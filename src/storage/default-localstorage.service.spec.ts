import { TestBed } from '@/testing';
import { vi } from 'vitest';
import { DefaultLocalStorageService } from './default-localstorage.service';

describe('DefaultLocalStorageService', () => {
  let service: DefaultLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultLocalStorageService],
    });
    service = TestBed.inject(DefaultLocalStorageService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('read', () => {
    it('should call localstorage.getItem', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'getItem');

      service.read('henlo');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo');
    });
  });

  describe('write', () => {
    it('should call localstorage.setItem', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'setItem');

      service.write('henlo', 'furiend');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo', 'furiend');
    });
  });

  describe('remove', () => {
    it('should call localstorage.removeItem', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'removeItem');

      service.remove('henlo');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo');
    });
  });

  describe('clear', () => {
    it('should call localstorage.clear', () => {
      // https://github.com/jsdom/jsdom/issues/2318
      const spy = vi.spyOn(Storage.prototype, 'clear');

      service.clear();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
