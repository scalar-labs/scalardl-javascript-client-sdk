import Ajv, {SchemaObject} from 'ajv';

export const ClientPropertiesField = {
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
  AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID:
    'scalar.dl.client.auditor.linearizable_validation.contract_id',
  TLS_CA_ROOT_CERT_PEM: 'scalar.dl.client.tls.ca_root_cert_pem',
  TLS_ENABLED: 'scalar.dl.client.tls.enabled',
  AUTHORIZATION_CREDENTIAL: 'scalar.dl.client.authorization.credential',
};

export type Properties = {
  [key: string]: string | number | boolean | Object;
};

const defaultSchema: SchemaObject = {
  $schema: 'http://json-schema.org/draft-07/schema',
  type: 'object',
  properties: {} as {
    [key: string]: {
      type: string;
    };
  },
};
defaultSchema.properties[ClientPropertiesField.CERT_HOLDER_ID] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.CERT_VERSION] = {
  type: 'number',
};
defaultSchema.properties[ClientPropertiesField.CERT_PEM] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.PRIVATE_KEY_PEM] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY] = {
  type: 'object',
};
defaultSchema.properties[ClientPropertiesField.SERVER_HOST] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.SERVER_PORT] = {
  type: 'number',
};
defaultSchema.properties[ClientPropertiesField.SERVER_PRIVILEGED_PORT] = {
  type: 'number',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_ENABLED] = {
  type: 'boolean',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_HOST] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_PORT] = {
  type: 'number',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_PRIVILEGED_PORT] = {
  type: 'number',
};
defaultSchema.properties[
  ClientPropertiesField.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.TLS_CA_ROOT_CERT_PEM] = {
  type: 'string',
};
defaultSchema.properties[ClientPropertiesField.TLS_ENABLED] = {
  type: 'boolean',
};
defaultSchema.properties[ClientPropertiesField.AUTHORIZATION_CREDENTIAL] = {
  type: 'string',
};

/**
 * Return a properties object with default values for optinal properties
 * @return {Object}
 */
function defaultProperties(): Properties {
  const properties: Properties = {};

  properties[ClientPropertiesField.SERVER_HOST] = 'localhost';
  properties[ClientPropertiesField.SERVER_PORT] = 50051;
  properties[ClientPropertiesField.SERVER_PRIVILEGED_PORT] = 50052;
  properties[ClientPropertiesField.CERT_VERSION] = 1;
  properties[ClientPropertiesField.TLS_ENABLED] = false;
  properties[ClientPropertiesField.AUDITOR_ENABLED] = false;
  properties[ClientPropertiesField.AUDITOR_HOST] = 'localhost';
  properties[ClientPropertiesField.AUDITOR_PORT] = 40051;
  properties[ClientPropertiesField.AUDITOR_PRIVILEGED_PORT] = 40052;
  properties[
    ClientPropertiesField.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
  ] = 'validate-ledger';

  return properties;
}

/**
 * A class represents client properties object
 */
export class ClientProperties {
  properties: Properties;

  /**
   * @param {Properties} properties native JavaScript object containing properties
   * @param {string[]} allOf array of string. required properties
   * @param {string[]} oneOf array of string. required properties
   */
  constructor(
    properties: Properties,
    allOf: string[] = [],
    oneOf: string[] = []
  ) {
    const theDefaultProperties = defaultProperties();

    properties = {
      ...theDefaultProperties,
      ...properties, // this object overwrites the upper default properties
    };

    const ajv = new Ajv();

    const schema = {
      ...defaultSchema,
    };

    if (allOf.length > 0) {
      schema['allOf'] = allOf.map(property => ({required: [property]}));
    }

    if (oneOf.length > 0) {
      schema['oneOf'] = oneOf.map(property => ({required: [property]}));
    }

    if (!ajv.validate(schema, properties)) {
      throw new Error(
        ajv.errors?.reduce(
          (message, error) => `${message} ${error.message}`,
          'In the client properties:'
        )
      );
    }

    if (properties[ClientPropertiesField.AUDITOR_ENABLED] !== true) {
      properties[
        ClientPropertiesField.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
      ] =
        theDefaultProperties[
          ClientPropertiesField.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
        ];
    }

    this.properties = properties;
  }

  /**
   * @return {string}
   */
  getCertHolderId(): string {
    return this.properties[ClientPropertiesField.CERT_HOLDER_ID] as string;
  }

  /**
   * @return {number}
   */
  getCertVersion(): number {
    return this.properties[ClientPropertiesField.CERT_VERSION] as number;
  }

  /**
   * @return {string}
   */
  getCertPem(): string {
    return this.properties[ClientPropertiesField.CERT_PEM] as string;
  }

  /**
   * @return {string}
   */
  getPrivateKeyPem(): string {
    return this.properties[ClientPropertiesField.PRIVATE_KEY_PEM] as string;
  }

  /**
   * @return {Object|null}
   */
  getPrivateKeyCryptoKey(): Object | null {
    return this.properties[ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY];
  }

  /**
   * @return {string}
   */
  getServerHost(): string {
    return this.properties[ClientPropertiesField.SERVER_HOST] as string;
  }

  /**
   * @return {number}
   */
  getServerPort(): number {
    return this.properties[ClientPropertiesField.SERVER_PORT] as number;
  }

  /**
   * @return {number}
   */
  getServerPrivilegedPort(): number {
    return this.properties[
      ClientPropertiesField.SERVER_PRIVILEGED_PORT
    ] as number;
  }

  /**
   * @return {boolean}
   */
  getAuditorEnabled(): boolean {
    return this.properties[ClientPropertiesField.AUDITOR_ENABLED] as boolean;
  }

  /**
   * @return {string}
   */
  getAuditorHost(): string {
    return this.properties[ClientPropertiesField.AUDITOR_HOST] as string;
  }

  /**
   * @return {number}
   */
  getAuditorPort(): number {
    return this.properties[ClientPropertiesField.AUDITOR_PORT] as number;
  }

  /**
   * @return {number}
   */
  getAuditorPrivilegedPort(): number {
    return this.properties[
      ClientPropertiesField.AUDITOR_PRIVILEGED_PORT
    ] as number;
  }

  /**
   * @return {string}
   */
  getAuditorLinearizableValidationContractId(): string {
    return this.properties[
      ClientPropertiesField.AUDITOR_LINEARIZABLE_VALIDATION_CONTRACT_ID
    ] as string;
  }

  /**
   * @return {string}
   */
  getTlsCaRootCertPem(): string {
    return this.properties[
      ClientPropertiesField.TLS_CA_ROOT_CERT_PEM
    ] as string;
  }

  /**
   * @return {boolean}
   */
  getTlsEnabled(): boolean {
    return this.properties[ClientPropertiesField.TLS_ENABLED] as boolean;
  }

  /**
   * @return {string}
   */
  getAuthorizationCredential(): string {
    return this.properties[
      ClientPropertiesField.AUTHORIZATION_CREDENTIAL
    ] as string;
  }
}
