import { TestBed } from '@/testing';
import { DOCUMENT } from '../../dom';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        {
          provide: DOCUMENT,
          useValue: { defaultView: { crypto: 'some-thing' } },
        },
      ],
    });
    cryptoService = TestBed.inject(CryptoService);
  });

  it('should create', () => {
    expect(cryptoService).toBeTruthy();
  });

  it('should return crypto if crypto is present', () => {
    // arrange

    // act
    const crypto = cryptoService.getCrypto();

    // assert
    expect(crypto).toBe('some-thing');
  });
});

describe('CryptoService: msCrypto', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        {
          provide: DOCUMENT,
          useValue: { defaultView: { msCrypto: 'some-msCrypto-thing' } },
        },
      ],
    });
    cryptoService = TestBed.inject(CryptoService);
  });

  it('should create', () => {
    expect(cryptoService).toBeTruthy();
  });

  it('should return crypto if crypto is present', () => {
    // arrange

    // act
    const crypto = cryptoService.getCrypto();

    // assert
    expect(crypto).toBe('some-msCrypto-thing');
  });
});
