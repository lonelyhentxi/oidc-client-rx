import 'reflect-metadata';
import type { Injector } from 'injection-js';

export type Module = (parentInjector: Injector) => Injector;
