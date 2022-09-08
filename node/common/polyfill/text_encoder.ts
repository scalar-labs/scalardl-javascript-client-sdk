import * as jsrsasign from 'jsrsasign';

/**
 * An internal class to encode utf8 string to Uint8Array
 * @class
 */
export class TextEncoder {
  /**
   * To encode utf8 to Uint8Array
   * @param {string} encoding
   * @return {Uint8Array}
   */
  encode(encoding: string): Uint8Array {
    return !encoding
      ? new Uint8Array()
      : new Uint8Array(
          jsrsasign.hextoArrayBuffer(jsrsasign.utf8tohex(encoding))
        );
  }
}
