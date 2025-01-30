import { HttpFeatureKind } from '@ngify/http';
import { HttpClientTestingBackend } from '@ngify/http/testing';

export function provideHttpClientTesting() {
  return {
    provide: HttpFeatureKind.Backend,
    useClass: HttpClientTestingBackend,
  };
}
