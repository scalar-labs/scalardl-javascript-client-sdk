import {AssetProof} from './asset_proof';
import {StatusCode} from './status_code';
import {LedgerValidationResponse} from './scalar_protobuf';

export class LedgerValidationResult {
  code: StatusCode;
  proof: AssetProof | null;
  auditorProof: AssetProof | null;

  /**
   * @param {StatusCode} code
   * @param {AssetProof|null} proof
   * @param {AssetProof|null} auditorProof
   */
  constructor(
    code: StatusCode,
    proof: AssetProof | null,
    auditorProof: AssetProof | null
  ) {
    this.code = code;
    this.proof = proof;
    this.auditorProof = auditorProof;
  }

  /**
   * @param {LedgerValidationResponse} response
   * @return {LedgerValidationResult}
   */
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

  /**
   * @return {AssetProof|null}
   */
  getProof(): AssetProof | null {
    return this.proof;
  }

  /**
   * @return {AssetProof|null}
   */
  getAuditorProof(): AssetProof | null {
    return this.auditorProof;
  }

  /**
   * @return {StatusCode}
   */
  getCode(): StatusCode {
    return this.code;
  }
}
