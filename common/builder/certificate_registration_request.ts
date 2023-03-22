import {CertificateRegistrationRequest} from '../scalar.proto';

export class CertificateRegistrationRequestBuilder {
  private certHolderId: string = '';
  private certVersion: number = 0;
  private certPem: string = '';

  constructor(private request: CertificateRegistrationRequest) {}

  withCertHolderId(id: string): CertificateRegistrationRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  withCertVersion(version: number): CertificateRegistrationRequestBuilder {
    this.certVersion = version;
    return this;
  }

  withCertPem(pem: string): CertificateRegistrationRequestBuilder {
    this.certPem = pem;
    return this;
  }

  async build(): Promise<CertificateRegistrationRequest> {
    const request = this.request;
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setCertPem(this.certPem);

    return request;
  }
}
