import {CertificateRegistrationRequestBuilder} from '../../../common/builder';

test('if CertificateRegistrationRequestBuilder can build CertificateRegistrationRequest', async () => {
  // Arrange
  const request = {
    setCertHolderId: jest.fn(),
    setCertVersion: jest.fn(),
    setCertPem: jest.fn(),
    serializeBinary: jest.fn(),
  };
  const builder = new CertificateRegistrationRequestBuilder(request);

  // Act
  await builder
    .withCertHolderId('certHolderId')
    .withCertVersion(1)
    .withCertPem('certPem')
    .build();

  // Asssert
  expect(request.setCertHolderId).toHaveBeenCalledWith('certHolderId');
  expect(request.setCertVersion).toHaveBeenCalledWith(1);
  expect(request.setCertPem).toHaveBeenCalledWith('certPem');
});
