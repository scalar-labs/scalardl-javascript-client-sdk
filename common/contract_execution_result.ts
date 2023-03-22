import {AssetProof} from './asset_proof';
import {ContractExecutionResponse} from './scalar.proto';

export class ContractExecutionResult {
  constructor(
    private contractResult: string,
    private functionResult: string,
    private ledgerProofs: AssetProof[],
    private auditorProofs: AssetProof[]
  ) {}

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

  getResult(): Object {
    return this.contractResult !== '' ? JSON.parse(this.contractResult) : {};
  }

  getContractResult(): string {
    return this.contractResult;
  }

  getFunctionResult(): string {
    return this.functionResult;
  }

  getProofs(): AssetProof[] {
    return this.ledgerProofs;
  }

  getLedgerProofs(): AssetProof[] {
    return this.ledgerProofs;
  }

  getAuditorProofs(): AssetProof[] {
    return this.auditorProofs;
  }
}

module.exports = {
  ContractExecutionResult,
};
