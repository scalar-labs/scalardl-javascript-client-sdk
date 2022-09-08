import {ExecutionValidationRequestBuilder} from '../../../common/builder';

test('ExecutionValidationRequestBuilder can build ExecutionValidationRequest', async () => {
  // Arrange
  const request = {
    setRequest: jest.fn(),
    setProofsList: jest.fn(),
  };
  const contractExecutionRequest = {
    setContractId: jest.fn(),
    setContractArgument: jest.fn(),
    setCertHolderId: jest.fn(),
    setCertVersion: jest.fn(),
    setFunctionArgument: jest.fn(),
    setUseFunctionIds: jest.fn(),
    setFunctionIdsList: jest.fn(),
    setNonce: jest.fn(),
    setSignature: jest.fn(),
  };
  const builder = new ExecutionValidationRequestBuilder(request);
  const proof = {
    setAssetId: jest.fn(),
    setAge: jest.fn(),
    setNonce: jest.fn(),
    setInput: jest.fn(),
    setHash: jest.fn(),
    setPrevHash: jest.fn(),
    setSignature: jest.fn(),
    getAssetId: jest.fn(),
    getAge: jest.fn(),
    getNonce: jest.fn(),
    getInput: jest.fn(),
    getHash_asU8: jest.fn(),
    getPrevHash_asU8: jest.fn(),
    getSignature_asU8: jest.fn(),
  };

  // Act
  await builder
    .withContractExecutionRequest(contractExecutionRequest)
    .withProofs([proof])
    .build();

  // Assert
  expect(request.setRequest).toHaveBeenCalledWith(contractExecutionRequest);
  expect(request.setProofsList).toHaveBeenCalledWith([proof]);
});
