export interface SignatureSigner {
  sign(data: Uint8Array): Promise<Uint8Array>;
}

export interface SignatureValidator {
  validate(data: Uint8Array, signature: Uint8Array): Promise<boolean>;
}

export interface SignatureSignerFactory {
  create(pem: string): SignatureSigner;
  create(key: Object): SignatureSigner;
}
