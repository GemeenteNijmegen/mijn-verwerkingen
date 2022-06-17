const  axios  = require('axios');
const { Bsn } = require('@gemeentenijmegen/utils');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

class VerwerkingenApi {
    constructor() {
        axios.defaults.baseURL = process.env.BASE_URL;
        this.apikey = process.env.API_TOKEN ?? undefined;
    }

    /**
     * Retrieve api key from secrets manager
     *
     * @returns string apikey
     */
     async getApiKey() {
        if (!this.apikey) {
        if (!process.env.VERWERKINGEN_API_KEY_ARN) {
                throw new Error('no secret arn provided');
            }
            const secretsManagerClient = new SecretsManagerClient({});
            const command = new GetSecretValueCommand({ SecretId: process.env.VERWERKINGEN_API_KEY_ARN });
            const data = await secretsManagerClient.send(command);
            // Depending on whether the secret is a string or binary, one of these fields will be populated.
            if (data === null || data === void 0 ? void 0 : data.SecretString) {
                this.apikey = data.SecretString;
            }
            else {
                throw new Error('No secret value found');
            }
        }
        return this.apikey;
    }

    async getData(bsn, startdate, enddate) {
        try {
            const aBsn = new Bsn(bsn);
            const apiKey = await this.getApiKey();
            let data = await this.request(
            {  
                'objecttype': 'persoon',
                'soortObjectId': 'BSN',
                'objectId': aBsn.bsn,
                'beginDatum': startdate,
                'eindDatum': enddate 
            }, 
            {
                'Content-type': 'application/json',
                'X-Api-Key': apiKey
            });
            
            if (data?.Items) {
                data.Items = data.Items.map((item) => {
                    let date = new Date(item.tijdstipRegistratie);
                    item.tijdstipRegistratie = date.toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
                    item.bewaartermijn = `${item.bewaartermijn.trim().substring(1, item.bewaartermijn.length-1)} jaar`;
                    return item;
                });
                return data;
            } else {
                throw new Error('Er konden geen verwerkingen opgehaald worden.');
            }
        } catch (error) {
            console.debug(error);
            const data = {
                'error': error.message
            }
            return data;
        }
    }

    async request(params, headers) {
        try {
            const response = await axios.get('verwerkingsacties', { 
                params,
                headers,
                timeout: 2000,
            });
            console.timeEnd('request to verwerkingsacties');
            console.debug(params, response.data);
            return response.data;
        } catch (error) {
            console.debug(error);
            console.timeEnd('request to verwerkingsacties');
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log('http status for verwerkingsacties' + ': ' + error.response.status);

                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.error(error?.code);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error(error.message);
                }
            } else {
                console.error(error.message);
            }
        }
    }
}

exports.VerwerkingenApi = VerwerkingenApi;