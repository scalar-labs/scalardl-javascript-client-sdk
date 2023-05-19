import Dexie, {Table} from 'dexie';
import {KEYUTIL, b64utohex} from 'jsrsasign';
import {Properties, CLIENT_PROPERTIES_FIELD} from './common/client_config';
import {ClientService} from './client_service';
import {isNonEmptyString, isInteger} from './common/polyfill/is';

const KEYSTORE_DATABASE_NAME = 'scalar';

class ScalarIndexedDb extends Dexie {
  keystore!: Table<{id: string; key: CryptoKey}, string>;
  certstore!: Table<{id: string; cert: string}, string>;

  constructor() {
    super(KEYSTORE_DATABASE_NAME);
    this.version(1).stores({keystore: 'id', certstore: 'id'});
  }
}

export class ClientServiceWithIndexedDb extends ClientService {
  static async create(properties: Properties) {
    const holderId = properties[CLIENT_PROPERTIES_FIELD.CERT_HOLDER_ID];
    const certVersion = properties[CLIENT_PROPERTIES_FIELD.CERT_VERSION];

    if (!isNonEmptyString(holderId) || !isInteger(certVersion)) {
      throw new Error(
        `${CLIENT_PROPERTIES_FIELD.CERT_HOLDER_ID} (string) and ${CLIENT_PROPERTIES_FIELD.CERT_VERSION} (integer) are required`
      );
    }

    const cryptoKey = properties[
      CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_CRYPTOKEY
    ] as CryptoKey;
    const keyPem = properties[
      CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM
    ] as string;
    const certPem = properties[CLIENT_PROPERTIES_FIELD.CERT_PEM] as string;
    const id = `${holderId}_${certVersion}`;

    const db = new ScalarIndexedDb();

    let key: CryptoKey;
    if (cryptoKey || keyPem) {
      key = cryptoKey || (await toCryptoKeyFromJwk(toJwkFromPkcs1(keyPem)));
      await db.keystore.put({id: id, key: key});
    } else {
      const item = await db.keystore.get(id);

      if (!item) {
        throw new Error('Can not find key from IndexedDB');
      }

      if (!(item.key instanceof CryptoKey)) {
        throw new Error('The key from indexedDB is not CryptoKey');
      }

      key = item && item.key;
    }
    properties[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_CRYPTOKEY] = key;
    delete properties[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM];

    if (certPem) {
      await db.certstore.put({id: id, cert: certPem});
    } else {
      const got = await db.certstore.get(id);
      if (!got) {
        throw new Error('Can not find certificate from indexedDB');
      }

      if (!isNonEmptyString(got.cert)) {
        throw new Error('The certificate from indexedDB is not string');
      }

      properties[CLIENT_PROPERTIES_FIELD.CERT_PEM] = got.cert;
    }

    return new ClientServiceWithIndexedDb(properties);
  }

  async deleteIndexedDb() {
    const id = `${this.config.getCertHolderId()}_${this.config.getCertVersion()}`;

    const db = new ScalarIndexedDb();

    await db.keystore.delete(id);
    await db.certstore.delete(id);
  }

  private constructor(properties: Properties) {
    super(properties);
  }
}

async function toCryptoKeyFromJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {name: 'ECDSA', namedCurve: 'P-256'},
    false, // extractable is false (which means unextractable)
    ['sign']
  );
}

function toJwkFromPkcs1(pkcs1: string): JsonWebKey {
  pkcs1 = pkcs1
    .replace('-----BEGIN EC PRIVATE KEY-----', '')
    .replace('-----END EC PRIVATE KEY-----', '')
    .replace(/\r\n/g, '');
  const key = KEYUTIL.getKey(b64utohex(pkcs1), null, 'pkcs5prv');

  return KEYUTIL.getJWKFromKey(key as never);
}
