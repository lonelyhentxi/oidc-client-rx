import { HttpClient } from '@ngify/http';
import { Injectable, inject } from 'injection-js';
import { Observable } from 'rxjs';

@Injectable()
export class HttpBaseService {
  constructor() {}

  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: { [key: string]: unknown }): Observable<T> {
    return this.http.get<T>(url, params);
  }

  post<T>(
    url: string,
    body: unknown,
    params?: { [key: string]: unknown }
  ): Observable<T> {
    return this.http.post<T>(url, body, params);
  }
}
