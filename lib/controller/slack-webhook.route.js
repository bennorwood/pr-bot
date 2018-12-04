((global) => {
    const url = require('querystring');
    const routeContext = '/slack';

    module.exports = (config, slackMessageHandlerService) => {
        return {
            register
        };

        function register(app) {
            app.post(`${routeContext}/open-prs`, postOpenPrs);
            app.post(`${routeContext}/command/open-prs`, getOpenPrs);
        }

        function successHandler(res, successResponse) {
            res.setHeader('Content-Type', 'application/json');
            res.send(successResponse);
        }

        function parseFormBody(req) {
            req.body = url.parse(req.body);
        }

        function extractTeamname(body) {
            return config.get('teams.validTeams').indexOf(body.text.toLowerCase()) !== -1
                ? body.text
                : 'platform';
        }

        async function postOpenPrs(req, res) {
            // TODO: adding request token validation for some security
            const teamName = extractTeamname(req.body);
            // get corresponding slack incoming webhook url from config...
            const responseUrl = process.env[config.get(`teams.${teamName}.slackIncomingWebhookURL`)];
            searchForPrs(teamName, responseUrl, res);
        }

        async function getOpenPrs(req, res, next) {
            const isValidRequestFromSlack = slackMessageHandlerService.verifyRequestFromSlack(req, res);
            if (!isValidRequestFromSlack) {
                next();
                return;
            }

            parseFormBody(req);
            const teamName = extractTeamname(req.body);
            const responseUrl = req.body.response_url;
            searchForPrs(teamName, responseUrl, res);
        }

        async function searchForPrs(teamName, responseUrl, res) {
            successHandler(res, slackMessageHandlerService.getImmediateResponsePayload());

            slackMessageHandlerService.searchForPrs(teamName)
                .then((payload) => {
                    slackMessageHandlerService.sendDelayedResponse(responseUrl, payload);
                })
                .catch((err) => {
                    const payload = {
                        response_type: 'ephemeral',
                        text: [
                            'Sorry, that didn\'t work. Please try again. Response: ',
                            global.JSON.stringify(err)
                        ].join('')
                    };
                    slackMessageHandlerService.sendDelayedResponse(responseUrl, payload);
                });
        }
    };
})(global);
