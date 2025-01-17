
import { DOCUMENT } from '../../dom';
import { inject, Injectable } from 'injection-js';

@Injectable()
export class RedirectService {
  private readonly document = inject<Document>(DOCUMENT);

  redirectTo(url: string): void {
    this.document.location.href = url;
  }
}
