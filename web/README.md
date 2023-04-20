## ScalarDL Web Client SDK

This is a library for web applications by which the applications can interact with a [ScalarDL](https://github.com/scalar-labs/scalardl) network.

## Node version used for development and testing
This package has been developed and tested using Node version 14 and 16.

## Install
We can use package manager to install this library. For example, to install with NPM:
```
npm install @scalar-labs/scalardl-web-client-sdk
```

You can also find a bundle `scalardl-web-client-sdk.bundle.js` which can be imported statically in @scalar-labs/scalardl-web-client-sdk/dist.

## HOWTO

### Create ClientService instance

`ClientService` class is the main class of this package.
It provides the following functions to request the ScalarDL network.

|Name|use|
|----|---|
|registerCertificate|To register a client's certificate on a ScalarDL network|
|registerContract|To register a contract (of a registered client) on the ScalarDL network|
|listContracts|To list the client's registered contracts|
|execute and executeContract (deprecated in the feature)|To execute a client's registered contract|
|validateLedger|To validate an asset on the ScalarDL network to determine if it has been tampered|

If an error occurs when executing one of the above methods, a `ClientError` will be thrown. The
`ClientError.code` provides additional error context. Please refer to the [Runtime error](#runtime-error) section below for the status code specification.

Use the code snippet below to create a ClientService instance.

```javascript
import { ClientService } from '@scalar-labs/scalardl-node-client-sdk';
const clientService = new ClientService(clientProperties);
```

Or, if you use the static release, try following
```html
<head>
    <meta charset="utf-8">
    <script src="scalardl-web-client-sdk.bundle.js"></script>
</head>

<script>
    const clientService = new Scalar.ClientService(clientProperties);
</script>
```

The `clientProperties` argument is mandatory for the constructor.
This is a properties example that a user `foo@example.com` would use to try to connect to the server `scalardl.example.com:50051` of the ScalarDL network.
```javascript
{
    'scalar.dl.client.server.host': 'scalardl.example.com',
    'scalar.dl.client.server.port': 50051,
    'scalar.dl.client.server.privileged_port': 50052,
    'scalar.dl.client.cert_holder_id': 'foo@example.com',
    'scalar.dl.client.private_key_pem': "-----BEGIN EC PRIVATE KEY-----\nMHc...",
    'scalar.dl.client.cert_pem': "-----BEGIN CERTIFICATE-----\nMIICjTCCAj...n",
    'scalar.dl.client.cert_version': 1,
    'scalar.dl.client.tls.enabled': false,
}
```

If the auditor capability is enabled on the ScalarDL network, specify additional properties like the following example. In this example, the client interacts with the auditor `scalardl-auditor.example.com` and detects Byzantine faults including data tampering when executing contracts.

```javascript
{
    'scalar.dl.client.auditor.enabled': true,
    'scalar.dl.client.auditor.host': 'scalardl-auditor.example.com',
    'scalar.dl.client.auditor.port': 40051,
    'scalar.dl.client.auditor.privileged_port': 40052,
}
```

In what follows assume that we have a clientService instance.

### Register the certificate
Use the `registerCertificate` function to register a certificate on the ScalarDL network.
```javascript
await clientService.registerCertificate();
```
Please refer to the [Status code](#status-code) section below for the details of the status.

### Register contracts
Use the `registerContract` function to register a contract.
```javascript
await clientService.registerContract(
    'contractId',
    'com.example.contract.contractName',
    contractUint8Array,
    propertiesObject,
);
```

### Register functions
Use the `registerFunction` function to register a function.
```javascript
await clientService.registerFunction(
    'functionId,
    'com.example.function.functionName',
    functionUint8Array,
);
```

### List registered contracts
Use `listContracts` function to list all registered contracts.
```javascript
const constracts = await clientService.listContracts();
```

### Execute a contract
Use the `execute` function to execute a registered contract and function (optionally).
```javascript
const response = await clientService.execute('contractId', argumentObject);
const executionResult = response.getResult();
const proofsList = response.getProofs();
```

```javascript
const response = await clientService.execute(
    'contractId',
    { 'arg1': 'a' }, // contract argument
    'functionId',
    { 'arg2': 'b' }, // function argument
);
```

### Validate an asset
Use the `validateLedger` function to validate an asset in the ScalarDL network.
```javascript
const response = await clientService.validateLedger('assetId');
const status = response.getCode();
const proof = response.getProof();
```

#### Ledger validation when Auditor is used
See [here](https://github.com/scalar-labs/scalardl/blob/master/docs/getting-started-auditor.md#validate-the-states-of-ledger-and-auditor) and use the above Node SDK interfaces (`registerContract` and `validateLedger`) in the same manner to validate the states of Ledger and Auditor. You can set the contract ID of [ValidateLedger](https://github.com/scalar-labs/scalardl-java-client-sdk/blob/master/src/main/java/com/scalar/dl/client/contract/ValidateLedger.java) to `scalar.dl.client.auditor.linearizable_validation.contract_id` property, otherwise the default ID `validate-ledger` will be used.

```javascript
{
    'scalar.dl.client.auditor.enabled': true,
    'scalar.dl.client.auditor.linearizable_validation.contract_id': '<choose a contract ID>',
}
```

### Runtime error
Error thrown by the client presenting a status code.
```javascript
try {
    await clientService.registerCertificate();
} catch (clientError) {
    const message = clientError.message;
    const statusCode = clientError.code;
}
```
Enumeration `StatusCode` enumerates all the possible statuses.
```
StatusCode = {
  OK: 200,
  INVALID_HASH: 300,
  INVALID_PREV_HASH: 301,
  INVALID_CONTRACT: 302,
  INVALID_OUTPUT: 303,
  INVALID_NONCE: 304,
  INCONSISTENT_STATES: 305,
  INVALID_SIGNATURE: 400,
  UNLOADABLE_KEY: 401,
  UNLOADABLE_CONTRACT: 402,
  CERTIFICATE_NOT_FOUND: 403,
  CONTRACT_NOT_FOUND: 404,
  CERTIFICATE_ALREADY_REGISTERED: 405,
  CONTRACT_ALREADY_REGISTERED: 406,
  INVALID_REQUEST: 407,
  CONTRACT_CONTEXTUAL_ERROR: 408,
  ASSET_NOT_FOUND: 409,
  FUNCTION_NOT_FOUND: 410,
  UNLOADABLE_FUNCTION: 411,
  INVALID_FUNCTION: 412,
  DATABASE_ERROR: 500,
  UNKNOWN_TRANSACTION_STATUS: 501,
  RUNTIME_ERROR: 502,
  CLIENT_IO_ERROR: 600,
  CLIENT_DATABASE_ERROR: 601,
  CLIENT_RUNTIME_ERROR: 602,
};
```

## Envoy configuration
ScalarDL server (gRPC) uses a custom header called `rpc.status-bin` to share error metadata with the client. This means Envoy needs to be
configured to expose the header to clients.
More specifically, `rpc.status-bin` needs to be added to the `expose-headers` field of the [cors configuration](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/route/route_components.proto#envoy-api-msg-route-corspolicy).

## Contributing
This library is mainly maintained by the Scalar Engineering Team, but we appreciate any help.

* For asking questions, finding answers and helping other users, please go to [stackoverflow](https://stackoverflow.com/) and use [scalardl](https://stackoverflow.com/questions/tagged/scalardl) tag.
* For filing bugs, suggesting improvements, or requesting new features, help us out by opening an issue.

## License
ScalarDL client SDK is dual-licensed under both the AGPL (found in the LICENSE file in the root directory) and a commercial license. You may select, at your option, one of the above-listed licenses. Regarding the commercial license, please [contact us](https://scalar-labs.com/contact_us/) for more information.
