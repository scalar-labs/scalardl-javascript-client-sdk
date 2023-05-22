/* eslint-disable node/no-unpublished-require */
/* eslint-disable no-undef */
const {ClientServiceWithIndexedDb} = require('../../dist/index');
const Dexie = require('dexie').default;

const db = new Dexie('scalar');
db.version(1).stores({keystore: 'id', certstore: 'id'});

async function presetKey(certHolderId, certVersion) {
  const generatedKeyPair = await window.crypto.subtle.generateKey(
    {name: 'ECDSA', namedCurve: 'P-256'},
    false, // cannot extractable
    ['sign', 'verify']
  );
  const privateKey = generatedKeyPair.privateKey;

  db.keystore.put({id: `${certHolderId}_${certVersion}`, key: privateKey});
}

async function presetCert(certHolderId, certVersion) {
  db.certstore.put({id: `${certHolderId}_${certVersion}`, cert: 'cert'});
}

async function presetKeyAndCert(certHolderId, certVersion) {
  await presetKey(certHolderId, certVersion);
  await presetCert(certHolderId, certVersion);
}

it('can fill key and cert into properties if they are stored in IndexedDB', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
  };

  await presetKeyAndCert(certHolderId, certVersion);

  // Act & Assert
  // Since ClientConfig check the properties, we can consider it pass the test if we can create a ClientService
  await expectAsync(
    ClientServiceWithIndexedDb.create(properties)
  ).toBeResolved();
});

it('can store key and cert into IndexedDB', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const cert =
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
    '-----END CERTIFICATE-----\n';
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
    'scalar.dl.client.private_key_pem':
      '-----BEGIN EC PRIVATE KEY-----\n' +
      'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
      'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
      'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n' +
      '-----END EC PRIVATE KEY-----\n',
    'scalar.dl.client.cert_pem': cert,
  };
  const id = `${certHolderId}_${certVersion}`;

  // Act
  const kBefore = await db.keystore.get(id);
  const cBefore = await db.certstore.get(id);
  await ClientServiceWithIndexedDb.create(properties);
  const kAfter = await db.keystore.get(id);
  const cAfter = await db.certstore.get(id);

  // Assert
  expect(kBefore).toBeUndefined();
  expect(kAfter).toBeDefined();
  expect(kAfter.key).toBeInstanceOf(CryptoKey);
  expect(cBefore).toBeUndefined();
  expect(cAfter.cert).toEqual(cert);
});

it('can store CryptoKey into IndexedDB', async () => {
  // Arrange
  const generatedKeyPair = await window.crypto.subtle.generateKey(
    {name: 'ECDSA', namedCurve: 'P-256'},
    false, // cannot extractable
    ['sign', 'verify']
  );

  const key = generatedKeyPair.privateKey;
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
    'scalar.dl.client.private_key_cryptokey': key,
    'scalar.dl.client.cert_pem': 'cert',
  };
  const id = `${certHolderId}_${certVersion}`;

  // Act
  const before = await db.keystore.get(id);
  await ClientServiceWithIndexedDb.create(properties);
  const after = await db.keystore.get(id);

  // Assert
  expect(before).toBeUndefined();
  expect(after).toBeDefined();
  expect(after.key).toEqual(key);
});

it('should throw error if the key can not be found in IndexedDB', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
  };

  // Act & Assert
  await expectAsync(
    ClientServiceWithIndexedDb.create(properties)
  ).toBeRejectedWithError('Can not find key from IndexedDB');
});

it('should throw error if the key stored in IndexedDB is not CryptoKey', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
  };
  const id = `${certHolderId}_${certVersion}`;
  db.keystore.put({id: id, key: 'key'});

  // Act & Assert
  await expectAsync(
    ClientServiceWithIndexedDb.create(properties)
  ).toBeRejectedWithError('The key from IndexedDB is not CryptoKey');
});

it('should throw error if the cert can not be found in IndexedDB', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
  };
  await presetKey(certHolderId, certVersion);

  // Act & Assert
  await expectAsync(
    ClientServiceWithIndexedDb.create(properties)
  ).toBeRejectedWithError('Can not find certificate from IndexedDB');
});

it('should throw error if the cert stored in IndexedDB is not string', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
  };
  const id = `${certHolderId}_${certVersion}`;
  await presetKey(certHolderId, certVersion);
  db.certstore.put({id: id, cert: 1});

  // Act & Assert
  await expectAsync(
    ClientServiceWithIndexedDb.create(properties)
  ).toBeRejectedWithError('The certificate from IndexedDB is not string');
});

it('can delete key and cert from IndexedDB', async () => {
  // Arrange
  const certHolderId = `${new Date().getTime()}`;
  const certVersion = 1;
  const properties = {
    'scalar.dl.client.server.host': '127.0.0.1',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': certHolderId,
    'scalar.dl.client.cert_version': certVersion,
  };
  const id = `${certHolderId}_${certVersion}`;

  // Act
  await presetKeyAndCert(certHolderId, certVersion);
  const clientService = await ClientServiceWithIndexedDb.create(properties);

  const before = await db.keystore.get(id);
  await clientService.deleteIndexedDb();
  const after = await db.keystore.get(id);

  // Assert
  expect(before).toBeDefined();
  expect(after).toBeUndefined();
});
