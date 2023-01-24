import {ContractsListingRequestBuilder} from '../../../common/builder';

test('ContractsListingRequestBuilder can build ContractsListingRequestBuilder', async () => {
  // Arrange
  const request = {
    setCertHolderId: jest.fn(),
    setCertVersion: jest.fn(),
    setContractId: jest.fn(),
    setSignature: jest.fn(),
    serializeBinary: jest.fn(),
  };
  const signer = {
    sign: jest.fn(async () => new Uint8Array([1, 2, 3])),
  };
  const builder = new ContractsListingRequestBuilder(request, signer);

  // Act
  builder.withCertHolderId('certHolderId');
  builder.withCertVersion(1);
  builder.withContractId('contractId');
  await builder.build();

  // Assert
  expect(signer.sign).toHaveBeenCalledWith(
    new Uint8Array([
      99, 111, 110, 116, 114, 97, 99, 116, 73, 100, 99, 101, 114, 116, 72, 111,
      108, 100, 101, 114, 73, 100, 0, 0, 0, 1,
    ])
  );
  expect(request.setCertHolderId).toHaveBeenCalledWith('certHolderId');
  expect(request.setCertVersion).toHaveBeenCalledWith(1);
  expect(request.setContractId).toHaveBeenCalledWith('contractId');
  expect(request.setSignature).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
});
