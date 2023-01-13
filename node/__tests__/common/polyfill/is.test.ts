import {
  isBoolean,
  isInteger,
  isNonEmptyString,
  isString,
  isUndefinedOrNull,
} from '../../../common/polyfill/is';

test('if isString works as expected', () => {
  // Assert
  expect(isString('foo')).toBeTruthy();
  expect(isString(new String('foo'))).toBeTruthy();
  expect(isString('')).toBeTruthy();

  expect(isString(undefined)).toBeFalsy();
  expect(isString(null)).toBeFalsy();
  expect(isString(true)).toBeFalsy();
  expect(isString(false)).toBeFalsy();
  expect(isString(1)).toBeFalsy();
  expect(isString(new Object())).toBeFalsy();
  expect(isString({foo: 'bar'})).toBeFalsy();
  expect(isString([0])).toBeFalsy();
});

test('if isInteger works as expected', () => {
  // Assert
  expect(isInteger(1)).toBeTruthy();
  expect(isInteger(1.0)).toBeTruthy();

  expect(isInteger(undefined)).toBeFalsy();
  expect(isInteger(null)).toBeFalsy();
  expect(isInteger(true)).toBeFalsy();
  expect(isInteger(false)).toBeFalsy();
  expect(isInteger(1.23)).toBeFalsy();
  expect(isInteger('foo')).toBeFalsy();
  expect(isInteger(new Object())).toBeFalsy();
  expect(isInteger({foo: 'bar'})).toBeFalsy();
  expect(isInteger([0])).toBeFalsy();
});

test('if isBoolean works as expected', () => {
  // Assert
  expect(isBoolean(true)).toBeTruthy();
  expect(isBoolean(false)).toBeTruthy();

  expect(isBoolean(undefined)).toBeFalsy();
  expect(isBoolean(null)).toBeFalsy();
  expect(isBoolean('true')).toBeFalsy();
  expect(isBoolean('false')).toBeFalsy();
  expect(isBoolean(1)).toBeFalsy();
  expect(isBoolean(0)).toBeFalsy();
  expect(isBoolean(new Object())).toBeFalsy();
  expect(isBoolean({foo: 'bar'})).toBeFalsy();
  expect(isBoolean([0])).toBeFalsy();
});

test('if isUndefinedOrNull works as expected', () => {
  // Assert
  expect(isUndefinedOrNull(undefined)).toBeTruthy();
  expect(isUndefinedOrNull(null)).toBeTruthy();

  expect(isUndefinedOrNull(true)).toBeFalsy();
  expect(isUndefinedOrNull('foo')).toBeFalsy();
  expect(isUndefinedOrNull(1)).toBeFalsy();
  expect(isUndefinedOrNull(new Object())).toBeFalsy();
  expect(isUndefinedOrNull({foo: 'bar'})).toBeFalsy();
  expect(isUndefinedOrNull([0])).toBeFalsy();
});

test('if isEmptyString works as expected', () => {
  // Assert
  expect(isNonEmptyString('foo')).toBeTruthy();

  expect(isNonEmptyString('')).toBeFalsy();
  expect(isNonEmptyString(undefined)).toBeFalsy();
  expect(isNonEmptyString(null)).toBeFalsy();
  expect(isNonEmptyString(true)).toBeFalsy();
  expect(isNonEmptyString(1)).toBeFalsy();
  expect(isNonEmptyString(new Object())).toBeFalsy();
  expect(isNonEmptyString({foo: 'bar'})).toBeFalsy();
  expect(isNonEmptyString([0])).toBeFalsy();
});
