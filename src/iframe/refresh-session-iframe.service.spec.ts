import { TestBed } from '@/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { LoggerService } from '../logging/logger.service';
import { mockProvider } from '../testing/mock';
import { UrlService } from '../utils/url/url.service';
import { RefreshSessionIframeService } from './refresh-session-iframe.service';
import { SilentRenewService } from './silent-renew.service';

describe('RefreshSessionIframeService ', () => {
  let refreshSessionIframeService: RefreshSessionIframeService;
  let urlService: UrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RefreshSessionIframeService,
        mockProvider(SilentRenewService),
        mockProvider(LoggerService),
        mockProvider(UrlService),
      ],
    });
  });

  beforeEach(() => {
    refreshSessionIframeService = TestBed.inject(RefreshSessionIframeService);
    urlService = TestBed.inject(UrlService);
  });

  it('should create', () => {
    expect(refreshSessionIframeService).toBeTruthy();
  });

  describe('refreshSessionWithIframe', () => {
    it('calls sendAuthorizeRequestUsingSilentRenew with created url', async () => {
      vi.spyOn(urlService, 'getRefreshSessionSilentRenewUrl').mockReturnValue(
        of('a-url')
      );
      const sendAuthorizeRequestUsingSilentRenewSpy = vi
        .spyOn(
          refreshSessionIframeService as any,
          'sendAuthorizeRequestUsingSilentRenew'
        )
        .mockReturnValue(of(null));
      const allConfigs = [{ configId: 'configId1' }];

      refreshSessionIframeService
        .refreshSessionWithIframe(allConfigs[0]!, allConfigs)
        .subscribe(() => {
          expect(
            sendAuthorizeRequestUsingSilentRenewSpy
          ).toHaveBeenCalledExactlyOnceWith(
            'a-url',
            allConfigs[0]!,
            allConfigs
          );
        });
    });
  });

  describe('initSilentRenewRequest', () => {
    it('dispatches customevent to window object', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      (refreshSessionIframeService as any).initSilentRenewRequest();

      expect(dispatchEventSpy).toHaveBeenCalledExactlyOnceWith(
        new CustomEvent('oidc-silent-renew-init', {
          detail: expect.any(Number),
        })
      );
    });
  });
});
