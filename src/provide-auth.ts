import type { Provider } from '@outposts/injection-js';
import {
  PASSED_CONFIG,
  type PassedInitialConfig,
  createStaticLoader,
} from './auth-config';
import { StsConfigLoader } from './config/loader/config-loader';
import { AbstractLoggerService } from './logging/abstract-logger.service';
import { ConsoleLoggerService } from './logging/console-logger.service';
import { AbstractSecurityStorage } from './storage/abstract-security-storage';
import { DefaultSessionStorageService } from './storage/default-sessionstorage.service';

/**
 * A feature to be used with `provideAuth`.
 */
export interface AuthFeature {
  ɵproviders: Provider[];
}

export function provideAuth(
  passedConfig: PassedInitialConfig,
  ...features: AuthFeature[]
): Provider[] {
  const providers = _provideAuth(passedConfig);

  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }

  return providers;
}

export function _provideAuth(passedConfig: PassedInitialConfig): Provider[] {
  return [
    // Make the PASSED_CONFIG available through injection
    { provide: PASSED_CONFIG, useValue: passedConfig },

    // Create the loader: Either the one getting passed or a static one
    passedConfig?.loader || {
      provide: StsConfigLoader,
      useFactory: createStaticLoader,
      deps: [PASSED_CONFIG],
    },
    {
      provide: AbstractSecurityStorage,
      useClass: DefaultSessionStorageService,
    },
    { provide: AbstractLoggerService, useClass: ConsoleLoggerService },
  ];
}
