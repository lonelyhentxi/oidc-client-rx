import { isEqual } from 'lodash-es';
import { type MockInstance, vi } from 'vitest';

export function createSpyObj<T>(baseName: string, methods: (keyof T)[]): T {
  const SpyClass = new Function(
    `return class Spy${baseName} {
      constructor() {}
    }`
  ) as new () => T;

  const spyObj = new SpyClass();

  for (const method of methods) {
    Object.defineProperty(spyObj, method, {
      value: vi.fn(),
      writable: true,
    });
  }

  return spyObj;
}

export function mockImplementationWhenArgsEqual<M extends MockInstance<any>>(
  mockInstance: M,
  whenArgs: Parameters<M extends MockInstance<infer T> ? T : never>,
  implementation: Exclude<ReturnType<M['getMockImplementation']>, undefined>
): M {
  const spyImpl = mockInstance.getMockImplementation()!;

  return mockInstance.mockImplementation((...args) => {
    if (isEqual(args, whenArgs)) {
      return implementation(...args);
    }
    return spyImpl?.(...args);
  });
}

export function mockImplementationWhenArgs<M extends MockInstance<any>>(
  mockInstance: M,
  whenArgs: (
    ...args: Parameters<M extends MockInstance<infer T> ? T : never>
  ) => boolean,
  implementation: Exclude<ReturnType<M['getMockImplementation']>, undefined>
): M {
  const spyImpl = mockInstance.getMockImplementation()!;

  return mockInstance.mockImplementation((...args) => {
    if (isEqual(args, whenArgs)) {
      return implementation(...args);
    }
    return spyImpl?.(...args);
  });
}

/**
 * mock Jasmine spyOnProperty
 */
export function spyOnProperty<T, K extends keyof T>(
  obj: T,
  propertyKey: K,
  accessType: 'get' | 'set' = 'get',
  mockImplementation?: any
) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(obj, propertyKey);

  if (!originalDescriptor) {
    throw new Error(
      `Property ${String(propertyKey)} does not exist on the object.`
    );
  }

  const spy = vi.fn();

  let value: T[K] | undefined;

  if (accessType === 'get') {
    Object.defineProperty(obj, propertyKey, {
      get: mockImplementation
        ? () => {
            value = mockImplementation();
            return value;
          }
        : spy,
      configurable: true,
    });
  } else if (accessType === 'set') {
    Object.defineProperty(obj, propertyKey, {
      set: mockImplementation
        ? (next) => {
            value = next;
          }
        : spy,
      configurable: true,
    });
  }

  // 恢复原始属性
  spy.mockRestore = () => {
    if (originalDescriptor) {
      Object.defineProperty(obj, propertyKey, originalDescriptor);
    } else {
      delete obj[propertyKey];
    }
  };

  return spy;
}
