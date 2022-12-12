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

  // Act
  await builder
    .withContractExecutionRequest(contractExecutionRequest)
    .withProofs(['proof'])
    .build();

  // Assert
  expect(request.setRequest).toHaveBeenCalledWith(contractExecutionRequest);
  expect(request.setProofsList).toHaveBeenCalledWith(['proof']);
});
