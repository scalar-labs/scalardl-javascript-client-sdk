import {StatusCode} from './status_code';
import {ClientError} from './client_error';
import {ClientConfig, Properties} from './client_config';
import {
  ContractRegistrationRequestBuilder,
  ContractsListingRequestBuilder,
  CertificateRegistrationRequestBuilder,
  FunctionRegistrationRequestBuilder,
} from './builder';
import {
  AuditorClient,
  AuditorPrivileged,
  LedgerClient,
  LedgerPrivileged,
  Metadata,
  CertificateRegistrationRequest,
  Status,
  ContractRegistrationRequest,
  FunctionRegistrationRequest,
  ContractsListingRequest,
  ContractsListingResponse,
  ScalarService,
  ScalarMessage,
} from './scalar.proto';
import {SignatureSigner, SignatureSignerFactory} from './signature';
import {isString} from './polyfill/is';

/**
 * This class handles all client interactions including registering certificates
 * and contracts, listing contracts, validating the ledger, and executing
 * contracts.
 */
export class ClientServiceBase {
  readonly metadata: Metadata;
  readonly ledgerClient: LedgerClient;
  readonly ledgerPrivileged: LedgerPrivileged;
  readonly auditorClient: AuditorClient;
  readonly auditorPrivileged: AuditorPrivileged;
  readonly signerFactory: SignatureSignerFactory;
  readonly protobuf: ScalarMessage;
  readonly onBrowser: boolean;
  readonly config: ClientConfig;

  signer: SignatureSigner | null = null;

  /**
   * @param {ScalarService & {signerFactory: SignatureSignerFactory}} services contains the object of ledgeClient and
   *  the object of ledgerPrivileged
   * @param {ScalarMessage} protobuf protobuf object to inject
   * @param {Properties} properties JSON Object used for setting client properties
   * @param {Metadata} metadata gRPC metadata object used to add header
   * @param {boolean} [onBrowser=false] whether the client is running on browser or not
   *  to the gRPC request
   */
  constructor(
    services: ScalarService & {
      signerFactory: SignatureSignerFactory;
    },
    protobuf: ScalarMessage,
    properties: Properties,
    metadata: Metadata,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    onBrowser: boolean = false
  ) {
    this.config = new ClientConfig(properties);
    this.metadata = metadata;
    this.ledgerClient = services['ledgerClient'];
    this.ledgerPrivileged = services['ledgerPrivileged'];
    this.auditorClient = services['auditorClient'];
    this.auditorPrivileged = services['auditorPrivileged'];
    this.signerFactory = services['signerFactory'];
    this.protobuf = protobuf;
    this.onBrowser = onBrowser;
  }

  static get binaryStatusKey(): string {
    return 'rpc.status-bin';
  }

