export type RouteData = {
  [key: string | symbol]: any;
};

export interface ActivatedRouteSnapshot {
  data: RouteData;
}

export interface RouterStateSnapshot {
  url: string;
}

export interface UrlTree {
  toString(): string;
}

export interface NavigationExtras {
  [key: string]: any;
}

export interface Navigation {
  id: number;
  initialUrl: UrlTree;
  extractedUrl: UrlTree;
  finalUrl?: UrlTree | undefined;
  trigger: 'imperative' | 'popstate' | 'hashchange';
  previousNavigation: Navigation | null;
  extras?: NavigationExtras;
}

export abstract class AbstractRouter {
  abstract navigateByUrl(url: string): void;

  abstract getCurrentNavigation(): Navigation;

  abstract parseUrl(_url: string): any;
}
