import { TestBed } from '@/testing';
import type { HttpHeaders } from '@ngify/http';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DataService } from '../api/data.service';
import { ResetAuthDataService } from '../flows/reset-auth-data.service';
import { CheckSessionService } from '../iframe/check-session.service';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistenceService } from '../storage/storage-persistence.service';
import { createRetriableStream } from '../testing/create-retriable-stream.helper';
import { mockProvider } from '../testing/mock';
import { RedirectService } from '../utils/redirect/redirect.service';
import { UrlService } from '../utils/url/url.service';
import { LogoffRevocationService } from './logoff-revocation.service';

describe('Logout and Revoke Service', () => {
  let service: LogoffRevocationService;
  let dataService: DataService;
  let loggerService: LoggerService;
  let storagePersistenceService: StoragePersistenceService;
  let urlService: UrlService;
  let checkSessionService: CheckSessionService;
  let resetAuthDataService: ResetAuthDataService;
  let redirectService: RedirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        mockProvider(DataService),
        mockProvider(LoggerService),
        mockProvider(StoragePersistenceService),
        mockProvider(UrlService),
        mockProvider(CheckSessionService),
        mockProvider(ResetAuthDataService),
        mockProvider(RedirectService),
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(LogoffRevocationService);
    dataService = TestBed.inject(DataService);
    loggerService = TestBed.inject(LoggerService);
    storagePersistenceService = TestBed.inject(StoragePersistenceService);
    urlService = TestBed.inject(UrlService);
    checkSessionService = TestBed.inject(CheckSessionService);
    resetAuthDataService = TestBed.inject(ResetAuthDataService);
    redirectService = TestBed.inject(RedirectService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('revokeAccessToken', () => {
    it('uses token parameter if token as parameter is passed in the method', () => {
      // Arrange
      const paramToken = 'passedTokenAsParam';
      const revocationSpy = vi.spyOn(
        urlService,
        'createRevocationEndpointBodyAccessToken'
      );
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(of(null));

      // Act
      service.revokeAccessToken(config, paramToken);
      // Assert
      expect(revocationSpy).toHaveBeenCalledExactlyOnceWith(paramToken, config);
    });

    it('uses token parameter from persistence if no param is provided', () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      const revocationSpy = vi.spyOn(
        urlService,
        'createRevocationEndpointBodyAccessToken'
      );

      vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      const config = { configId: 'configId1' };

      // Act
      service.revokeAccessToken(config);
      // Assert
      expect(revocationSpy).toHaveBeenCalledExactlyOnceWith(paramToken, config);
    });

    it('returns type observable', () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      const config = { configId: 'configId1' };

      // Act
      const result = service.revokeAccessToken(config);

      // Assert
      expect(result).toEqual(expect.any(Observable));
    });

    it('loggs and returns unmodified response if request is positive', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logDebug');

      vi.spyOn(dataService, 'post').mockReturnValue(of({ data: 'anything' }));
      const config = { configId: 'configId1' };

      // Act
      service.revokeAccessToken(config).subscribe((result) => {
        // Assert
        expect(result).toEqual({ data: 'anything' });
        expect(loggerSpy).toHaveBeenCalled();
      });
    });

    it('loggs error when request is negative', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logError');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        throwError(() => new Error('Error'))
      );

      // Act
      service.revokeAccessToken(config).subscribe({
        error: (err) => {
          expect(loggerSpy).toHaveBeenCalled();
          expect(err).toBeTruthy();
        },
      });
    });

    it('should retry once', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logDebug');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => new Error('Error')),
          of({ data: 'anything' })
        )
      );

      service.revokeAccessToken(config).subscribe({
        next: (res) => {
          // Assert
          expect(res).toBeTruthy();
          expect(res).toEqual({ data: 'anything' });
          expect(loggerSpy).toHaveBeenCalled();
        },
      });
    });

    it('should retry twice', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logDebug');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => new Error('Error')),
          throwError(() => new Error('Error')),
          of({ data: 'anything' })
        )
      );

      service.revokeAccessToken(config).subscribe({
        next: (res) => {
          // Assert
          expect(res).toBeTruthy();
          expect(res).toEqual({ data: 'anything' });
          expect(loggerSpy).toHaveBeenCalled();
        },
      });
    });

    it('should fail after three tries', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getAccessToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logError');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => new Error('Error')),
          throwError(() => new Error('Error')),
          throwError(() => new Error('Error')),
          of({ data: 'anything' })
        )
      );

      service.revokeAccessToken(config).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          expect(loggerSpy).toHaveBeenCalled();
        },
      });
    });
  });

  describe('revokeRefreshToken', () => {
    it('uses refresh token parameter if token as parameter is passed in the method', () => {
      // Arrange
      const paramToken = 'passedTokenAsParam';
      const revocationSpy = vi.spyOn(
        urlService,
        'createRevocationEndpointBodyRefreshToken'
      );

      vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      const config = { configId: 'configId1' };

      // Act
      service.revokeRefreshToken(config, paramToken);
      // Assert
      expect(revocationSpy).toHaveBeenCalledExactlyOnceWith(paramToken, config);
    });

    it('uses refresh token parameter from persistence if no param is provided', () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      const config = { configId: 'configId1' };
      const revocationSpy = vi.spyOn(
        urlService,
        'createRevocationEndpointBodyRefreshToken'
      );

      vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      // Act
      service.revokeRefreshToken(config);
      // Assert
      expect(revocationSpy).toHaveBeenCalledExactlyOnceWith(paramToken, config);
    });

    it('returns type observable', () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      const config = { configId: 'configId1' };

      // Act
      const result = service.revokeRefreshToken(config);

      // Assert
      expect(result).toEqual(expect.any(Observable));
    });

    it('loggs and returns unmodified response if request is positive', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logDebug');

      vi.spyOn(dataService, 'post').mockReturnValue(of({ data: 'anything' }));
      const config = { configId: 'configId1' };

      // Act
      service.revokeRefreshToken(config).subscribe((result) => {
        // Assert
        expect(result).toEqual({ data: 'anything' });
        expect(loggerSpy).toHaveBeenCalled();
      });
    });

    it('loggs error when request is negative', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logError');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        throwError(() => new Error('Error'))
      );

      // Act
      service.revokeRefreshToken(config).subscribe({
        error: (err) => {
          expect(loggerSpy).toHaveBeenCalled();
          expect(err).toBeTruthy();
        },
      });
    });

    it('should retry once', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logDebug');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => new Error('Error')),
          of({ data: 'anything' })
        )
      );

      service.revokeRefreshToken(config).subscribe({
        next: (res) => {
          // Assert
          expect(res).toBeTruthy();
          expect(res).toEqual({ data: 'anything' });
          expect(loggerSpy).toHaveBeenCalled();
        },
      });
    });

    it('should retry twice', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logDebug');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => new Error('Error')),
          throwError(() => new Error('Error')),
          of({ data: 'anything' })
        )
      );

      service.revokeRefreshToken(config).subscribe({
        next: (res) => {
          // Assert
          expect(res).toBeTruthy();
          expect(res).toEqual({ data: 'anything' });
          expect(loggerSpy).toHaveBeenCalled();
        },
      });
    });

    it('should fail after three tries', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(urlService, 'createRevocationEndpointBodyAccessToken');
      const loggerSpy = vi.spyOn(loggerService, 'logError');
      const config = { configId: 'configId1' };

      vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => new Error('Error')),
          throwError(() => new Error('Error')),
          throwError(() => new Error('Error')),
          of({ data: 'anything' })
        )
      );

      service.revokeRefreshToken(config).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          expect(loggerSpy).toHaveBeenCalled();
        },
      });
    });
  });

  describe('logoff', () => {
    it('logs and returns if `endSessionUrl` is false', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('');

      const serverStateChangedSpy = vi.spyOn(
        checkSessionService,
        'serverStateChanged'
      );
      const config = { configId: 'configId1' };

      // Act
      const result$ = service.logoff(config, [config]);

      // Assert
      result$.subscribe(() => {
        expect(serverStateChangedSpy).not.toHaveBeenCalled();
      });
    });

    it('logs and returns if `serverStateChanged` is true', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('someValue');
      const redirectSpy = vi.spyOn(redirectService, 'redirectTo');

      vi.spyOn(checkSessionService, 'serverStateChanged').mockReturnValue(true);
      const config = { configId: 'configId1' };

      // Act
      const result$ = service.logoff(config, [config]);

      // Assert
      result$.subscribe(() => {
        expect(redirectSpy).not.toHaveBeenCalled();
      });
    });

    it('calls urlHandler if urlhandler is passed', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('someValue');
      const spy = jasmine.createSpy();
      const urlHandler = (url: string): void => {
        spy(url);
      };
      const redirectSpy = vi.spyOn(redirectService, 'redirectTo');
      const resetAuthorizationDataSpy = vi.spyOn(
        resetAuthDataService,
        'resetAuthorizationData'
      );

      vi.spyOn(checkSessionService, 'serverStateChanged').mockReturnValue(
        false
      );
      const config = { configId: 'configId1' };

      // Act
      const result$ = service.logoff(config, [config], { urlHandler });

      // Assert
      result$.subscribe(() => {
        expect(redirectSpy).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalledExactlyOnceWith('someValue');
        expect(resetAuthorizationDataSpy).toHaveBeenCalled();
      });
    });

    it('calls redirect service if no logoutOptions are passed', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('someValue');

      const redirectSpy = vi.spyOn(redirectService, 'redirectTo');

      vi.spyOn(checkSessionService, 'serverStateChanged').mockReturnValue(
        false
      );
      const config = { configId: 'configId1' };

      // Act
      const result$ = service.logoff(config, [config]);

      // Assert
      result$.subscribe(() => {
        expect(redirectSpy).toHaveBeenCalledExactlyOnceWith('someValue');
      });
    });

    it('calls redirect service if logoutOptions are passed and method is GET', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('someValue');

      const redirectSpy = vi.spyOn(redirectService, 'redirectTo');

      vi.spyOn(checkSessionService, 'serverStateChanged').mockReturnValue(
        false
      );
      const config = { configId: 'configId1' };

      // Act
      const result$ = service.logoff(config, [config], { logoffMethod: 'GET' });

      // Assert
      result$.subscribe(() => {
        expect(redirectSpy).toHaveBeenCalledExactlyOnceWith('someValue');
      });
    });

    it('calls dataservice post if logoutOptions are passed and method is POST', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('someValue');

      const redirectSpy = vi.spyOn(redirectService, 'redirectTo');

      vi.spyOn(checkSessionService, 'serverStateChanged').mockReturnValue(
        false
      );
      vi.spyOn(storagePersistenceService, 'getIdToken').mockReturnValue(
        'id-token'
      );
      vi.spyOn(urlService, 'getPostLogoutRedirectUrl').mockReturnValue(
        'post-logout-redirect-url'
      );
      vi.spyOn(urlService, 'getEndSessionEndpoint').mockReturnValue({
        url: 'some-url',
        existingParams: '',
      });
      const postSpy = vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      const config = { configId: 'configId1', clientId: 'clientId' };

      // Act
      const result$ = service.logoff(config, [config], {
        logoffMethod: 'POST',
      });

      // Assert
      result$.subscribe(() => {
        expect(redirectSpy).not.toHaveBeenCalled();
        expect(postSpy).toHaveBeenCalledExactlyOnceWith(
          'some-url',
          {
            id_token_hint: 'id-token',
            client_id: 'clientId',
            post_logout_redirect_uri: 'post-logout-redirect-url',
          },
          config,
          expect.anything()
        );

        const httpHeaders = postSpy.calls.mostRecent().args[3] as HttpHeaders;

        expect(httpHeaders.has('Content-Type')).toBeTruthy();
        expect(httpHeaders.get('Content-Type')).toBe(
          'application/x-www-form-urlencoded'
        );
      });
    });

    it('calls dataservice post if logoutOptions with customParams are passed and method is POST', async () => {
      // Arrange
      vi.spyOn(urlService, 'getEndSessionUrl').mockReturnValue('someValue');

      const redirectSpy = vi.spyOn(redirectService, 'redirectTo');

      vi.spyOn(checkSessionService, 'serverStateChanged').mockReturnValue(
        false
      );
      vi.spyOn(storagePersistenceService, 'getIdToken').mockReturnValue(
        'id-token'
      );
      vi.spyOn(urlService, 'getPostLogoutRedirectUrl').mockReturnValue(
        'post-logout-redirect-url'
      );
      vi.spyOn(urlService, 'getEndSessionEndpoint').mockReturnValue({
        url: 'some-url',
        existingParams: '',
      });
      const postSpy = vi.spyOn(dataService, 'post').mockReturnValue(of(null));
      const config = { configId: 'configId1', clientId: 'clientId' };

      // Act
      const result$ = service.logoff(config, [config], {
        logoffMethod: 'POST',
        customParams: {
          state: 'state',
          logout_hint: 'logoutHint',
          ui_locales: 'de fr en',
        },
      });

      // Assert
      result$.subscribe(() => {
        expect(redirectSpy).not.toHaveBeenCalled();
        expect(postSpy).toHaveBeenCalledExactlyOnceWith(
          'some-url',
          {
            id_token_hint: 'id-token',
            client_id: 'clientId',
            post_logout_redirect_uri: 'post-logout-redirect-url',
            state: 'state',
            logout_hint: 'logoutHint',
            ui_locales: 'de fr en',
          },
          config,
          expect.anything()
        );

        const httpHeaders = postSpy.calls.mostRecent().args[3] as HttpHeaders;

        expect(httpHeaders.has('Content-Type')).toBeTruthy();
        expect(httpHeaders.get('Content-Type')).toBe(
          'application/x-www-form-urlencoded'
        );
      });
    });
  });

  describe('logoffLocal', () => {
    it('calls flowsService.resetAuthorizationData', () => {
      // Arrange
      const resetAuthorizationDataSpy = vi.spyOn(
        resetAuthDataService,
        'resetAuthorizationData'
      );
      const config = { configId: 'configId1' };

      // Act
      service.logoffLocal(config, [config]);

      // Assert
      expect(resetAuthorizationDataSpy).toHaveBeenCalled();
    });
  });

  describe('logoffAndRevokeTokens', () => {
    it('calls revokeRefreshToken and revokeAccessToken when storage holds a refreshtoken', async () => {
      // Arrange
      const paramToken = 'damien';
      const config = { configId: 'configId1' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ revocationEndpoint: 'revocationEndpoint' })
      );
      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      const revokeRefreshTokenSpy = vi
        .spyOn(service, 'revokeRefreshToken')
        .mockReturnValue(of({ any: 'thing' }));
      const revokeAccessTokenSpy = vi
        .spyOn(service, 'revokeAccessToken')
        .mockReturnValue(of({ any: 'thing' }));

      // Act
      service.logoffAndRevokeTokens(config, [config]).subscribe(() => {
        // Assert
        expect(revokeRefreshTokenSpy).toHaveBeenCalled();
        expect(revokeAccessTokenSpy).toHaveBeenCalled();
      });
    });

    it('logs error when revokeaccesstoken throws an error', async () => {
      // Arrange
      const paramToken = 'damien';
      const config = { configId: 'configId1' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ revocationEndpoint: 'revocationEndpoint' })
      );
      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(service, 'revokeRefreshToken').mockReturnValue(
        of({ any: 'thing' })
      );
      const loggerSpy = vi.spyOn(loggerService, 'logError');

      vi.spyOn(service, 'revokeAccessToken').mockReturnValue(
        throwError(() => new Error('Error'))
      );

      // Act
      service.logoffAndRevokeTokens(config, [config]).subscribe({
        error: (err) => {
          expect(loggerSpy).toHaveBeenCalled();
          expect(err).toBeTruthy();
        },
      });
    });

    it('calls logoff in case of success', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(service, 'revokeRefreshToken').mockReturnValue(
        of({ any: 'thing' })
      );
      vi.spyOn(service, 'revokeAccessToken').mockReturnValue(
        of({ any: 'thing' })
      );
      const logoffSpy = vi.spyOn(service, 'logoff').mockReturnValue(of(null));
      const config = { configId: 'configId1' };

      // Act
      service.logoffAndRevokeTokens(config, [config]).subscribe(() => {
        // Assert
        expect(logoffSpy).toHaveBeenCalled();
      });
    });

    it('calls logoff with urlhandler in case of success', async () => {
      // Arrange
      const paramToken = 'damien';

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        paramToken
      );
      vi.spyOn(service, 'revokeRefreshToken').mockReturnValue(
        of({ any: 'thing' })
      );
      vi.spyOn(service, 'revokeAccessToken').mockReturnValue(
        of({ any: 'thing' })
      );
      const logoffSpy = vi.spyOn(service, 'logoff').mockReturnValue(of(null));
      const urlHandler = (_url: string): void => undefined;
      const config = { configId: 'configId1' };

      // Act
      service
        .logoffAndRevokeTokens(config, [config], { urlHandler })
        .subscribe(() => {
          // Assert
          expect(logoffSpy).toHaveBeenCalledExactlyOnceWith(config, [config], {
            urlHandler,
          });
        });
    });

    it('calls revokeAccessToken when storage does not hold a refreshtoken', async () => {
      // Arrange
      const config = { configId: 'configId1' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ revocationEndpoint: 'revocationEndpoint' })
      );

      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        ''
      );
      const revokeRefreshTokenSpy = vi.spyOn(service, 'revokeRefreshToken');
      const revokeAccessTokenSpy = vi
        .spyOn(service, 'revokeAccessToken')
        .mockReturnValue(of({ any: 'thing' }));

      // Act
      service.logoffAndRevokeTokens(config, [config]).subscribe(() => {
        // Assert
        expect(revokeRefreshTokenSpy).not.toHaveBeenCalled();
        expect(revokeAccessTokenSpy).toHaveBeenCalled();
      });
    });

    it('logs error when revokeaccesstoken throws an error', async () => {
      // Arrange
      const config = { configId: 'configId1' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ revocationEndpoint: 'revocationEndpoint' })
      );
      vi.spyOn(storagePersistenceService, 'getRefreshToken').mockReturnValue(
        ''
      );
      const loggerSpy = vi.spyOn(loggerService, 'logError');

      vi.spyOn(service, 'revokeAccessToken').mockReturnValue(
        throwError(() => new Error('Error'))
      );

      // Act
      service.logoffAndRevokeTokens(config, [config]).subscribe({
        error: (err) => {
          expect(loggerSpy).toHaveBeenCalled();
          expect(err).toBeTruthy();
        },
      });
    });
  });

  describe('logoffLocalMultiple', () => {
    it('calls logoffLocal for every config which is present', () => {
      // Arrange
      const allConfigs = [{ configId: 'configId1' }, { configId: 'configId2' }];
      const resetAuthorizationDataSpy = vi.spyOn(
        resetAuthDataService,
        'resetAuthorizationData'
      );
      const checkSessionServiceSpy = vi.spyOn(checkSessionService, 'stop');

      // Act
      service.logoffLocalMultiple(allConfigs);

      // Assert
      expect(resetAuthorizationDataSpy).toHaveBeenCalledTimes(2);
      expect(checkSessionServiceSpy).toHaveBeenCalledTimes(2);
      expect(resetAuthorizationDataSpy).toBeCalledWith([
        [allConfigs[0]!, allConfigs],
        [allConfigs[1], allConfigs],
      ]);
    });
  });
});
