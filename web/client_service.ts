import {ClientServiceBase} from './common';
import {ClientConfig, Properties} from './common/client_config';
import {SignerFactory} from './signer';
import {Metadata} from 'grpc-web';
import {isNonEmptyString} from './common/polyfill/is';

const {
  AuditorClient,
  AuditorPrivilegedClient,
  LedgerClient,
  LedgerPrivilegedClient,
} = require('./scalar_grpc_web_pb.js');

const protobuf = require('./scalar_pb');

export class ClientService extends ClientServiceBase {
  constructor(properties: Properties) {
    const config = new ClientConfig(properties);

    const host = config.getServerHost();
    const auditorHost = config.getAuditorHost();
    const tlsEnabled = config.getTlsEnabled();
    const ledgerClientServiceURL = `${
      tlsEnabled ? 'https' : 'http'
    }://${host}:${config.getServerPort()}`;
    const ledgerPriviledgedClientServiceURL = `${
      tlsEnabled ? 'https' : 'http'
    }://${host}:${config.getServerPrivilegedPort()}`;
    const auditorClientServiceURL = `${
      tlsEnabled ? 'https' : 'http'
    }://${auditorHost}:${config.getAuditorPort()}`;
    const auditorPriviledgedClientServiceURL = `${
      tlsEnabled ? 'https' : 'http'
    }://${auditorHost}:${config.getAuditorPrivilegedPort()}`;

    const metadata: Metadata = {};
    if (isNonEmptyString(config.getAuthorizationCredential())) {
      metadata.Authorization = config.getAuthorizationCredential() as string;
    }

    super(
      {
        ledgerClient: new LedgerClient(ledgerClientServiceURL),
        ledgerPrivileged: new LedgerPrivilegedClient(
          ledgerPriviledgedClientServiceURL
        ),
        auditorClient: new AuditorClient(auditorClientServiceURL),
        auditorPrivileged: new AuditorPrivilegedClient(
          auditorPriviledgedClientServiceURL
        ),
        signerFactory: new SignerFactory(),
      },
      protobuf as never,
      properties,
      metadata as never,
      true
    );
  }
}
