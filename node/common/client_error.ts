import {StatusCode} from './status_code';

/**
 * Generic error thrown by the SDK.
 * @extends {Error}
 */
export class ClientError extends Error {
  code: StatusCode;

  /**
   * @override
   * @param {StatusCode} code error status code
   * @param {string} args
   */
  constructor(code: StatusCode, ...args: string[]) {
    super(...args);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientError);
    }
    this.name = 'ClientError';
    this.code = code;
  }
}
