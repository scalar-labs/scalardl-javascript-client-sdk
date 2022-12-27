import {TextEncoder} from '../polyfill/text_encoder';
import {SignatureSigner} from '../signature';

export type ContractExecutionRequest = {
  setContractId: (id: string) => void;
  setContractArgument: (argument: string) => void;
  setCertHolderId: (id: string) => void;
  setCertVersion: (version: number) => void;
  setFunctionArgument: (argument: string) => void;
  setUseFunctionIds: (used: boolean) => void;
  setFunctionIdsList: (list: string[]) => void;
  setNonce: (nonce: string) => void;
  setSignature: (signature: Uint8Array) => void;
};

export class ContractExecutionRequestBuilder {
  request: ContractExecutionRequest;
  signer: SignatureSigner;
  contractId: string = '';
  contractArgument: string = '';
  certHolderId: string = '';
  certVersion: number = 0;
  functionArgument: string = '';
  useFunctionIds: boolean = false;
  functionIds: string[] = [];
  nonce: string = '';

  constructor(request: ContractExecutionRequest, signer: SignatureSigner) {
    this.request = request;
    this.signer = signer;
  }

  withContractId(id: string): ContractExecutionRequestBuilder {
    this.contractId = id;
    return this;
  }

  withContractArgument(argument: string): ContractExecutionRequestBuilder {
    this.contractArgument = argument;
    return this;
  }

  withCertHolderId(id: string): ContractExecutionRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  withCertVersion(version: number): ContractExecutionRequestBuilder {
    this.certVersion = version;
    return this;
  }

  withFunctionArgument(argument: string): ContractExecutionRequestBuilder {
    this.functionArgument = argument;
    return this;
  }

  withUseFunctionIds(useFunctionIds: boolean): ContractExecutionRequestBuilder {
    this.useFunctionIds = useFunctionIds;
    return this;
  }

  withFunctionIds(functionIds: string[]): ContractExecutionRequestBuilder {
    this.functionIds = functionIds;
    return this;
  }

  withNonce(nonce: string): ContractExecutionRequestBuilder {
    this.nonce = nonce;
    return this;
  }

  /**
   * @throws {Error}
   */
  async build(): Promise<ContractExecutionRequest> {
    const request = this.request;
    request.setContractId(this.contractId);
    request.setContractArgument(this.contractArgument);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setFunctionArgument(this.functionArgument);
    request.setUseFunctionIds(this.useFunctionIds);
    request.setFunctionIdsList(this.functionIds);
    request.setNonce(this.nonce);

    const contractIdEncoded = new TextEncoder().encode(this.contractId);
    const contractArgument = new TextEncoder().encode(this.contractArgument);
    const certHolderId = new TextEncoder().encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);

    const buffer = new Uint8Array(
      contractIdEncoded.byteLength +
        contractArgument.byteLength +
        certHolderId.byteLength +
        certVersion.byteLength
    );
    let offset = 0;
    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;
    buffer.set(contractArgument, offset);
    offset += contractArgument.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}
