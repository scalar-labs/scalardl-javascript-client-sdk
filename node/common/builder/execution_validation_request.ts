import {
  AssetProof,
  ContractExecutionRequest,
  ExecutionValidationRequest,
} from '../scalar.proto';

export class ExecutionValidationRequestBuilder {
  request: ExecutionValidationRequest;
  contractExecutionRequest: ContractExecutionRequest = {
    setContractId: () => {},
    setContractArgument: () => {},
    setCertHolderId: () => {},
    setCertVersion: () => {},
    setFunctionArgument: () => {},
    setUseFunctionIds: () => {},
    setFunctionIdsList: () => {},
    setNonce: () => {},
    setSignature: () => {},
    setAuditorSignature: () => {},
    serializeBinary: () => new Uint8Array(),
  };
  proofs: AssetProof[] = [];

  constructor(request: ExecutionValidationRequest) {
    this.request = request;
  }

  withContractExecutionRequest(
    request: ContractExecutionRequest
  ): ExecutionValidationRequestBuilder {
    this.contractExecutionRequest = request;
    return this;
  }

  withProofs(proofs: AssetProof[]): ExecutionValidationRequestBuilder {
    this.proofs = proofs;
    return this;
  }

  async build(): Promise<ExecutionValidationRequest> {
    const request = this.request;
    request.setRequest(this.contractExecutionRequest);
    request.setProofsList(this.proofs);
    return request;
  }
}
