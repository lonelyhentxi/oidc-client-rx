import { HttpHeaders } from '@ngify/http';
import { Injectable, inject } from '@outposts/injection-js';
import type { Observable } from 'rxjs';
import type { OpenIdConfiguration } from '../config/openid-configuration';
import { HttpParams } from '../http';
import { HttpBaseService } from './http-base.service';

const NGSW_CUSTOM_PARAM = 'ngsw-bypass';

@Injectable()
export class DataService {
  private readonly httpClient = inject(HttpBaseService);

  get<T>(
    url: string,
    config: OpenIdConfiguration,
    token?: string
  ): Observable<T> {
    const headers = this.prepareHeaders(token);
    const params = this.prepareParams(config);

    return this.httpClient.get<T>(url, {
      headers,
      params,
    });
  }

  post<T>(
    url: string | null,
    body: unknown,
    config: OpenIdConfiguration,
    headersParams?: HttpHeaders
  ): Observable<T> {
    const headers = headersParams || this.prepareHeaders();
    const params = this.prepareParams(config);

    return this.httpClient.post<T>(url ?? '', body, { headers, params });
  }

  private prepareHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders();

    headers = headers.set('Accept', 'application/json');

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${decodeURIComponent(token)}`
      );
    }

    return headers;
  }

  private prepareParams(config: OpenIdConfiguration): HttpParams {
    let params = new HttpParams();

    const { ngswBypass } = config;

    if (ngswBypass) {
      params = params.set(NGSW_CUSTOM_PARAM, '');
    }

    return params;
  }
}
