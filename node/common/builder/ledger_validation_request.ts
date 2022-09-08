import {TextEncoder} from '../polyfill';
import {SignatureSigner} from '../signature_signer';

export type LedgerValidationRequest = {
  setAssetId: (id: string) => void;
  setStartAge: (startAge: number) => void;
  setEndAge: (endAge: number) => void;
  setCertHolderId: (certHolderId: string) => void;
  setCertVersion: (certVersion: number) => void;
  setSignature: (signature: Uint8Array) => void;
};

export class LedgerValidationRequestBuilder {
  request: LedgerValidationRequest;
  signer: SignatureSigner;
  assetId: string = '';
  startAge: number = 0;
  endAge: number = 0;
  certHolderId: string = '';
  certVersion: number = 0;

  /**
   * @param {LedgerValidationRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request: LedgerValidationRequest, signer: SignatureSigner) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * @param {string} id
   * @return {LedgerValidationRequestBuilder}
   */
  withAssetId(id: string): LedgerValidationRequestBuilder {
    this.assetId = id;
    return this;
  }

  /**
   * @param {number} startAge
   * @return {LedgerValidationRequestBuilder}
   */
  withStartAge(startAge: number): LedgerValidationRequestBuilder {
    this.startAge = startAge;
    return this;
  }

  /**
   * @param {number} endAge
   * @return {LedgerValidationRequestBuilder}
   */
  withEndAge(endAge: number): LedgerValidationRequestBuilder {
    this.endAge = endAge;
    return this;
  }

  /**
   * @param {string} id
   * @return {LedgerValidationRequestBuilder}
   */
  withCertHolderId(id: string): LedgerValidationRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  /**
   * @param {number} version
   * @return {LedgerValidationRequestBuilder}
   */
  withCertVersion(version: number): LedgerValidationRequestBuilder {
    this.certVersion = version;
    return this;
  }

  /**
   * @return {Promise<LedgerValidationRequest>}
   */
  async build(): Promise<LedgerValidationRequest> {
    const request = this.request;
    request.setAssetId(this.assetId);
    request.setStartAge(this.startAge);
    request.setEndAge(this.endAge);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const assetId_ = new TextEncoder().encode(this.assetId);
    const viewStartAge = new DataView(new ArrayBuffer(4));
    const viewEndAge = new DataView(new ArrayBuffer(4));
    const viewCertVersion = new DataView(new ArrayBuffer(4));
    viewStartAge.setUint32(0, this.startAge);
    const startAge = new Uint8Array(viewStartAge.buffer);
    viewEndAge.setUint32(0, this.endAge);
    const endAge = new Uint8Array(viewEndAge.buffer);
    const certHolderId = new TextEncoder().encode(this.certHolderId);
    viewCertVersion.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(viewCertVersion.buffer);

    const buffer = new Uint8Array(
      assetId_.byteLength +
        startAge.byteLength +
        endAge.byteLength +
        certHolderId.byteLength +
        certVersion.byteLength
    );
    let offset = 0;
    buffer.set(assetId_, offset);
    offset += assetId_.byteLength;
    buffer.set(startAge, offset);
    offset += startAge.byteLength;
    buffer.set(endAge, offset);
    offset += endAge.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}