  /**
   * Registers the certificate specified in the given client properties.
   * @throws {ClientError|Error}
   */
  async registerCertificate(): Promise<void> {
    const request = await this.createCertificateRegistrationRequest();

    if (this.isAuditorEnabled()) {
      const promise = new Promise<void>((resolve, reject) => {
        this.auditorPrivileged.registerCert(request, this.metadata, err => {
          if (err) reject(err);
          else resolve();
        });
      });

      await this.executePromise(promise);
    }

    const promise = new Promise<void>((resolve, reject) => {
      this.ledgerPrivileged.registerCert(request, this.metadata, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    return this.executePromise(promise) as Promise<void>;
  }

  /**
   * Create the byte array of CertificateRegistrationRequest.
   * @return {Promise<Uint8Array>}
   * @throws {Error}
   */
  async createSerializedCertificateRegistrationRequest(): Promise<Uint8Array> {
    return (
      await this.createCertificateRegistrationRequest()
    ).serializeBinary();
  }

  /**
   * Register a ScalarDL function
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async registerFunction(
    id: string,
    name: string,
    functionBytes: Uint8Array
  ): Promise<void> {
    const request = await this.createFunctionRegistrationRequest(
      id,
      name,
      functionBytes
    );

    const promise = new Promise<void>((resolve, reject) => {
      this.ledgerPrivileged.registerFunction(request, this.metadata, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    return this.executePromise(promise) as Promise<void>;
  }

  /**
   * Create the byte array of FunctionRegistrationRequest
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Promise<Uint8Array>}
   * @throws {Error}
   */
  async createSerializedFunctionRegistrationRequest(
    id: string,
    name: string,
    functionBytes: Uint8Array
  ): Promise<Uint8Array> {
    return (
      await this.createFunctionRegistrationRequest(id, name, functionBytes)
    ).serializeBinary();
  }

  /**
   * Register a ScalarDL contract
   * @param {string} id of the contract
   * @param {string} name  the canonical name of the contract class.
   *  For example "com.banking.contract1"
   * @param {Uint8Array} contractBytes
   * @param {Object} [properties={}]
   *  JSON Object used for setting client properties
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async registerContract(
    id: string,
    name: string,
    contractBytes: Uint8Array,
    properties: Object = {}
  ): Promise<void> {
    const request = await this.createContractRegistrationRequest(
      id,
      name,
      contractBytes,
      properties
    );

    if (this.isAuditorEnabled()) {
      const promise = new Promise<void>((resolve, reject) => {
        this.auditorClient.registerContract(request, this.metadata, err => {
          if (err) reject(err);
          else resolve();
        });
      });
      return this.executePromise(promise) as Promise<void>;
    }

    const promise = new Promise<void>((resolve, reject) => {
      this.ledgerClient.registerContract(request, this.metadata, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    return this.executePromise(promise) as Promise<void>;
  }

  /**
   * Create the byte array of ContractRegistrationRequest
   * @param {string} id of the contract
   * @param {string} name  the canonical name of the contract class.
   *  For example "com.banking.contract1"
   * @param {Uint8Array} contractBytes
   * @param {Object} properties
   *  JSON Object used for setting client properties
   * @return {Uint8Array}
   * @throws {Error}
   */
  async createSerializedContractRegistrationRequest(
    id: string,
    name: string,
    contractBytes: Uint8Array,
    properties: Object = {}
  ): Promise<Uint8Array> {
    return (
      await this.createContractRegistrationRequest(
        id,
        name,
        contractBytes,
        properties
      )
    ).serializeBinary();
  }

  /**
   * List the registered contract for the current user
   * @param {string} [contractId=''] to verify if a specific contractId is registered
   * @return {Promise<Object>}
   * @throws {ClientError|Error}
   */
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  async listContracts(contractId: string = ''): Promise<Object> {
    const request = await this.createContractsListingRequest(contractId);
    const promise = new Promise<Object>((resolve, reject) => {
      this.ledgerClient.listContracts(
        request,
        this.metadata,
        (err, response) => {
          if (err) reject(err);
          else
            resolve(
              JSON.parse((response as ContractsListingResponse).toObject().json)
            );
        }
      );
    });

    return this.executePromise(promise) as Promise<Object>;
  }

  /**
   * Create the byte array of ContractsListingRequest
   * @param {string} [contractId=''] to verify if a specific contractId is registered
   * @return {Uint8Array}
   */
  async createSerializedContractsListingRequest(
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    contractId: string = ''
  ): Promise<Uint8Array> {
    return (
      await this.createContractsListingRequest(contractId)
    ).serializeBinary();
  }

  private async createContractsListingRequest(
    contractId: string
  ): Promise<ContractsListingRequest> {
    if (!isString(contractId)) {
      throw new Error('Invalid argument');
    }

    return new ContractsListingRequestBuilder(
      new this.protobuf.ContractsListingRequest(),
      this.createSigner()
    )
      .withCertHolderId(this.config.getCertHolderId())
      .withCertVersion(this.config.getCertVersion())
      .withContractId(contractId)
      .build();
  }

  private isAuditorEnabled(): boolean {
    return this.config.getAuditorEnabled();
  }

  private async executePromise(
    promise: Promise<void | Object>
  ): Promise<void | Object> {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof ClientError) {
        throw e;
      }
      const status = this.parseStatusFromError(
        e as Error & {metadata: Metadata}
      ) as Status;
      if (status) {
        throw new ClientError(status.code, status.message);
      } else {
        throw new ClientError(
          StatusCode.UNKNOWN_TRANSACTION_STATUS,
          (e as Error).message
        );
      }
    }
  }

  private parseStatusFromError(
    error: Error & {metadata: Metadata}
  ): Object | void {
    if (!error.metadata) {
      return;
    }

    let binaryStatus;
    if (this.onBrowser) {
      // Web runtime
      binaryStatus = error.metadata[ClientServiceBase.binaryStatusKey];
    } else {
      // Node.js runtime
      const statusMetadata = error.metadata.get(
        ClientServiceBase.binaryStatusKey
      );
      if (Array.isArray(statusMetadata) && statusMetadata.length === 1) {
        binaryStatus = statusMetadata[0];
      }
    }

    if (binaryStatus) {
      return this.protobuf.Status.deserializeBinary(binaryStatus).toObject();
    }
  }

  private async createCertificateRegistrationRequest(): Promise<CertificateRegistrationRequest> {
    return new CertificateRegistrationRequestBuilder(
      new this.protobuf.CertificateRegistrationRequest()
    )
      .withCertHolderId(this.config.getCertHolderId())
      .withCertVersion(this.config.getCertVersion())
      .withCertPem(this.config.getCertPem())
      .build();
  }

  private async createFunctionRegistrationRequest(
    id: string,
    name: string,
    functionBytes: Uint8Array
  ): Promise<FunctionRegistrationRequest> {
    if (
      !isString(id) ||
      !isString(name) ||
      functionBytes.constructor.name !== 'Uint8Array'
    ) {
      throw new Error('Invalid argument');
    }

    return new FunctionRegistrationRequestBuilder(
      new this.protobuf.FunctionRegistrationRequest()
    )
      .withFunctionId(id)
      .withFunctionBinaryName(name)
      .withFunctionByteCode(functionBytes)
      .build();
  }

  private async createContractRegistrationRequest(
    id: string,
    name: string,
    contractBytes: Uint8Array,
    contractProperties: Object
  ): Promise<ContractRegistrationRequest> {
    if (
      !isString(id) ||
      !isString(name) ||
      contractBytes.constructor.name !== 'Uint8Array' ||
      !(contractProperties instanceof Object)
    ) {
      throw new Error('Invalid argument');
    }

    const contractPropertiesJson = JSON.stringify(contractProperties);
    return new ContractRegistrationRequestBuilder(
      new this.protobuf.ContractRegistrationRequest(),
      this.createSigner()
    )
      .withContractId(id)
      .withContractBinaryName(name)
      .withContractByteCode(contractBytes)
      .withContractProperties(contractPropertiesJson)
      .withCertHolderId(this.config.getCertHolderId())
      .withCertVersion(this.config.getCertVersion())
      .build();
  }

  private createSigner(): SignatureSigner {
    const config = this.config;

    if (!config.getPrivateKeyCryptoKey() && config.getPrivateKeyPem() === '') {
      throw new Error(
        'Eitehr private key crypto key or private key pem must be set'
      );
    }

    const key = config.getPrivateKeyCryptoKey() || config.getPrivateKeyPem();

    this.signer = this.signer || this.signerFactory.create(key);

    return this.signer;
  }
}
