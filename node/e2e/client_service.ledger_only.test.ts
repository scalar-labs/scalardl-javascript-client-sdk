import {ClientService, StatusCode} from '../index';
import {readFileSync} from 'fs';
import {join} from 'path';
// eslint-disable-next-line node/no-unpublished-import
import {Client as CassandraClient} from 'cassandra-driver';

const properties = {
  'scalar.dl.client.server.host': 'localhost',
  'scalar.dl.client.server.port': 50051,
  'scalar.dl.client.server.privileged_port': 50052,

  // Make the test idempotent.
  'scalar.dl.client.cert_holder_id': `foo@${Date.now()}`,

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
    'Gc/v+yh4dHIDhCrimajTQAYOG9n0kajULI70Gg7TNw==\n-----END CERTIFICATE-----\n',

  'scalar.dl.client.cert_version': 1,
  'scalar.dl.client.tls.enabled': false,
};

test('registerCertificate should be successful', async () => {
  // Arrange
  const clientService = new ClientService(properties);

  // Act & Assert
  expect(await clientService.registerCertificate()).toBe(void 0);
});

test('registerContract should be successful', async () => {
  // Arrange
  const id = `DeprecatedStateReader${Date.now()}`;
  const name = 'com.org1.contract.DeprecatedStateReader';
  const bytes = readFileSync(
    join(__dirname, 'fixture', 'DeprecatedStateReader.class')
  );

  const clientService = new ClientService(properties);

  // Act & Assert
  expect(await clientService.registerContract(id, name, bytes)).toBe(void 0);
});

test('registerFunction should be successful', async () => {
  // Arrange
  const id = `TestFunction${Date.now()}`;
  const name = 'com.org1.function.TestFunction';
  const bytes = readFileSync(join(__dirname, 'fixture', 'TestFunction.class'));

  const clientService = new ClientService(properties);

  // Act & Assert
  expect(await clientService.registerFunction(id, name, bytes)).toBe(void 0);
});

test('listContracts should contain the registered contract', async () => {
  // Arrange
  const id = `DeprecatedStateReader${Date.now()}`;
  const name = 'com.org1.contract.DeprecatedStateReader';
  const bytes = readFileSync(
    join(__dirname, 'fixture', 'DeprecatedStateReader.class')
  );

  const clientService = new ClientService(properties);

  // Act
  await clientService.registerContract(id, name, bytes, {foo: 'bar'});
  const registered = await clientService.listContracts();

  // Assert
  expect(Object.keys(registered)).toContain(id);
  expect((registered as never)[id]['contract_name']).toBe(
    'com.org1.contract.DeprecatedStateReader'
  );
  expect((registered as never)[id]['contract_properties']).toBe(
    '{"foo":"bar"}'
  );
});

test('execute (DeprecatedContract) with function should be successful', async () => {
  // Arrange
  const id1 = `deprecated-state-reader${Date.now()}`;
  const name1 = 'com.org1.contract.DeprecatedStateReader';
  const bytes1 = readFileSync(
    join(__dirname, 'fixture', 'DeprecatedStateReader.class')
  );

  const id2 = `deprecated-state-updater${Date.now()}`;
  const name2 = 'com.org1.contract.DeprecatedStateUpdater';
  const bytes2 = readFileSync(
    join(__dirname, 'fixture', 'DeprecatedStateUpdater.class')
  );

  const id3 = `deprecated-function${Date.now()}`;
  const name3 = 'com.org1.function.TestFunction';
  const bytes3 = readFileSync(join(__dirname, 'fixture', 'TestFunction.class'));

  const clientService = new ClientService(properties);

  const assetId = `foo${Date.now()}`;

  // Act
  await clientService.registerContract(id1, name1, bytes1);
  await clientService.registerContract(id2, name2, bytes2);
  await clientService.registerFunction(id3, name3, bytes3);

  const state = Date.now() % 1000;

  await clientService.execute(
    id2,
    {
      asset_id: assetId,
      state: state,
    },
    id3,
    {
      asset_id: assetId,
    }
  );

  const executed = await clientService.execute(id1, {asset_id: assetId});
  const result = JSON.parse(executed.getContractResult());

  const cassandraClient = new CassandraClient({
    contactPoints: ['localhost'],
    localDataCenter: 'dc1',
  });

  const cassandraResponse = await cassandraClient.execute(
    `SELECT * FROM foo.bar WHERE column_a='${assetId}';`
  );
  await cassandraClient.shutdown();

  // Assert
  expect(Object.keys(result)).toContain('id');
  expect(Object.keys(result)).toContain('output');
  expect((result as never)['id']).toBe(assetId);
  expect((result as never)['output']['state']).toBe(state);
  expect(cassandraResponse.rows[0].column_a).toBe(assetId);
});

