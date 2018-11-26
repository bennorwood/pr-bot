(() => {

    module.exports = (config, slackMessageHandlerService) => {
        const isTestMode = config.util.getEnv('NODE_ENV') === 'test';

        return {
            register
        }

        function register(app) {
            if(isTestMode) {
                app.get('/', testRoute);
            }
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
                    errorHandler(res, errr);
                });
        }

    }
})();