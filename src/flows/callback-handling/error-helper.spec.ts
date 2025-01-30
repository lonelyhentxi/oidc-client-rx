import { HttpErrorResponse } from '@ngify/http';
import { isNetworkError } from './error-helper';

describe('error helper', () => {
  describe('isNetworkError ', () => {
    const HTTP_ERROR = new HttpErrorResponse({});

    const CONNECTION_ERROR = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 0,
      statusText: 'Unknown Error',
      url: 'https://identity-server.test/openid-connect/token',
    });

    const UNKNOWN_CONNECTION_ERROR = new HttpErrorResponse({
      error: new Error('error'),
      status: 0,
      statusText: 'Unknown Error',
      url: 'https://identity-server.test/openid-connect/token',
    });

    const PARTIAL_CONNECTION_ERROR = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 418, // i am a teapot
      statusText: 'Unknown Error',
      url: 'https://identity-server.test/openid-connect/token',
    });

    it('returns true on http error with status = 0', () => {
      expect(isNetworkError(CONNECTION_ERROR)).toBeTruthy();
    });

    it('returns true on http error with status = 0 and unknown error', () => {
      expect(isNetworkError(UNKNOWN_CONNECTION_ERROR)).toBeTruthy();
    });

    it('returns true on http error with status <> 0 and error ProgressEvent', () => {
      expect(isNetworkError(PARTIAL_CONNECTION_ERROR)).toBeTruthy();
    });

    it('returns false on non http error', () => {
      expect(isNetworkError(new Error('not a HttpErrorResponse'))).toBeFalsy();
    });

    it('returns false on string error', () => {
      expect(isNetworkError('not a HttpErrorResponse')).toBeFalsy();
    });

    it('returns false on undefined', () => {
      expect(isNetworkError(undefined)).toBeFalsy();
    });

    it('returns false on empty http error', () => {
      expect(isNetworkError(HTTP_ERROR)).toBeFalsy();
    });
  });
});
