import {StatusCode} from './status_code';
import {ClientError} from './client_error';
import {ClientConfig, Properties} from './client_config';
import {
  ContractRegistrationRequestBuilder,
  ContractsListingRequestBuilder,
  LedgerValidationRequestBuilder,
  CertificateRegistrationRequestBuilder,
  FunctionRegistrationRequestBuilder,
  ContractExecutionRequestBuilder,
  ExecutionValidationRequestBuilder,
} from './builder';
import {ContractExecutionResult} from './contract_execution_result';
import {LedgerValidationResult} from './ledger_validation_result';
import {AssetProof} from './asset_proof';
import {v4 as uuidv4} from 'uuid';
import {format} from './contract_execution_argument';
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
  LedgerValidationRequest,
  LedgerValidationResponse,
  ContractExecutionRequest,
  ContractExecutionResponse,
  ExecutionOrderingResponse,
  ExecutionValidationRequest,
  ScalarService,
  ScalarMessage,
} from './scalar.proto';
import {SignatureSigner, SignatureSignerFactory} from './signature';
import {isInteger, isString} from './polyfill/is';

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
   * Get ledger asset maximum age which is equivalent to
   * Java's Integer.MAX_VALUE equal to 2147483647
   */
  static get maxAge(): number {
    return 0x7fffffff;
  }

  /**
   * Get ledger asset minimum age
   */
  static get minAge(): number {
    return 0;
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

  /**
   * Validate the integrity of an asset
   * @param {string} assetId
   * @param {number} [startAge=0] must be >= 0
   * @param {number} [endAge=0x7fffffff] must be <= 2147483647
   * @return {Promise<LedgerValidationResult>}
   * @throws {ClientError|Error}
   */
  async validateLedger(
    assetId: string,
    startAge: number = ClientServiceBase.minAge,
    endAge: number = ClientServiceBase.maxAge
  ): Promise<LedgerValidationResult> {
    if (this.isAuditorEnabled()) {
      return this.validateLedgerWithContractExecution(
        assetId,
        startAge,
        endAge,
        this.config.getAuditorLinearizableValidationContractId()
      );
    } else {
      const request = await this.createLedgerValidationRequest(
        assetId,
        startAge,
        endAge
      );

      const promise = new Promise<LedgerValidationResult>((resolve, reject) => {
        this.ledgerClient.validateLedger(
          request,
          this.metadata,
          (err, response) => {
            if (err) reject(err);
            else
              resolve(
                LedgerValidationResult.fromGrpcLedgerValidationResponse(
                  response as LedgerValidationResponse
                )
              );
          }
        );
      });

      return this.executePromise(promise) as Promise<LedgerValidationResult>;
    }
  }

  private async validateLedgerWithContractExecution(
    assetId: string,
    startAge: number,
    endAge: number,
    contractId: string
  ): Promise<LedgerValidationResult> {
    if (
      !isString(assetId) ||
      !isString(contractId) ||
      !isInteger(startAge) ||
      !isInteger(endAge)
    ) {
      throw new Error('Invalid argument');
    }

    if (
      !(
        endAge >= startAge &&
        startAge >= ClientServiceBase.minAge &&
        endAge <= ClientServiceBase.maxAge
      )
    ) {
      throw new Error('invalid ages are specified');
    }

    const argument = {
      asset_id: assetId,
      start_age: startAge,
      end_age: endAge,
    };

    const result = await this.execute(contractId, argument);

    const ledgerProofs = result.getLedgerProofs();
    const auditorProofs = result.getAuditorProofs();

    return new LedgerValidationResult(
      StatusCode.OK,
      ledgerProofs.length > 0 ? ledgerProofs[0] : null,
      auditorProofs.length > 0 ? ledgerProofs[0] : null
    );
  }

  /**
   * Create the byte array of LedgerValidationRequest
   * @param {string} assetId
   * @param {number} [startAge=0] must be >= 0
   * @param {number} [endAge=0x7fffffff] must be <= 2147483647
   * @return {Uint8Array}
   * @throws {Error}
   */
  async createSerializedLedgerValidationRequest(
    assetId: string,
    startAge: number = ClientServiceBase.minAge,
    endAge: number = ClientServiceBase.maxAge
  ): Promise<Uint8Array> {
    return (
      await this.createLedgerValidationRequest(assetId, startAge, endAge)
    ).serializeBinary();
  }

  /**
   * Execute a registered contract
   * @deprecated Use {@link execute} instead
   * @param {string} contractId
   * @param {Object} contractArgument
   * @param {Object|null} [functionArgument=null]
   * @return {Promise<ContractExecutionResult|void|*>}
   * @throws {ClientError|Error}
   */
  async executeContract(
    contractId: string,
    contractArgument: Object,
    functionArgument: Object | null = null
  ): Promise<ContractExecutionResult> {
    return this.execute(contractId, contractArgument, null, functionArgument);
  }

  /**
   * Execute a registered contract and function (optionally)
   * @param {string} contractId
   * @param {Object|string} contractArgument
   * @param {string|null} [functionId=null]
   * @param {Object|string|null} [functionArgument=null]
   * @param {string|null} [nonce=null]
   * @return {Promise<ContractExecutionResult>}
   * @throws {ClientError|Error}
   */
  async execute(
    contractId: string,
    contractArgument: Object | string,
    functionId: string | null = null,
    functionArgument: Object | string | null = null,
    nonce: string | null = null
  ): Promise<ContractExecutionResult> {
    const request = await this.createContractExecutionRequest(
      contractId,
      functionId,
      contractArgument,
      functionArgument,
      nonce
    );

    return this._executeContract(request);
  }

  private async _executeContract(
    request: ContractExecutionRequest
  ): Promise<ContractExecutionResult> {
    const ordered = await this.executeOrdering(request);
    const promise = new Promise<ContractExecutionResult>((resolve, reject) => {
      this.ledgerClient.executeContract(
        ordered,
        this.metadata,
        async (err, response) => {
          if (err) {
            return reject(err);
          }

          if (!this.isAuditorEnabled()) {
            return resolve(
              ContractExecutionResult.fromGrpcContractExecutionResponse(
                response as ContractExecutionResponse
              )
            );
          }

          try {
            const auditorResponse = await this.validateExecution(
              ordered,
              response as ContractExecutionResponse
            );

            const isConsistent = this.validateResponses(
              response as ContractExecutionResponse,
              auditorResponse
            );

            if (!isConsistent) {
              return reject(
                new ClientError(
                  StatusCode.INCONSISTENT_STATES,
                  "The results from Ledger and Auditor don't match"
                )
              );
            }

            return resolve(
              new ContractExecutionResult(
                (response as ContractExecutionResponse).getContractResult(),
                (response as ContractExecutionResponse).getFunctionResult(),
                (response as ContractExecutionResponse)
                  .getProofsList()
                  .map(p => AssetProof.fromGrpcAssetProof(p)),
                auditorResponse
                  .getProofsList()
                  .map(p => AssetProof.fromGrpcAssetProof(p))
              )
            );
          } catch (err) {
            return reject(err);
          }
        }
      );
    });

    return this.executePromise(promise) as Promise<ContractExecutionResult>;
  }

  /**
   * Create the byte array of ContractExecutionRequest
   * @param {string} contractId
   * @param {Object|string} contractArgument
   * @param {string|null} [functionId=null]
   * @param {Object|string|null} [functionArgument=null]
   * @param {string|null} [nonce=null]
   * @return {Promise<Uint8Array>}
   * @throws {Error}
   */
  async createSerializedExecutionRequest(
    contractId: string,
    contractArgument: Object | string,
    functionId: string | null = null,
    functionArgument: Object | string | null = null,
    nonce: string | null = null
  ): Promise<Uint8Array> {
    return (
      await this.createContractExecutionRequest(
        contractId,
        functionId,
        contractArgument,
        functionArgument,
        nonce
      )
    ).serializeBinary();
  }

  /**
   * Create the byte array of ContractExecutionRequest
   * @deprecated Use {@link createSerializedExecutionRequest} instead
   * @param {string} contractId
   * @param {Object} argument
   * @param {Object|null} [functionArgument=null]
   * @return {Promise<Uint8Array>}
   * @throws {Error}
   */
  async createSerializedContractExecutionRequest(
    contractId: string,
    argument: Object,
    functionArgument: Object | null = null
  ): Promise<Uint8Array> {
    return this.createSerializedExecutionRequest(
      contractId,
      argument,
      '',
      functionArgument
    );
  }

  private isAuditorEnabled(): boolean {
    return this.config.getAuditorEnabled();
  }

  private async executeOrdering(
    request: ContractExecutionRequest
  ): Promise<ContractExecutionRequest> {
    if (!this.isAuditorEnabled()) {
      return request;
    }

    const promise = new Promise<ContractExecutionRequest>((resolve, reject) => {
      this.auditorClient.orderExecution(
        request,
        this.metadata,
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            request.setAuditorSignature(
              (response as ExecutionOrderingResponse).getSignature()
            );
            resolve(request);
          }
        }
      );
    });

    return this.executePromise(promise) as Promise<ContractExecutionRequest>;
  }

  private async validateExecution(
    request: ContractExecutionRequest,
    ledgerResponse: ContractExecutionResponse
  ): Promise<ContractExecutionResponse> {
    const validationRequest = await this.createExecutionValidationRequest(
      request,
      ledgerResponse
    );

    const promise = new Promise<ContractExecutionResponse>(
      (resolve, reject) => {
        this.auditorClient.validateExecution(
          validationRequest,
          this.metadata,
          (err, auditorResponse) => {
            if (err) reject(err);
            else resolve(auditorResponse as ContractExecutionResponse);
          }
        );
      }
    );

    return this.executePromise(promise) as Promise<ContractExecutionResponse>;
  }

  private validateResponses(
    response1: ContractExecutionResponse,
    response2: ContractExecutionResponse
  ): boolean {
    const proofs1 = response1
      .getProofsList()
      .map(p => AssetProof.fromGrpcAssetProof(p));
    const proofs2 = response2
      .getProofsList()
      .map(p => AssetProof.fromGrpcAssetProof(p));

    if (
      response1.getContractResult() !== response2.getContractResult() ||
      proofs1.length !== proofs2.length
    ) {
      return false;
    }

    const map = new Map();
    proofs1.forEach(p => map.set(p.getId(), p));

    for (const p2 of proofs2) {
      const p1 = map.get(p2.getId());
      if (
        p1 === null ||
        typeof p1 === 'undefined' ||
        p1.getAge() !== p2.getAge() ||
        !p1.hashEquals(p2.getHash())
      ) {
        return false;
      }
    }

    return true;
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
      !(functionBytes instanceof Uint8Array)
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
      !(contractBytes instanceof Uint8Array) ||
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

  private async createLedgerValidationRequest(
    assetId: string,
    startAge: number,
    endAge: number
  ): Promise<LedgerValidationRequest> {
    if (!isString(assetId) || !isInteger(startAge) || !isInteger(endAge)) {
      throw new Error('Invalid argument');
    }

    if (
      !(
        endAge >= startAge &&
        startAge >= ClientServiceBase.minAge &&
        endAge <= ClientServiceBase.maxAge
      )
    ) {
      throw new Error('invalid ages are specified');
    }

    return new LedgerValidationRequestBuilder(
      new this.protobuf.LedgerValidationRequest(),
      this.createSigner()
    )
      .withAssetId(assetId)
      .withStartAge(startAge)
      .withEndAge(endAge)
      .withCertHolderId(this.config.getCertHolderId())
      .withCertVersion(this.config.getCertVersion())
      .build();
  }

  private async createContractExecutionRequest(
    contractId: string,
    functionId: string | null,
    contractArgument: Object | string,
    functionArgument: Object | string | null,
    nonce: string | null
  ): Promise<ContractExecutionRequest> {
    if (
      !isString(contractId) ||
      !(contractArgument instanceof Object || isString(contractArgument))
    ) {
      throw new Error('Invalid argument');
    }

    if (functionArgument === null) {
      functionArgument = typeof contractArgument === 'object' ? {} : '';
    }

    if (typeof contractArgument !== typeof functionArgument) {
      throw Error(
        'contract argument and function argument must be the same type'
      );
    }

    if (functionId === null) {
      functionId = '';
    }

    if (nonce === null) {
      nonce = uuidv4();
    }

    if (
      !isString(functionId) ||
      !isString(nonce) ||
      !(functionArgument instanceof Object || isString(functionArgument))
    ) {
      throw Error('Invalid argument');
    }

    const functionIds = functionId.length > 0 ? [functionId] : [];

    return new ContractExecutionRequestBuilder(
      new this.protobuf.ContractExecutionRequest(),
      this.createSigner()
    )
      .withContractId(contractId)
      .withContractArgument(format(nonce, functionIds, contractArgument))
      .withFunctionArgument(
        typeof functionArgument === 'object'
          ? JSON.stringify(functionArgument)
          : functionArgument
      )
      .withCertHolderId(this.config.getCertHolderId())
      .withCertVersion(this.config.getCertVersion())
      .withUseFunctionIds(functionIds.length > 0)
      .withFunctionIds(functionIds)
      .withNonce(nonce)
      .build();
  }

  private async createExecutionValidationRequest(
    request: ContractExecutionRequest,
    response: ContractExecutionResponse
  ): Promise<ExecutionValidationRequest> {
    return new ExecutionValidationRequestBuilder(
      new this.protobuf.ExecutionValidationRequest()
    )
      .withContractExecutionRequest(request)
      .withProofs(response.getProofsList())
      .build();
  }

  private createSigner(): SignatureSigner {
    const config = this.config;

    if (!config.getPrivateKeyCryptoKey() && config.getPrivateKeyPem() === '') {
      throw new Error(
        'Either private key crypto key or private key pem must be set'
      );
    }

    const key = config.getPrivateKeyCryptoKey() || config.getPrivateKeyPem();

    this.signer = this.signer || this.signerFactory.create(key);

    return this.signer;
  }
}
