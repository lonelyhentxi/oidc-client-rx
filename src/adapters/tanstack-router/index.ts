import { InjectionToken, inject } from '@outposts/injection-js';
import type {
  AnyRoute,
  Router,
  TrailingSlashOption,
} from '@tanstack/react-router';
import { AbstractRouter } from 'src/router';
import type { AuthFeature } from '../../provide-auth';

export type TanStackRouter = Router<AnyRoute, TrailingSlashOption, boolean>;

export const TANSTACK_ROUTER = new InjectionToken<TanStackRouter>(
  'TANSTACK_ROUTER'
);

export class TanStackRouterAdapter implements AbstractRouter<string> {
  private router = inject(TANSTACK_ROUTER);

  navigateByUrl(url: string): void {
    this.router.navigate({
      href: url,
    });
  }

  getCurrentNavigation() {
    return {
      extractedUrl: this.router.state.location.href,
    };
  }
}

export function withTanstackRouter(router: TanStackRouter): AuthFeature {
  return {
    ɵproviders: [
      {
        provide: TANSTACK_ROUTER,
        useValue: router,
      },
      {
        provide: AbstractRouter,
        useClass: TanStackRouterAdapter,
      },
    ],
  };
}
