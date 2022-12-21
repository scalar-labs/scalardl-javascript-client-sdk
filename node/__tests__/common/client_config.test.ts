import {ClientConfig} from '../../common/client_config';

test('should set optional properties with default values', () => {
  const properties = new ClientConfig({
    'scalar.dl.client.cert_holder_id': 'foo',
    'scalar.dl.client.cert_pem': 'fake-cert',
    'scalar.dl.client.private_key_pem': 'fake-key',
  });

  expect(properties.getCertHolderId()).toEqual('foo');
  expect(properties.getCertVersion()).toEqual(1);
  expect(properties.getCertPem()).toEqual('fake-cert');
  expect(properties.getPrivateKeyPem()).toEqual('fake-key');
  expect(properties.getServerHost()).toEqual('localhost');
  expect(properties.getServerPort()).toEqual(50051);
  expect(properties.getServerPrivilegedPort()).toEqual(50052);
  expect(properties.getAuditorHost()).toEqual('localhost');
  expect(properties.getAuditorPort()).toEqual(40051);
  expect(properties.getAuditorPrivilegedPort()).toEqual(40052);
  expect(properties.getCertVersion()).toEqual(1);
  expect(properties.getTlsEnabled()).toEqual(false);
  expect(properties.getAuditorEnabled()).toEqual(false);
});

test('should overwrite default values of default properties', () => {
  const properties = new ClientConfig({
    'scalar.dl.client.cert_holder_id': 'foo',
    'scalar.dl.client.cert_pem': 'fake-cert',
    'scalar.dl.client.cert_version': 10,
    'scalar.dl.client.private_key_pem': 'fake-key',
    'scalar.dl.client.server.host': 'ledger.example.com',
    'scalar.dl.client.server.port': 80,
    'scalar.dl.client.server.privileged_port': 8080,
    'scalar.dl.client.tls.enabled': true,
    'scalar.dl.client.tls.ca_root_cert_pem': 'fake-ca',
    'scalar.dl.client.auditor.enabled': true,
    'scalar.dl.client.auditor.host': 'auditor.example.com',
    'scalar.dl.client.auditor.port': 443,
    'scalar.dl.client.auditor.privileged_port': 4433,
    'scalar.dl.client.auditor.tls.enabled': true,
    'scalar.dl.client.auditor.tls.ca_root_cert_pem': 'fake-auditor-ca',
    'scalar.dl.client.auditor.linearizable_validation.contract_id':
      'new-validation',
    'scalar.dl.client.authorization.credential': 'my-credential',
  });

  expect(properties.getCertHolderId()).toEqual('foo');
  expect(properties.getCertVersion()).toEqual(10);
  expect(properties.getCertPem()).toEqual('fake-cert');
  expect(properties.getPrivateKeyPem()).toEqual('fake-key');
  expect(properties.getServerHost()).toEqual('ledger.example.com');
  expect(properties.getServerPort()).toEqual(80);
  expect(properties.getServerPrivilegedPort()).toEqual(8080);
  expect(properties.getCertVersion()).toEqual(10);
  expect(properties.getTlsEnabled()).toEqual(true);
  expect(properties.getTlsCaRootCertPem()).toEqual('fake-ca');
  expect(properties.getAuditorEnabled()).toEqual(true);
  expect(properties.getAuditorHost()).toEqual('auditor.example.com');
  expect(properties.getAuditorPort()).toEqual(443);
  expect(properties.getAuditorPrivilegedPort()).toEqual(4433);
  expect(properties.getAuditorTlsEnabled()).toEqual(true);
  expect(properties.getAuditorTlsCaRootCertPem()).toEqual('fake-auditor-ca');
  expect(properties.getAuditorLinearizableValidationContractId()).toEqual(
    'new-validation'
  );
  expect(properties.getAuthorizationCredential()).toEqual('my-credential');
});

test('should throw error if `scalar.dl.client.cert_holder_id` is not set', () => {
  expect(() => {
    new ClientConfig({});
  }).toThrow(
    'scalar.dl.client.cert_holder_id should be non-empty string when scalar.dl.client.mode is CLIENT.'
  );
});

test('should throw error if `scalar.dl.client.cert_holder_id` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 100,
    });
  }).toThrow(
    'scalar.dl.client.cert_holder_id should be non-empty string when scalar.dl.client.mode is CLIENT.'
  );
});

test('should throw error if `scalar.dl.client.cert_holder_id` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': '',
    });
  }).toThrow(
    'scalar.dl.client.cert_holder_id should be non-empty string when scalar.dl.client.mode is CLIENT.'
  );
});

test('should throw error if `scalar.dl.client.cert_pem` is not set', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
    });
  }).toThrow(
    'scalar.dl.client.cert_pem should be non-empty string when scalar.dl.client.mode is CLIENT.'
  );
});

test('should throw error if `scalar.dl.client.cert_pem` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': true,
    });
  }).toThrow(
    'scalar.dl.client.cert_pem should be non-empty string when scalar.dl.client.mode is CLIENT.'
  );
});

