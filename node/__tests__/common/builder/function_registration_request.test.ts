import {FunctionRegistrationRequestBuilder} from '../../../common/builder';

test('if FunctionRegistrationRequestBuilder can build FunctionRegistrationRequest', async () => {
  // Arrange
  const request = {
    setFunctionId: jest.fn(),
    setFunctionBinaryName: jest.fn(),
    setFunctionByteCode: jest.fn(),
  };
  const builder = new FunctionRegistrationRequestBuilder(request);

  // Act
  await builder
    .withFunctionId('functionId')
    .withFunctionBinaryName('functionBinaryName')
    .withFunctionByteCode(new Uint8Array([1, 2, 3]))
    .build();

  // Assert
  expect(request.setFunctionId).toHaveBeenCalledWith('functionId');
  expect(request.setFunctionBinaryName).toHaveBeenCalledWith(
    'functionBinaryName'
  );
  expect(request.setFunctionByteCode).toHaveBeenCalledWith(
    new Uint8Array([1, 2, 3])
  );
});
