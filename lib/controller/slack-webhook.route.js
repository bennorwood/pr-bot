(() => {

    const path = require('path');
    const config = require('config');
    const fetch = require('node-fetch');

    const isTestMode = config.util.getEnv('NODE_ENV') === 'test';
    const slackResponseHandler = require(path.join('../service', 'slack.response.handler.service'));



    module.exports = function(app) {
        if(isTestMode) {
            app.get('/', (req, res) => {
                const slackWebhookUrl = process.env[config.get('github.slackWebHookURL')];
                const data = [
                    // pr structure atm
                    { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] }
                ];

                fetch(slackWebhookUrl, {
                    method: 'POST',
                    body:    JSON.stringify(slackResponseHandler.createResponse(data)),
                    headers: { 'Content-Type': 'application/json' },
                }).then((slackResponse) => {
                    //slackResponse.json();
                    res.setHeader('Content-Type', 'application/json');
                    res.send(slackResponse);
                }).catch((err) => {
                    console.log(err);
                });
            });
        }
    };
})();