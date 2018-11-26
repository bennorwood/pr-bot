(() => {

    module.exports = (config, slackMessageHandlerService) => {
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

        function getOpenPrs(req, res) {
            slackMessageHandlerService.verifyRequestFromSlack(req);

            /* const teamMembers = config.get('teams.platform.members'); */

            const data = [
                // pr structure atm
                { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] },
                { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] }
            ];
    
            slackMessageHandlerService.createSlackMessageFromGithubSearchResponse(config.get('teams.platform.members'), data)
                .then(function(response){
                    successHandler(res, response);
                })
                .catch(function(err){
                    errorHandler(res, err);
                });
        }
    
        function testRoute(req, res) {
            const data = [
                // pr structure atm
                { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] },
                { items: [ { html_url: 'https://google.com'}, {html_url: 'https://twitter.com'} ] }
            ];
    
            slackMessageHandlerService.postSlackMessageFromGithubSearchResponse(config.get('teams.platform.members'), data)
                .then(function(response){
                    successHandler(res, response);
                })
                .catch(function(err){
                    errorHandler(res, err);
                });
        }

    };
})();