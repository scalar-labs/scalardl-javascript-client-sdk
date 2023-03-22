export function isString(s: unknown): boolean {
  return typeof s === 'string' || s instanceof String;
}

export function isInteger(i: unknown): boolean {
  return Number.isInteger(i);
}

export function isNonEmptyString(s: unknown): boolean {
  return isString(s) && (s as string).length > 0;
}

export function isUndefinedOrNull(u: unknown): boolean {
  return u === undefined || u === null;
}

export function isBoolean(b: unknown): boolean {
  return typeof b === 'boolean';
}
