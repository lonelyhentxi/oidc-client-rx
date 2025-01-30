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
