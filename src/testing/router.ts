import type { Provider } from 'injection-js';
import { JSDOM } from 'jsdom';
import { AbstractRouter, type Navigation, type UrlTree } from 'oidc-client-rx';

export class MockRouter extends AbstractRouter {
  dom = new JSDOM('', {
    url: 'http://localhost',
  });

  navigation: Navigation = {
    id: 1,
    extras: {},
    initialUrl: this.parseUrl(this.dom.window.location.href),
    extractedUrl: this.parseUrl(this.dom.window.location.href),
    trigger: 'imperative',
    previousNavigation: null,
  };

  navigateByUrl(url: string): void {
    const prevNavigation = this.navigation;
    this.dom.reconfigure({
      url: new URL(url, this.dom.window.location.href).href,
    });
    this.navigation = {
      id: prevNavigation.id + 1,
      extras: {},
      initialUrl: prevNavigation.initialUrl,
      extractedUrl: this.parseUrl(this.dom.window.location.href),
      trigger: prevNavigation.trigger,
      previousNavigation: prevNavigation,
    };
  }
  getCurrentNavigation(): Navigation {
    return this.navigation;
  }
  parseUrl(url: string): UrlTree {
    const u = new URL(url, this.dom.window.location.href);
    return `${u.pathname}${u.search}${u.hash}`;
  }
}

export function mockRouterProvider(): Provider {
  return {
    useClass: MockRouter,
    provide: AbstractRouter, // This is the token that will be injected into components
  };
}
