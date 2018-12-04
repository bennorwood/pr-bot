(() => {
    module.exports = (config) => {
        const CONFIG_CONSTANTS = {
            DEFAULT_VALUE: '<Specify Environment Variable>'
        };

        const FAKE_WEBHOOK_URL = 'https://fakeurl.com/slack/delayed-response-webhook-mock';
        const SLACK_PLATFORM_WEHOOK = process.env[config.get('teams.platform.slackIncomingWebhookURL')];

        const NODE_FETCH_CAUGHT_REQUESTS = [
            FAKE_WEBHOOK_URL,
            SLACK_PLATFORM_WEHOOK
        ];

        return {
            CONFIG_CONSTANTS,
            FAKE_WEBHOOK_URL,
            SLACK_PLATFORM_WEHOOK,
            NODE_FETCH_CAUGHT_REQUESTS
        };
    };
})();
