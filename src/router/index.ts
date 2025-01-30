export type RouteData = {
  [key: string | symbol]: any;
};

export interface ActivatedRouteSnapshot {
  data: RouteData;
}

export interface RouterStateSnapshot {
  url: string;
}

export abstract class AbstractRouter {
  navigateByUrl(_url: string): void {
    // TODO
    // Implementation of navigating to a URL
  }

  getCurrentNavigation(): any {
    // TODO
    // Implementation of getting the current navigation
    return null;
  }

  // TODO
  parseUrl(_url: string): any {
    // TODO
    // Implementation of getting the current navigation
    return null;
  }
}
