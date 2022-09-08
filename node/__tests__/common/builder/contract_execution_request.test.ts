import {ContractExecutionRequestBuilder} from '../../../common/builder/';

test('ContractExecutionRequestBuilder can build ContractExecutionRequest', async () => {
  // Arrange
  const request = {
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
  const signer = {
    sign: jest.fn(async () => new Uint8Array([1, 2, 3])),
  };
  const builder = new ContractExecutionRequestBuilder(request, signer);

  // Act
  await builder
    .withCertHolderId('certHolderId')
    .withCertVersion(1)
    .withContractId('contractId')
    .withContractArgument('contractArgument')
    .withUseFunctionIds(true)
    .withFunctionIds(['functionId'])
    .withFunctionArgument('functionArgument')
    .withNonce('nonce')
    .build();

  // Assert
  expect(signer.sign).toHaveBeenCalledWith(
    new Uint8Array([
      99, 111, 110, 116, 114, 97, 99, 116, 73, 100, 99, 111, 110, 116, 114, 97,
      99, 116, 65, 114, 103, 117, 109, 101, 110, 116, 99, 101, 114, 116, 72,
      111, 108, 100, 101, 114, 73, 100, 0, 0, 0, 1,
    ])
  );
  expect(request.setCertHolderId).toHaveBeenCalledWith('certHolderId');
  expect(request.setCertVersion).toHaveBeenCalledWith(1);
  expect(request.setContractId).toHaveBeenCalledWith('contractId');
  expect(request.setContractArgument).toHaveBeenCalledWith('contractArgument');
  expect(request.setUseFunctionIds).toHaveBeenCalledWith(true);
  expect(request.setFunctionIdsList).toHaveBeenCalledWith(['functionId']);
  expect(request.setFunctionArgument).toHaveBeenCalledWith('functionArgument');
  expect(request.setNonce).toHaveBeenCalledWith('nonce');
  expect(request.setSignature).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
});
