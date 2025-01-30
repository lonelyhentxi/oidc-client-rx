import type { Provider } from 'injection-js';

export function mockClass<T>(obj: new (...args: any[]) => T): any {
  const keys = Object.getOwnPropertyNames(obj.prototype);
  const allMethods = keys.filter((key) => {
    try {
      return typeof obj.prototype[key] === 'function';
    } catch {
      return false;
    }
  });
  const allProperties = keys.filter((x) => !allMethods.includes(x));

  const mockedClass = class T {};

  for (const method of allMethods) {
    (mockedClass.prototype as any)[method] = (): void => {
      return;
    };
  }

  for (const method of allProperties) {
    Object.defineProperty(mockedClass.prototype, method, {
      get() {
        return '';
      },
      configurable: true,
    });
  }

  return mockedClass;
}

export function mockProvider<T>(obj: new (...args: any[]) => T): Provider {
  return {
    provide: obj,
    useClass: mockClass(obj),
  };
}

export function mockAbstractProvider<T, M extends T>(
  type: abstract new (...args: any[]) => T,
  mockType: new (...args: any[]) => M
): Provider {
  const mock = mockClass(mockType);

  return { provide: type, useClass: mock };
}
