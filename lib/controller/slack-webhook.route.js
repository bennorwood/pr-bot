((global) => {
    const url = require('querystring');
    const routeContext = '/slack';

    module.exports = (config, slackMessageHandlerService, cryptoService) => {
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
            return (body.text && config.get('teams.validTeams').indexOf(body.text.toLowerCase()) !== -1)
                ? body.text
                : 'platform';
        }

        function isValidRequest(req) {
            if (config.get('securityEnabled') === false) {
                return true;
            }

            const signedSecret = req.get('X-PR-BOT-Signature') || '';
            const timestamp = req.get('X-PR-BOT-Request-Timestamp');
            const prefix = 'v0';

            const payload = `${prefix}:${timestamp}:${JSON.stringify(req.body)}`;
            const expectedSignedSecret = `${prefix}=${cryptoService.signApplicationRequest(payload)}`;

            if (!cryptoService.timingSafeEquals(expectedSignedSecret, signedSecret)) {
                return false;
            }

            return true;
        }

        async function postOpenPrs(req, res) {
            // TODO: adding request token validation for some security
            if (!isValidRequest(req)) {
                sendBadSignatureErrorResponse(res);
                return;
            }

            const teamName = extractTeamname(req.body);
            // get corresponding slack incoming webhook url from config...
            const responseUrl = process.env[config.get(`teams.${teamName}.slackIncomingWebhookURL`)];
            searchForPrs(teamName, responseUrl, res);
        }

        async function getOpenPrs(req, res) {
            if (!slackMessageHandlerService.verifyRequestFromSlack(req, res)) {
                sendBadSignatureErrorResponse(res);
                return;
            }

            try {
                parseFormBody(req);
                const teamName = extractTeamname(req.body);
                const responseUrl = req.body.response_url;
                searchForPrs(teamName, responseUrl, res);
            } catch (e) {
                console.log(e);
                res.status(400);
                res.send({
                    message: 'Malformed Request',
                    e
                });
            }
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

        function sendBadSignatureErrorResponse(res) {
            const error = {
                message: 'Bad Request',
                debugMessage: 'Request signature is invalid.',
                code: 400
            };

            res.status(400);
            res.send(error);
        }
    };
})(global);
