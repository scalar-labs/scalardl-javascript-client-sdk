import {ContractRegistrationRequest} from '../scalar.proto';
import {SignatureSigner} from '../signature';
import {TextEncoder} from '../polyfill/text_encoder';

export class ContractRegistrationRequestBuilder {
  private contractId: string = '';
  private contractBinaryName: string = '';
  private contractByteCode: Uint8Array = new Uint8Array();
  private contractProperties: string = '';
  private certHolderId: string = '';
  private certVersion: number = 0;

  constructor(
    private request: ContractRegistrationRequest,
    private signer: SignatureSigner
  ) {}

  withContractId(id: string): ContractRegistrationRequestBuilder {
    this.contractId = id;
    return this;
  }

  withContractBinaryName(name: string): ContractRegistrationRequestBuilder {
    this.contractBinaryName = name;
    return this;
  }

  withContractByteCode(
    byteCode: Uint8Array
  ): ContractRegistrationRequestBuilder {
    this.contractByteCode = byteCode;
    return this;
  }

  withContractProperties(
    properties: string
  ): ContractRegistrationRequestBuilder {
    this.contractProperties = properties;
    return this;
  }

  withCertHolderId(id: string): ContractRegistrationRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  withCertVersion(version: number): ContractRegistrationRequestBuilder {
    this.certVersion = version;
    return this;
  }

  async build(): Promise<ContractRegistrationRequest> {
    const request = this.request;
    request.setContractId(this.contractId);
    request.setContractBinaryName(this.contractBinaryName);
    request.setContractByteCode(this.contractByteCode);
    request.setContractProperties(this.contractProperties);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const contractId = new TextEncoder().encode(this.contractId);
    const contractBinaryName = new TextEncoder().encode(
      this.contractBinaryName
    );
    const contractBytes = this.contractByteCode;
    const contractProperties = new TextEncoder().encode(
      this.contractProperties
    );
    const certHolderId = new TextEncoder().encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);

    const buffer = new Uint8Array(
      contractId.byteLength +
        contractBinaryName.byteLength +
        contractBytes.byteLength +
        contractProperties.byteLength +
        certHolderId.byteLength +
        certVersion.byteLength
    );

    let offset = 0;
    buffer.set(contractId, offset);
    offset += contractId.byteLength;
    buffer.set(contractBinaryName, offset);
    offset += contractBinaryName.byteLength;
    buffer.set(contractBytes, offset);
    offset += contractBytes.byteLength;
    buffer.set(contractProperties, offset);
    offset += contractProperties.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}
