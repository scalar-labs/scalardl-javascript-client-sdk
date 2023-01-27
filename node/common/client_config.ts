import {
  isNonEmptyString,
  isUndefinedOrNull,
  isBoolean,
  isInteger,
} from './polyfill/is';

export const CLIENT_PROPERTIES_FIELD = {
  CERT_HOLDER_ID: 'scalar.dl.client.cert_holder_id',
  CERT_VERSION: 'scalar.dl.client.cert_version',
  CERT_PEM: 'scalar.dl.client.cert_pem',
  PRIVATE_KEY_PEM: 'scalar.dl.client.private_key_pem',
  PRIVATE_KEY_CRYPTOKEY: 'scalar.dl.client.private_key_cryptokey',
  SERVER_HOST: 'scalar.dl.client.server.host',
  SERVER_PORT: 'scalar.dl.client.server.port',
  SERVER_PRIVILEGED_PORT: 'scalar.dl.client.server.privileged_port',
  AUDITOR_ENABLED: 'scalar.dl.client.auditor.enabled',
  AUDITOR_HOST: 'scalar.dl.client.auditor.host',
  AUDITOR_PORT: 'scalar.dl.client.auditor.port',
  AUDITOR_PRIVILEGED_PORT: 'scalar.dl.client.auditor.privileged_port',
  AUDITOR_TLS_ENABLED: 'scalar.dl.client.auditor.tls.enabled',
  AUDITOR_TLS_CA_ROOT_CERT_PEM: 'scalar.dl.client.auditor.tls.ca_root_cert_pem',
  AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID:
    'scalar.dl.client.auditor.linearizable_validation.contract_id',
  TLS_CA_ROOT_CERT_PEM: 'scalar.dl.client.tls.ca_root_cert_pem',
  TLS_ENABLED: 'scalar.dl.client.tls.enabled',
  AUTHORIZATION_CREDENTIAL: 'scalar.dl.client.authorization.credential',
  MODE: 'scalar.dl.client.mode',
};

export const CLIENT_MODE = {
  CLIENT: 'CLIENT',
  INTERMEDIARY: 'INTERMEDIARY',
};

export type Properties = {
  [key: string]: string | number | boolean | Object;
};

function defaultProperties(): Properties {
  const properties: Properties = {};

  properties[CLIENT_PROPERTIES_FIELD.CERT_VERSION] = 1;
  properties[CLIENT_PROPERTIES_FIELD.SERVER_HOST] = 'localhost';
  properties[CLIENT_PROPERTIES_FIELD.SERVER_PORT] = 50051;
  properties[CLIENT_PROPERTIES_FIELD.SERVER_PRIVILEGED_PORT] = 50052;
  properties[CLIENT_PROPERTIES_FIELD.TLS_ENABLED] = false;
  properties[CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED] = false;
  properties[CLIENT_PROPERTIES_FIELD.AUDITOR_HOST] = 'localhost';
  properties[CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_ENABLED] = false;
  properties[CLIENT_PROPERTIES_FIELD.AUDITOR_PORT] = 40051;
  properties[CLIENT_PROPERTIES_FIELD.AUDITOR_PRIVILEGED_PORT] = 40052;
  properties[
    CLIENT_PROPERTIES_FIELD.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
  ] = 'validate-ledger';
  properties[CLIENT_PROPERTIES_FIELD.MODE] = CLIENT_MODE.CLIENT;

  return properties;
}

