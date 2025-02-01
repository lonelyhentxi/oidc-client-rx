import {
  type InjectionToken,
  type Injector,
  type Provider,
  ReflectiveInjector,
  type Type,
} from 'injection-js';
import { setCurrentInjector } from 'injection-js/lib/injector_compatibility';

export interface TestModuleMetadata {
  providers?: Provider[];
  imports?: ((parentInjector: Injector) => Injector)[];
}

export class TestBed {
  static environmentInjector?: Injector;
  private injector: ReflectiveInjector;
  private providers: Provider[] = [];
  private imports: Injector[] = [];

  constructor(
    metadata: TestModuleMetadata = {},
    environmentInjector?: Injector
  ) {
    const providers = metadata.providers ?? [];
    const imports = metadata.imports ?? [];
    this.injector = ReflectiveInjector.resolveAndCreate(
      providers,
      environmentInjector
    );
    this.imports = imports.map((importFn) => importFn(this.injector));
  }

  static #instance?: TestBed;

  static initTestEnvironment(providers: Provider[] = []) {
    TestBed.environmentInjector =
      ReflectiveInjector.resolveAndCreate(providers);
  }

  static configureTestingModule(metadata: TestModuleMetadata = {}) {
    const newTestBed = new TestBed(metadata, TestBed.environmentInjector);
    TestBed.#instance = newTestBed;

    return newTestBed;
  }

  /**
   * 在 TestBed 的注入上下文中运行函数
   */
  static runInInjectionContext<T>(fn: () => T): T {
    const injector = TestBed.#instance?.injector;
    if (!injector) {
      throw new Error(
        'TestBed is not configured. Call configureTestingModule first.'
      );
    }

    // 保存当前的注入器
    const previousInjector = setCurrentInjector(injector);

    try {
      // 在注入上下文中执行函数
      return fn();
    } finally {
      // 恢复之前的注入器
      setCurrentInjector(previousInjector);
    }
  }

  compileComponents(): Promise<any> {
    return Promise.resolve();
  }

  static get instance(): TestBed {
    if (!TestBed.#instance) {
      throw new Error('TestBest.configureTestingModule should be called first');
    }
    return TestBed.#instance;
  }

  static get<T>(token: Type<T> | InjectionToken<T>): T;
  static get(token: any): any;
  static get(token: unknown): any {
    const g = TestBed.instance;
    return g.injector.get(token);
  }

  static inject<T>(token: Type<T> | InjectionToken<T>): T;
  static inject(token: any): any;
  static inject(token: unknown): any {
    return TestBed.get(token as any);
  }

  static [Symbol.dispose]() {
    TestBed.#instance = undefined;
  }
}

export function getTestBed() {
  return TestBed.instance;
}
