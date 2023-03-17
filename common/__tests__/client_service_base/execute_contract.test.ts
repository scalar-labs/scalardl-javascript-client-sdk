import {ClientServiceBase} from '../../../common/client_service_base';
import {Callback, Metadata} from '../../../common/scalar.proto';
import {ContractExecutionResult} from '../../../common/contract_execution_result';

const clientProperties = {
  'scalar.dl.client.private_key_pem':
    '-----BEGIN EC PRIVATE KEY-----\n' +
    'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
    'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
    'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n',
  'scalar.dl.client.cert_pem':
    '-----BEGIN CERTIFICATE-----\n' +
    'MIICizCCAjKgAwIBAgIUMEUDTdWsQpftFkqs6bCd6U++4nEwCgYIKoZIzj0EAwIw\n' +
    'bzELMAkGA1UEBhMCSlAxDjAMBgNVBAgTBVRva3lvMQ4wDAYDVQQHEwVUb2t5bzEf\n' +
    'MB0GA1UEChMWU2FtcGxlIEludGVybWVkaWF0ZSBDQTEfMB0GA1UEAxMWU2FtcGxl\n' +
    'IEludGVybWVkaWF0ZSBDQTAeFw0xODA5MTAwODA3MDBaFw0yMTA5MDkwODA3MDBa\n' +
    'MEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJ\n' +
    'bnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNC\n' +
    'AAQEa6Gq6bKHsFU2pw0oBBCKkMaihSlRG97Z07rqlAKCO1J+7uUlXbRdhZ2uCjRj\n' +
    'd5cSG8rSWxRE703Ses+JBZPgo4HVMIHSMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUE\n' +
    'DDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRDd2MS9Ndo68PJ\n' +
    'y9K/RNY6syZW0zAfBgNVHSMEGDAWgBR+Y+v8yByDNp39G7trYrTfZ0UjJzAxBggr\n' +
    'BgEFBQcBAQQlMCMwIQYIKwYBBQUHMAGGFWh0dHA6Ly9sb2NhbGhvc3Q6ODg4OTAq\n' +
    'BgNVHR8EIzAhMB+gHaAbhhlodHRwOi8vbG9jYWxob3N0Ojg4ODgvY3JsMAoGCCqG\n' +
    'SM49BAMCA0cAMEQCIC/Bo4oNU6yHFLJeme5ApxoNdyu3rWyiqWPxJmJAr9L0AiBl\n' +
    'Gc/v+yh4dHIDhCrimajTQAYOG9n0kajULI70Gg7TNw==\n' +
    '-----END CERTIFICATE-----\n',
  'scalar.dl.client.cert_holder_id': 'hold',
  'scalar.dl.client.cert_version': 1,
};

test('should throw error when the type of the contract argument and the function argument is different', async () => {
  // Arrange
  const clientServiceBase = new ClientServiceBase(
    {} as never,
    {} as never,
    clientProperties,
    {} as never
  );

  // Act & Assert
  await expect(
    clientServiceBase.execute('id', 'string', null, {})
  ).rejects.toThrowError(
    'contract argument and function argument must be the same type'
  );
});

test('should throw error is nonce is not string', async () => {
  // Arrange
  const mockedExecuteContract = {
    setContractId: function () {},
    setContractArgument: function () {},
    setCertHolderId: function () {},
    setCertVersion: function () {},
    setFunctionArgument: function () {},
    setSignature: function () {},
    setUseFunctionIds: function () {},
    setFunctionIdsList: function () {},
    setNonce: function () {},
  };
  const mockedProtobuf = {
    ContractExecutionRequest: function () {
      return mockedExecuteContract;
    },
  };
  const clientServiceBase = new ClientServiceBase(
    {
      ledgerClient: {},
      signerFactory: {
        create: () => ({
          sign: () => {},
        }),
      },
    } as never,
    mockedProtobuf as never,
    clientProperties,
    {} as Metadata
  );

  // Act & Assert
  await expect(
    clientServiceBase.execute(
      'contract-id',
      'contract-argument',
      'function-id',
      'function-argument',
      {} as never
    )
  ).rejects.toThrowError('Invalid argument');
});

const mockedContractId = 'contract-id';
const mockedFunctionId = 'function-id';
const mockedArgument = {mocked: 'contact-argument'};
const mockedFunctionArgument = {mocked: 'function-argument'};
const mockedFunctionArgumentJson = JSON.stringify(mockedFunctionArgument);

