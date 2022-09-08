import {TextEncoder} from '../polyfill';
import {SignatureSigner} from '../signature_signer';

export type ContractsListingRequest = {
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setContractId: (id: string) => void;
  setSignature: (signature: Uint8Array) => void;
};

export class ContractsListingRequestBuilder {
  request: ContractsListingRequest;
  signer: SignatureSigner;
  certHolderId: string = '';
  certVersion: number = 0;
  contractId: string = '';

  /**
   * @param {ContractsListingRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request: ContractsListingRequest, signer: SignatureSigner) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * @param {string} id
   * @return {ContractsListingRequestBuilder}
   */
  withCertHolderId(id: string): ContractsListingRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  /**
   * @param {number} version
   * @return {ContractsListingRequestBuilder}
   */
  withCertVersion(version: number): ContractsListingRequestBuilder {
    this.certVersion = version;
    return this;
  }

  /**
   * @param {string} id
   * @return {ContractsListingRequestBuilder}
   */
  withContractId(id: string): ContractsListingRequestBuilder {
    this.contractId = id;
    return this;
  }

  /**
   * @return {Promise<ContractsListingRequest>}
   */
  async build(): Promise<ContractsListingRequest> {
    const request = this.request;
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setContractId(this.contractId);

    const certHolderId = new TextEncoder().encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);
    const contractIdEncoded = new TextEncoder().encode(this.contractId);

    const buffer = new Uint8Array(
      contractIdEncoded.byteLength +
        certHolderId.byteLength +
        certVersion.byteLength
    );
    let offset = 0;

    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}
