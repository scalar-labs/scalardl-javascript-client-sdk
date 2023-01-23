import {StatusCode} from './status_code';
import {ClientError} from './client_error';
import {ClientConfig, Properties} from './client_config';
import {CertificateRegistrationRequestBuilder} from './builder';

import {
  AuditorClient,
  AuditorPrivileged,
  LedgerClient,
  LedgerPrivileged,
  Metadata,
  CertificateRegistrationRequest,
  Status,
  ScalarService,
  ScalarMessage,
} from './scalar.proto';
import {SignatureSigner, SignatureSignerFactory} from './signature';

/**
 * This class handles all client interactions including registering certificates
 * and contracts, listing contracts, validating the ledger, and executing
 * contracts.
 */
export class ClientServiceBase {
  readonly metadata: Metadata;
  readonly ledgerClient: LedgerClient;
  readonly ledgerPrivileged: LedgerPrivileged;
  readonly auditorClient: AuditorClient;
  readonly auditorPrivileged: AuditorPrivileged;
  readonly signerFactory: SignatureSignerFactory;
  readonly protobuf: ScalarMessage;
  readonly onBrowser: boolean;
  readonly config: ClientConfig;

  signer: SignatureSigner | null = null;

  /**
   * @param {ScalarService & {signerFactory: SignatureSignerFactory}} services contains the object of ledgeClient and
   *  the object of ledgerPrivileged
   * @param {ScalarMessage} protobuf protobuf object to inject
   * @param {Properties} properties JSON Object used for setting client properties
   * @param {Metadata} metadata gRPC metadata object used to add header
   * @param {boolean} [onBrowser=false] whether the client is running on browser or not
   *  to the gRPC request
   */
  constructor(
    services: ScalarService & {
      signerFactory: SignatureSignerFactory;
    },
    protobuf: ScalarMessage,
    properties: Properties,
    metadata: Metadata,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    onBrowser: boolean = false
  ) {
    this.config = new ClientConfig(properties);
    this.metadata = metadata;
    this.ledgerClient = services['ledgerClient'];
    this.ledgerPrivileged = services['ledgerPrivileged'];
    this.auditorClient = services['auditorClient'];
    this.auditorPrivileged = services['auditorPrivileged'];
    this.signerFactory = services['signerFactory'];
    this.protobuf = protobuf;
    this.onBrowser = onBrowser;
  }

  static get binaryStatusKey(): string {
    return 'rpc.status-bin';
  }

  /**
   * Registers the certificate specified in the given client properties.
   * @throws {ClientError|Error}
   */
  async registerCertificate(): Promise<void> {
    const request = await this.createCertificateRegistrationRequest();

    if (this.isAuditorEnabled()) {
      const promise = new Promise<void>((resolve, reject) => {
        this.auditorPrivileged.registerCert(request, this.metadata, err => {
          if (err) reject(err);
          else resolve();
        });
      });

      await this.executePromise(promise);
    }

    const promise = new Promise<void>((resolve, reject) => {
      this.ledgerPrivileged.registerCert(request, this.metadata, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    return this.executePromise(promise) as Promise<void>;
  }

  /**
   * Create the byte array of CertificateRegistrationRequest.
   * @return {Promise<Uint8Array>}
   * @throws {Error}
   */
  async createSerializedCertificateRegistrationRequest(): Promise<Uint8Array> {
    return (
      await this.createCertificateRegistrationRequest()
    ).serializeBinary();
  }

  private isAuditorEnabled(): boolean {
    return this.config.getAuditorEnabled();
  }

  private async executePromise(
    promise: Promise<void | Object>
  ): Promise<void | Object> {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof ClientError) {
        throw e;
      }
      const status = this.parseStatusFromError(
        e as Error & {metadata: Metadata}
      ) as Status;
      if (status) {
        throw new ClientError(status.code, status.message);
      } else {
        throw new ClientError(
          StatusCode.UNKNOWN_TRANSACTION_STATUS,
          (e as Error).message
        );
      }
    }
  }

  private parseStatusFromError(
    error: Error & {metadata: Metadata}
  ): Object | void {
    if (!error.metadata) {
      return;
    }

    let binaryStatus;
    if (this.onBrowser) {
      // Web runtime
      binaryStatus = error.metadata[ClientServiceBase.binaryStatusKey];
    } else {
      // Node.js runtime
      const statusMetadata = error.metadata.get(
        ClientServiceBase.binaryStatusKey
      );
      if (Array.isArray(statusMetadata) && statusMetadata.length === 1) {
        binaryStatus = statusMetadata[0];
      }
    }

    if (binaryStatus) {
      return this.protobuf.Status.deserializeBinary(binaryStatus).toObject();
    }
  }

  private async createCertificateRegistrationRequest(): Promise<CertificateRegistrationRequest> {
    return new CertificateRegistrationRequestBuilder(
      new this.protobuf.CertificateRegistrationRequest()
    )
      .withCertHolderId(this.config.getCertHolderId())
      .withCertVersion(this.config.getCertVersion())
      .withCertPem(this.config.getCertPem())
      .build();
  }
}
