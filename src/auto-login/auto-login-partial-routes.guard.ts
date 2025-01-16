import { inject, Injectable } from 'injection-js';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthOptions } from '../auth-options';
import { AuthStateService } from '../auth-state/auth-state.service';
import { ConfigurationService } from '../config/config.service';
import { LoginService } from '../login/login.service';
import { AutoLoginService } from './auto-login.service';

@Injectable()
export class AutoLoginPartialRoutesGuard {
  private readonly autoLoginService = inject(AutoLoginService);

  private readonly authStateService = inject(AuthStateService);

  private readonly loginService = inject(LoginService);

  private readonly configurationService = inject(ConfigurationService);

  private readonly router = inject(Router);

  canLoad(): Observable<boolean> {
    const url =
      this.router
        .getCurrentNavigation()
        ?.extractedUrl.toString()
        .substring(1) ?? '';

    return checkAuth(
      url,
      this.configurationService,
      this.authStateService,
      this.autoLoginService,
      this.loginService
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const authOptions: AuthOptions | undefined = route?.data
      ? { customParams: route.data }
      : undefined;

    return checkAuth(
      state.url,
      this.configurationService,
      this.authStateService,
      this.autoLoginService,
      this.loginService,
      authOptions
    );
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const authOptions: AuthOptions | undefined = route?.data
      ? { customParams: route.data }
      : undefined;

    return checkAuth(
      state.url,
      this.configurationService,
      this.authStateService,
      this.autoLoginService,
      this.loginService,
      authOptions
    );
  }
}

export function autoLoginPartialRoutesGuard(
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot,
  configId?: string
): Observable<boolean> {
  const configurationService = inject(ConfigurationService);
  const authStateService = inject(AuthStateService);
  const loginService = inject(LoginService);
  const autoLoginService = inject(AutoLoginService);
  const router = inject(Router);
  const authOptions: AuthOptions | undefined = route?.data
    ? { customParams: route.data }
    : undefined;

  const url =
    router.getCurrentNavigation()?.extractedUrl.toString().substring(1) ?? '';

  return checkAuth(
    url,
    configurationService,
    authStateService,
    autoLoginService,
    loginService,
    authOptions,
    configId
  );
}

export function autoLoginPartialRoutesGuardWithConfig(
  configId: string
): (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot
) => Observable<boolean> {
  return (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) =>
    autoLoginPartialRoutesGuard(route, state, configId);
}

function checkAuth(
  url: string,
  configurationService: ConfigurationService,
  authStateService: AuthStateService,
  autoLoginService: AutoLoginService,
  loginService: LoginService,
  authOptions?: AuthOptions,
  configId?: string
): Observable<boolean> {
  return configurationService.getOpenIDConfiguration(configId).pipe(
    map((configuration) => {
      const isAuthenticated =
        authStateService.areAuthStorageTokensValid(configuration);

      if (isAuthenticated) {
        autoLoginService.checkSavedRedirectRouteAndNavigate(configuration);
      }

      if (!isAuthenticated) {
        autoLoginService.saveRedirectRoute(configuration, url);
        if (authOptions) {
          loginService.login(configuration, authOptions);
        } else {
          loginService.login(configuration);
        }
      }

      return isAuthenticated;
    })
  );
}
