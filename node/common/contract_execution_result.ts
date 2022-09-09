import {AssetProof} from './asset_proof';
import {ContractExecutionResponse} from './scalar_protobuf';

export class ContractExecutionResult {
  contractResult: string;
  functionResult: string;
  ledgerProofs: AssetProof[];
  auditorProofs: AssetProof[];

  /**
   * @param {string} contractResult
   * @param {string} functionResult
   * @param {AssetProof[]} ledgerProofs
   * @param {AssetProof[]} auditorProofs
   */
  constructor(
    contractResult: string,
    functionResult: string,
    ledgerProofs: AssetProof[],
    auditorProofs: AssetProof[]
  ) {
    this.contractResult = contractResult;
    this.functionResult = functionResult;
    this.ledgerProofs = ledgerProofs;
    this.auditorProofs = auditorProofs;
  }

  /**
   * @param {ContractExecutionResponse} response
   * @return {ContractExecutionResult}
   */
  static fromGrpcContractExecutionResponse(
    response: ContractExecutionResponse
  ): ContractExecutionResult {
    return new ContractExecutionResult(
      response.getContractResult(),
      response.getFunctionResult(),
      response
        .getProofsList()
        .map(proof => AssetProof.fromGrpcAssetProof(proof)),
      []
    );
  }

  /**
   * @deprecated
   * @return {Object}
   */
  getResult() {
    return this.contractResult !== '' ? JSON.parse(this.contractResult) : {};
  }

  /**
   * @return {string}
   */
  getContractResult(): string {
    return this.contractResult;
  }

  /**
   * @return {string}
   */
  getFunctionResult(): string {
    return this.functionResult;
  }

  /**
   * @deprecated
   * @return {AssetProof[]}
   */
  getProofs(): AssetProof[] {
    return this.ledgerProofs;
  }

  /**
   * @return {AssetProof[]}
   */
  getLedgerProofs(): AssetProof[] {
    return this.ledgerProofs;
  }

  /**
   * @return {AssetProof[]}
   */
  getAuditorProofs(): AssetProof[] {
    return this.auditorProofs;
  }
}

module.exports = {
  ContractExecutionResult,
};
