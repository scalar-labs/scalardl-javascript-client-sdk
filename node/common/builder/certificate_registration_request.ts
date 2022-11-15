import {CertificateRegistrationRequest} from '../scalar.proto';

export class CertificateRegistrationRequestBuilder {
  private certHolderId: string = '';
  private certVersion: number = 0;
  private certPem: string = '';

  /**
   * @param {CertificateRegistrationRequest} request
   */
  constructor(private request: CertificateRegistrationRequest) {}

  /**
   * @param {string} id
   * @return {CertificateRegistrationRequestBuilder}
   */
  withCertHolderId(id: string): CertificateRegistrationRequestBuilder {
    this.certHolderId = id;
    return this;
  }

  /**
   * @param {number} version
   * @return {CertificateRegistrationRequestBuilder}
   */
  withCertVersion(version: number): CertificateRegistrationRequestBuilder {
    this.certVersion = version;
    return this;
  }

  /**
   * @param {string} pem
   * @return {CertificateRegistrationRequestBuilder}
   */
  withCertPem(pem: string): CertificateRegistrationRequestBuilder {
    this.certPem = pem;
    return this;
  }

  /**
   * @return {Promise<CertificateRegistrationRequest>}
   */
  async build(): Promise<CertificateRegistrationRequest> {
    const request = this.request;
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setCertPem(this.certPem);

    return request;
  }
}
