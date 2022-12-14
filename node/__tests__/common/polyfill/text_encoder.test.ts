import {TextEncoder} from '../../../common/polyfill/text_encoder';

test('if TextEncoder can encode the `hello world` string', () => {
  // Arrange
  const encoder = new TextEncoder();

  // Act
  const encoded = encoder.encode('hello world');

  // Assert
  expect(encoded).toEqual(
    new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
  );
});

test('if TextEncoder can encode the empty string', () => {
  // Arrange
  const encoder = new TextEncoder();

  // Act
  const encoded = encoder.encode('');

  // Assert
  expect(encoded).toEqual(new Uint8Array());
});

test('If TextEncoder can encode the `あいうえお` string', () => {
  // Arrange
  const encoder = new TextEncoder();

  // Act
  const encoded = encoder.encode('あいうえお');

  // Assert
  expect(encoded).toEqual(
    new Uint8Array([
      227, 129, 130, 227, 129, 132, 227, 129, 134, 227, 129, 136, 227, 129, 138,
    ])
  );
});
