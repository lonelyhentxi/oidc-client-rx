import { TestBed, mockRouterProvider } from '@/testing';
import { AbstractRouter } from 'oidc-client-rx';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import type { CallbackContext } from '../flows/callback-context';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { mockProvider } from '../testing/mock';
import { CodeFlowCallbackService } from './code-flow-callback.service';
import { IntervalService } from './interval.service';

describe('CodeFlowCallbackService ', () => {
  let codeFlowCallbackService: CodeFlowCallbackService;
  let intervalService: IntervalService;
  let flowsService: FlowsService;
  let flowsDataService: FlowsDataService;
  let router: AbstractRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        mockRouterProvider(),
        CodeFlowCallbackService,
        mockProvider(FlowsService),
        mockProvider(FlowsDataService),
        mockProvider(IntervalService),
      ],
    });
    codeFlowCallbackService = TestBed.inject(CodeFlowCallbackService);
    intervalService = TestBed.inject(IntervalService);
    flowsDataService = TestBed.inject(FlowsDataService);
    flowsService = TestBed.inject(FlowsService);
    router = TestBed.inject(AbstractRouter);
  });

  it('should create', () => {
    expect(codeFlowCallbackService).toBeTruthy();
  });

  describe('authenticatedCallbackWithCode', () => {
    it('calls flowsService.processCodeFlowCallback with correct url', () => {
      const spy = vi
        .spyOn(flowsService, 'processCodeFlowCallback')
        .mockReturnValue(of({} as CallbackContext));
      //spyOn(configurationProvider, 'getOpenIDConfiguration').mockReturnValue({ triggerAuthorizationResultEvent: true });

      const config = {
        configId: 'configId1',
        triggerAuthorizationResultEvent: true,
      };

      codeFlowCallbackService.authenticatedCallbackWithCode(
        'some-url1',
        config,
        [config]
      );
      expect(spy).toHaveBeenCalledExactlyOnceWith('some-url1', config, [
        config,
      ]);
    });

    it('does only call resetCodeFlowInProgress if triggerAuthorizationResultEvent is true and isRenewProcess is true', async () => {
      const callbackContext = {
        code: '',
        refreshToken: '',
        state: '',
        sessionState: null,
        authResult: null,
        isRenewProcess: true,
        jwtKeys: null,
        validationResult: null,
        existingIdToken: '',
      };
      const spy = vi
        .spyOn(flowsService, 'processCodeFlowCallback')
        .mockReturnValue(of(callbackContext));
      const flowsDataSpy = vi.spyOn(
        flowsDataService,
        'resetCodeFlowInProgress'
      );
      const routerSpy = vi.spyOn(router, 'navigateByUrl');
      const config = {
        configId: 'configId1',
        triggerAuthorizationResultEvent: true,
      };

      codeFlowCallbackService
        .authenticatedCallbackWithCode('some-url2', config, [config])
        .subscribe(() => {
          expect(spy).toHaveBeenCalledExactlyOnceWith('some-url2', config, [
            config,
          ]);
          expect(routerSpy).not.toHaveBeenCalled();
          expect(flowsDataSpy).toHaveBeenCalled();
        });
    });

    it('calls router and resetCodeFlowInProgress if triggerAuthorizationResultEvent is false and isRenewProcess is false', async () => {
      const callbackContext = {
        code: '',
        refreshToken: '',
        state: '',
        sessionState: null,
        authResult: null,
        isRenewProcess: false,
        jwtKeys: null,
        validationResult: null,
        existingIdToken: '',
      };
      const spy = vi
        .spyOn(flowsService, 'processCodeFlowCallback')
        .mockReturnValue(of(callbackContext));
      const flowsDataSpy = vi.spyOn(
        flowsDataService,
        'resetCodeFlowInProgress'
      );
      const routerSpy = vi.spyOn(router, 'navigateByUrl');
      const config = {
        configId: 'configId1',
        triggerAuthorizationResultEvent: false,
        postLoginRoute: 'postLoginRoute',
      };

      codeFlowCallbackService
        .authenticatedCallbackWithCode('some-url3', config, [config])
        .subscribe(() => {
          expect(spy).toHaveBeenCalledExactlyOnceWith('some-url3', config, [
            config,
          ]);
          expect(routerSpy).toHaveBeenCalledExactlyOnceWith('postLoginRoute');
          expect(flowsDataSpy).toHaveBeenCalled();
        });
    });

    it('resetSilentRenewRunning, resetCodeFlowInProgress and stopPeriodicallTokenCheck in case of error', async () => {
      vi.spyOn(flowsService, 'processCodeFlowCallback').mockReturnValue(
        throwError(() => new Error('error'))
      );
      const resetSilentRenewRunningSpy = vi.spyOn(
        flowsDataService,
        'resetSilentRenewRunning'
      );
      const resetCodeFlowInProgressSpy = vi.spyOn(
        flowsDataService,
        'resetCodeFlowInProgress'
      );
      const stopPeriodicallTokenCheckSpy = vi.spyOn(
        intervalService,
        'stopPeriodicTokenCheck'
      );

      const config = {
        configId: 'configId1',
        triggerAuthorizationResultEvent: false,
        postLoginRoute: 'postLoginRoute',
      };

      codeFlowCallbackService
        .authenticatedCallbackWithCode('some-url4', config, [config])
        .subscribe({
          error: (err) => {
            expect(resetSilentRenewRunningSpy).toHaveBeenCalled();
            expect(resetCodeFlowInProgressSpy).toHaveBeenCalled();
            expect(stopPeriodicallTokenCheckSpy).toHaveBeenCalled();
            expect(err).toBeTruthy();
          },
        });
    });

    it(`navigates to unauthorizedRoute in case of error and  in case of error and
            triggerAuthorizationResultEvent is false`, async () => {
      vi.spyOn(flowsDataService, 'isSilentRenewRunning').mockReturnValue(false);
      vi.spyOn(flowsService, 'processCodeFlowCallback').mockReturnValue(
        throwError(() => new Error('error'))
      );
      const resetSilentRenewRunningSpy = vi.spyOn(
        flowsDataService,
        'resetSilentRenewRunning'
      );
      const stopPeriodicallTokenCheckSpy = vi.spyOn(
        intervalService,
        'stopPeriodicTokenCheck'
      );
      const routerSpy = vi.spyOn(router, 'navigateByUrl');

      const config = {
        configId: 'configId1',
        triggerAuthorizationResultEvent: false,
        unauthorizedRoute: 'unauthorizedRoute',
      };

      codeFlowCallbackService
        .authenticatedCallbackWithCode('some-url5', config, [config])
        .subscribe({
          error: (err) => {
            expect(resetSilentRenewRunningSpy).toHaveBeenCalled();
            expect(stopPeriodicallTokenCheckSpy).toHaveBeenCalled();
            expect(err).toBeTruthy();
            expect(routerSpy).toHaveBeenCalledExactlyOnceWith(
              'unauthorizedRoute'
            );
          },
        });
    });
  });
});
