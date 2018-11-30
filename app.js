(() => {
    // simply used here
    const bodyParser = require('body-parser');

    module.exports = (Promise, chalk, config, loggingManager, slackWebhookController) => {
        let runningServer = null;
        let runningApplication = null;

        return {
            getApplication,
            setServer,
            start,
            stop
        };

        function start() {
            return new Promise((resolve) => {
                process.env.NODE_ENV = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'dev';

                const express = require('express');

                // Simple server with a few exposed endpoints
                const app = express();
                loggingManager.register(app);
                registerBodyParser(app);

                slackWebhookController.register(app);

                console.log(`Server booting in mode: ${config.util.getEnv('NODE_ENV')}`);

                runningApplication = app;
                resolve(app);
            });
        }

        function stop() {
            // Close application client connections, then close server connections

            // No app connections atm

            if (runningServer) {
                console.log(chalk.cyan('Received kill signal, shutting down gracefully'));

                runningServer.close(() => {
                    console.log(chalk.green('Closed remaining connections'));
                    process.exit(0);
                });

                setTimeout(() => {
                    console.error(chalk.yellow('Could not close connections in time, forcefully shutting down'));
                    process.exit(1);
                }, 10000);
            }
        }

        function setServer(server) {
            runningServer = server;
        }

        function getApplication() {
            return runningApplication;
        }

        function registerBodyParser(app) {
            // for parsing application/json
            app.use(bodyParser.json());
            app.use(bodyParser.text({
                type: ['application/x-www-form-urlencoded', 'text/plain']
            }));
        }
    };
})();
