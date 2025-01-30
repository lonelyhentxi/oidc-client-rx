import { TestBed, fakeAsync, tick } from '@/testing';
import { vi } from 'vitest';
import type { OpenIdConfiguration } from '../../config/openid-configuration';
import { LoggerService } from '../../logging/logger.service';
import { StoragePersistenceService } from '../../storage/storage-persistence.service';
import { mockProvider } from '../../testing/mock';
import type { PopupResult } from './popup-result';
import { PopUpService } from './popup.service';

describe('PopUpService', () => {
  let popUpService: PopUpService;
  let storagePersistenceService: StoragePersistenceService;
  let loggerService: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        mockProvider(StoragePersistenceService),
        mockProvider(LoggerService),
      ],
    });
    storagePersistenceService = TestBed.inject(StoragePersistenceService);
    loggerService = TestBed.inject(LoggerService);
    popUpService = TestBed.inject(PopUpService);
  });

  let store: any = {};
  const mockStorage = {
    getItem: (key: string): string => {
      return key in store ? store[key] : null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = `${value}`;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    length: 1,
    key: (_i: any): string => '',
  };

  it('should create', () => {
    expect(popUpService).toBeTruthy();
  });

  describe('isCurrentlyInPopup', () => {
    it('returns false if can not access Session Storage', () => {
      // arrange
      vi.spyOn(popUpService as any, 'canAccessSessionStorage').mockReturnValue(
        false
      );
      spyOnProperty(popUpService as any, 'windowInternal').mockReturnValue({
        opener: {} as Window,
      });
      vi.spyOn(storagePersistenceService, 'read').mockReturnValue({
        popupauth: true,
      });
      const config = {} as OpenIdConfiguration;

      // act
      const result = popUpService.isCurrentlyInPopup(config);

      // assert
      expect(result).toBe(false);
    });

    it('returns false if window has no opener', () => {
      // arrange
      vi.spyOn(popUpService as any, 'canAccessSessionStorage').mockReturnValue(
        true
      );
      vi.spyOn(storagePersistenceService, 'read').mockReturnValue({
        popupauth: true,
      });
      const config = {} as OpenIdConfiguration;

      // act
      const result = popUpService.isCurrentlyInPopup(config);

      // assert
      expect(result).toBe(false);
    });

    it('returns true if isCurrentlyInPopup', () => {
      // arrange
      vi.spyOn(popUpService as any, 'canAccessSessionStorage').mockReturnValue(
        true
      );
      spyOnProperty(popUpService as any, 'windowInternal').mockReturnValue({
        opener: {} as Window,
      });
      vi.spyOn(storagePersistenceService, 'read').mockReturnValue({
        popupauth: true,
      });
      const config = {} as OpenIdConfiguration;

      // act
      const result = popUpService.isCurrentlyInPopup(config);

      // assert
      expect(result).toBe(true);
    });
  });

  describe('result$', () => {
    it('emits when internal subject is called', async () => {
      const popupResult: PopupResult = {
        userClosed: false,
        receivedUrl: 'some-url1111',
      };

      popUpService.result$.subscribe((result) => {
        expect(result).toBe(popupResult);
      });

      (popUpService as any).resultInternal$.next(popupResult);
    });
  });

  describe('openPopup', () => {
    it('popup opens with parameters and default options', async () => {
      // arrange
      const popupSpy = vi.spyOn(window, 'open').and.callFake(
        () =>
          ({
            closed: true,
            close: () => undefined,
          }) as Window
      );

      // act
      popUpService.openPopUp('url', {}, { configId: 'configId1' });

      // assert
      expect(popupSpy).toHaveBeenCalledExactlyOnceWith(
        'url',
        '_blank',
        expect.any(String)
      );
    });

    it('popup opens with parameters and passed options', async () => {
      // arrange
      const popupSpy = vi.spyOn(window, 'open').and.callFake(
        () =>
          ({
            closed: true,
            close: () => undefined,
          }) as Window
      );

      // act
      popUpService.openPopUp('url', { width: 100 }, { configId: 'configId1' });

      // assert
      expect(popupSpy).toHaveBeenCalledExactlyOnceWith(
        'url',
        '_blank',
        expect.any(String)
      );
    });

    it('logs error and return if popup could not be opened', () => {
      // arrange
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const loggerSpy = vi.spyOn(loggerService, 'logError');

      // act
      popUpService.openPopUp('url', { width: 100 }, { configId: 'configId1' });

      // assert
      expect(loggerSpy).toHaveBeenCalledExactlyOnceWith(
        { configId: 'configId1' },
        'Could not open popup'
      );
    });

    describe('popup closed', () => {
      let popup: Window;
      let popupResult: PopupResult;
      let cleanUpSpy: jasmine.Spy;

      beforeEach(() => {
        popup = {
          closed: false,
          close: () => undefined,
        } as Window;

        vi.spyOn(window, 'open').mockReturnValue(popup);

        cleanUpSpy = vi.spyOn(popUpService as any, 'cleanUp')();

        popupResult = {} as PopupResult;

        popUpService.result$.subscribe((result) => (popupResult = result));
      });

      it('message received with data', async () => {
        let listener: (event: MessageEvent) => void = () => {
          return;
        };

        vi.spyOn(window, 'addEventListener').and.callFake(
          (_: any, func: any) => (listener = func)
        );

        popUpService.openPopUp('url', {}, { configId: 'configId1' });

        expect(popupResult).toEqual({} as PopupResult);
        expect(cleanUpSpy).not.toHaveBeenCalled();

        listener(new MessageEvent('message', { data: 'some-url1111' }));

        tick(200);

        expect(popupResult).toEqual({
          userClosed: false,
          receivedUrl: 'some-url1111',
        });
        expect(cleanUpSpy).toHaveBeenCalledExactlyOnceWith(listener, {
          configId: 'configId1',
        });
      });

      it('message received without data does return but cleanup does not throw event', async () => {
        let listener: (event: MessageEvent) => void = () => {
          return;
        };

        vi.spyOn(window, 'addEventListener').and.callFake(
          (_: any, func: any) => (listener = func)
        );
        const nextSpy = vi.spyOn((popUpService as any).resultInternal$, 'next');

        popUpService.openPopUp('url', {}, { configId: 'configId1' });

        expect(popupResult).toEqual({} as PopupResult);
        expect(cleanUpSpy).not.toHaveBeenCalled();

        listener(new MessageEvent('message', { data: null }));

        tick(200);

        expect(popupResult).toEqual({} as PopupResult);
        expect(cleanUpSpy).toHaveBeenCalled();
        expect(nextSpy).not.toHaveBeenCalled();
      });

      it('user closed', async () => {
        popUpService.openPopUp('url', undefined, { configId: 'configId1' });

        expect(popupResult).toEqual({} as PopupResult);
        expect(cleanUpSpy).not.toHaveBeenCalled();

        (popup as any).closed = true;

        tick(200);

        expect(popupResult).toEqual({
          userClosed: true,
          receivedUrl: '',
        } as PopupResult);
        expect(cleanUpSpy).toHaveBeenCalled();
      });
    });
  });

  describe('sendMessageToMainWindow', () => {
    it('does nothing if window.opener is null', async () => {
      // arrange
      spyOnProperty(window, 'opener').mockReturnValue(null);

      const sendMessageSpy = vi.spyOn(popUpService as any, 'sendMessage');

      // act
      popUpService.sendMessageToMainWindow('', {});

      // assert
      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    it('calls postMessage when window opener is given', async () => {
      // arrange
      spyOnProperty(window, 'opener').mockReturnValue({
        postMessage: () => undefined,
      });
      const sendMessageSpy = vi.spyOn(window.opener, 'postMessage');

      // act
      popUpService.sendMessageToMainWindow('someUrl', {});

      // assert
      expect(sendMessageSpy).toHaveBeenCalledExactlyOnceWith(
        'someUrl',
        expect.any(String)
      );
    });
  });

  describe('cleanUp', () => {
    it('calls removeEventListener on window with correct params', async () => {
      // arrange
      const spy = vi
        .spyOn(window, 'removeEventListener')
        .mockImplementation(() => undefined);
      const listener: any = null;

      // act
      (popUpService as any).cleanUp(listener, { configId: 'configId1' });

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledExactlyOnceWith('message', listener, false);
    });

    it('removes popup from sessionstorage, closes and nulls when popup is opened', async () => {
      // arrange
      const popupMock = {
        anyThing: 'truthy',
        sessionStorage: mockStorage,
        close: (): void => undefined,
      };
      const removeItemSpy = vi.spyOn(storagePersistenceService, 'remove');
      const closeSpy = vi.spyOn(popupMock, 'close');

      // act
      (popUpService as any).popUp = popupMock;
      (popUpService as any).cleanUp(null, { configId: 'configId1' });

      // assert
      expect(removeItemSpy).toHaveBeenCalledExactlyOnceWith('popupauth', {
        configId: 'configId1',
      });
      expect(closeSpy).toHaveBeenCalledTimes(1);
      expect((popUpService as any).popUp).toBeNull();
    });
  });
});
