import {FunctionRegistrationRequest} from '../scalar.proto';

export class FunctionRegistrationRequestBuilder {
  private functionId: string = '';
  private functionBinaryName: string = '';
  private functionByteCode: Uint8Array = new Uint8Array();

  constructor(private request: FunctionRegistrationRequest) {}

  withFunctionId(id: string): FunctionRegistrationRequestBuilder {
    this.functionId = id;
    return this;
  }

  withFunctionBinaryName(name: string): FunctionRegistrationRequestBuilder {
    this.functionBinaryName = name;
    return this;
  }

  withFunctionByteCode(
    byteCode: Uint8Array
  ): FunctionRegistrationRequestBuilder {
    this.functionByteCode = byteCode;
    return this;
  }

  async build(): Promise<FunctionRegistrationRequest> {
    const request = this.request;
    request.setFunctionId(this.functionId);
    request.setFunctionBinaryName(this.functionBinaryName);
    request.setFunctionByteCode(this.functionByteCode);

    return request;
  }
}
