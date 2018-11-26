(() => {

    const path = require('path');
    const config = require('config');
    const fetch = require('node-fetch');

    const isTestMode = config.util.getEnv('NODE_ENV') === 'test';
    const colors = config.get('colors');
    const githubSearchSerivce = require(path.join('../service', 'github.search.service'));

    
    //const colors = ['#81d2e0', '#49c4a1'];
    function createResponse(data) {
        const response = {
            response_type: 'in_channel',
            text: 'Open Pull Requests (PRs)',
            attachments: []
        };

        data.forEach((prs, i) => {
            response.attachments.push({
                color: colors[i],
                author_name: 'Ben Norwood',
                author_link: 'https://github.com/bennorwood',
                title: 'bennorwood\'s open PRs',
                title_link: 'https://github.com/pulls?utf8=✓&q=is%3Aopen+is%3Apr+archived%3Afalse+author%3Abennorwood',
                fields: prs.items.map(item => {
                    return {
                        value: item.html_url,
                        short: false,
                    }
                }),
            });
        });

        return response;
    }

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
                    body:    JSON.stringify(createResponse(data)),
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(slackResponse => {
                    //slackResponse.json();
                    res.setHeader('Content-Type', 'application/json');
                    res.send(slackResponse);
                }).catch(err => {
                    console.log(err);
                });
            });
        }

        app.post('/open-prs', (req, res) => {
            
        })
    }
})();