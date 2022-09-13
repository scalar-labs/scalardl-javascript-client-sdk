import {
  ContractExecutionRequest,
  ExecutionValidationRequest,
  AssetProof,
} from '../scalar_protobuf';

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

  /**
   * @param {ExecutionValidationRequest} request
   */
  constructor(request: ExecutionValidationRequest) {
    this.request = request;
  }

  /**
   * @param {ContractExecutionRequest} request
   * @return {ExecutionValidationRequestBuilder}
   */
  withContractExecutionRequest(
    request: ContractExecutionRequest
  ): ExecutionValidationRequestBuilder {
    this.contractExecutionRequest = request;
    return this;
  }

  /**
   * @param {Array<AssetProof>} proofs
   * @return {ExecutionValidationRequestBuilder}
   */
  withProofs(proofs: AssetProof[]): ExecutionValidationRequestBuilder {
    this.proofs = proofs;
    return this;
  }

  /**
   * @throws {Error}
   * @return {Promise<ExecutionValidationRequest>}
   */
  async build(): Promise<ExecutionValidationRequest> {
    const request = this.request;
    request.setRequest(this.contractExecutionRequest);
    request.setProofsList(this.proofs);
    return request;
  }
}
