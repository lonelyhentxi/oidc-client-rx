import {
  type HttpBackend,
  HttpClient,
  type HttpFeature,
  HttpFeatureKind,
  type HttpInterceptor,
  type HttpInterceptorFn,
  withInterceptors,
  withLegacyInterceptors,
} from '@ngify/http';
import { InjectionToken, Optional, type Provider } from 'injection-js';
import type { ArrayOrNullableOne } from '../utils/types';
export { HttpParams, HttpParamsOptions } from './params';

export const HTTP_FEATURES = new InjectionToken<HttpFeature[]>('HTTP_FEATURES');

export const HTTP_INTERCEPTOR_FNS = new InjectionToken<HttpInterceptorFn[]>(
  'HTTP_INTERCEPTOR_FNS'
);

export const HTTP_LEGACY_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>(
  'HTTP_LEGACY_INTERCEPTORS'
);

export const HTTP_BACKEND = new InjectionToken<HttpBackend>('HTTP_BACKEND');

export const HTTP_XSRF_PROTECTION = new InjectionToken<HttpInterceptorFn>(
  'HTTP_XSRF_PROTECTION'
);

export function provideHttpClient(features: HttpFeature[] = []): Provider[] {
  return [
    {
      provide: HTTP_INTERCEPTOR_FNS,
      multi: true,
      useValue: [],
    },
    {
      provide: HTTP_LEGACY_INTERCEPTORS,
      multi: true,
      useValue: [],
    },
    {
      provide: HTTP_FEATURES,
      useFactory: (
        interceptors: ArrayOrNullableOne<HttpInterceptorFn>[]
      ): HttpFeature[] => {
        const normalizedInterceptors = [interceptors]
          .flat(Number.MAX_SAFE_INTEGER)
          .filter(Boolean) as HttpInterceptorFn[];
        return normalizedInterceptors.length
          ? [withInterceptors(normalizedInterceptors)]
          : [];
      },
      multi: true,
      deps: [HTTP_INTERCEPTOR_FNS],
    },
    {
      provide: HTTP_FEATURES,
      useFactory: (
        interceptors: ArrayOrNullableOne<HttpInterceptor>[]
      ): HttpFeature[] => {
        const normalizedInterceptors = [interceptors]
          .flat(Number.MAX_SAFE_INTEGER)
          .filter(Boolean) as HttpInterceptor[];
        return normalizedInterceptors.length
          ? [withLegacyInterceptors(normalizedInterceptors)]
          : [];
      },
      multi: true,
      deps: [HTTP_LEGACY_INTERCEPTORS],
    },
    {
      provide: HTTP_FEATURES,
      useFactory: (backend: HttpBackend | null | undefined): HttpFeature[] => {
        return backend
          ? [
              {
                kind: HttpFeatureKind.Backend,
                value: backend,
              },
            ]
          : [];
      },
      multi: true,
      deps: [[new Optional(), HTTP_BACKEND]],
    },
    {
      provide: HTTP_FEATURES,
      useFactory: (
        interceptor: HttpInterceptorFn | null | undefined
      ): HttpFeature[] => {
        return interceptor
          ? [
              {
                kind: HttpFeatureKind.XsrfProtection,
                value: interceptor,
              },
            ]
          : [];
      },
      multi: true,
      deps: [[new Optional(), HTTP_XSRF_PROTECTION]],
    },
    {
      provide: HTTP_FEATURES,
      useValue: features,
      multi: true,
    },
    {
      provide: HttpClient,
      useFactory: (features: ArrayOrNullableOne<HttpFeature>[]) => {
        const normalizedFeatures = [features]
          .flat(Number.MAX_SAFE_INTEGER)
          .filter(Boolean) as HttpFeature[];
        return new HttpClient(...normalizedFeatures);
      },
      deps: [HTTP_FEATURES],
    },
  ];
}
