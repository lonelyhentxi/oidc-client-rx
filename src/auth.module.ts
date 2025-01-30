import {
  type InjectionToken,
  Injector,
  ReflectiveInjector,
  type Type,
} from 'injection-js';
import type { PassedInitialConfig } from './auth-config';
import type { Module } from './injection';
import { _provideAuth } from './provide-auth';

export interface AuthModuleOptions {
  passedConfig: PassedInitialConfig;
  parentInjector?: ReflectiveInjector;
}

export class AuthModule extends Injector {
  passedConfig: PassedInitialConfig;
  injector: ReflectiveInjector;
  parentInjector?: Injector;

  constructor(passedConfig?: PassedInitialConfig, parentInjector?: Injector) {
    super();
    this.passedConfig = passedConfig ?? {};
    this.parentInjector = parentInjector;
    this.injector = ReflectiveInjector.resolveAndCreate(
      [..._provideAuth(this.passedConfig)],
      this.parentInjector
    );
  }

  static forRoot(passedConfig?: PassedInitialConfig): Module {
    return (parentInjector?: Injector) =>
      new AuthModule(passedConfig, parentInjector);
  }

  get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T;
  get(token: any, notFoundValue?: any);
  get(token: unknown, notFoundValue?: unknown): any {
    return this.injector.get(token, notFoundValue);
  }
}
