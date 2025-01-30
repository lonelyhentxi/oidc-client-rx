import { HttpHeaders } from '@ngify/http';
import { inject, Injectable } from 'injection-js';
import { type Observable, of, throwError, timer } from 'rxjs';
import { catchError, mergeMap, retryWhen, switchMap } from 'rxjs/operators';
import { DataService } from '../../api/data.service';
import type { OpenIdConfiguration } from '../../config/openid-configuration';
import { LoggerService } from '../../logging/logger.service';
import { StoragePersistenceService } from '../../storage/storage-persistence.service';
import { UrlService } from '../../utils/url/url.service';
import type { AuthResult, CallbackContext } from '../callback-context';
import { isNetworkError } from './error-helper';

@Injectable()
export class RefreshTokenCallbackHandlerService {
  private readonly urlService = inject(UrlService);

  private readonly loggerService = inject(LoggerService);

  private readonly dataService = inject(DataService);

  private readonly storagePersistenceService = inject(
    StoragePersistenceService
  );

  // STEP 2 Refresh Token
  refreshTokensRequestTokens(
    callbackContext: CallbackContext,
    config: OpenIdConfiguration,
    customParamsRefresh?: { [key: string]: string | number | boolean }
  ): Observable<CallbackContext> {
    let headers: HttpHeaders = new HttpHeaders();

    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');

    const authWellknownEndpoints = this.storagePersistenceService.read(
      'authWellKnownEndPoints',
      config
    );
    const tokenEndpoint = authWellknownEndpoints?.tokenEndpoint;

    if (!tokenEndpoint) {
      return throwError(() => new Error('Token Endpoint not defined'));
    }

    const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(
      callbackContext.refreshToken,
      config,
      customParamsRefresh
    );

    return this.dataService
      .post<AuthResult>(tokenEndpoint, data, config, headers)
      .pipe(
        switchMap((response) => {
          this.loggerService.logDebug(
            config,
            `token refresh response: ${response}`
          );

          if (response) {
            response.state = callbackContext.state;
          }

          callbackContext.authResult = response;

          return of(callbackContext);
        }),
        retryWhen((error) => this.handleRefreshRetry(error, config)),
        catchError((error) => {
          const { authority } = config;
          const errorMessage = `OidcService code request ${authority}`;

          this.loggerService.logError(config, errorMessage, error);

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  private handleRefreshRetry(
    errors: Observable<unknown>,
    config: OpenIdConfiguration
  ): Observable<unknown> {
    return errors.pipe(
      mergeMap((error) => {
        // retry token refresh if there is no internet connection
        if (isNetworkError(error)) {
          const { authority, refreshTokenRetryInSeconds } = config;
          const errorMessage = `OidcService code request ${authority} - no internet connection`;

          this.loggerService.logWarning(config, errorMessage, error);

          return timer((refreshTokenRetryInSeconds ?? 0) * 1000);
        }

        return throwError(() => error);
      })
    );
  }
}
