import {ClientService} from '../client_service';
import {readFileSync} from 'fs';
import {join} from 'path';
// eslint-disable-next-line node/no-unpublished-import
import {StatusCode} from '../common';

const validateLedgerContractId = `validate-ledger${Date.now()}`;

const properties = {
  'scalar.dl.client.server.host': 'localhost',
  'scalar.dl.client.server.port': 50051,
  'scalar.dl.client.server.privileged_port': 50052,

  'scalar.dl.client.auditor.enabled': true,
  'scalar.dl.client.auditor.host': 'localhost',
  'scalar.dl.client.auditor.port': 40051,
  'scalar.dl.client.auditor.privileged_port': 40052,
  'scalar.dl.client.auditor.linearizable_validation.contract_id':
    validateLedgerContractId,

  // Make the test idempotent.
  'scalar.dl.client.cert_holder_id': `foo@${Date.now()}`,

  'scalar.dl.client.private_key_pem':
    '-----BEGIN EC PRIVATE KEY-----\n' +
    'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
    'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
    'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n',

  'scalar.dl.client.cert_version': 1,
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
};

const assetId = `asset${Date.now()}`;

test('registerCertificate should be successful', async () => {
  // Arrange
  const clientService = new ClientService(properties);

  // Act & Assert
  expect(await clientService.registerCertificate()).toBe(void 0);
});

test('registerContract (ValidateLedger) should be successful', async () => {
  // Arrange
  const id = validateLedgerContractId;
  const name = 'com.scalar.dl.client.contract.ValidateLedger';
  const bytes = readFileSync(
    join(__dirname, 'fixture', 'ValidateLedger.class')
  );

  const clientService = new ClientService(properties);

  // Act & Assert
  expect(await clientService.registerContract(id, name, bytes)).toBe(void 0);
});

test('execute (JacksonBasedContract) should be successful', async () => {
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

  const clientService = new ClientService(properties);

  // Act
  await clientService.registerContract(id1, name1, bytes1);
  await clientService.registerContract(id2, name2, bytes2);

  const state = Date.now() % 1000;

  await clientService.execute(id2, {
    asset_id: assetId,
    state: state,
  });

  const executed = await clientService.execute(id1, {asset_id: assetId});
  const result = JSON.parse(executed.getContractResult());

  // Assert
  expect(Object.keys(result)).toContain('id');
  expect(Object.keys(result)).toContain('output');
  expect((result as never)['id']).toBe(assetId);
  expect((result as never)['output']['state']).toBe(state);

  expect(executed.getAuditorProofs().length).toBeGreaterThan(0);
  expect(executed.getProofs().length).toBeGreaterThan(0);
  expect(executed.getAuditorProofs().length).toEqual(
    executed.getProofs().length
  );
  executed.getAuditorProofs().map((proof, i) => {
    proof.valueEquals(executed.getProofs()[i]);
  });
});

test('validateLedger should be successful', async () => {
  // Arrange
  const clientService = new ClientService(properties);

  // Act
  const validated = await clientService.validateLedger(assetId);

  // Assert
  expect(validated.getCode()).toBe(StatusCode.OK);
  expect(validated.getAuditorProof()).toBeDefined();
  expect(validated.getProof()).toBeDefined();
  expect(validated.getAuditorProof()!).toBe(validated.getProof()!);
});
