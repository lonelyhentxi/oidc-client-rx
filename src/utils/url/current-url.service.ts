import { Injectable, inject } from '@outposts/injection-js';
import { DOCUMENT } from '../../dom';

@Injectable()
export class CurrentUrlService {
  private readonly document: Document = inject(DOCUMENT);

  getStateParamFromCurrentUrl(url?: string): string | null {
    const currentUrl = url || this.getCurrentUrl();

    if (!currentUrl) {
      return null;
    }

    const parsedUrl = new URL(currentUrl);
    const urlParams = new URLSearchParams(parsedUrl.search);

    return urlParams.get('state');
  }

  getCurrentUrl(): string | null {
    return this.document?.defaultView?.location.toString() ?? null;
  }
}
