import type { Provider } from 'injection-js';
import { firstValueFrom } from 'rxjs';
import {
  PASSED_CONFIG,
  type PassedInitialConfig,
  createStaticLoader,
} from './auth-config';
import { StsConfigLoader } from './config/loader/config-loader';
import { APP_INITIALIZER } from './injection';
import { AbstractLoggerService } from './logging/abstract-logger.service';
import { ConsoleLoggerService } from './logging/console-logger.service';
import { OidcSecurityService } from './oidc.security.service';
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

/**
 * Configures an app initializer, which is called before the app starts, and
 * resolves any OAuth callback variables.
 * When used, it replaces the need to manually call
 * `OidcSecurityService.checkAuth(...)` or
 * `OidcSecurityService.checkAuthMultiple(...)`.
 *
 * @see https://angular.dev/api/core/APP_INITIALIZER
 */
export function withAppInitializerAuthCheck(): AuthFeature {
  return {
    ɵproviders: [
      {
        provide: APP_INITIALIZER,
        useFactory: (oidcSecurityService: OidcSecurityService) =>
          oidcSecurityService.checkAuthMultiple(),
        multi: true,
        deps: [OidcSecurityService],
      },
    ],
  };
}
