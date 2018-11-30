(() => {
    module.exports = new Promise((resolve, reject) => {
        const container = require('./container');

        const chalk = container.get('chalk');
        const config = container.get('config');
        const PORT = process.env.PORT || config.get('port');

        /**
         * This separation is necessary so that we can start the app
         * in the tests without binding to a port.
         */
        container.startModule('app', { async: true })
            .then((appModule) => {
                const server = appModule.getApplication().listen(PORT, () => {
                    console.log(`Listening on ${PORT}`);
                    console.log('Web app started successfully.');
                });

                appModule.setServer(server);
                resolve(appModule);
            })
            .catch((err) => {
                console.log(chalk.red('Application failed tp boot: '), err);
                reject(err);
            });
    });
})();
