import { Injectable } from 'injection-js';
import { AbstractSecurityStorage } from './abstract-security-storage';

@Injectable()
export class DefaultLocalStorageService implements AbstractSecurityStorage {
  public read(key: string): string | null {
    return localStorage.getItem(key);
  }

  public write(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  public clear(): void {
    localStorage.clear();
  }
}