test('should work as expected', async () => {
  // Arrange
  const mockedExecuteContract = {
    setContractId: function () {},
    setContractArgument: function () {},
    setCertHolderId: function () {},
    setCertVersion: function () {},
    setFunctionArgument: function () {},
    setSignature: function () {},
    setUseFunctionIds: function () {},
    setFunctionIdsList: function () {},
    setNonce: function () {},
  };
  const mockedProtobuf = {
    ContractExecutionRequest: function () {
      return mockedExecuteContract;
    },
  };
  const mockedSigner = {
    sign: function () {},
  };

  const clientServiceBase = new ClientServiceBase(
    {
      ledgerClient: {
        executeContract: (_: never, __: never, callback: Callback) => {
          const mockProof = {
            getAssetId: () => 'asset-id',
            getAge: () => 1,
            getHash_asU8: () => new Uint8Array([1, 2, 3]),
            getPrevHash_asU8: () => new Uint8Array([1, 2, 3]),
            getNonce: () => 'nonce',
            getInput: () => 'input',
            getSignature_asU8: () => new Uint8Array([1, 2, 3]),
          };
          const mockedResponse = {
            getContractResult: () => '',
            getFunctionResult: () => '',
            getProofsList: () => [mockProof],
          };
          callback(null, mockedResponse);
        },
      },
      signerFactory: {
        create: () => mockedSigner,
      },
    } as never,
    mockedProtobuf as never,
    clientProperties,
    {} as Metadata
  );
  const mockSpyContractExecutionRequest = jest.spyOn(
    mockedProtobuf,
    'ContractExecutionRequest'
  );
  const mockSpySetContractId = jest.spyOn(
    mockedExecuteContract,
    'setContractId'
  );
  const mockSpySetContractArgument = jest.spyOn(
    mockedExecuteContract,
    'setContractArgument'
  );
  const mockSpySetCertHolderId = jest.spyOn(
    mockedExecuteContract,
    'setCertHolderId'
  );
  const mockSpySetCertVersion = jest.spyOn(
    mockedExecuteContract,
    'setCertVersion'
  );
  const mockSpySetFunctionArgument = jest.spyOn(
    mockedExecuteContract,
    'setFunctionArgument'
  );
  const mockSpySetSignature = jest.spyOn(mockedExecuteContract, 'setSignature');
  const mockSpySign = jest.spyOn(mockedSigner, 'sign');

  const spiedSetNonce = jest.spyOn(mockedExecuteContract, 'setNonce');
  const spiedSetFunctionIdsList = jest.spyOn(
    mockedExecuteContract,
    'setFunctionIdsList'
  );

  // Act
  const response = await clientServiceBase.execute(
    mockedContractId,
    mockedArgument,
    mockedFunctionId,
    mockedFunctionArgument,
    'nonce'
  );

  // Assert
  expect(mockSpyContractExecutionRequest).toBeCalledTimes(1);
  expect(mockSpySetContractId).toBeCalledWith(mockedContractId);
  expect(mockSpySetContractArgument).toBeCalledWith(
    'V2\u0001nonce\u0003function-id\u0003{"mocked":"contact-argument"}'
  );
  expect(mockSpySetCertHolderId).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_holder_id']
  );
  expect(mockSpySetCertVersion).toBeCalledWith(
    clientProperties['scalar.dl.client.cert_version']
  );
  expect(mockSpySetSignature).toBeCalledTimes(1);
  expect(mockSpySign).toBeCalledTimes(1);
  expect(mockSpySetFunctionArgument).toBeCalledWith(mockedFunctionArgumentJson);
  expect(spiedSetNonce).toBeCalledWith('nonce');
  expect(spiedSetFunctionIdsList).toBeCalledWith(['function-id']);

  expect(response).toBeInstanceOf(ContractExecutionResult);

  const assetProof = response.getLedgerProofs()[0];
  expect(assetProof.getId()).toEqual('asset-id');
  expect(assetProof.getAge()).toEqual(1);
  expect(assetProof.getHash()).toEqual(new Uint8Array([1, 2, 3]));
  expect(assetProof.getPrevHash()).toEqual(new Uint8Array([1, 2, 3]));
  expect(assetProof.getNonce()).toEqual('nonce');
  expect(assetProof.getInput()).toEqual('input');
  expect(assetProof.getSignature()).toEqual(new Uint8Array([1, 2, 3]));
});
