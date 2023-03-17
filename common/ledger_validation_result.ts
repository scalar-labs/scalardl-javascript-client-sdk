import {AssetProof} from './asset_proof';
import {StatusCode} from './status_code';
import {LedgerValidationResponse} from './scalar.proto';

export class LedgerValidationResult {
  constructor(
    private code: StatusCode,
    private proof: AssetProof | null,
    private auditorProof: AssetProof | null
  ) {}

  static fromGrpcLedgerValidationResponse(
    response: LedgerValidationResponse
  ): LedgerValidationResult {
    return new LedgerValidationResult(
      response.getStatusCode(),
      response.getProof()
        ? AssetProof.fromGrpcAssetProof(response.getProof())
        : null,
      null
    );
  }

  getProof(): AssetProof | null {
    return this.proof;
  }

  getAuditorProof(): AssetProof | null {
    return this.auditorProof;
  }

  getCode(): StatusCode {
    return this.code;
  }
}
