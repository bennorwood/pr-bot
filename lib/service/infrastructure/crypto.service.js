(() => {
    const crypto = require('crypto');

    module.exports = (config) => {
        return {
            signSlackRequest
        };

        function signSlackRequest(payload) {
            const hmac = crypto.createHmac('sha256', getSlackPrivateKey());
            hmac.update(payload);

            return hmac.digest('hex');
        }

        function getSlackPrivateKey() {
            return process.env[config.get('slack.SIGNING_SECRET')];
        }
    };
})();
