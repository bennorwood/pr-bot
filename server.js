(() => {
    // simply used here
    const bodyParser = require('body-parser');

    module.exports = (Promise, config, loggingManager, slackWebhookController) => {
        return {
            start
        };

        function start() {
            return new Promise((resolve) => {
                process.env.NODE_ENV =  (process.env.NODE_ENV) ? process.env.NODE_ENV : 'dev';
    
                const express = require('express');
                const PORT = process.env.PORT || config.get('port');
    
                // Simple server with a few exposed endpoints
                const app = express();
                loggingManager.register(app);
                registerBodyParser(app);
                
                    
                slackWebhookController.register(app);
    
                console.log('Server booting in mode: ' + config.util.getEnv('NODE_ENV'));

                app.listen(PORT, () => {
                    console.log(`Listening on ${ PORT }`);
                    resolve(app);
                });
            });
        }

        function registerBodyParser(app) {
            // for parsing application/json
            app.use(bodyParser.json());

            // for parsing application/x-www-form-urlencoded
            app.use(bodyParser.urlencoded({ extended: true }));

            app.use(bodyParser.text({
                type: 'text/plain'
            }));
        }
    };

})();