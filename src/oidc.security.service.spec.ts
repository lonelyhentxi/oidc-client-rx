import { TestBed, spyOnProperty } from '@/testing';
import { Observable, lastValueFrom, of } from 'rxjs';
import { type MockInstance, vi } from 'vitest';
import { AuthStateService } from './auth-state/auth-state.service';
import { CheckAuthService } from './auth-state/check-auth.service';
import { CallbackService } from './callback/callback.service';
import { RefreshSessionService } from './callback/refresh-session.service';
import { AuthWellKnownService } from './config/auth-well-known/auth-well-known.service';
import { ConfigurationService } from './config/config.service';
import { FlowsDataService } from './flows/flows-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import type { LoginResponse } from './login/login-response';
import { LoginService } from './login/login.service';
import { LogoffRevocationService } from './logoff-revoke/logoff-revocation.service';
import { OidcSecurityService } from './oidc.security.service';
import { mockProvider } from './testing/mock';
import { UserService } from './user-data/user.service';
import { TokenHelperService } from './utils/tokenHelper/token-helper.service';
import { UrlService } from './utils/url/url.service';

describe('OidcSecurityService', () => {
  let oidcSecurityService: OidcSecurityService;
  let configurationService: ConfigurationService;
  let authStateService: AuthStateService;
  let authWellKnownService: AuthWellKnownService;
  let tokenHelperService: TokenHelperService;
  let flowsDataService: FlowsDataService;
  let logoffRevocationService: LogoffRevocationService;
  let loginService: LoginService;
  let refreshSessionService: RefreshSessionService;
  let checkAuthService: CheckAuthService;
  let checkSessionService: CheckSessionService;
  let userService: UserService;
  let urlService: UrlService;
  let callbackService: CallbackService;
  let authenticatedSpy: MockInstance<
    () => (typeof authStateService)['authenticated$']
  >;
  let userDataSpy: MockInstance<() => (typeof userService)['userData$']>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        OidcSecurityService,
        mockProvider(CheckSessionService),
        mockProvider(CheckAuthService),
        mockProvider(UserService),
        mockProvider(TokenHelperService),
        mockProvider(ConfigurationService),
        mockProvider(AuthStateService),
        mockProvider(FlowsDataService),
        mockProvider(CallbackService),
        mockProvider(LogoffRevocationService),
        mockProvider(LoginService),
        mockProvider(RefreshSessionService),
        mockProvider(UrlService),
        mockProvider(AuthWellKnownService),
      ],
    });
    authStateService = TestBed.inject(AuthStateService);
    tokenHelperService = TestBed.inject(TokenHelperService);
    configurationService = TestBed.inject(ConfigurationService);
    flowsDataService = TestBed.inject(FlowsDataService);
    logoffRevocationService = TestBed.inject(LogoffRevocationService);
    loginService = TestBed.inject(LoginService);
    refreshSessionService = TestBed.inject(RefreshSessionService);
    checkAuthService = TestBed.inject(CheckAuthService);
    userService = TestBed.inject(UserService);
    urlService = TestBed.inject(UrlService);
    authWellKnownService = TestBed.inject(AuthWellKnownService);
    checkSessionService = TestBed.inject(CheckSessionService);
    callbackService = TestBed.inject(CallbackService);

    // this is required because these methods will be invoked by the signal properties when the service is created
    authenticatedSpy = spyOnProperty(
      authStateService,
      'authenticated$'
    ).mockReturnValue(
      of({ isAuthenticated: false, allConfigsAuthenticated: [] })
    );
    userDataSpy = spyOnProperty(userService, 'userData$').mockReturnValue(
      of({ userData: null, allUserData: [] })
    );
    oidcSecurityService = TestBed.inject(OidcSecurityService);
  });

  it('should create', () => {
    expect(oidcSecurityService).toBeTruthy();
  });

  describe('userData$', () => {
    it('calls userService.userData$', async () => {
      await lastValueFrom(oidcSecurityService.userData$);
      // 1x from this subscribe
      // 1x by the signal property
      expect(userDataSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('userData', () => {
    it('calls userService.userData$', async () => {
      const _userdata = await lastValueFrom(oidcSecurityService.userData());

      expect(userDataSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAuthenticated$', () => {
    it('calls authStateService.isAuthenticated$', async () => {
      await lastValueFrom(oidcSecurityService.isAuthenticated$);
      // 1x from this subscribe
      // 1x by the signal property
      expect(authenticatedSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('authenticated', () => {
    it('calls authStateService.isAuthenticated$', async () => {
      const _authenticated = await lastValueFrom(
        oidcSecurityService.authenticated()
      );

      expect(authenticatedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkSessionChanged$', () => {
    it('calls checkSessionService.checkSessionChanged$', async () => {
      const spy = spyOnProperty(
        checkSessionService,
        'checkSessionChanged$'
      ).mockReturnValue(of(true));
      await lastValueFrom(oidcSecurityService.checkSessionChanged$);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('stsCallback$', () => {
    it('calls callbackService.stsCallback$', async () => {
      const spy = spyOnProperty(
        callbackService,
        'stsCallback$'
      ).mockReturnValue(of());

      await lastValueFrom(oidcSecurityService.stsCallback$);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('preloadAuthWellKnownDocument', () => {
    it('calls authWellKnownService.queryAndStoreAuthWellKnownEndPoints with config', async () => {
      const config = { configId: 'configid1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi
        .spyOn(authWellKnownService, 'queryAndStoreAuthWellKnownEndPoints')
        .mockReturnValue(of({}));

      await lastValueFrom(oidcSecurityService.preloadAuthWellKnownDocument());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('getConfigurations', () => {
    it('is not of type observable', () => {
      expect(oidcSecurityService.getConfigurations).not.toEqual(
        expect.any(Observable)
      );
    });

    it('calls configurationProvider.getAllConfigurations', () => {
      const spy = vi.spyOn(configurationService, 'getAllConfigurations');

      oidcSecurityService.getConfigurations();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getConfiguration', () => {
    it('is not of type observable', () => {
      expect(oidcSecurityService.getConfiguration).not.toEqual(
        expect.any(Observable)
      );
    });

    it('calls configurationProvider.getOpenIDConfiguration with passed configId when configId is passed', () => {
      const spy = vi.spyOn(configurationService, 'getOpenIDConfiguration');

      oidcSecurityService.getConfiguration('configId');

      expect(spy).toHaveBeenCalledExactlyOnceWith('configId');
    });
  });

  describe('getUserData', () => {
    it('calls configurationProvider.getOpenIDConfiguration with config', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(userService, 'getUserDataFromStore')
        .mockReturnValue({
          some: 'thing',
        });

      await lastValueFrom(oidcSecurityService.getUserData('configId'));
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });

    it('returns userdata', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      vi.spyOn(userService, 'getUserDataFromStore').mockReturnValue({
        some: 'thing',
      });

      oidcSecurityService.getUserData('configId').subscribe((result) => {
        expect(result).toEqual({ some: 'thing' });
      });
    });
  });

  describe('checkAuth', () => {
    it('calls checkAuthService.checkAuth() without url if none is passed', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );

      const spy = vi
        .spyOn(checkAuthService, 'checkAuth')
        .mockReturnValue(of({} as LoginResponse));

      await lastValueFrom(oidcSecurityService.checkAuth());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config], undefined);
    });

    it('calls checkAuthService.checkAuth() with url if one is passed', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );

      const spy = vi
        .spyOn(checkAuthService, 'checkAuth')
        .mockReturnValue(of({} as LoginResponse));

      await lastValueFrom(oidcSecurityService.checkAuth('some-url'));
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config], 'some-url');
    });
  });

  describe('checkAuthMultiple', () => {
    it('calls checkAuthService.checkAuth() without url if none is passed', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );

      const spy = vi
        .spyOn(checkAuthService, 'checkAuthMultiple')
        .mockReturnValue(of([{}] as LoginResponse[]));

      await lastValueFrom(oidcSecurityService.checkAuthMultiple());
      expect(spy).toHaveBeenCalledExactlyOnceWith([config], undefined);
    });

    it('calls checkAuthService.checkAuthMultiple() with url if one is passed', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );

      const spy = vi
        .spyOn(checkAuthService, 'checkAuthMultiple')
        .mockReturnValue(of([{}] as LoginResponse[]));

      await lastValueFrom(oidcSecurityService.checkAuthMultiple('some-url'));
      expect(spy).toHaveBeenCalledExactlyOnceWith([config], 'some-u-+rl');
    });
  });

  describe('isAuthenticated()', () => {
    it('calls authStateService.isAuthenticated with passed configId when configId is passed', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(authStateService, 'isAuthenticated')
        .mockReturnValue(true);

      await lastValueFrom(oidcSecurityService.isAuthenticated());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('checkAuthIncludingServer', () => {
    it('calls checkAuthService.checkAuthIncludingServer()', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );

      const spy = vi
        .spyOn(checkAuthService, 'checkAuthIncludingServer')
        .mockReturnValue(of({} as LoginResponse));

      await lastValueFrom(oidcSecurityService.checkAuthIncludingServer());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config]);
    });
  });

  describe('getAccessToken', () => {
    it('calls authStateService.getAccessToken()', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(authStateService, 'getAccessToken')
        .mockReturnValue('');

      await lastValueFrom(oidcSecurityService.getAccessToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('getIdToken', () => {
    it('calls authStateService.getIdToken()', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi.spyOn(authStateService, 'getIdToken').mockReturnValue('');

      await lastValueFrom(oidcSecurityService.getIdToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('getRefreshToken', () => {
    it('calls authStateService.getRefreshToken()', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi
        .spyOn(authStateService, 'getRefreshToken')
        .mockReturnValue('');

      await lastValueFrom(oidcSecurityService.getRefreshToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('getAuthenticationResult', () => {
    it('calls authStateService.getAuthenticationResult()', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(authStateService, 'getAuthenticationResult')
        .mockReturnValue(null);

      await lastValueFrom(oidcSecurityService.getAuthenticationResult());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('getPayloadFromIdToken', () => {
    it('calls `authStateService.getIdToken` method, encode = false', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      vi.spyOn(authStateService, 'getIdToken').mockReturnValue('some-token');
      const spy = vi
        .spyOn(tokenHelperService, 'getPayloadFromToken')
        .mockReturnValue(null);

      await lastValueFrom(oidcSecurityService.getPayloadFromIdToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith('some-token', false, config);
    });

    it('calls `authStateService.getIdToken` method, encode = true', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      vi.spyOn(authStateService, 'getIdToken').mockReturnValue('some-token');
      const spy = vi
        .spyOn(tokenHelperService, 'getPayloadFromToken')
        .mockReturnValue(null);

      await lastValueFrom(oidcSecurityService.getPayloadFromIdToken(true));
      expect(spy).toHaveBeenCalledExactlyOnceWith('some-token', true, config);
    });
  });

  describe('getPayloadFromAccessToken', () => {
    it('calls `authStateService.getAccessToken` method, encode = false', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue(
        'some-access-token'
      );
      const spy = vi
        .spyOn(tokenHelperService, 'getPayloadFromToken')
        .mockReturnValue(null);

      await lastValueFrom(oidcSecurityService.getPayloadFromAccessToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith(
        'some-access-token',
        false,
        config
      );
    });

    it('calls `authStateService.getIdToken` method, encode = true', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue(
        'some-access-token'
      );
      const spy = vi
        .spyOn(tokenHelperService, 'getPayloadFromToken')
        .mockReturnValue(null);

      await lastValueFrom(oidcSecurityService.getPayloadFromAccessToken(true));
      expect(spy).toHaveBeenCalledExactlyOnceWith(
        'some-access-token',
        true,
        config
      );
    });
  });

  describe('setState', () => {
    it('calls flowsDataService.setAuthStateControl with param', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi.spyOn(flowsDataService, 'setAuthStateControl');

      await lastValueFrom(oidcSecurityService.setState('anyString'));
      expect(spy).toHaveBeenCalledExactlyOnceWith('anyString', config);
    });
  });

  describe('getState', () => {
    it('calls flowsDataService.getAuthStateControl', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi.spyOn(flowsDataService, 'getAuthStateControl');

      await lastValueFrom(oidcSecurityService.getState());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config);
    });
  });

  describe('authorize', () => {
    it('calls login service login', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi.spyOn(loginService, 'login');

      await lastValueFrom(oidcSecurityService.authorize());

      expect(spy).toHaveBeenCalledExactlyOnceWith(config, undefined);
    });

    it('calls login service login with authoptions', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi.spyOn(loginService, 'login');

      await lastValueFrom(
        oidcSecurityService.authorize('configId', {
          customParams: { some: 'param' },
        })
      );

      expect(spy).toHaveBeenCalledExactlyOnceWith(config, {
        customParams: { some: 'param' },
      });
    });
  });

  describe('authorizeWithPopUp', () => {
    it('calls login service loginWithPopUp', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );
      const spy = vi
        .spyOn(loginService, 'loginWithPopUp')
        .mockImplementation(() => of({} as LoginResponse));

      await lastValueFrom(oidcSecurityService.authorizeWithPopUp());
      expect(spy).toHaveBeenCalledExactlyOnceWith(
        config,
        [config],
        undefined,
        undefined
      );
    });
  });

  describe('forceRefreshSession', () => {
    it('calls refreshSessionService userForceRefreshSession with configId from config when none is passed', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );

      const spy = vi
        .spyOn(refreshSessionService, 'userForceRefreshSession')
        .mockReturnValue(of({} as LoginResponse));

      await lastValueFrom(oidcSecurityService.forceRefreshSession());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config], undefined);
    });
  });

  describe('logoffAndRevokeTokens', () => {
    it('calls logoffRevocationService.logoffAndRevokeTokens', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );
      const spy = vi
        .spyOn(logoffRevocationService, 'logoffAndRevokeTokens')
        .mockReturnValue(of(null));

      await lastValueFrom(oidcSecurityService.logoffAndRevokeTokens());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config], undefined);
    });
  });

  describe('logoff', () => {
    it('calls logoffRevocationService.logoff', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );
      const spy = vi
        .spyOn(logoffRevocationService, 'logoff')
        .mockReturnValue(of(null));

      await lastValueFrom(oidcSecurityService.logoff());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config], undefined);
    });
  });

  describe('logoffLocal', () => {
    it('calls logoffRevocationService.logoffLocal', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );
      const spy = vi.spyOn(logoffRevocationService, 'logoffLocal');
      await lastValueFrom(oidcSecurityService.logoffLocal());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, [config]);
    });
  });

  describe('logoffLocalMultiple', () => {
    it('calls logoffRevocationService.logoffLocalMultiple', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfigurations').mockReturnValue(
        of({ allConfigs: [config], currentConfig: config })
      );
      const spy = vi.spyOn(logoffRevocationService, 'logoffLocalMultiple');

      await lastValueFrom(oidcSecurityService.logoffLocalMultiple());
      expect(spy).toHaveBeenCalledExactlyOnceWith([config]);
    });
  });

  describe('revokeAccessToken', () => {
    it('calls logoffRevocationService.revokeAccessToken', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi
        .spyOn(logoffRevocationService, 'revokeAccessToken')
        .mockReturnValue(of(null));

      await lastValueFrom(oidcSecurityService.revokeAccessToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, undefined);
    });

    it('calls logoffRevocationService.revokeAccessToken with accesstoken', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi
        .spyOn(logoffRevocationService, 'revokeAccessToken')
        .mockReturnValue(of(null));

      await lastValueFrom(
        oidcSecurityService.revokeAccessToken('access_token')
      );
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, 'access_token');
    });
  });

  describe('revokeRefreshToken', () => {
    it('calls logoffRevocationService.revokeRefreshToken', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi
        .spyOn(logoffRevocationService, 'revokeRefreshToken')
        .mockReturnValue(of(null));

      await lastValueFrom(oidcSecurityService.revokeRefreshToken());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, undefined);
    });

    it('calls logoffRevocationService.revokeRefreshToken with refresh token', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );
      const spy = vi
        .spyOn(logoffRevocationService, 'revokeRefreshToken')
        .mockReturnValue(of(null));

      await lastValueFrom(
        oidcSecurityService.revokeRefreshToken('refresh_token')
      );
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, 'refresh_token');
    });
  });

  describe('getEndSessionUrl', () => {
    it('calls logoffRevocationService.getEndSessionUrl ', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(urlService, 'getEndSessionUrl')
        .mockReturnValue(null);

      await lastValueFrom(oidcSecurityService.getEndSessionUrl());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, undefined);
    });

    it('calls logoffRevocationService.getEndSessionUrl with customparams', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(urlService, 'getEndSessionUrl')
        .mockReturnValue(null);

      await lastValueFrom(
        oidcSecurityService.getEndSessionUrl({ custom: 'params' })
      );
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, {
        custom: 'params',
      });
    });
  });

  describe('getAuthorizeUrl', () => {
    it('calls urlService.getAuthorizeUrl ', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(urlService, 'getAuthorizeUrl')
        .mockReturnValue(of(null));

      await lastValueFrom(oidcSecurityService.getAuthorizeUrl());
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, undefined);
    });

    it('calls urlService.getAuthorizeUrl with customparams', async () => {
      const config = { configId: 'configId1' };

      vi.spyOn(configurationService, 'getOpenIDConfiguration').mockReturnValue(
        of(config)
      );

      const spy = vi
        .spyOn(urlService, 'getAuthorizeUrl')
        .mockReturnValue(of(null));

      await lastValueFrom(
        oidcSecurityService.getAuthorizeUrl({ custom: 'params' })
      );
      expect(spy).toHaveBeenCalledExactlyOnceWith(config, {
        customParams: { custom: 'params' },
      });
    });
  });
});
