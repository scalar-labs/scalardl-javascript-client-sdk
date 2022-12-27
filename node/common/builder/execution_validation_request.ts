import {ContractExecutionRequest} from '.';

export type ExecutionValidationRequest = {
  setRequest: (request: ContractExecutionRequest) => void;
  setProofsList: (proofs: unknown[]) => void;
};

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
  };
  proofs: unknown[] = [];

  constructor(request: ExecutionValidationRequest) {
    this.request = request;
  }

  withContractExecutionRequest(
    request: ContractExecutionRequest
  ): ExecutionValidationRequestBuilder {
    this.contractExecutionRequest = request;
    return this;
  }

  withProofs(proofs: unknown[]): ExecutionValidationRequestBuilder {
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
