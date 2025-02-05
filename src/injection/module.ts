import type { Injector } from '@outposts/injection-js';

export type Module = (parentInjector: Injector) => Injector;
