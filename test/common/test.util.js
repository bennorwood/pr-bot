(() => {
    const container = require('../../container');
    const swapWithFakeNodeFetch = require('../mocks/node-fetch');
    const TestsCommon = require('./tests.common');

    module.exports = {
        startTestApplication,
        shutdownApplication,
        TestsCommon
    };

    swapWithFakeNodeFetch();

    function startTestApplication() {
        return Promise.resolve(container.startModule('app', { async: true }));
    }

    function shutdownApplication() {
        return Promise.resolve(container.stopAll());
    }
})();
