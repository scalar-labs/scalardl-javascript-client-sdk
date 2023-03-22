import {ClientServiceBase} from '../../../common/client_service_base';
import {Callback, Metadata} from '../../../common/scalar.proto';

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
    {} as never,
    {} as never,
    clientProperties,
    {} as never
  );

  // Act & Assert
  try {
    await clientServiceBase.registerContract(
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
  const mockedPropertiesJson = JSON.stringify(clientProperties);
  const mockedContractRegistrationRequest = {
    setContractId: function () {},
    setContractBinaryName: function () {},
    setContractByteCode: function () {},
    setContractProperties: function () {},
    setCertHolderId: function () {},
    setCertVersion: function () {},
    setSignature: function () {},
  };
  const mockedProtobuf = {
    ContractRegistrationRequest: function () {
      return mockedContractRegistrationRequest;
    },
  };
  const mockedSigner = {
    sign: function () {},
  };
  const clientServiceBase = new ClientServiceBase(
    {
      ledgerClient: {
        registerContract: (_: never, __: never, callback: Callback) => {
          const mockedResponse = {
            toObject: () => ({}),
          };
          callback(null, mockedResponse);
        },
      },
      signerFactory: {
        create: () => mockedSigner,
      },
    } as never,
    mockedProtobuf as never,
    clientProperties,
    {} as Metadata
  );
  const mockSpyContractRegistrationRequest = jest.spyOn(
    mockedProtobuf,
    'ContractRegistrationRequest'
  );
  const mockSpySetContractBinaryName = jest.spyOn(
    mockedContractRegistrationRequest,
    'setContractBinaryName'
  );
  const mockSpySetContractId = jest.spyOn(
    mockedContractRegistrationRequest,
    'setContractId'
  );
  const mockSpySetContractByteCode = jest.spyOn(
    mockedContractRegistrationRequest,
    'setContractByteCode'
  );
  const mockSpySetContractProperties = jest.spyOn(
    mockedContractRegistrationRequest,
    'setContractProperties'
  );
  const mockSpySetCertHolderId = jest.spyOn(
    mockedContractRegistrationRequest,
    'setCertHolderId'
  );
  const mockSpySetCertVersion = jest.spyOn(
    mockedContractRegistrationRequest,
    'setCertVersion'
  );
  const mockSpySetSignature = jest.spyOn(
    mockedContractRegistrationRequest,
    'setSignature'
  );
  const mockSpySign = jest.spyOn(mockedSigner, 'sign');

  // Act
  const response = await clientServiceBase.registerContract(
    mockedContractId,
    mockedName,
    mockedByteCode,
    clientProperties
  );

  // Assert
  expect(mockSpySetContractId).toBeCalledWith(mockedContractId);
  expect(mockSpyContractRegistrationRequest).toBeCalledTimes(1);
  expect(mockSpySetContractBinaryName).toBeCalledWith(mockedName);
  expect(mockSpySetContractByteCode).toBeCalledWith(mockedByteCode);
  expect(mockSpySetContractProperties).toBeCalledWith(mockedPropertiesJson);
  expect(mockSpySetCertHolderId).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_holder_id']
  );
  expect(mockSpySetCertVersion).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_version']
  );
  expect(mockSpySetSignature).toBeCalledTimes(1);
  expect(mockSpySign).toBeCalledTimes(1);
  expect(response).toBeUndefined();
});
