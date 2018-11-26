(() => {
    const crypto = require('crypto');

    module.exports = (config) => {
        const hmac = crypto.createHmac('sha256', getSlackPrivateKey());

        return {
            signSlackRequest
        };

        function signSlackRequest(payload) {
            hmac.update(payload);

            return hmac.digest('hex');
        }

        function getSlackPrivateKey() {
            return process.env[config.get('slack.SIGNING_SECRET')];
        }
    };
})();