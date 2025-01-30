import { TestBed } from '@/testing';
import { vi } from 'vitest';
import { DOCUMENT } from '../../dom';
import { RedirectService } from './redirect.service';

describe('Redirect Service Tests', () => {
  let service: RedirectService;
  let myDocument: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RedirectService,
        {
          provide: DOCUMENT,
          useValue: {
            location: {
              get href(): string {
                return 'fakeUrl';
              },
              set href(_value) {
                // ...
              },
            },
          },
        },
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(RedirectService);
    myDocument = TestBed.inject(DOCUMENT);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
    expect(myDocument).toBeTruthy();
  });

  it('redirectTo sets window location href', () => {
    const spy = vi.spyOnProperty(myDocument.location, 'href', 'set');

    service.redirectTo('anyurl');
    expect(spy).toHaveBeenCalledExactlyOnceWith('anyurl');
  });
});
