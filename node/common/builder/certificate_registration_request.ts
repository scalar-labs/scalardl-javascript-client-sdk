import {CertificateRegistrationRequest} from '../scalar_protobuf';

export class CertificateRegistrationRequestBuilder {
  request: CertificateRegistrationRequest;
  certHolderId: string = '';
  certVersion: number = 0;
  certPem: string = '';

  /**
   * @param {CertificateRegistrationRequest} request
   */
  constructor(request: CertificateRegistrationRequest) {
    this.request = request;
  }

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
