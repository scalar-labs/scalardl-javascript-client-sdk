import {ClientServiceBase} from './common';
import * as fs from 'fs';
import {SignerFactory} from './signer';
import {Metadata, credentials} from '@grpc/grpc-js';
import {
  ClientConfig,
  CLIENT_PROPERTIES_FIELD,
  Properties,
} from './common/client_config';
import {ScalarService} from './common/scalar.proto';
const {
  AuditorClient,
  AuditorPrivilegedClient,
  LedgerClient,
  LedgerPrivilegedClient,
} = require('./scalar_grpc_pb.js');

const protobuf = require('./scalar_pb.js');

export function resolveFileBasedProperties(properties: Properties) {
  const certPath = properties[CLIENT_PROPERTIES_FIELD.CERT_PATH] as string;
  const certPem = properties[CLIENT_PROPERTIES_FIELD.CERT_PEM];
  if (certPath !== undefined && certPem === undefined) {
    properties[CLIENT_PROPERTIES_FIELD.CERT_PEM] = fs
      .readFileSync(certPath)
      .toString();
  }

  const keyPath = properties[
    CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PATH
  ] as string;
  const keyPem = properties[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM];
  if (keyPath !== undefined && keyPem === undefined) {
    properties[CLIENT_PROPERTIES_FIELD.PRIVATE_KEY_PEM] = fs
      .readFileSync(keyPath)
      .toString();
  }

  const caPath = properties[
    CLIENT_PROPERTIES_FIELD.TLS_CA_ROOT_CERT_PATH
  ] as string;
  const caPem = properties[CLIENT_PROPERTIES_FIELD.TLS_CA_ROOT_CERT_PEM];
  if (caPath !== undefined && caPem === undefined) {
    properties[CLIENT_PROPERTIES_FIELD.TLS_CA_ROOT_CERT_PEM] = fs
      .readFileSync(caPath)
      .toString();
  }

  return properties;
}

export function createMetadata(properties: Properties) {
  const metadata = new Metadata();
  const credential = properties[
    CLIENT_PROPERTIES_FIELD.AUTHORIZATION_CREDENTIAL
  ] as string;

  if (credential !== undefined) {
    metadata.set('authorization', credential);
  }
  return metadata;
}

export function createGrpcServices(properties: Properties): ScalarService {
  const config = new ClientConfig(properties);
  const ledgerClientUrl =
    `${config.getServerHost()}:` + `${config.getServerPort()}`;
  const ledgerPrivilegedClientUrl =
    `${config.getServerHost()}:` + `${config.getServerPrivilegedPort()}`;
  const ca = config.getTlsCaRootCertPem();
  const tlsEnabled = config.getTlsEnabled();

  let grpcChannelCredentials = credentials.createInsecure();
  if (tlsEnabled) {
    if (ca) {
      // Use custom root CA
      grpcChannelCredentials = credentials.createSsl(Buffer.from(ca, 'utf8'));
    } else {
      // When no custom root CA is provided to init the SSL/TLS connection,
      // default root CA maintained by Node.js will be used
      grpcChannelCredentials = credentials.createSsl();
    }
  }

  const ledgerClient = new LedgerClient(
    ledgerClientUrl,
    grpcChannelCredentials
  );
  const ledgerPrivilegedClient = new LedgerPrivilegedClient(
    ledgerPrivilegedClientUrl,
    grpcChannelCredentials
  );

  const auditorClientUrl =
    `${config.getAuditorHost() || ''}:` + `${config.getAuditorPort() || ''}`;
  const auditorPrivilegedClientUrl =
    `${config.getAuditorHost() || ''}:` +
    `${config.getAuditorPrivilegedPort() || ''}`;

  const auditorClient = new AuditorClient(
    auditorClientUrl,
    grpcChannelCredentials
  );
  const auditorPrivilegedClient = new AuditorPrivilegedClient(
    auditorPrivilegedClientUrl,
    grpcChannelCredentials
  );

  return {
    ledgerClient: ledgerClient as never, // since scalar_grpc_pb doesn't provide the types
    ledgerPrivileged: ledgerPrivilegedClient as never,
    auditorClient: auditorClient as never,
    auditorPrivileged: auditorPrivilegedClient as never,
  };
}

export class ClientService extends ClientServiceBase {
  constructor(properties: Properties) {
    const stringnifiedProperties = resolveFileBasedProperties(properties);
    const metadata = createMetadata(properties);
    const {ledgerClient, ledgerPrivileged, auditorClient, auditorPrivileged} =
      createGrpcServices(properties);
    const signerFactory = new SignerFactory();

    super(
      {
        ledgerClient,
        ledgerPrivileged,
        auditorClient,
        auditorPrivileged,
        signerFactory: signerFactory,
      },
      protobuf as never,
      stringnifiedProperties,
      metadata as never
    );
  }
}
