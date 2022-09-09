const ARGUMENT_VERSION_PREFIX = 'V';
const ARGUMENT_FORMAT_VERSION = '2';
const NONCE_SEPARATOR = '\u0001';
const FUNCTION_SEPARATOR = '\u0002';
const ARGUMENT_SEPARATOR = '\u0003';

/**
 * @param {string} nonce
 * @param {string[]} functionIds
 * @param {string|Object} argument
 * @return {string}
 */
export function format(
  nonce: string,
  functionIds: string[],
  argument: string | Object
): string {
  if (typeof argument !== 'string' && typeof argument !== 'object') {
    throw new Error('argument must be a string or an object');
  }

  return (
    ARGUMENT_VERSION_PREFIX +
    ARGUMENT_FORMAT_VERSION +
    NONCE_SEPARATOR +
    nonce +
    ARGUMENT_SEPARATOR +
    `${functionIds
      .filter(v => typeof v === 'string')
      .join(FUNCTION_SEPARATOR)}` +
    ARGUMENT_SEPARATOR +
    `${typeof argument === 'object' ? JSON.stringify(argument) : argument}`
  );
}
