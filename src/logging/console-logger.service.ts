import { Injectable } from 'injection-js';
import { AbstractLoggerService } from './abstract-logger.service';

@Injectable()
export class ConsoleLoggerService implements AbstractLoggerService {
  logError(message: string | object, ...args: any[]): void {
    console.error(message, ...args);
  }

  logWarning(message: string | object, ...args: any[]): void {
    console.warn(message, ...args);
  }

  logDebug(message: string | object, ...args: any[]): void {
    console.debug(message, ...args);
  }
}
