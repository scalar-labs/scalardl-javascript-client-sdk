/**
 * An internal class to encode utf8 string to Uint8Array
 * @class
 */
export class TextEncoder {
  /**
   * To encode utf8 to Uint8Array
   */
  encode(encoding: string): Uint8Array {
    // This implementation is mostly copied from the following URL.
    // https://github.com/kjur/jsrsasign/blob/master/src/base64x-1.1.js
    // The main author of jsrsasign is Kenji Urushima.
    // This code is licensed under the MIT license.
    const hex = encodeURIComponentAll(encoding)
      .replace(/%/g, '')
      .toLocaleLowerCase();
    const buffer = new ArrayBuffer(hex.length / 2);
    const view = new DataView(buffer);

    for (let i = 0; i < hex.length / 2; i++) {
      view.setUint8(i, parseInt(hex.substring(i * 2, i * 2 + 2), 16));
    }

    return new Uint8Array(buffer);
  }
}

function encodeURIComponentAll(u8: string) {
  const s = encodeURIComponent(u8);
  let s2 = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '%') {
      s2 = s2 + s.substring(i, i + 3);
      i = i + 2;
    } else {
      // A-Z a-z 0-9 - _ . ! ~ * ' ( )
      s2 = s2 + '%' + stohex(s[i]);
    }
  }
  return s2;
}

function stohex(s: string) {
  const ba = [];
  for (let i = 0; i < s.length; i++) {
    ba[i] = s.charCodeAt(i);
  }

  let hex = '';

  for (let i = 0; i < ba.length; i++) {
    let hex1 = ba[i].toString(16);
    if (hex1.length === 1) hex1 = '0' + hex1;
    hex = hex + hex1;
  }

  return hex;
}
