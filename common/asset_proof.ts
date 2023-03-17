import {TextEncoder} from './polyfill/text_encoder';
import {btoa} from './polyfill/btoa';
import {AssetProof as GrpcAssetProof} from './scalar.proto';
import {SignatureValidator} from './signature';

export class AssetProof {
  id: string = '';
  age: number = 0;
  nonce: string = '';
  input: string = '';
  hash: Uint8Array = new Uint8Array();
  prevHash: Uint8Array = new Uint8Array();
  signature: Uint8Array = new Uint8Array();

  constructor(
    id: string,
    age: number,
    nonce: string,
    input: string,
    hash: Uint8Array,
    prevHash: Uint8Array,
    signature: Uint8Array
  ) {
    this.id = id;
    this.age = age;
    this.nonce = nonce;
    this.input = input;
    this.hash = hash;
    this.prevHash = prevHash;
    this.signature = signature;
  }

  static fromGrpcAssetProof(proof: GrpcAssetProof): AssetProof {
    return new AssetProof(
      proof.getAssetId(),
      proof.getAge(),
      proof.getNonce(),
      proof.getInput(),
      proof.getHash_asU8(),
      proof.getPrevHash_asU8(),
      proof.getSignature_asU8()
    );
  }

  getId(): string {
    return this.id;
  }

  getAge(): number {
    return this.age;
  }

  getHash(): Uint8Array {
    return this.hash;
  }

  getPrevHash(): Uint8Array {
    return this.prevHash;
  }

  getNonce(): string {
    return this.nonce;
  }

  getInput(): string {
    return this.input;
  }

  getSignature(): Uint8Array {
    return this.signature;
  }

  /**
   * @deprecated
   */
  hashEquals(hash: Uint8Array): boolean {
    if (!(hash instanceof Uint8Array)) {
      return false;
    }
    if (this.hash.length !== hash.length) {
      return false;
    }
    for (let i = 0; i < this.hash.length; ++i) {
      if (this.hash[i] !== hash[i]) {
        return false;
      }
    }
    return true;
  }

  valueEquals(other: AssetProof): boolean {
    if (!(other instanceof AssetProof)) {
      return false;
    }

    return (
      other.getId() === this.getId() &&
      other.getAge() === this.getAge() &&
      other.getNonce() === this.getNonce() &&
      other.getInput() === this.getInput() &&
      other.getHash().length === this.getHash().length &&
      other.getHash().every((e, i) => e === this.getHash()[i]) &&
      other.getPrevHash().length === this.getPrevHash().length &&
      other.getPrevHash().every((e, i) => e === this.getPrevHash()[i])
    );
  }

  toString(): string {
    return (
      `AssetProof{id=${this.id},` +
      `age=${this.age},` +
      `hash=${this.hash},` +
      `nonce=${this.nonce},` +
      `input=${this.input},` +
      `hash=${uint8ArrayToBase64(this.hash)},` +
      `prev_hash=${uint8ArrayToBase64(this.prevHash)},` +
      `signature=${uint8ArrayToBase64(this.signature)}}`
    );
  }

  /**
   * @throws {Error}
   */
  async validateWith(validator: SignatureValidator) {
    const serilized = serialize(
      this.id,
      this.age,
      this.nonce,
      this.input,
      this.hash,
      this.prevHash
    );

    if (!(await validator.validate(serilized, this.signature))) {
      throw new Error(
        "The proof signature can't be validated with the certificate."
      );
    }
  }
}

function uint8ArrayToBase64(array: Uint8Array): string {
  return btoa(
    Array(array.length)
      .fill('')
      .map((_, i) => String.fromCharCode(array[i]))
      .join('')
  );
}

function serialize(
  id: string,
  age: number,
  nonce: string,
  input: string,
  hash: Uint8Array,
  prevHash: Uint8Array
): Uint8Array {
  const idBytes = new TextEncoder().encode(id);
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, age);
  const ageBytes = new Uint8Array(view.buffer);
  const nonceBytes = new TextEncoder().encode(nonce);
  const inputBytes = new TextEncoder().encode(input);

  const buffer = new Uint8Array(
    idBytes.byteLength +
      ageBytes.byteLength +
      nonceBytes.byteLength +
      inputBytes.byteLength +
      hash.byteLength +
      prevHash.byteLength
  );

  let offset = 0;
  buffer.set(idBytes, 0);
  offset += idBytes.byteLength;
  buffer.set(ageBytes, offset);
  offset += ageBytes.byteLength;
  buffer.set(nonceBytes, offset);
  offset += nonceBytes.byteLength;
  buffer.set(inputBytes, offset);
  offset += inputBytes.byteLength;
  buffer.set(hash, offset);
  offset += hash.byteLength;
  buffer.set(prevHash, offset);

  return buffer;
}
