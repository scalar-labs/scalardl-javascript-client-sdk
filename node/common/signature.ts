export interface SignatureSigner {
  sign(data: Uint8Array): Promise<Uint8Array>;
}
