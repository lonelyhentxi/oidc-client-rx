import { InjectionToken } from 'injection-js';
import type { Observable } from 'rxjs';

export const APP_INITIALIZER = new InjectionToken<
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  readonly (() => void | Observable<unknown> | Promise<unknown>)[]
>('APP_INITIALIZER');