test('execute (JacksonBasedContract) with function should be successful', async () => {
  // Arrange
  const id1 = `jackson-state-reader${Date.now()}`;
  const name1 = 'com.org1.contract.JacksonBasedStateReader';
  const bytes1 = readFileSync(
    join(__dirname, 'fixture', 'JacksonBasedStateReader.class')
  );

  const id2 = `jackson-state-updater${Date.now()}`;
  const name2 = 'com.org1.contract.JacksonBasedStateUpdater';
  const bytes2 = readFileSync(
    join(__dirname, 'fixture', 'JacksonBasedStateUpdater.class')
  );

  const id3 = `jackson-function${Date.now()}`;
  const name3 = 'com.org1.function.JacksonFunction';
  const bytes3 = readFileSync(
    join(__dirname, 'fixture', 'JacksonFunction.class')
  );

  const clientService = new ClientService(properties);

  const assetId = `foo${Date.now()}`;

  // Act
  await clientService.registerContract(id1, name1, bytes1);
  await clientService.registerContract(id2, name2, bytes2);
  await clientService.registerFunction(id3, name3, bytes3);

  const state = Date.now() % 1000;

  await clientService.execute(
    id2,
    {
      asset_id: assetId,
      state: state,
    },
    id3,
    {
      namespace: 'namespace',
      table: 'table',
      key: 'key',
      value: 'value',
    }
  );

  const executed = await clientService.execute(id1, {asset_id: assetId});
  const result = JSON.parse(executed.getContractResult());

  // Assert
  expect(Object.keys(result)).toContain('id');
  expect(Object.keys(result)).toContain('output');
  expect((result as never)['id']).toBe(assetId);
  expect((result as never)['output']['state']).toBe(state);
});

test('execute (StringBasedContract) should be successful', async () => {
  // Arrange
  const id1 = `string-state-reader${Date.now()}`;
  const name1 = 'com.org1.contract.StringBasedStateReader';
  const bytes1 = readFileSync(
    join(__dirname, 'fixture', 'StringBasedStateReader.class')
  );

  const id2 = `string-state-updater${Date.now()}`;
  const name2 = 'com.org1.contract.StringBasedStateUpdater';
  const bytes2 = readFileSync(
    join(__dirname, 'fixture', 'StringBasedStateUpdater.class')
  );

  const clientService = new ClientService(properties);

  // Act
  await clientService.registerContract(id1, name1, bytes1);
  await clientService.registerContract(id2, name2, bytes2);

  const state = Date.now() % 1000;

  await clientService.execute(id2, `bar,${state}`);
  const executed = await clientService.execute(id1, 'bar');
  const result = executed.getContractResult();

  // Assert
  expect(result).toContain('bar');
  expect(result).toContain(`${state}`);
});

test('validateLedger should be successful', async () => {
  // Arrange
  const clientService = new ClientService(properties);

  // Act
  const validated = await clientService.validateLedger('bar');

  // Assert
  expect(validated.getCode()).toBe(StatusCode.OK);
});
