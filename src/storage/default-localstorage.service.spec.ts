import { TestBed } from '@/testing';
import { vi } from 'vitest';
import { DefaultLocalStorageService } from './default-localstorage.service';

describe('DefaultLocalStorageService', () => {
  let service: DefaultLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultLocalStorageService],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(DefaultLocalStorageService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('read', () => {
    it('should call localstorage.getItem', () => {
      const spy = vi.spyOn(localStorage, 'getItem');

      service.read('henlo');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo');
    });
  });

  describe('write', () => {
    it('should call localstorage.setItem', () => {
      const spy = vi.spyOn(localStorage, 'setItem');

      service.write('henlo', 'furiend');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo', 'furiend');
    });
  });

  describe('remove', () => {
    it('should call localstorage.removeItem', () => {
      const spy = vi.spyOn(localStorage, 'removeItem');

      service.remove('henlo');

      expect(spy).toHaveBeenCalledExactlyOnceWith('henlo');
    });
  });

  describe('clear', () => {
    it('should call localstorage.clear', () => {
      const spy = vi.spyOn(localStorage, 'clear');

      service.clear();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
