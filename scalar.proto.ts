import {StatusCode} from './status_code';

export type CertificateRegistrationRequest = {
  setCertHolderId: (certHolderId: string) => void;
  setCertVersion: (certVersion: number) => void;
  setCertPem: (certPem: string) => void;
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
};

export type ContractsListingRequest = {
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setContractId: (id: string) => void;
  setSignature: (signature: Uint8Array) => void;
};

export type ContractRegistrationRequest = {
  setContractId: (id: string) => void;
  setContractBinaryName: (name: string) => void;
  setContractByteCode: (byteCode: Uint8Array) => void;
  setContractProperties: (properties: string) => void;
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setSignature: (signature: Uint8Array) => void;
};

export type ExecutionValidationRequest = {
  setRequest: (request: ContractExecutionRequest) => void;
  setProofsList: (proofs: AssetProof[]) => void;
};

export type FunctionRegistrationRequest = {
  setFunctionId: (id: string) => void;
  setFunctionBinaryName: (name: string) => void;
  setFunctionByteCode: (byteCode: Uint8Array) => void;
};

export type LedgerValidationRequest = {
  setAssetId: (id: string) => void;
  setStartAge: (startAge: number) => void;
  setEndAge: (endAge: number) => void;
  setCertHolderId: (certHolderId: string) => void;
  setCertVersion: (certVersion: number) => void;
  setSignature: (signature: Uint8Array) => void;
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

export type ContractExecutionResponse = {
  getContractResult: () => string;
  getFunctionResult: () => string;
  getProofsList: () => AssetProof[];
};

export type LedgerValidationResponse = {
  getStatusCode: () => StatusCode;
  getProof: () => AssetProof;
};
