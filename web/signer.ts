import * as jsrsasign from 'jsrsasign';

class WebCryptoSigner {
  pkcs1?: string;
  key?: CryptoKey;
  jwk?: jsrsasign.KJUR.jws.JWS.JsonWebKey;

  constructor(key: string | CryptoKey) {
    if (typeof key === 'string') {
      this.pkcs1 = key;
    } else if (key instanceof CryptoKey) {
      this.key = key;
    } else {
      throw new Error('key type should be either string (PEM) or CryptoKey');
    }
  }

  async sign(content: Uint8Array): Promise<Uint8Array> {
    let key;
    if (this.key) {
      key = this.key;
    } else if (this.pkcs1) {
      if (!this.jwk) {
        this.jwk = toJwkFromPkcs1(this.pkcs1);
      }
      try {
        key = await toCryptoKeyFromJwk(this.jwk);
      } catch {
        throw new Error('Failed load the PEM file');
      }
    }

    if (!key) {
      throw new Error('Failed to load the key');
    }

    const algorithm = {
      // EcdsaParams
      name: 'ECDSA',
      hash: 'SHA-256',
    };
    const data = content;

    try {
      const signature = await window.crypto.subtle.sign(algorithm, key, data);
      return P1363ToDer(new Uint8Array(signature));
    } catch {
      throw new Error('Failed to sign the request');
    }
  }
}

export class SignerFactory {
  create(key: string | CryptoKey): WebCryptoSigner {
    return new WebCryptoSigner(key);
  }
}

/**
 * @param {Uint8Array} sig - P1363 signature
 * @return {Uint8Array} DER signature
 *
 * This function is taken from the SDK of token.io (https://github.com/tokenio/sdk-js)
 *
 * Copyright (c) 2020, Token, Inc. (https://token.io)
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * Converts an ECDSA signature from P1363 to DER format
 *
 * IEEE P1363: bytes array of [
 *   r,
 *   s
 * ]
 *
 * ASN.1 DER: bytes array of [
 *   0x30 (DER sequence tag),
 *   (length of the bytes after this byte),
 *   0x02 (DER integer tag),
 *   (length of the bytes of r),
 *   (padding, if necessary)
 *   r,
 *   0x02 (DER integer tag),
 *   (length of the bytes of s),
 *   (padding, if necessary)
 *   s
 * ]
 */
function P1363ToDer(sig: Uint8Array): Uint8Array {
  const signature = Array.from(sig, x =>
    ('00' + x.toString(16)).slice(-2)
  ).join('');
  let r = signature.substr(0, signature.length / 2);
  let s = signature.substr(signature.length / 2);
  r = r.replace(/^(00)+/, '');
  s = s.replace(/^(00)+/, '');
  if ((parseInt(r, 16) & 0x80) > 0) r = `00${r}`;
  if ((parseInt(s, 16) & 0x80) > 0) s = `00${s}`;
  const rString = `02${(r.length / 2).toString(16).padStart(2, '0')}${r}`;
  const sString = `02${(s.length / 2).toString(16).padStart(2, '0')}${s}`;
  const derSig = `30${((rString.length + sString.length) / 2)
    .toString(16)
    .padStart(2, '0')}${rString}${sString}`;
  return new Uint8Array(
    derSig.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16))
  );
}

async function toCryptoKeyFromJwk(
  jwk: jsrsasign.KJUR.jws.JWS.JsonWebKey
): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false, // extractable is false (which means unextractable)
    ['sign']
  );
}

function toJwkFromPkcs1(pkcs1: string): jsrsasign.KJUR.jws.JWS.JsonWebKey {
  pkcs1 = pkcs1
    .replace('-----BEGIN EC PRIVATE KEY-----', '')
    .replace('-----END EC PRIVATE KEY-----', '')
    .replace(/\r\n/g, '');
  const key = jsrsasign.KEYUTIL.getKey(
    jsrsasign.b64utohex(pkcs1),
    null,
    'pkcs5prv'
  ) as never;

  return jsrsasign.KEYUTIL.getJWKFromKey(key);
}
