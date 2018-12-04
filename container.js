(() => {
    const path = require('path');
    const container = require('kontainer-di');

    /* ************************************************************************************************
     * 3rd Party Dependencies
     * *********************************************************************************************** */
    container.register('Promise', [], () => Promise);

    const chalk = require('chalk');
    container.register('chalk', [], () => chalk);

    const rfs = require('rotating-file-stream');
    container.register('rotating-file-stream', [], () => rfs);

    const morgan = require('morgan');
    container.register('morgan', [], () => morgan);

    const fetch = require('node-fetch');
    fetch.Promise = Promise;
    container.register('node-fetch', [], () => fetch);

    const config = require('config');
    container.register('config', [], config);

    const jwt = require('jsonwebtoken');
    container.register('jsonwebtoken', [], () => jwt);

    /* ************************************************************************************************
     * Services/Controllers
     * *********************************************************************************************** */
    const loggingManager = require(path.join(__dirname, 'lib/service/infrastructure', 'logging.manager'));
    container.register('loggingManager', ['morgan', 'rotating-file-stream', 'config'], loggingManager);

    const cryptoService = require(path.join(__dirname, 'lib/service/infrastructure', 'crypto.service'));
    container.register('cryptoService', ['config', 'jsonwebtoken'], cryptoService);

    const slackMessageHandlerService = require(path.join(__dirname, 'lib/service', 'slack-message-handler.service'));
    container.register('slackMessageHandlerService', ['node-fetch', 'config', 'cryptoService', 'githubSearchService'], slackMessageHandlerService);

    const githubSearchService = require(path.join(__dirname, 'lib/service', 'github-search.service'));
    container.register('githubSearchService', ['node-fetch', 'config', 'cryptoService'], githubSearchService);

    const slackWebhookController = require(path.join(__dirname, 'lib/controller', 'slack-webhook.route'));
    container.register('slackWebhookController', ['config', 'slackMessageHandlerService'], slackWebhookController);

    /* ************************************************************************************************
     * Server
     * *********************************************************************************************** */
    const appModule = require('./app');
    container.register('app', ['Promise', 'chalk', 'config', 'loggingManager', 'slackWebhookController'], appModule);

    function shutdown() {
        return Promise.resolve(container.stopAll());
    }

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    module.exports = container;
})();
