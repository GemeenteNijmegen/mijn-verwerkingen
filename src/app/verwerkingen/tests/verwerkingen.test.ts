import * as fs from 'fs';
import * as path from 'path';
import { DynamoDBClient, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { SecretsManagerClient, GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import { ApiClient } from '@gemeentenijmegen/apiclient';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockClient } from 'jest-aws-client-mock';
import * as Dotenv from 'dotenv';
import { verwerkingenRequestHandler } from '../verwerkingenRequestHandler';



beforeAll(() => {
  global.console.log = jest.fn();
  Dotenv.config();

  if (process.env.VERBOSETESTS!='True') {
    global.console.error = jest.fn();
    global.console.time = jest.fn();
    global.console.log = jest.fn();
  }
  // Set env variables
  process.env.SESSION_TABLE = 'mijnnijmegen-sessions';
  process.env.AUTH_URL_BASE = 'https://authenticatie-accp.nijmegen.nl';
  process.env.APPLICATION_URL_BASE = 'https://testing.example.com/';
  process.env.CLIENT_SECRET_ARN = '123';
  process.env.OIDC_CLIENT_ID = '1234';
  process.env.OIDC_SCOPE = 'openid';

  process.env.MTLS_PRIVATE_KEY_ARN = 'testarn';
  process.env.VERWERKINGEN_API_KEY_NAME = 'testarn';

  const secretsOutput: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'test',
  };
  secretsMock.mockImplementation(() => secretsOutput);
  const ssmOutput: GetParameterCommandOutput = {
    $metadata: {},
    Parameter: {
      Value: 'test',
    },
  };

  secretsMock.mockImplementation(() => secretsOutput);
  parameterStoreMock.mockImplementation(() => ssmOutput);
});


const ddbMock = mockClient(DynamoDBClient);
const secretsMock = mockClient(SecretsManagerClient);
const axiosMock = new MockAdapter(axios);
const parameterStoreMock = mockClient(SSMClient);

beforeEach(() => {
  ddbMock.mockReset();
  secretsMock.mockReset();
  axiosMock.reset();
  const getItemOutput: Partial<GetItemCommandOutput> = {
    Item: {
      data: {
        M: {
          loggedin: { BOOL: true },
          bsn: { S: '900026236' },
        },
      },
    },
  };
  ddbMock.mockImplementation(() => getItemOutput);
});

describe('Requests', () => {

  test('Show overview page', async () => {
    const output: GetSecretValueCommandOutput = {
      $metadata: {},
      SecretString: 'ditiseennepgeheim',
    };
    secretsMock.mockImplementation(() => output);
    const file = 'verwerkingen.json';
    const filePath = path.join('responses', file);
    const returnData = await getStringFromFilePath(filePath)
      .then((data: any) => {
        return JSON.parse(data);
      });
    axiosMock.onGet().reply(200, returnData);
    const client = new ApiClient();
    const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1' });
    const result = await verwerkingenRequestHandler('session=12345', client, dynamoDBClient);
    expect(result.body).toMatch('Verwerkte persoonsgegevens');
    fs.writeFile(path.join(__dirname, 'output', 'test.html'), result.body, () => {});
  });

 
  test('Show actual results', async () => {
    // console.debug(process.env);
    axiosMock.restore();
    if (!process.env.API_TOKEN) {
      console.debug('This test will not run in CI');
      return;
    }

    const output: GetSecretValueCommandOutput = {
      $metadata: {},
      SecretString: process.env.API_TOKEN ?? 'nepgeheim',
    };
    secretsMock.mockImplementation(() => output);
    const client = new ApiClient();
    const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1' });
    const result = await verwerkingenRequestHandler('session=12345', client, dynamoDBClient);
    expect(result.body).toMatch('Verwerkte persoonsgegevens');
    fs.writeFile(path.join(__dirname, 'output', 'test-real.html'), result.body, () => {});
  });
});

async function getStringFromFilePath(filePath: string) {
  return new Promise((res, rej) => {
    fs.readFile(path.join(__dirname, filePath), (err, data) => {
      if (err) {return rej(err);}
      return res(data.toString());
    });
  });
}