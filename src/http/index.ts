import type { HttpFeature, HttpInterceptor } from '@ngify/http';
import { InjectionToken } from 'injection-js';
export { HttpParams, HttpParamsOptions } from './params';

export const HTTP_INTERCEPTORS = new InjectionToken<readonly HttpInterceptor[]>(
  'HTTP_INTERCEPTORS'
);

export function provideHttpClient() {
  // todo
  throw new Error('todo!');
}

export function withInterceptorsFromDi(): HttpFeature {
  // todo
  throw new Error('todo!');
}
