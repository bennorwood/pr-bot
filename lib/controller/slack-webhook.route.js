((global) => {
    const url = require('querystring');

    module.exports = (config, slackMessageHandlerService, githubSearchService) => {
        const isTestMode = config.util.getEnv('NODE_ENV') === 'test';

        return {
            register
        };

        function register(app) {
            if(isTestMode) {
                app.get('/', testRoute);
            }

            app.post('/open-prs', getOpenPrs);
        }

        function successHandler(res, successResponse) {
            res.setHeader('Content-Type', 'application/json');
            res.send(successResponse);
        }

        function errorHandler (res, errorResponse) {
            console.log(errorResponse);
            res.status(500);
            res.send({
                debugMessage: errorResponse,
                message: 'Something went wrong.'
            });
        }

        function parseFormBody(req) {
            req.body = url.parse(req.body);
        }

        function extractTeamname(body) {
            return config.get('teams.validTeams').indexOf(body.text.toLowerCase()) !== -1 
                ? body.text
                : 'platform';
        }

        async function getOpenPrs(req, res) {
            slackMessageHandlerService.verifyRequestFromSlack(req);
            parseFormBody(req);

            const teamName = extractTeamname(req.body);
            //TODO: Could query for this directly in the future to get list of people from github instead of maintaining config
            const teamMembers = config.get(`teams.${teamName}.members`);
            const responseUrl = req.body.response_url;
            console.log(responseUrl);

            successHandler(res, slackMessageHandlerService.getImmediateResponsePayload());

            const responses = await githubSearchService.getPRsForUsers(teamMembers);

            slackMessageHandlerService.createSlackMessageFromGithubSearchResponse(teamMembers, responses)
                .then(function(payload){
                    slackMessageHandlerService.sendDelayedResponse(responseUrl, payload);
                })
                .catch(function(err){
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
    
        function testRoute(req, res) {
            const teamMembers = config.get('teams.platform.members');
            const data = [
                // pr structure atm
                { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] },
                { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] }
            ];
    
            slackMessageHandlerService.postSlackMessageFromGithubSearchResponse(teamMembers, data)
                .then(function(response){
                    successHandler(res, response);
                })
                .catch(function(err){
                    errorHandler(res, err);
                });
        }
    };
})(global);