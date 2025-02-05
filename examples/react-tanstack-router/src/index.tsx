import { type Injector, ReflectiveInjector } from '@outposts/injection-js';
import { LogLevel, OidcSecurityService, provideAuth } from 'oidc-client-rx';
import { InjectorProvider } from 'oidc-client-rx/adapters/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');

if (rootEl) {
  const injector = ReflectiveInjector.resolveAndCreate(
    provideAuth({
      config: {
        authority: '<your authority address here>',
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        clientId: '<your clientId>',
        scope: 'openid profile email offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
      },
    })
  ) as Injector;

  // if needed, check when init
  const oidcSecurityService = injector.get(OidcSecurityService);
  oidcSecurityService.checkAuthMultiple();

  const root = ReactDOM.createRoot(rootEl);

  root.render(
    <React.StrictMode>
      <InjectorProvider injector={injector}>
        <App />
      </InjectorProvider>
    </React.StrictMode>
  );
}
