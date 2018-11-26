(() => {

    const path = require('path');
    const container = require('kontainer-di');

    /*************************************************************************************************
     * 3rd Party Dependencies
     *************************************************************************************************/
    container.register('Promise', [], function () {
        return Promise;
    });

    const rfs = require('rotating-file-stream');
    container.register('rotating-file-stream', [], function(){
        return rfs;
    });

    const morgan = require('morgan');
    container.register('morgan', [], function(){
        return morgan;
    });

    const fetch = require('node-fetch');
    fetch.Promise = Promise;
    container.register('fetch', [], function(){
        return fetch;
    });

    const config = require('config');
    container.register('config', [], config);

    /*************************************************************************************************
     * Services/Controllers
     *************************************************************************************************/
    const loggingManager = require(path.join(__dirname, 'lib/service/infrastructure', 'logging.manager'));
    container.register('loggingManager', ['morgan', 'rotating-file-stream', 'config'], loggingManager);

    const cryptoService = require(path.join(__dirname, 'lib/service/infrastructure', 'crypto.service'));
    container.register('cryptoService', ['config'], cryptoService);

    const slackMessageHandlerService = require(path.join(__dirname, 'lib/service', 'slack-message-handler.service'));
    container.register('slackMessageHandlerService', ['fetch', 'config', 'cryptoService'], slackMessageHandlerService);

    const githubSearchService = require(path.join(__dirname, 'lib/service', 'github-search.service'));
    container.register('githubSearchService', ['fetch', 'config'], githubSearchService);

    const slackWebhookController = require(path.join(__dirname, 'lib/controller', 'slack-webhook.route'));
    container.register('slackWebhookController', ['config', 'slackMessageHandlerService'], slackWebhookController);

    /*************************************************************************************************
     * Server
     *************************************************************************************************/
    const appModule = require('./server');
    container.register('server', ['Promise', 'config', 'loggingManager', 'slackWebhookController'], appModule);


    module.exports = container;
})();