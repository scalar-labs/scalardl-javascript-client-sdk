import {SignatureSigner} from '../signature_signer';
import {TextEncoder} from '../polyfill';
import {ContractRegistrationRequest} from '../scalar_protobuf';

export class ContractRegistrationRequestBuilder {
  request: ContractRegistrationRequest;
  signer: SignatureSigner;
  contractId: string = '';
  contractBinaryName: string = '';
  contractByteCode: Uint8Array = new Uint8Array();
  contractProperties: string = '';
  certHolderId: string = '';
  certVersion: number = 0;

  /**
   * @param {ContractRegistrationRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request: ContractRegistrationRequest, signer: SignatureSigner) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * @param {string} id
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractId(id: string): ContractRegistrationRequestBuilder {
    this.contractId = id;
    return this;
  }

  /**
   * @param {string} name
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractBinaryName(name: string): ContractRegistrationRequestBuilder {
    this.contractBinaryName = name;
    return this;
  }

  /**
   * @param {Uint8Array} byteCode
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractByteCode(
    byteCode: Uint8Array
  ): ContractRegistrationRequestBuilder {
    this.contractByteCode = byteCode;
    return this;
  }

  /**
   * @param {string} properties
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractProperties(
    properties: string
  ): ContractRegistrationRequestBuilder {
    this.contractProperties = properties;
    return this;
  }

  /**
   * @param {string} id
   * @return {ContractRegistrationRequestBuilder}
   */
  withCertHolderId(id: string): ContractRegistrationRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  /**
   * @param {number} version
   * @return {ContractRegistrationRequestBuilder}
   */
  withCertVersion(version: number): ContractRegistrationRequestBuilder {
    this.certVersion = version;
    return this;
  }

  /**
   * @return {Promise<ContractRegistrationRequest>}
   */
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
