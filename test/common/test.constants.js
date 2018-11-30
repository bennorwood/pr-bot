(() => {
    const CONFIG_CONSTANTS = {
        DEFAULT_VALUE: '<Specify Environment Variable>'
    };

    const FAKE_WEBHOOK_URL = 'https://fakeurl.com/slack/delayed-response-webhook-mock';

    const NODE_FETCH_CAUGHT_REQUESTS = [
        FAKE_WEBHOOK_URL
    ];

    module.exports = {
        CONFIG_CONSTANTS,
        FAKE_WEBHOOK_URL,
        NODE_FETCH_CAUGHT_REQUESTS
    };
})();
