import type { InjectionToken, Injector, Type } from '@outposts/injection-js';
import {
  type ParentProps,
  createContext,
  createMemo,
  mergeProps,
  splitProps,
  useContext,
} from 'solid-js';
import h from 'solid-js/h';
import { OidcSecurityService } from '../../oidc.security.service';

export const InjectorContextVoidInjector: Injector = {
  get: <T>(_token: Type<T> | InjectionToken<T>, _notFoundValue?: T): T => {
    throw new Error('Please wrap with a InjectorContext.Provider first');
  },
};

export const InjectorContext = createContext<Injector>(
  InjectorContextVoidInjector
);

export function InjectorProvider(props: ParentProps<{ injector: Injector }>) {
  const [local, others] = splitProps(props, ['children', 'injector']);
  const providerProps = mergeProps(others, { value: local.injector });
  return h(InjectorContext.Provider, providerProps, local.children);
}

export function useInjector() {
  return useContext(InjectorContext);
}

export function useOidcClient() {
  const injector = useInjector();

  const oidcSecurityService = createMemo(() =>
    injector.get(OidcSecurityService)
  );

  return {
    injector,
    oidcSecurityService,
  };
}
