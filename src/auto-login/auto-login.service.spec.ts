import { TestBed } from '@/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';
import { StoragePersistenceService } from '../storage/storage-persistence.service';
import { mockProvider } from '../testing/mock';
import { AutoLoginService } from './auto-login.service';

describe('AutoLoginService ', () => {
  let autoLoginService: AutoLoginService;
  let storagePersistenceService: StoragePersistenceService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AutoLoginService, mockProvider(StoragePersistenceService)],
    });
    router = TestBed.inject(Router);
    autoLoginService = TestBed.inject(AutoLoginService);
    storagePersistenceService = TestBed.inject(StoragePersistenceService);
  });

  it('should create', () => {
    expect(autoLoginService).toBeTruthy();
  });

  describe('checkSavedRedirectRouteAndNavigate', () => {
    it('if not route is saved, router and delete are not called', () => {
      const deleteSpy = vi.spyOn(storagePersistenceService, 'remove');
      const routerSpy = vi.spyOn(router, 'navigateByUrl');
      const readSpy = vi
        .spyOn(storagePersistenceService, 'read')
        .mockReturnValue(null);

      autoLoginService.checkSavedRedirectRouteAndNavigate({
        configId: 'configId1',
      });

      expect(deleteSpy).not.toHaveBeenCalled();
      expect(routerSpy).not.toHaveBeenCalled();
      expect(readSpy).toHaveBeenCalledExactlyOnceWith('redirect', {
        configId: 'configId1',
      });
    });

    it('if route is saved, router and delete are called', () => {
      const deleteSpy = vi.spyOn(storagePersistenceService, 'remove');
      const routerSpy = vi.spyOn(router, 'navigateByUrl');
      const readSpy = vi
        .spyOn(storagePersistenceService, 'read')
        .mockReturnValue('saved-route');

      autoLoginService.checkSavedRedirectRouteAndNavigate({
        configId: 'configId1',
      });

      expect(deleteSpy).toHaveBeenCalledExactlyOnceWith('redirect', {
        configId: 'configId1',
      });
      expect(routerSpy).toHaveBeenCalledExactlyOnceWith('saved-route');
      expect(readSpy).toHaveBeenCalledExactlyOnceWith('redirect', {
        configId: 'configId1',
      });
    });
  });

  describe('saveRedirectRoute', () => {
    it('calls storageService with correct params', () => {
      const writeSpy = vi.spyOn(storagePersistenceService, 'write');

      autoLoginService.saveRedirectRoute(
        { configId: 'configId1' },
        'some-route'
      );

      expect(writeSpy).toHaveBeenCalledExactlyOnceWith(
        'redirect',
        'some-route',
        {
          configId: 'configId1',
        }
      );
    });
  });
});
