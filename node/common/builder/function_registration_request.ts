export type FunctionRegistrationRequest = {
  setFunctionId: (id: string) => void;
  setFunctionBinaryName: (name: string) => void;
  setFunctionByteCode: (byteCode: Uint8Array) => void;
};

export class FunctionRegistrationRequestBuilder {
  request: FunctionRegistrationRequest;
  functionId: string = '';
  functionBinaryName: string = '';
  functionByteCode: Uint8Array = new Uint8Array();

  /**
   * @param {FunctionRegistrationRequest} request
   */
  constructor(request: FunctionRegistrationRequest) {
    this.request = request;
  }

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
