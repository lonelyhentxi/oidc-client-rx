import { TestBed, mockImplementationWhenArgsEqual } from '@/testing';
import { HttpErrorResponse, HttpHeaders } from '@ngify/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DataService } from '../../api/data.service';
import { LoggerService } from '../../logging/logger.service';
import { StoragePersistenceService } from '../../storage/storage-persistence.service';
import { createRetriableStream } from '../../testing/create-retriable-stream.helper';
import { mockProvider } from '../../testing/mock';
import { UrlService } from '../../utils/url/url.service';
import type { CallbackContext } from '../callback-context';
import { RefreshTokenCallbackHandlerService } from './refresh-token-callback-handler.service';

describe('RefreshTokenCallbackHandlerService', () => {
  let service: RefreshTokenCallbackHandlerService;
  let storagePersistenceService: StoragePersistenceService;
  let dataService: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RefreshTokenCallbackHandlerService,
        mockProvider(UrlService),
        mockProvider(LoggerService),
        mockProvider(DataService),
        mockProvider(StoragePersistenceService),
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(RefreshTokenCallbackHandlerService);
    storagePersistenceService = TestBed.inject(StoragePersistenceService);
    dataService = TestBed.inject(DataService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('refreshTokensRequestTokens', () => {
    const HTTP_ERROR = new HttpErrorResponse({});
    const CONNECTION_ERROR = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 0,
      statusText: 'Unknown Error',
      url: 'https://identity-server.test/openid-connect/token',
    });

    it('throws error if no tokenEndpoint is given', async () => {
      (service as any)
        .refreshTokensRequestTokens({} as CallbackContext)
        .subscribe({
          error: (err: unknown) => {
            expect(err).toBeTruthy();
          },
        });
    });

    it('calls data service if all params are good', async () => {
      const postSpy = vi.spyOn(dataService, 'post').mockReturnValue(of({}));

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', { configId: 'configId1' }],
        () => ({ tokenEndpoint: 'tokenEndpoint' })
      );

      await lastValueFrom(service
        .refreshTokensRequestTokens({} as CallbackContext, {
          configId: 'configId1',
        }));
expect(postSpy).toHaveBeenCalledExactlyOnceWith(
            'tokenEndpoint',
            undefined,
            { configId: 'configId1' },
            expect.any(HttpHeaders)
          );;
const httpHeaders = postSpy.calls.mostRecent().args[3] as HttpHeaders;;
expect(httpHeaders.has('Content-Type')).toBeTruthy();;
expect(httpHeaders.get('Content-Type')).toBe(
            'application/x-www-form-urlencoded'
          );
    });

    it('calls data service with correct headers if all params are good', async () => {
      const postSpy = vi.spyOn(dataService, 'post').mockReturnValue(of({}));

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', { configId: 'configId1' }],
        () => ({ tokenEndpoint: 'tokenEndpoint' })
      );

      await lastValueFrom(service
        .refreshTokensRequestTokens({} as CallbackContext, {
          configId: 'configId1',
        }));
const httpHeaders = postSpy.calls.mostRecent().args[3] as HttpHeaders;;
expect(httpHeaders.has('Content-Type')).toBeTruthy();;
expect(httpHeaders.get('Content-Type')).toBe(
            'application/x-www-form-urlencoded'
          );
    });

    it('returns error in case of http error', async () => {
      vi.spyOn(dataService, 'post').mockReturnValue(
        throwError(() => HTTP_ERROR)
      );
      const config = { configId: 'configId1', authority: 'authority' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ tokenEndpoint: 'tokenEndpoint' })
      );

      service
        .refreshTokensRequestTokens({} as CallbackContext, config)
        .subscribe({
          error: (err) => {
            expect(err).toBeTruthy();
          },
        });
    });

    it('retries request in case of no connection http error and succeeds', async () => {
      const postSpy = vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => CONNECTION_ERROR),
          of({})
        )
      );
      const config = { configId: 'configId1', authority: 'authority' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ tokenEndpoint: 'tokenEndpoint' })
      );

      service
        .refreshTokensRequestTokens({} as CallbackContext, config)
        .subscribe({
          next: (res) => {
            expect(res).toBeTruthy();
            expect(postSpy).toHaveBeenCalledTimes(1);
          },
          error: (err) => {
            // fails if there should be a result
            expect(err).toBeFalsy();
          },
        });
    });

    it('retries request in case of no connection http error and fails because of http error afterwards', async () => {
      const postSpy = vi.spyOn(dataService, 'post').mockReturnValue(
        createRetriableStream(
          throwError(() => CONNECTION_ERROR),
          throwError(() => HTTP_ERROR)
        )
      );
      const config = { configId: 'configId1', authority: 'authority' };

      mockImplementationWhenArgsEqual(
        vi.spyOn(storagePersistenceService, 'read'),
        ['authWellKnownEndPoints', config],
        () => ({ tokenEndpoint: 'tokenEndpoint' })
      );

      service
        .refreshTokensRequestTokens({} as CallbackContext, config)
        .subscribe({
          next: (res) => {
            // fails if there should be a result
            expect(res).toBeFalsy();
          },
          error: (err) => {
            expect(err).toBeTruthy();
            expect(postSpy).toHaveBeenCalledTimes(1);
          },
        });
    });
  });
});
