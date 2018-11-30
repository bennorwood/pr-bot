(() => {
    const container = require('../../container');
    const expect = require('expect');
    const request = require('supertest');
    const BotInteractionHelper = require('../helpers/slack-bot-interaction-handshake.helper.js');
    const TestConstants = require('./test.constants');


    const config = container.get('config');
    const chalk = container.get('chalk');

    module.exports = {
        BotInteractionHelper,
        chalk,
        config,
        container,
        expect,
        request,
        TestConstants
    };
})();
