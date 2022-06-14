const { render } = require('./shared/render');
const { BrpApi } = require('./BrpApi');
const { Session } = require('@gemeentenijmegen/session');


function redirectResponse(location, code = 302) {
    return {
        'statusCode': code,
        'body': '',
        'headers': { 
            'Location': location
        }
    }
}

exports.verwerkingenRequestHandler = async (cookies, apiClient, dynamoDBClient) => {
    if(!cookies || !apiClient || !dynamoDBClient) { throw new Error('all handler params are required'); }
    console.time('request');
    console.timeLog('request', 'start request');
    console.timeLog('request', 'finished init');
    let session = new Session(cookies, dynamoDBClient);
    await session.init();
    console.timeLog('request', 'init session');
    if (session.isLoggedIn() == true) {
        // Get API data
        const response = await handleLoggedinRequest(session, apiClient);
        console.timeEnd('request');
        return response;
    }
    console.timeEnd('request');
    return redirectResponse('/login');
}

async function handleLoggedinRequest(session, apiClient) {
    console.timeLog('request', 'Api Client init');
    const bsn = session.getValue('bsn');
    const brpApi = new BrpApi(apiClient);
    console.timeLog('request', 'Brp Api');

    const brpData = await brpApi.getBrpData(bsn);
    const data = brpData;
    data.volledigenaam = brpData?.Persoon?.Persoonsgegevens?.Naam ? brpData.Persoon.Persoonsgegevens.Naam : 'Onbekende gebruiker';

    data.title = 'Verwerkte persoonsgegevens';
    data.shownav = true;
    // render page
    const html = await render(data, __dirname + '/templates/verwerkingen.mustache', {
        'header': __dirname + '/shared/header.mustache',
        'footer': __dirname + '/shared/footer.mustache',
    });
    response = {
        'statusCode': 200,
        'body': html,
        'headers': {
            'Content-type': 'text/html'
        }
    };
    return response;
}

