import type { Provider } from '@outposts/injection-js';
import { JSDOM } from 'jsdom';
import { AbstractRouter, type Navigation, type UrlTree } from 'oidc-client-rx';

export class MockRouter extends AbstractRouter {
  dom = new JSDOM('', {
    url: 'http://localhost',
  });

  navigation: Navigation = {
    extractedUrl: this.parseUrl(this.dom.window.location.href),
  };

  navigateByUrl(url: string): void {
    this.dom.reconfigure({
      url: new URL(url, this.dom.window.location.href).href,
    });
    this.navigation = {
      extractedUrl: this.parseUrl(this.dom.window.location.href),
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
