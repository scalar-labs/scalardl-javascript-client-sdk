import {ClientServiceBase} from '../../../common/client_service_base';
import {Callback, Metadata} from '../../../common/scalar.proto';
import {LedgerValidationResult} from '../../../common/ledger_validation_result';

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

describe('validateLedger', () => {
  test('should throw an error when startAge is not valid', async () => {
    // Arrange
    const clientServiceBase = new ClientServiceBase(
      {} as never, // service
      {} as never, // protobuf
      clientProperties, // properties
      {} as Metadata
    );

    // Act & Assert
    await expect(
      clientServiceBase.validateLedger('whatever', -1, 3)
    ).rejects.toThrowError();
  });

  test('should throw an error when endAge is not valid', async () => {
    // Arrange
    const clientServiceBase = new ClientServiceBase(
      {} as never, // service
      {} as never, // protobuf
      clientProperties,
      {} as Metadata
    );

    // Act & Assert
    await expect(
      clientServiceBase.validateLedger('whatever', 0, 100000000000000000)
    ).rejects.toThrowError();
  });

  test('should throw an error when endAge is inferior to startAge', async () => {
    // Arrange
    const clientServiceBase = new ClientServiceBase(
      {} as never, // service
      {} as never, // protobuf
      clientProperties,
      {} as Metadata
    );

    // Act & Assert
    await expect(
      clientServiceBase.validateLedger('whatever', 3, 2)
    ).rejects.toThrowError();
  });

  const mockedAssetId = 'contractId';

  test('should work as expected', async () => {
    // Arrange
    const mockedValidateLedger = {
      setAssetId: function () {},
      setStartAge: function () {},
      setEndAge: function () {},
      setCertHolderId: function () {},
      setCertVersion: function () {},
      setSignature: function () {},
    };
    const mockedProtobuf = {
      LedgerValidationRequest: function () {
        return mockedValidateLedger;
      },
    };
    const mockedSigner = {
      sign: function () {},
    };
    const clientServiceBase = new ClientServiceBase(
      {
        ledgerClient: {
          validateLedger: (_: never, __: never, callback: Callback) => {
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
              getStatusCode: () => 0,
              getProof: () => mockProof,
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
    const mockSpyLedgerValidationRequest = jest.spyOn(
      mockedProtobuf,
      'LedgerValidationRequest'
    );
    const mockSpySetAssetId = jest.spyOn(mockedValidateLedger, 'setAssetId');
    const mockSpySetCertHolderId = jest.spyOn(
      mockedValidateLedger,
      'setCertHolderId'
    );
    const mockSpySetCertVersion = jest.spyOn(
      mockedValidateLedger,
      'setCertVersion'
    );
    const mockSpySetSignature = jest.spyOn(
      mockedValidateLedger,
      'setSignature'
    );
    const mockSpySign = jest.spyOn(mockedSigner, 'sign');

    // Act
    const response = await clientServiceBase.validateLedger(mockedAssetId);

    // Assert
    expect(mockSpyLedgerValidationRequest).toBeCalledTimes(1);
    expect(mockSpySetAssetId).toBeCalledWith(mockedAssetId);
    expect(mockSpySetCertHolderId).toBeCalledWith(
      clientProperties['scalar.dl.client.cert_holder_id']
    );
    expect(mockSpySetCertVersion).toBeCalledWith(
      clientProperties['scalar.dl.client.cert_version']
    );
    expect(mockSpySetSignature).toBeCalledTimes(1);
    expect(mockSpySign).toBeCalledTimes(1);
    expect(response).toBeInstanceOf(LedgerValidationResult);

    const assetProof = response.getProof()!;
    expect(assetProof.getId()).toEqual('asset-id');
    expect(assetProof.getAge()).toEqual(1);
    expect(assetProof.getHash()).toEqual(new Uint8Array([1, 2, 3]));
    expect(assetProof.getPrevHash()).toEqual(new Uint8Array([1, 2, 3]));
    expect(assetProof.getNonce()).toEqual('nonce');
    expect(assetProof.getInput()).toEqual('input');
    expect(assetProof.getSignature()).toEqual(new Uint8Array([1, 2, 3]));
  });
});

describe('validateLedger linearizably', () => {
  test('should work as expected', async () => {
    // Arrange
    const mockedSigner = {
      sign: function () {},
    };

    const spiedSetContractArgument = jest.fn();

    const mockedProtobuf = {
      ContractExecutionRequest: () => ({
        setContractId: function () {},
        setContractArgument: spiedSetContractArgument,
        setCertHolderId: function () {},
        setCertVersion: function () {},
        setFunctionArgument: function () {},
        setSignature: function () {},
        setAuditorSignature: function () {},
        setUseFunctionIds: function () {},
        setFunctionIdsList: function () {},
        setNonce: function () {},
      }),
      ExecutionValidationRequest: () => ({
        setRequest: function () {},
        setProofsList: function () {},
      }),
    };

    const mockedLedgerClient = {
      executeContract: (_: never, __: never, callback: Callback) => {
        callback(null, {
          getContractResult: () => '',
          getFunctionResult: () => '',
          getProofsList: () => [
            {
              getAssetId: () => 'foo',
              getAge: () => 1,
              getHash_asU8: () => new Uint8Array([0, 0, 0]),
              getPrevHash_asU8: () => new Uint8Array([0, 0, 0]),
              getNonce: () => 'nonce',
              getInput: () => 'input',
              getSignature_asU8: () => new Uint8Array([1, 2, 3]),
            },
          ],
        });
      },
    };

    const mockedAuditorClient = {
      orderExecution: (_: never, __: never, callback: Callback) => {
        callback(null, {
          getSignature: () => null,
        });
      },
      validateExecution: (_: never, __: never, callback: Callback) => {
        callback(null, {
          getContractResult: () => '',
          getFunctionResult: () => '',
          getProofsList: () => [
            {
              getAssetId: () => 'foo',
              getAge: () => 1,
              getHash_asU8: () => new Uint8Array([0, 0, 0]),
              getPrevHash_asU8: () => new Uint8Array([0, 0, 0]),
              getNonce: () => 'nonce',
              getInput: () => 'input',
              getSignature_asU8: () => new Uint8Array([1, 2, 3]),
            },
          ],
        });
      },
    };

    const clientServiceBase = new ClientServiceBase(
      {
        ledgerClient: mockedLedgerClient,
        auditorClient: mockedAuditorClient,
        signerFactory: {
          create: () => mockedSigner,
        },
      } as never,
      mockedProtobuf as never,
      {
        ...clientProperties,
        'scalar.dl.client.auditor.enabled': true,
      },
      {} as Metadata
    );

    const spiedContractExecutionRequest = jest.spyOn(
      mockedProtobuf,
      'ContractExecutionRequest'
    );

    const spiedExecuteContract = jest.spyOn(
      mockedLedgerClient,
      'executeContract'
    );

    const spiedOrderExecution = jest.spyOn(
      mockedAuditorClient,
      'orderExecution'
    );

    const spiedValidateExecution = jest.spyOn(
      mockedAuditorClient,
      'validateExecution'
    );

    const spiedExecutionValidationRequest = jest.spyOn(
      mockedProtobuf,
      'ExecutionValidationRequest'
    );

    const spiedSign = jest.spyOn(mockedSigner, 'sign');

    // Act
    const response = await clientServiceBase.validateLedger('foo');

    // Assert
    expect(spiedContractExecutionRequest).toBeCalledTimes(1);
    expect(spiedExecutionValidationRequest).toBeCalledTimes(1);
    expect(spiedExecuteContract).toBeCalledTimes(1);
    expect(spiedOrderExecution).toBeCalledTimes(1);
    expect(spiedValidateExecution).toBeCalledTimes(1);
    expect(spiedSign).toBeCalledTimes(1);

    expect(spiedSetContractArgument).toBeCalledWith(
      expect.stringContaining('start_age')
    );
    expect(spiedSetContractArgument).toBeCalledWith(
      expect.stringContaining('end_age')
    );

    expect(response).toBeInstanceOf(LedgerValidationResult);

    const ledgerProof = response.getProof();
    const auditorProof = response.getAuditorProof();

    expect(ledgerProof).not.toBeNull();
    expect(ledgerProof!.getId()).toEqual('foo');
    expect(ledgerProof!.getAge()).toEqual(1);
    expect(ledgerProof!.getHash()).toEqual(new Uint8Array([0, 0, 0]));
    expect(ledgerProof!.getPrevHash()).toEqual(new Uint8Array([0, 0, 0]));
    expect(ledgerProof!.getNonce()).toEqual('nonce');
    expect(ledgerProof!.getSignature()).toEqual(new Uint8Array([1, 2, 3]));

    expect(auditorProof).not.toBeNull();
    expect(auditorProof!.getId()).toEqual('foo');
    expect(auditorProof!.getAge()).toEqual(1);
    expect(auditorProof!.getHash()).toEqual(new Uint8Array([0, 0, 0]));
    expect(auditorProof!.getPrevHash()).toEqual(new Uint8Array([0, 0, 0]));
    expect(auditorProof!.getNonce()).toEqual('nonce');
    expect(auditorProof!.getSignature()).toEqual(new Uint8Array([1, 2, 3]));
  });
});
