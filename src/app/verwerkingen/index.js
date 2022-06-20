const { ApiClient } = require('@gemeentenijmegen/apiclient');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { verwerkingenRequestHandler } = require("./verwerkingenRequestHandler");

const dynamoDBClient = new DynamoDBClient();
const apiClient = new ApiClient();

async function init() {
    let promise = apiClient.init();
    return promise;
}

const initPromise = init();

function parseEvent(event) {
    return { 
        'cookies': event?.cookies?.join(';'),
        'startdate': event?.queryStringParameters?.['date-start'] ?? new Date().toISOString(),
        'enddate': event?.queryStringParameters?.['date-end'] ?? new Date().toISOString()
    };
}

exports.handler = async (event, context) => {
    try {
        console.debug(event);
        const params = parseEvent(event);
        console.debug(params);
        await initPromise;
        return await verwerkingenRequestHandler(params.cookies, { startdate: params.startdate, enddate: params.enddate }, apiClient, dynamoDBClient);
    
    } catch (err) {
        console.debug(err);
        response = {
            'statusCode': 500
        }
        return response;
    }
};