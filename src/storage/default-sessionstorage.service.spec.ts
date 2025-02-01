import { TestBed } from '@/testing';
import { vi } from 'vitest';
import { DefaultSessionStorageService } from './default-sessionstorage.service';

describe('DefaultSessionStorageService', () => {
  let service: DefaultSessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultSessionStorageService],
    });
    service = TestBed.inject(DefaultSessionStorageService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('read', () => {
    it('should call sessionstorage.getItem', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'getItem');

      service.read('henlo');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo');
    });
  });

  describe('write', () => {
    it('should call sessionstorage.setItem', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'setItem');

      service.write('henlo', 'furiend');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo', 'furiend');
    });
  });

  describe('remove', () => {
    it('should call sessionstorage.removeItem', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'removeItem');

      service.remove('henlo');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo');
    });
  });

  describe('clear', () => {
    it('should call sessionstorage.clear', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'clear');

      service.clear();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
