import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from 'injection-js';

@Injectable()
export class PlatformProvider {
  private readonly platformId = inject<string>(PLATFORM_ID);

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
