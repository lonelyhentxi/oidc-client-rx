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

export interface Navigation<URL extends UrlTree = UrlTree> {
  extractedUrl: URL;
}

export abstract class AbstractRouter<
  URL extends UrlTree = UrlTree,
  NAVIGATION extends Navigation<URL> = Navigation<URL>,
> {
  abstract navigateByUrl(url: string): void;

  abstract getCurrentNavigation(): NAVIGATION;
}
