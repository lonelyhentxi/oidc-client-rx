import { TestBed } from '@/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@ngify/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@ngify/http/testing';
import { vi } from 'vitest';
import { AuthStateService } from '../auth-state/auth-state.service';
import { ConfigurationService } from '../config/config.service';
import { LoggerService } from '../logging/logger.service';
import { mockProvider } from '../testing/mock';
import { AuthInterceptor, authInterceptor } from './auth.interceptor';
import { ClosestMatchingRouteService } from './closest-matching-route.service';

describe(`AuthHttpInterceptor`, () => {
  let httpTestingController: HttpTestingController;
  let configurationService: ConfigurationService;
  let httpClient: HttpClient;
  let authStateService: AuthStateService;
  let closestMatchingRouteService: ClosestMatchingRouteService;

  describe(`with Class Interceptor`, () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [
          ClosestMatchingRouteService,
          {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
          },
          mockProvider(AuthStateService),
          mockProvider(LoggerService),
          mockProvider(ConfigurationService),
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting(),
        ],
      });

      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
      configurationService = TestBed.inject(ConfigurationService);
      authStateService = TestBed.inject(AuthStateService);
      closestMatchingRouteService = TestBed.inject(ClosestMatchingRouteService);
    });

    afterEach(() => {
      httpTestingController.verify();
    });

    runTests();
  });

  describe(`with Functional Interceptor`, () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          ClosestMatchingRouteService,
          provideHttpClient(withInterceptors([authInterceptor()])),
          provideHttpClientTesting(),
          mockProvider(AuthStateService),
          mockProvider(LoggerService),
          mockProvider(ConfigurationService),
        ],
      });

      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
      configurationService = TestBed.inject(ConfigurationService);
      authStateService = TestBed.inject(AuthStateService);
      closestMatchingRouteService = TestBed.inject(ClosestMatchingRouteService);
    });

    afterEach(() => {
      httpTestingController.verify();
    });

    runTests();
  });

  function runTests(): void {
    it('should add an Authorization header when route matches and token is present', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        {
          secureRoutes: [actionUrl],
          configId: 'configId1',
        },
      ]);

      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue(
        'thisIsAToken'
      );
      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(true);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should not add an Authorization header when `secureRoutes` is not given', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        {
          configId: 'configId1',
        },
      ]);
      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue(
        'thisIsAToken'
      );
      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should not add an Authorization header when no routes configured', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        {
          secureRoutes: [],
          configId: 'configId1',
        },
      ]);

      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );
      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue(
        'thisIsAToken'
      );

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should not add an Authorization header when no routes configured', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        {
          secureRoutes: [],
          configId: 'configId1',
        },
      ]);

      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should not add an Authorization header when route is configured but no token is present', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        {
          secureRoutes: [actionUrl],
          configId: 'configId1',
        },
      ]);

      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );
      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue('');

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should not add an Authorization header when no config is present', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        false
      );

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should not add an Authorization header when no configured route is matching the request', async () => {
      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );
      const actionUrl = `https://jsonplaceholder.typicode.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        {
          secureRoutes: [actionUrl],
          configId: 'configId1',
        },
      ]);
      vi.spyOn(
        closestMatchingRouteService,
        'getConfigIdForClosestMatchingRoute'
      ).mockReturnValue({
        matchingRoute: null,
        matchingConfig: null,
      });

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(false);

      httpRequest.flush('something');
      httpTestingController.verify();
    });

    it('should add an Authorization header when multiple routes are configured and token is present', async () => {
      const actionUrl = `https://jsonplaceholder.typicode.com/`;
      const actionUrl2 = `https://some-other-url.com/`;

      vi.spyOn(configurationService, 'getAllConfigurations').mockReturnValue([
        { secureRoutes: [actionUrl, actionUrl2], configId: 'configId1' },
      ]);

      vi.spyOn(authStateService, 'getAccessToken').mockReturnValue(
        'thisIsAToken'
      );
      vi.spyOn(configurationService, 'hasAtLeastOneConfig').mockReturnValue(
        true
      );

      httpClient.get(actionUrl).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      httpClient.get(actionUrl2).subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const httpRequest = httpTestingController.expectOne(actionUrl);

      expect(httpRequest.request.headers.has('Authorization')).toEqual(true);

      const httpRequest2 = httpTestingController.expectOne(actionUrl2);

      expect(httpRequest2.request.headers.has('Authorization')).toEqual(true);

      httpRequest.flush('something');
      httpRequest2.flush('something');
      httpTestingController.verify();
    });
  }
});
