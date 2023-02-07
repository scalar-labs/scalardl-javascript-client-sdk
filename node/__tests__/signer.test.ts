import {SignerFactory} from '../signer';

test('if signer can sign a content', async () => {
  // Arrange
  const key =
    '-----BEGIN EC PRIVATE KEY-----\n' +
    'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
    'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
    'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n';
  const factory = new SignerFactory();
  const signer = factory.create(key);

  // Act
  const signed = await signer.sign(new Uint8Array([1, 2, 3]));

  // Assert
  expect(signed).toEqual(
    new Uint8Array([
      48, 70, 2, 33, 0, 182, 92, 214, 10, 51, 31, 205, 185, 135, 20, 172, 12,
      108, 208, 95, 232, 80, 16, 59, 244, 249, 245, 214, 127, 187, 221, 184, 20,
      68, 244, 241, 71, 2, 33, 0, 148, 161, 6, 219, 126, 20, 215, 191, 198, 120,
      113, 86, 65, 184, 42, 153, 110, 6, 161, 93, 59, 77, 196, 202, 232, 116,
      216, 79, 186, 211, 89, 103,
    ])
  );
});
