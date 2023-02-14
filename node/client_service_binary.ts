import {ContractExecutionResult, LedgerValidationResult} from './common';
import {ClientConfig, Properties} from './common/client_config';
import {
  resolveFileBasedProperties,
  createGrpcServices,
  createMetadata,
} from './client_service';

import {ClientServiceBase} from './common';
import {SignerFactory} from './signer';
const protobuf = require('./scalar_pb.js');

export class ClientServiceWithBinary {
  properties: Properties;
  clientServiceBase: ClientServiceBase;
  ledgerClient: any;
  ledgerPrivileged: any;
  auditorClient: any;
  auditorPrivileged: any;

  constructor(properties: Properties) {
    this.properties = resolveFileBasedProperties(properties);

    const metadata = createMetadata(properties);
    const signerFactory = new SignerFactory();
    const {ledgerClient, ledgerPrivileged, auditorClient, auditorPrivileged} =
      createGrpcServices(this.properties);

    this.clientServiceBase = new ClientServiceBase(
      {
        ledgerClient,
        ledgerPrivileged,
        auditorClient,
        auditorPrivileged,
        signerFactory: signerFactory,
      },
      protobuf as never,
      this.properties,
      metadata as never
    );

    this.ledgerClient = ledgerClient;
    this.ledgerPrivileged = ledgerPrivileged;
    this.auditorClient = auditorClient;
    this.auditorPrivileged = auditorPrivileged;
  }

  /**
   * @param {Uint8Array} serializedBinary
   *   a serialized byte array of CertificateRegistrationRequest
   * @return {Promise<void>}
   */
  async registerCertificate(serializedBinary: Uint8Array): Promise<void> {
    const request =
      this.ledgerPrivileged.registerCert.requestDeserialize(serializedBinary);

    return this.clientServiceBase.registerCertificateWithRequest(request);
  }

  /**
   * @param {Uint8Array} serializedBinary
   *   a serialized byte array of FunctionRegistrationRequest
   * @return {Promise<void>}
   */
  async registerFunction(serializedBinary: Uint8Array): Promise<void> {
    const request =
      this.ledgerPrivileged.registerFunction.requestDeserialize(
        serializedBinary
      );

    return this.clientServiceBase.registerFunctionWithRequest(request);
  }

  /**
   * @param {Uint8Array} serializedBinary
   *   a serialized byte array of ContractRegistrationRequest
   * @return {Promise<void>}
   */
  async registerContract(serializedBinary: Uint8Array): Promise<void> {
    const request =
      this.ledgerClient.registerContract.requestDeserialize(serializedBinary);

    return this.clientServiceBase.registerContractWithRequest(request);
  }

  /**
   * @param {Uint8Array} serializedBinary
   *   a serialized byte array of ContractsListingRequest
   * @return {Promise<Object>}
   */
  async listContracts(serializedBinary: Uint8Array): Promise<Object> {
    const request =
      this.ledgerClient.listContracts.requestDeserialize(serializedBinary);

    return this.clientServiceBase.listContractsWithRequest(request);
  }

  /**
   * @param {Uint8Array} serializedBinary
   *   a serialized byte array of LedgerValidationRequest
   * @return {Promise<LedgerValidationResult>}
   */
  async validateLedger(
    serializedBinary: Uint8Array
  ): Promise<LedgerValidationResult> {
    const properties = new ClientConfig(this.properties);
    if (properties.getAuditorEnabled()) {
      throw new Error(
        'validateLedger with Auditor ' +
          'is not supported in the intermediary mode. ' +
          'Please execute ValidateLedger contract ' +
          'simply for validating assets.'
      );
    }

    const request =
      this.ledgerClient.validateLedger.requestDeserialize(serializedBinary);

    return this.clientServiceBase.validateLedgerWithRequest(request);
  }

  /**
   * @param {Uint8Array} serializedBinary
   *   a serialized byte array of ContractExecutionRequest
   * @return {Promise<ContractExecutionResult>}
   */
  async executeContract(
    serializedBinary: Uint8Array
  ): Promise<ContractExecutionResult> {
    const request =
      this.ledgerClient.executeContract.requestDeserialize(serializedBinary);

    return this.clientServiceBase.executeContractWithRequest(request);
  }

  /**
   * Create the byte array of CertificateRegistrationRequest.
   * @return {Promise<Uint8Array>}
   * @throws {Error}
   */
  async createSerializedCertificateRegistrationRequest(): Promise<Uint8Array> {
    return this.clientServiceBase.createSerializedCertificateRegistrationRequest();
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
    return this.clientServiceBase.createSerializedFunctionRegistrationRequest(
      id,
      name,
      functionBytes
    );
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
    return this.clientServiceBase.createSerializedContractRegistrationRequest(
      id,
      name,
      contractBytes,
      properties
    );
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
    return this.clientServiceBase.createSerializedContractsListingRequest(
      contractId
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
    return this.clientServiceBase.createSerializedLedgerValidationRequest(
      assetId,
      startAge,
      endAge
    );
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
    return this.clientServiceBase.createSerializedExecutionRequest(
      contractId,
      contractArgument,
      functionId,
      functionArgument,
      nonce
    );
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
}
