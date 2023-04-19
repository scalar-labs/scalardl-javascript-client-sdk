/* eslint-disable no-undef */
const {SignerFactory} = require('../dist/index');

const factory = new SignerFactory();

it('creates signer by PEM', async () => {
  // Arrange
  const pem =
    '-----BEGIN EC PRIVATE KEY-----\n' +
    'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
    'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
    'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n';

  // Act
  const signer = factory.create(pem);
  const signature = await signer.sign(new Uint8Array([1, 2, 3]));

  // Assert
  expect(signature).toBeInstanceOf(Uint8Array);
});

it('creates signer by CryptoKey', async () => {
  // Arrange
  const keyPair = await window.crypto.subtle.generateKey(
    {name: 'ECDSA', namedCurve: 'P-256'},
    true,
    ['sign']
  );

  // Act
  const signer = factory.create(keyPair.privateKey);
  const signature = await signer.sign(new Uint8Array([1, 2, 3]));

  // Assert
  expect(signature).toBeInstanceOf(Uint8Array);
});

it('throws error if key is neither string nor CryptoKey', () => {
  // Act & Assert
  expect(() => factory.create(100)).toThrowError(
    Error,
    'key type should be either string (PEM) or CryptoKey'
  );
});

it('throws error if key is invalid', async () => {
  // Arrage
  const signer = factory.create('invalid key');

  // Act & Assert
  await expectAsync(
    signer.sign(new Uint8Array([1, 2, 3]))
  ).toBeRejectedWithError();
});
