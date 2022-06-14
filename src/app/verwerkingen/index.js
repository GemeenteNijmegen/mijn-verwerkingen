const { ApiClient } = require('./ApiClient');
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
    };
}

exports.handler = async (event, context) => {
    try {
        const params = parseEvent(event);
        await initPromise;
        return await verwerkingenRequestHandler(params.cookies, apiClient, dynamoDBClient);
    
    } catch (err) {
        console.debug(err);
        response = {
            'statusCode': 500
        }
        return response;
    }
};