/**
 * Convert a plain text to the base64-encoded string
 * @param {string} converting
 * @return {string}
 * @throws {Error}
 */
export function btoa(converting: string): string {
  let bitmap;
  let a;
  let b;
  let c;
  let result = '';
  let i = 0;
  const b64 =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const rest = converting.length % 3; // To determine the final padding

  for (; i < converting.length; ) {
    if (
      (a = converting.charCodeAt(i++)) > 255 ||
      (b = converting.charCodeAt(i++)) > 255 ||
      (c = converting.charCodeAt(i++)) > 255
    ) {
      throw new Error(
        'The string contains characters outside of the Latin1 range.'
      );
    }

    bitmap = (a << 16) | (b << 8) | c;
    result +=
      b64.charAt((bitmap >> 18) & 63) +
      b64.charAt((bitmap >> 12) & 63) +
      b64.charAt((bitmap >> 6) & 63) +
      b64.charAt(bitmap & 63);
  }

  return rest ? result.slice(0, rest - 3) + '==='.substring(rest) : result;
}
