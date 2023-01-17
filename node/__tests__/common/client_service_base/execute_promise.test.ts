import {ClientError} from '../../../common/client_error';
import {ClientServiceBase} from '../../../common/client_service_base';
import {Metadata, Status} from '../../../common/scalar.proto';
import {StatusCode} from '../../../common/status_code';

const clientProperties = {
  'scalar.dl.client.private_key_pem':
    '-----BEGIN EC PRIVATE KEY-----\n' +
    'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
    'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
    'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n',
  'scalar.dl.client.cert_pem':
    '-----BEGIN CERTIFICATE-----\n' +
    'MIICizCCAjKgAwIBAgIUMEUDTdWsQpftFkqs6bCd6U++4nEwCgYIKoZIzj0EAwIw\n' +
    'bzELMAkGA1UEBhMCSlAxDjAMBgNVBAgTBVRva3lvMQ4wDAYDVQQHEwVUb2t5bzEf\n' +
    'MB0GA1UEChMWU2FtcGxlIEludGVybWVkaWF0ZSBDQTEfMB0GA1UEAxMWU2FtcGxl\n' +
    'IEludGVybWVkaWF0ZSBDQTAeFw0xODA5MTAwODA3MDBaFw0yMTA5MDkwODA3MDBa\n' +
    'MEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJ\n' +
    'bnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNC\n' +
    'AAQEa6Gq6bKHsFU2pw0oBBCKkMaihSlRG97Z07rqlAKCO1J+7uUlXbRdhZ2uCjRj\n' +
    'd5cSG8rSWxRE703Ses+JBZPgo4HVMIHSMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUE\n' +
    'DDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRDd2MS9Ndo68PJ\n' +
    'y9K/RNY6syZW0zAfBgNVHSMEGDAWgBR+Y+v8yByDNp39G7trYrTfZ0UjJzAxBggr\n' +
    'BgEFBQcBAQQlMCMwIQYIKwYBBQUHMAGGFWh0dHA6Ly9sb2NhbGhvc3Q6ODg4OTAq\n' +
    'BgNVHR8EIzAhMB+gHaAbhhlodHRwOi8vbG9jYWxob3N0Ojg4ODgvY3JsMAoGCCqG\n' +
    'SM49BAMCA0cAMEQCIC/Bo4oNU6yHFLJeme5ApxoNdyu3rWyiqWPxJmJAr9L0AiBl\n' +
    'Gc/v+yh4dHIDhCrimajTQAYOG9n0kajULI70Gg7TNw==\n' +
    '-----END CERTIFICATE-----\n',
  'scalar.dl.client.cert_holder_id': 'hold',
  'scalar.dl.client.cert_version': 1,
};

test('should parse and rethrow error on Node.js environment', async () => {
  // Arrange
  const status: Status = {
    code: 404,
    message: 'foo message',
    toObject: jest.fn(() => status),
  };
  const protobuf = {Status: {deserializeBinary: jest.fn(() => status)}};
  const clientServiceBase = new ClientServiceBase(
    {} as never,
    protobuf as never,
    clientProperties,
    {} as Metadata,
    false
  );
  const binaryStatus = [status];
  const errorStub: Error & {metadata: Metadata} = new Error() as Error & {
    metadata: Metadata;
  };
  const metadataStub = {
    get: jest.fn(() => binaryStatus),
  };
  errorStub.metadata = metadataStub;

  // Act & Assert
  try {
    const promise = new Promise<void>(() => {
      throw errorStub;
    });
    await clientServiceBase['executePromise'](promise);
  } catch (e) {
    expect((e as Error).constructor.name).toEqual('ClientError');
    expect((e as ClientError).code).toEqual(status.code);
    expect((e as ClientError).message).toEqual(status.message);
  }
});

test('should parse and rethrow error on browser environment', async () => {
  // Arrange
  const status: Status = {
    code: 404,
    message: 'foo message',
    toObject: jest.fn(() => status),
  };
  const protobuf = {Status: {deserializeBinary: jest.fn(() => status)}};
  const clientServiceBase = new ClientServiceBase(
    {} as never,
    protobuf as never,
    clientProperties,
    {} as Metadata,
    true
  );
  const metadata: Metadata = {
    get: jest.fn(() => status),
  };
  metadata[ClientServiceBase.binaryStatusKey] = status;
  const errorStub = new Error('bar message');
  (errorStub as Error & {metadata: Metadata}).metadata = metadata;

  // Act & Assert
  try {
    const promise = new Promise<void>(() => {
      throw errorStub;
    });
    await clientServiceBase['executePromise'](promise);
  } catch (e) {
    expect((e as Error).constructor.name).toEqual('ClientError');
    expect((e as ClientError).code).toEqual(status.code);
    expect((e as ClientError).message).toEqual(status.message);
  }
});

it('should rethrow error when there is no error status', async () => {
  // Arrange
  const clientServiceBase = new ClientServiceBase(
    {} as never,
    {} as never,
    clientProperties,
    {} as Metadata,
    true
  );
  const errorStub = new Error('bar message');
  (errorStub as Error & {metadata: Object}).metadata = {};

  // Act & Assert
  try {
    const promise = new Promise<void>(() => {
      throw errorStub;
    });
    await clientServiceBase['executePromise'](promise);
  } catch (e) {
    expect((e as Error).constructor.name).toEqual('ClientError');
    expect((e as ClientError).code).toEqual(
      StatusCode.UNKNOWN_TRANSACTION_STATUS
    );
    expect((e as ClientError).message).toEqual(errorStub.message);
  }
});
