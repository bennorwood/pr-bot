(() => {
    const container = require('../../container');
    const expect = require('expect');
    const request = require('supertest');
    const BotInteractionHelper = require('../helpers/slack-bot-interaction-handshake.helper.js');

    const config = container.get('config');
    const chalk = container.get('chalk');

    const TestConstants = require('./test.constants')(config);

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
