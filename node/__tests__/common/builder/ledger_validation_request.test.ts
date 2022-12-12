import {LedgerValidationRequestBuilder} from '../../../common/builder';

test('if LedgerValidationRequestBuilder can build LedgerValidationRequest', async () => {
  // Arrange
  const request = {
    setAssetId: jest.fn(),
    setStartAge: jest.fn(),
    setEndAge: jest.fn(),
    setCertHolderId: jest.fn(),
    setCertVersion: jest.fn(),
    setSignature: jest.fn(),
  };
  const signer = {
    sign: jest.fn(async () => new Uint8Array([1, 2, 3])),
  };
  const builder = new LedgerValidationRequestBuilder(request, signer);

  // Act
  await builder
    .withAssetId('assetId')
    .withCertHolderId('certHolderId')
    .withCertVersion(1)
    .withStartAge(1)
    .withEndAge(2)
    .build();

  // Assert
  expect(signer.sign).toHaveBeenCalledWith(
    new Uint8Array([
      97, 115, 115, 101, 116, 73, 100, 0, 0, 0, 1, 0, 0, 0, 2, 99, 101, 114,
      116, 72, 111, 108, 100, 101, 114, 73, 100, 0, 0, 0, 1,
    ])
  );
  expect(request.setAssetId).toHaveBeenCalledWith('assetId');
  expect(request.setStartAge).toHaveBeenCalledWith(1);
  expect(request.setEndAge).toHaveBeenCalledWith(2);
  expect(request.setCertHolderId).toHaveBeenCalledWith('certHolderId');
  expect(request.setCertVersion).toHaveBeenCalledWith(1);
  expect(request.setSignature).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
});
