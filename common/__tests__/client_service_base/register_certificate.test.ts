import {ClientServiceBase} from '../../../common/client_service_base';
import {Callback, Metadata, ScalarService} from '../../../common/scalar.proto';
import {SignatureSignerFactory} from '../../../common/signature';

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

test('should work as expected', async () => {
  // Arrange
  const mockedCertificateRegistrationRequest = {
    setCertHolderId: function () {},
    setCertVersion: function () {},
    setCertPem: function () {},
    serializeBinary: function () {},
  };
  const mockedProtobuf = {
    CertificateRegistrationRequest: class {
      constructor() {
        return mockedCertificateRegistrationRequest;
      }
    },
  };
  const clientServiceBase = new ClientServiceBase(
    {
      ledgerPrivileged: {
        registerCert: (_: never, __: never, callback: Callback) => {
          const mockedResponse = {
            toObject: () => ({}),
          };
          callback(null, mockedResponse);
        },
      },
    } as ScalarService & {signerFactory: SignatureSignerFactory},
    mockedProtobuf as never,
    clientProperties,
    {} as Metadata
  );
  const mockSpySetCertHolderId = jest.spyOn(
    mockedCertificateRegistrationRequest,
    'setCertHolderId'
  );
  const mockSpySetCertVersion = jest.spyOn(
    mockedCertificateRegistrationRequest,
    'setCertVersion'
  );
  const mockSpySetCertPem = jest.spyOn(
    mockedCertificateRegistrationRequest,
    'setCertPem'
  );

  // Act
  const response = await clientServiceBase.registerCertificate();

  // Assert
  expect(mockSpySetCertHolderId).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_holder_id']
  );
  expect(mockSpySetCertVersion).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_version']
  );
  expect(mockSpySetCertPem).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_pem']
  );
  expect(response).toBeUndefined();
});
