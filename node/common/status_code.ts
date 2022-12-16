/**
 * A type used for various http status codes
 */
export enum StatusCode {
  OK = 200,
  INVALID_HASH = 300,
  INVALID_PREV_HASH = 301,
  INVALID_CONTRACT = 302,
  INVALID_OUTPUT = 303,
  INVALID_NONCE = 304,
  INCONSISTENT_STATES = 305,
  INCONSISTENT_REQUEST = 306,
  INVALID_SIGNATURE = 400,
  UNLOADABLE_KEY = 401,
  UNLOADABLE_CONTRACT = 402,
  CERTIFICATE_NOT_FOUND = 403,
  CONTRACT_NOT_FOUND = 404,
  CERTIFICATE_ALREADY_REGISTERED = 405,
  CONTRACT_ALREADY_REGISTERED = 406,
  INVALID_REQUEST = 407,
  CONTRACT_CONTEXTUAL_ERROR = 408,
  ASSET_NOT_FOUND = 409,
  FUNCTION_NOT_FOUND = 410,
  UNLOADABLE_FUNCTION = 411,
  INVALID_FUNCTION = 412,
  DATABASE_ERROR = 500,
  UNKNOWN_TRANSACTION_STATUS = 501,
  RUNTIME_ERROR = 502,
  UNAVAILABLE = 503,
  CONFLICT = 504,
}