test('should throw error if `scalar.dl.client.cert_pem` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': '',
    });
  }).toThrow(
    'scalar.dl.client.cert_pem should be non-empty string when scalar.dl.client.mode is CLIENT.'
  );
});

test('should throw error if `scalar.dl.client.private_key_pem` is not set', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
    });
  }).toThrow(
    'either scalar.dl.client.private_key_pem (non-empty string) or scalar.dl.client.private_key_cryptokey (CtyptoKey) is required.'
  );
});

test('should throw error if `scalar.dl.client.private_key_pem` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': new Object(),
    });
  }).toThrow(
    'either scalar.dl.client.private_key_pem (non-empty string) or scalar.dl.client.private_key_cryptokey (CtyptoKey) is required.'
  );
});

test('should throw error if `scalar.dl.client.private_key_pem` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': '',
    });
  }).toThrow(
    'either scalar.dl.client.private_key_pem (non-empty string) or scalar.dl.client.private_key_cryptokey (CtyptoKey) is required.'
  );
});

test('should throw error if `scalar.dl.client.tls.enabled` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.tls.enabled': 'true',
    });
  }).toThrow('scalar.dl.client.tls.enabled should be boolean.');
});

test('should throw error if `scalar.dl.client.tls.ca_root_cert_pem` is not set', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.tls.enabled': true,
    });
  }).toThrow(
    'scalar.dl.client.tls.ca_root_cert_pem should be non-empty string when scalar.dl.client.tls.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.tls.ca_root_cert_pem` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.tls.enabled': true,
      'scalar.dl.client.tls.ca_root_cert_pem': 1,
    });
  }).toThrow(
    'scalar.dl.client.tls.ca_root_cert_pem should be non-empty string when scalar.dl.client.tls.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.tls.ca_root_cert_pem` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.tls.enabled': true,
      'scalar.dl.client.tls.ca_root_cert_pem': '',
    });
  }).toThrow(
    'scalar.dl.client.tls.ca_root_cert_pem should be non-empty string when scalar.dl.client.tls.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.enabled` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': 'true',
    });
  }).toThrow('scalar.dl.client.auditor.enabled should be boolean.');
});

test('should throw error if `scalar.dl.client.auditor.host` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.host': 0,
    });
  }).toThrow(
    'scalar.dl.client.auditor.host should be non-empty string when scalar.dl.client.auditor.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.host` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.host': '',
    });
  }).toThrow(
    'scalar.dl.client.auditor.host should be non-empty string when scalar.dl.client.auditor.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.port` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.port': '50052',
    });
  }).toThrow(
    'scalar.dl.client.auditor.port should be integer when scalar.dl.client.auditor.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.privileged_port` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.privileged_port': '50052',
    });
  }).toThrow(
    'scalar.dl.client.auditor.privileged_port should be integer when scalar.dl.client.auditor.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.linearizable_validation.contract_id` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.linearizable_validation.contract_id': 100,
    });
  }).toThrow(
    'scalar.dl.client.auditor.linearizable_validation.contract_id should be non-empty string when scalar.dl.client.auditor.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.linearizable_validation.contract_id` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.linearizable_validation.contract_id': '',
    });
  }).toThrow(
    'scalar.dl.client.auditor.linearizable_validation.contract_id should be non-empty string when scalar.dl.client.auditor.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.tls.enabled` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.tls.enabled': 'true',
    });
  }).toThrow('scalar.dl.client.auditor.tls.enabled should be boolean.');
});

test('should throw error if `scalar.dl.client.auditor.tls.ca_root_cert_pem` is not set', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.tls.enabled': true,
    });
  }).toThrow(
    'scalar.dl.client.auditor.tls.ca_root_cert_pem should be non-empty string when scalar.dl.client.auditor.tls.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.tls.ca_root_cert_pem` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.tls.enabled': true,
      'scalar.dl.client.auditor.tls.ca_root_cert_pem': 100,
    });
  }).toThrow(
    'scalar.dl.client.auditor.tls.ca_root_cert_pem should be non-empty string when scalar.dl.client.auditor.tls.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.auditor.tls.ca_root_cert_pem` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.auditor.enabled': true,
      'scalar.dl.client.auditor.tls.enabled': true,
      'scalar.dl.client.auditor.tls.ca_root_cert_pem': '',
    });
  }).toThrow(
    'scalar.dl.client.auditor.tls.ca_root_cert_pem should be non-empty string when scalar.dl.client.auditor.tls.enabled is true.'
  );
});

test('should throw error if `scalar.dl.client.authorization.credential` is in wrong type', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.authorization.credential': 100,
    });
  }).toThrow(
    'scalar.dl.client.authorization.credential should be non-empty string.'
  );
});

test('should throw error if `scalar.dl.client.authorization.credential` is empty string', () => {
  expect(() => {
    new ClientConfig({
      'scalar.dl.client.cert_holder_id': 'foo',
      'scalar.dl.client.cert_pem': 'fake-cert',
      'scalar.dl.client.private_key_pem': 'fake-key',
      'scalar.dl.client.authorization.credential': '',
    });
  }).toThrow(
    'scalar.dl.client.authorization.credential should be non-empty string.'
  );
});
