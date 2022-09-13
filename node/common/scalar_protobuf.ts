import {StatusCode} from './status_code';

export type CertificateRegistrationRequest = {
  setCertHolderId: (certHolderId: string) => void;
  setCertVersion: (certVersion: number) => void;
  setCertPem: (certPem: string) => void;
  serializeBinary: () => Uint8Array;
};

export type ContractExecutionRequest = {
  setContractId: (id: string) => void;
  setContractArgument: (argument: string) => void;
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setFunctionArgument: (argument: string) => void;
  setUseFunctionIds: (used: boolean) => void;
  setFunctionIdsList: (list: string[]) => void;
  setNonce: (nonce: string) => void;
  setSignature: (signature: Uint8Array) => void;
  setAuditorSignature: (signature: Uint8Array) => void;
  serializeBinary: () => Uint8Array;
};

export type ContractsListingRequest = {
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setContractId: (id: string) => void;
  setSignature: (signature: Uint8Array) => void;
  serializeBinary: () => Uint8Array;
};

export type ContractsListingResponse = {
  toObject(): {json: string};
};

export type ContractRegistrationRequest = {
  setContractId: (id: string) => void;
  setContractBinaryName: (name: string) => void;
  setContractByteCode: (byteCode: Uint8Array) => void;
  setContractProperties: (properties: string) => void;
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setSignature: (signature: Uint8Array) => void;
  serializeBinary: () => Uint8Array;
};

export type ExecutionValidationRequest = {
  setRequest: (request: ContractExecutionRequest) => void;
  setProofsList: (proofs: AssetProof[]) => void;
};

export type FunctionRegistrationRequest = {
  setFunctionId: (id: string) => void;
  setFunctionBinaryName: (name: string) => void;
  setFunctionByteCode: (byteCode: Uint8Array) => void;
  serializeBinary: () => Uint8Array;
};

export type LedgerValidationRequest = {
  setAssetId: (id: string) => void;
  setStartAge: (startAge: number) => void;
  setEndAge: (endAge: number) => void;
  setCertHolderId: (certHolderId: string) => void;
  setCertVersion: (certVersion: number) => void;
  setSignature: (signature: Uint8Array) => void;
  serializeBinary: () => Uint8Array;
};

export type AssetProof = {
  setAssetId: (id: string) => void;
  setAge: (age: number) => void;
  setNonce: (nonce: string) => void;
  setInput: (input: string) => void;
  setHash: (hash: Uint8Array) => void;
  setPrevHash: (prevHash: Uint8Array) => void;
  setSignature: (signature: Uint8Array) => void;
  getAssetId: () => string;
  getAge: () => number;
  getNonce: () => string;
  getInput: () => string;
  getHash_asU8: () => Uint8Array;
  getPrevHash_asU8: () => Uint8Array;
  getSignature_asU8: () => Uint8Array;
};

export type LedgerValidationResponse = {
  getStatusCode: () => StatusCode;
  getProof: () => AssetProof;
};

export type ContractExecutionResponse = {
  getContractResult: () => string;
  getFunctionResult: () => string;
  getProofsList: () => AssetProof[];
};

export type ExecutionOrderingResponse = {
  getSignature: () => Uint8Array;
};

export type Metadata = {
  [key: string]: Object;
} & {
  get(key: string): Object;
};

export type Callback = (err: Error | null, response: unknown) => void;

export interface LedgerClient {
  registerContract(
    request: ContractRegistrationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  listContracts(
    request: ContractsListingRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  validateLedger(
    request: LedgerValidationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  executeContract(
    request: ContractExecutionRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
}

export interface LedgerPrivileged {
  registerCert(
    request: CertificateRegistrationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  registerFunction(
    request: FunctionRegistrationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
}

export interface AuditorClient {
  registerContract(
    request: ContractRegistrationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  validateLedger(
    request: LedgerValidationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  orderExecution(
    request: ContractExecutionRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
  validateExecution(
    request: ExecutionValidationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
}

export interface AuditorPrivileged {
  registerCert(
    request: CertificateRegistrationRequest,
    metadata: Metadata,
    callback: Callback
  ): void;
}

export interface ScalarMessage {
  CertificateRegistrationRequest: new () => CertificateRegistrationRequest;
  ContractRegistrationRequest: new () => ContractRegistrationRequest;
  FunctionRegistrationRequest: new () => FunctionRegistrationRequest;
  ContractsListingRequest: new () => ContractsListingRequest;
  LedgerValidationRequest: new () => LedgerValidationRequest;
  ExecutionValidationRequest: new () => ExecutionValidationRequest;
  ContractExecutionRequest: new () => ContractExecutionRequest;
  Status: {deserializeBinary(bytes: Uint8Array): Status};
}

export interface ScalarService {
  ledgerClient: LedgerClient;
  ledgerPrivileged: LedgerPrivileged;
  auditorClient: AuditorClient;
  auditorPrivileged: AuditorPrivileged;
}

export type Status = {
  code: number;
  message: string;
  toObject(): {code: number; message: string};
};
