import {ContractRegistrationRequestBuilder} from '../../../common/builder';

test('ContractRegisftrationRequestBuilder can build ContractRegistrationRequest', async () => {
  // Arrange
  const signer = {
    sign: jest.fn(async () => new Uint8Array([7, 8, 9])),
  };
  const request = {
    setContractId: jest.fn(),
    setContractBinaryName: jest.fn(),
    setContractByteCode: jest.fn(),
    setContractProperties: jest.fn(),
    setCertHolderId: jest.fn(),
    setCertVersion: jest.fn(),
    setSignature: jest.fn(),
    serializeBinary: jest.fn(),
  };
  const builder = new ContractRegistrationRequestBuilder(request, signer);

  // Act
  await builder
    .withContractId('contractId')
    .withContractBinaryName('contractBinaryName')
    .withContractByteCode(new Uint8Array([1, 2, 3]))
    .withContractProperties('contractProperties')
    .withCertHolderId('certHolderId')
    .withCertVersion(1)
    .build();

  // Assert
  expect(signer.sign).toHaveBeenCalledWith(
    new Uint8Array([
      99, 111, 110, 116, 114, 97, 99, 116, 73, 100, 99, 111, 110, 116, 114, 97,
      99, 116, 66, 105, 110, 97, 114, 121, 78, 97, 109, 101, 1, 2, 3, 99, 111,
      110, 116, 114, 97, 99, 116, 80, 114, 111, 112, 101, 114, 116, 105, 101,
      115, 99, 101, 114, 116, 72, 111, 108, 100, 101, 114, 73, 100, 0, 0, 0, 1,
    ])
  );
  expect(request.setContractId).toHaveBeenCalledWith('contractId');
  expect(request.setContractBinaryName).toHaveBeenCalledWith(
    'contractBinaryName'
  );
  expect(request.setContractByteCode).toHaveBeenCalledWith(
    new Uint8Array([1, 2, 3])
  );
  expect(request.setContractProperties).toHaveBeenCalledWith(
    'contractProperties'
  );
  expect(request.setCertHolderId).toHaveBeenCalledWith('certHolderId');
  expect(request.setCertVersion).toHaveBeenCalledWith(1);
  expect(request.setSignature).toHaveBeenCalledWith(new Uint8Array([7, 8, 9]));
});
