import * as crypto from 'crypto';
import * as elliptic from 'elliptic';
import {KEYUTIL, b64utohex} from 'jsrsasign';

class EllipticSigner {
  constructor(readonly pem: string) {}

  async sign(data: Uint8Array): Promise<Uint8Array> {
    try {
      const base64 = this.pem
        .replace('-----BEGIN EC PRIVATE KEY-----', '')
        .replace('-----END EC PRIVATE KEY-----', '')
        .replace(/\n/g, '');
      const {prvKeyHex} = KEYUTIL.getKey(
        b64utohex(base64),
        null,
        'pkcs5prv'
      ) as never; // jsrsasign seems to be missing this type
      const EC = elliptic.ec;
      const ecdsa = new EC('p256');
      const signKey = ecdsa.keyFromPrivate(prvKeyHex, 'hex');
      const sha256 = crypto.createHash('sha256');
      const digest = sha256.update(data).digest();
      const signature = ecdsa.sign(digest, signKey);
      return new Uint8Array(signature.toDER());
    } catch (err) {
      throw new Error(`Failed to sign the data: ${(err as Error).message}`);
    }
  }
}

export class SignerFactory {
  create(pem: string): EllipticSigner {
    return new EllipticSigner(pem);
  }
}
