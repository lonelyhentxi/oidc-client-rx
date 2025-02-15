import { Injectable } from '@outposts/injection-js';
import type { OpenIdConfiguration } from '../config/openid-configuration';

@Injectable()
export class ClosestMatchingRouteService {
  getConfigIdForClosestMatchingRoute(
    route: string,
    configurations: OpenIdConfiguration[]
  ): ClosestMatchingRouteResult {
    for (const config of configurations) {
      const { secureRoutes } = config;

      for (const configuredRoute of secureRoutes ?? []) {
        if (route.startsWith(configuredRoute)) {
          return {
            matchingRoute: configuredRoute,
            matchingConfig: config,
          };
        }
      }
    }

    return {
      matchingRoute: null,
      matchingConfig: null,
    };
  }
}

export interface ClosestMatchingRouteResult {
  matchingRoute: string | null;
  matchingConfig: OpenIdConfiguration | null;
}
