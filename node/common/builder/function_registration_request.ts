import {FunctionRegistrationRequest} from '../scalar.proto';

export class FunctionRegistrationRequestBuilder {
  private functionId: string = '';
  private functionBinaryName: string = '';
  private functionByteCode: Uint8Array = new Uint8Array();

  /**
   * @param {FunctionRegistrationRequest} request
   */
  constructor(private request: FunctionRegistrationRequest) {}

  /**
   * Sets the ID of the function
   * @param {string} id
   * @return {FunctionRegistrationRequestBuilder}
   */
  withFunctionId(id: string): FunctionRegistrationRequestBuilder {
    this.functionId = id;
    return this;
  }

  /**
   * @param {string} name
   * @return {FunctionRegistrationRequestBuilder}
   */
  withFunctionBinaryName(name: string): FunctionRegistrationRequestBuilder {
    this.functionBinaryName = name;
    return this;
  }

  /**
   * @param {Uint8Array} byteCode
   * @return {FunctionRegistrationRequestBuilder}
   */
  withFunctionByteCode(
    byteCode: Uint8Array
  ): FunctionRegistrationRequestBuilder {
    this.functionByteCode = byteCode;
    return this;
  }

  /**
   * @return {Promise<FunctionRegistrationRequest>}
   */
  async build(): Promise<FunctionRegistrationRequest> {
    const request = this.request;
    request.setFunctionId(this.functionId);
    request.setFunctionBinaryName(this.functionBinaryName);
    request.setFunctionByteCode(this.functionByteCode);

    return request;
  }
}
