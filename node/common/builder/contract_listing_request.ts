import {TextEncoder} from '../polyfill/text_encoder';
import {SignatureSigner} from '../signature';
import {ContractsListingRequest} from '../scalar.proto';

export class ContractsListingRequestBuilder {
  request: ContractsListingRequest;
  signer: SignatureSigner;
  certHolderId: string = '';
  certVersion: number = 0;
  contractId: string = '';

  constructor(request: ContractsListingRequest, signer: SignatureSigner) {
    this.request = request;
    this.signer = signer;
  }

  withCertHolderId(id: string): ContractsListingRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  withCertVersion(version: number): ContractsListingRequestBuilder {
    this.certVersion = version;
    return this;
  }

  withContractId(id: string): ContractsListingRequestBuilder {
    this.contractId = id;
    return this;
  }

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
