import { TestBed } from '@/testing';
import {
  HTTP_CLIENT_TEST_CONTROLLER,
  provideHttpClientTesting,
} from '@/testing/http';
import { HttpHeaders } from '@ngify/http';
import type { HttpTestingController } from '@ngify/http/testing';
import { firstValueFrom } from 'rxjs';
import { DataService } from './data.service';
import { HttpBaseService } from './http-base.service';

describe('Data Service', () => {
  let dataService: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [DataService, HttpBaseService, provideHttpClientTesting()],
    });
    dataService = TestBed.inject(DataService);
    httpMock = TestBed.inject(HTTP_CLIENT_TEST_CONTROLLER);
  });

  it('should create', () => {
    expect(dataService).toBeTruthy();
  });

  describe('get', () => {
    it('get call sets the accept header', async () => {
      const url = 'testurl';

      const data = await firstValueFrom(
        dataService.get(url, { configId: 'configId1' })
      );
      expect(data).toBe('bodyData');
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');

      req.flush('bodyData');

      httpMock.verify();
    });

    it('get call with token the accept header and the token', async () => {
      const url = 'testurl';
      const token = 'token';

      const data = await firstValueFrom(
        dataService.get(url, { configId: 'configId1' }, token)
      );
      expect(data).toBe('bodyData');
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

      req.flush('bodyData');

      httpMock.verify();
    });

    it('call without ngsw-bypass param by default', async () => {
      const url = 'testurl';

      const data = await firstValueFrom(
        dataService.get(url, { configId: 'configId1' })
      );
      expect(data).toBe('bodyData');
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.params.get('ngsw-bypass')).toBeNull();

      req.flush('bodyData');

      httpMock.verify();
    });

    it('call with ngsw-bypass param', async () => {
      const url = 'testurl';

      const data = await firstValueFrom(
        dataService.get(url, { configId: 'configId1', ngswBypass: true })
      );
      expect(data).toBe('bodyData');
      const req = httpMock.expectOne(`${url}?ngsw-bypass=`);

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.params.get('ngsw-bypass')).toBe('');

      req.flush('bodyData');

      httpMock.verify();
    });
  });

  describe('post', () => {
    it('call sets the accept header when no other params given', async () => {
      const url = 'testurl';

      await firstValueFrom(
        dataService.post(url, { some: 'thing' }, { configId: 'configId1' })
      );
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');

      req.flush('bodyData');

      await httpMock.verify();
    });

    it('call sets custom headers ONLY (No ACCEPT header) when custom headers are given', async () => {
      const url = 'testurl';
      let headers = new HttpHeaders();

      headers = headers.set('X-MyHeader', 'Genesis');

      await firstValueFrom(
        dataService.post(
          url,
          { some: 'thing' },
          { configId: 'configId1' },
          headers
        )
      );
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-MyHeader')).toEqual('Genesis');
      expect(req.request.headers.get('X-MyHeader')).not.toEqual('Genesis333');

      req.flush('bodyData');

      httpMock.verify();
    });

    it('call without ngsw-bypass param by default', async () => {
      const url = 'testurl';

      await firstValueFrom(
        dataService.post(url, { some: 'thing' }, { configId: 'configId1' })
      );
      const req = httpMock.expectOne(url);

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.params.get('ngsw-bypass')).toBeNull();

      req.flush('bodyData');

      httpMock.verify();
    });

    it('call with ngsw-bypass param', async () => {
      const url = 'testurl';

      await firstValueFrom(
        dataService.post(
          url,
          { some: 'thing' },
          { configId: 'configId1', ngswBypass: true }
        )
      );
      // biome-ignore lint/style/useTemplate: <explanation>
      const req = httpMock.expectOne(url + '?ngsw-bypass=');

      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.params.get('ngsw-bypass')).toBe('');

      req.flush('bodyData');

      httpMock.verify();
    });
  });
});
