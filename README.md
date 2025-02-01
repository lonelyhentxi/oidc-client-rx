# Angular Lib for OpenID Connect & OAuth2

TODO

![Build Status](https://github.com/damienbod/oidc-client-rx/actions/workflows/build.yml/badge.svg?branch=main) [![npm](https://img.shields.io/npm/v/oidc-client-rx.svg)](https://www.npmjs.com/package/oidc-client-rx) [![npm](https://img.shields.io/npm/dm/oidc-client-rx.svg)](https://www.npmjs.com/package/oidc-client-rx) [![npm](https://img.shields.io/npm/l/oidc-client-rx.svg)](https://www.npmjs.com/package/oidc-client-rx) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![Coverage Status](https://coveralls.io/repos/github/damienbod/oidc-client-rx/badge.svg?branch=main)](https://coveralls.io/github/damienbod/oidc-client-rx?branch=main)

<p align="center">
  <a href="https://oidc-client-rx.com/"><img src="https://raw.githubusercontent.com/damienbod/oidc-client-rx/main/.github/angular-auth-logo.png" alt="" width="350" /></a>
</p>

Secure your Angular app using the latest standards for OpenID Connect & OAuth2. Provides support for token refresh, all modern OIDC Identity Providers and more.

## Acknowledgements

This library is <a href="http://openid.net/certification/#RPs">certified</a> by OpenID Foundation. (RP Implicit and Config RP)

<p align="center">
  <a href="http://openid.net/certification/#RPs"><img src="https://damienbod.files.wordpress.com/2017/06/oid-l-certification-mark-l-rgb-150dpi-90mm.png" alt="" width="400" /></a>
</p>

## Features

- [Code samples](https://oidc-client-rx.com/docs/samples/) for most of the common use cases
- Supports schematics via `ng add` support
- Supports all modern OIDC identity providers
- Supports OpenID Connect Code Flow with PKCE
- Supports Code Flow PKCE with Refresh tokens
- [Supports OpenID Connect Implicit Flow](http://openid.net/specs/openid-connect-implicit-1_0.html)
- [Supports OpenID Connect Session Management 1.0](http://openid.net/specs/openid-connect-session-1_0.html)
- [Supports RFC7009 - OAuth 2.0 Token Revocation](https://tools.ietf.org/html/rfc7009)
- [Supports RFC7636 - Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)
- [Supports OAuth 2.0 Pushed authorisation requests (PAR) draft](https://tools.ietf.org/html/draft-ietf-oauth-par-06)
- Semantic releases
- Github actions
- Modern coding guidelines with prettier, husky
- Up to date documentation
- Implements OIDC validation as specified, complete client side validation for REQUIRED features
- Supports authentication using redirect or popup

## Installation

### Ng Add

You can use the schematics and `ng add` the library.

```shell
ng add oidc-client-rx
```

And answer the questions. A module will be created which encapsulates your configuration.

![oidc-client-rx schematics](https://raw.githubusercontent.com/damienbod/oidc-client-rx/main/.github/oidc-client-rx-schematics-720.gif)

### Npm / Yarn

Navigate to the level of your `package.json` and type

```shell
 npm install oidc-client-rx
```

or with yarn

```shell
 yarn add oidc-client-rx
```

## Documentation

[Read the docs here](https://oidc-client-rx.com/)

## Samples

[Explore the Samples here](https://oidc-client-rx.com/docs/samples/)

## Quickstart

For the example of the Code Flow. For further examples please check the [Samples](https://oidc-client-rx.com/docs/samples/) Section.

> If you have done the installation with the schematics, these modules and files should be available already!

### Configuration

Import the `AuthModule` in your module.

```ts
import { NgModule } from '@angular/core';
import { AuthModule, LogLevel } from 'oidc-client-rx';
// ...

@NgModule({
  // ...
  imports: [
    // ...
    AuthModule.forRoot({
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
    }),
  ],
  // ...
})
export class AppModule {}
```

And call the method `checkAuth()` from your `app.component.ts`. The method `checkAuth()` is needed to process the redirect from your Security Token Service and set the correct states. This method must be used to ensure the correct functioning of the library.

```ts
import { Component, OnInit, inject } from '@angular/core';
import { OidcSecurityService } from 'oidc-client-rx';

@Component({
  /*...*/
})
export class AppComponent implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  ngOnInit() {
    this.oidcSecurityService
      .checkAuth()
      .subscribe((loginResponse: LoginResponse) => {
        const { isAuthenticated, userData, accessToken, idToken, configId } =
          loginResponse;

        /*...*/
      });
  }

  login() {
    this.oidcSecurityService.authorize().subscribe();
  }

  logout() {
    this.oidcSecurityService
      .logoff()
      .subscribe((result) => console.log(result));
  }
}
```

### Using the access token

You can get the access token by calling the method `getAccessToken()` on the `OidcSecurityService`

```ts
const token = this.oidcSecurityService.getAccessToken().subscribe(...);
```

And then you can use it in the HttpHeaders

```ts
import { HttpHeaders } from '@ngify/http';

const token = this.oidcSecurityServices.getAccessToken().subscribe((token) => {
  const httpOptions = {
    headers: new HttpHeaders({
      Authorization: 'Bearer ' + token,
    }),
  };
});
```

You can use the built in interceptor to add the accesstokens to your request

```ts
AuthModule.forRoot({
  config: {
    // ...
    secureRoutes: ['https://my-secure-url.com/', 'https://my-second-secure-url.com/'],
  },
}),
```

```ts
 providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
```

## Versions

Current Version is Version 19.x

- [Info about Version 18](https://github.com/damienbod/oidc-client-rx/tree/version-18)
- [Info about Version 17](https://github.com/damienbod/oidc-client-rx/tree/version-17)
- [Info about Version 16](https://github.com/damienbod/oidc-client-rx/tree/version-16)
- [Info about Version 15](https://github.com/damienbod/oidc-client-rx/tree/version-15)
- [Info about Version 14](https://github.com/damienbod/oidc-client-rx/tree/version-14)
- [Info about Version 13](https://github.com/damienbod/oidc-client-rx/tree/version-13)
- [Info about Version 12](https://github.com/damienbod/oidc-client-rx/tree/version-12)
- [Info about Version 11](https://github.com/damienbod/oidc-client-rx/tree/version-11)
- [Info about Version 10](https://github.com/damienbod/oidc-client-rx/tree/version-10)

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors

- [@DamienBod](https://www.github.com/damienbod)
- [@FabianGosebrink](https://www.github.com/FabianGosebrink)
