import type { Provider } from 'injection-js';
import { AbstractRouter } from 'oidc-client-rx';

// TODO
export class MockRouter extends AbstractRouter {}

export function mockRouterProvider(): Provider {
  return {
    useClass: MockRouter,
    provide: AbstractRouter, // This is the token that will be injected into components
  };
}