function check(p: Properties) {
  const mode = p[CLIENT_PROPERTIES_FIELD.MODE];

  if (mode !== CLIENT_MODE.CLIENT && mode !== CLIENT_MODE.INTERMEDIARY) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.MODE} should be either ${CLIENT_MODE.CLIENT} or ${CLIENT_MODE.INTERMEDIARY}.`
    );
  }

  if (mode === CLIENT_MODE.CLIENT) {
    const certHolderId = p[CLIENT_PROPERTIES_FIELD.CERT_HOLDER_ID];

    if (!isNonEmptyString(certHolderId)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.CERT_HOLDER_ID} should be non-empty string when ${CLIENT_PROPERTIES_FIELD.MODE} is ${CLIENT_MODE.CLIENT}.`
      );
    }

    const certPem = p[CLIENT_PROPERTIES_FIELD.CERT_PEM];

    if (!isNonEmptyString(certPem)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.CERT_PEM} should be non-empty string when ${CLIENT_PROPERTIES_FIELD.MODE} is ${CLIENT_MODE.CLIENT}.`
      );
    }

    const privateKeyPem = p[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM];
    const privateKeyCryptoKey =
      p[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_CRYPTOKEY];

    if (!isNonEmptyString(privateKeyPem) && !isCryptoKey(privateKeyCryptoKey)) {
      throw new Error(
        `either ${CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM} (non-empty string) or ${CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_CRYPTOKEY} (CtyptoKey) is required.`
      );
    }
  }

  const tlsEnabled = p[CLIENT_PROPERTIES_FIELD.TLS_ENABLED];

  if (!isBoolean(tlsEnabled)) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.TLS_ENABLED} should be boolean.`
    );
  }

  if (tlsEnabled) {
    const tlsCaRootCertPem = p[CLIENT_PROPERTIES_FIELD.TLS_CA_ROOT_CERT_PEM];
    if (!isNonEmptyString(tlsCaRootCertPem)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.TLS_CA_ROOT_CERT_PEM} should be non-empty string when ${CLIENT_PROPERTIES_FIELD.TLS_ENABLED} is true.`
      );
    }
  }

  const auditorEnabled = p[CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED];

  if (!isBoolean(auditorEnabled)) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED} should be boolean.`
    );
  }

  if (auditorEnabled) {
    const auditorHost = p[CLIENT_PROPERTIES_FIELD.AUDITOR_HOST];

    if (!isNonEmptyString(auditorHost)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.AUDITOR_HOST} should be non-empty string when ${CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED} is true.`
      );
    }

    const auditorPort = p[CLIENT_PROPERTIES_FIELD.AUDITOR_PORT];

    if (!isInteger(auditorPort)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.AUDITOR_PORT} should be integer when ${CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED} is true.`
      );
    }

    const auditorPrivilegedPort =
      p[CLIENT_PROPERTIES_FIELD.AUDITOR_PRIVILEGED_PORT];

    if (!isInteger(auditorPrivilegedPort)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.AUDITOR_PRIVILEGED_PORT} should be integer when ${CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED} is true.`
      );
    }

    const auditorLinearizableValidationContractId =
      p[CLIENT_PROPERTIES_FIELD.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID];

    if (!isNonEmptyString(auditorLinearizableValidationContractId)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID} should be non-empty string when ${CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED} is true.`
      );
    }

    const auditorTlsEnabled = p[CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_ENABLED];

    if (!isBoolean(auditorTlsEnabled)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_ENABLED} should be boolean.`
      );
    }

    if (auditorTlsEnabled) {
      const auditorTlsCaRootCertPem =
        p[CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_CA_ROOT_CERT_PEM];

      if (!isNonEmptyString(auditorTlsCaRootCertPem)) {
        throw new Error(
          `${CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_CA_ROOT_CERT_PEM} should be non-empty string when ${CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_ENABLED} is true.`
        );
      }
    }
  }

  const serverHost = p[CLIENT_PROPERTIES_FIELD.SERVER_HOST];

  if (!isNonEmptyString(serverHost)) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.SERVER_HOST} should be non-empty string.`
    );
  }

  const serverPort = p[CLIENT_PROPERTIES_FIELD.SERVER_PORT];

  if (!isInteger(serverPort)) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.SERVER_PORT} should be integer.`
    );
  }

  const serverPriviledgedPort =
    p[CLIENT_PROPERTIES_FIELD.SERVER_PRIVILEGED_PORT];

  if (!Number.isInteger(serverPriviledgedPort)) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.SERVER_PRIVILEGED_PORT} should to be integer.`
    );
  }

  const authorizationCredential =
    p[CLIENT_PROPERTIES_FIELD.AUTHORIZATION_CREDENTIAL];

  if (
    !isUndefinedOrNull(authorizationCredential) &&
    !isNonEmptyString(authorizationCredential)
  ) {
    throw new Error(
      `${CLIENT_PROPERTIES_FIELD.AUTHORIZATION_CREDENTIAL} should be non-empty string.`
    );
  }
}

export class ClientConfig {
  properties: Properties;

  constructor(properties: Properties) {
    const theDefaultProperties = defaultProperties();

    properties = {
      ...theDefaultProperties,
      ...properties,
    };

    check(properties);

    this.properties = properties;
  }

  getCertHolderId(): string {
    return this.properties[CLIENT_PROPERTIES_FIELD.CERT_HOLDER_ID] as string;
  }

  getCertVersion(): number {
    return this.properties[CLIENT_PROPERTIES_FIELD.CERT_VERSION] as number;
  }

  getCertPem(): string {
    return this.properties[CLIENT_PROPERTIES_FIELD.CERT_PEM] as string;
  }

  getPrivateKeyPem(): string {
    return this.properties[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM] as string;
  }

  getPrivateKeyCryptoKey(): Object | undefined | null {
    return this.properties[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_CRYPTOKEY];
  }

  getServerHost(): string {
    return this.properties[CLIENT_PROPERTIES_FIELD.SERVER_HOST] as string;
  }

  getServerPort(): number {
    return this.properties[CLIENT_PROPERTIES_FIELD.SERVER_PORT] as number;
  }

  getServerPrivilegedPort(): number {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.SERVER_PRIVILEGED_PORT
    ] as number;
  }

  getAuditorEnabled(): boolean {
    return this.properties[CLIENT_PROPERTIES_FIELD.AUDITOR_ENABLED] as boolean;
  }

  getAuditorHost(): string | undefined | null {
    return this.properties[CLIENT_PROPERTIES_FIELD.AUDITOR_HOST] as string;
  }

  getAuditorPort(): number | undefined | null {
    return this.properties[CLIENT_PROPERTIES_FIELD.AUDITOR_PORT] as number;
  }

  getAuditorPrivilegedPort(): number | undefined | null {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.AUDITOR_PRIVILEGED_PORT
    ] as number;
  }

  getAuditorLinearizableValidationContractId(): string {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
    ] as string;
  }

  getAuditorTlsEnabled(): boolean {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_ENABLED
    ] as boolean;
  }

  getAuditorTlsCaRootCertPem(): string | undefined | null {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.AUDITOR_TLS_CA_ROOT_CERT_PEM
    ] as string;
  }

  getTlsEnabled(): boolean {
    return this.properties[CLIENT_PROPERTIES_FIELD.TLS_ENABLED] as boolean;
  }

  getTlsCaRootCertPem(): string | undefined | null {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.TLS_CA_ROOT_CERT_PEM
    ] as string;
  }

  getAuthorizationCredential(): string | undefined | null {
    return this.properties[
      CLIENT_PROPERTIES_FIELD.AUTHORIZATION_CREDENTIAL
    ] as string;
  }
}

function isCryptoKey(k: unknown): boolean {
  return (
    k !== undefined &&
    k !== null &&
    k.constructor &&
    k.constructor.name === 'CryptoKey'
  );
}
