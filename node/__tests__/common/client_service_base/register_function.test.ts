import {ClientServiceBase} from '../../../common/client_service_base';
import {Callback, Metadata, ScalarMessage} from '../../../common/scalar.proto';

const protobuf = {};
const services = {
  ledgerPrivileged: {},
  ledgerClient: {},
};

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

test('should throw an error when contractBytes is not a Uint8Array', async () => {
  // Arrange
  const clientServiceBase = new ClientServiceBase(
    services as never,
    protobuf as ScalarMessage,
    clientProperties,
    {} as Metadata
  );

  // Act & Assert
  try {
    await clientServiceBase.registerFunction(
      'contract1',
      'foo',
      'wrongType' as never
    );
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('should work as expected', async () => {
  // Arrange
  const mockedContractId = '12345';
  const mockedName = 'foo';
  const mockedByteCode = new Uint8Array([1, 2, 3]);
  const mockedFunctionRegistrationRequest = {
    setFunctionId: function () {},
    setFunctionBinaryName: function () {},
    setFunctionByteCode: function () {},
  };
  const mockedProtobuf = {
    FunctionRegistrationRequest: function () {
      return mockedFunctionRegistrationRequest;
    },
  };
  const clientServiceBase = new ClientServiceBase(
    {
      ledgerPrivileged: {
        registerFunction: (_: never, __: never, callback: Callback) => {
          const mockedResponse = {
            toObject: () => ({}),
          };
          callback(null, mockedResponse);
        },
      },
    } as never,
    mockedProtobuf as never,
    clientProperties,
    {} as Metadata
  );
  const mockSpyFunctionRegistrationRequest = jest.spyOn(
    mockedProtobuf,
    'FunctionRegistrationRequest'
  );
  const mockSpySetFunctionId = jest.spyOn(
    mockedFunctionRegistrationRequest,
    'setFunctionId'
  );
  const mockSpySetFunctionBinaryName = jest.spyOn(
    mockedFunctionRegistrationRequest,
    'setFunctionBinaryName'
  );
  const mockSpySetFunctionByteCode = jest.spyOn(
    mockedFunctionRegistrationRequest,
    'setFunctionByteCode'
  );

  // Act
  const response = await clientServiceBase.registerFunction(
    mockedContractId,
    mockedName,
    mockedByteCode
  );

  // Assert
  expect(mockSpyFunctionRegistrationRequest).toBeCalledTimes(1);
  expect(mockSpySetFunctionId).toBeCalledWith(mockedContractId);
  expect(mockSpySetFunctionBinaryName).toBeCalledWith(mockedName);
  expect(mockSpySetFunctionByteCode).toBeCalledWith(mockedByteCode);
  expect(response).toBeUndefined();
});
