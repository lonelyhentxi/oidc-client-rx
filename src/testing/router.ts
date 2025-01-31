import type { Provider } from 'injection-js';
import { AbstractRouter, type Navigation, type UrlTree } from 'oidc-client-rx';

export class MockRouter extends AbstractRouter {
  navigation: Navigation = {
    id: 1,
    extras: {},
    initialUrl: new URL('https://localhost/'),
    extractedUrl: new URL('https://localhost/'),
    trigger: 'imperative',
    previousNavigation: null,
  };

  navigateByUrl(url: string): void {
    const prevNavigation = this.navigation;
    this.navigation = {
      id: prevNavigation.id + 1,
      extras: {},
      initialUrl: prevNavigation.initialUrl,
      extractedUrl: new URL(url),
      trigger: prevNavigation.trigger,
      previousNavigation: prevNavigation,
    };
  }
  getCurrentNavigation(): Navigation {
    return this.navigation;
  }
  parseUrl(url: string): UrlTree {
    return new URL(url);
  }
}

export function mockRouterProvider(): Provider {
  return {
    useClass: MockRouter,
    provide: AbstractRouter, // This is the token that will be injected into components
  };
}
