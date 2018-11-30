((global) => {
    const url = require('querystring');
    const routeContext = '/slack';

    module.exports = (config, slackMessageHandlerService, githubSearchService) => {
        return {
            register
        };

        function register(app) {
            app.post(`${routeContext}/open-prs`, getOpenPrs);
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

        async function getOpenPrs(req, res, next) {
            const isValidRequestFromSlack = slackMessageHandlerService.verifyRequestFromSlack(req, res);
            if (!isValidRequestFromSlack) {
                next();
                return;
            }
            parseFormBody(req);

            const teamName = extractTeamname(req.body);
            // TODO: Could query for this directly in the future to get list of people from github instead of maintaining config
            const teamMembers = config.get(`teams.${teamName}.members`);
            const responseUrl = req.body.response_url;

            successHandler(res, slackMessageHandlerService.getImmediateResponsePayload());

            const responses = await githubSearchService.getPRsForUsers(teamMembers);

            slackMessageHandlerService.createSlackMessageFromGithubSearchResponse(teamMembers, responses)
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
