(() => {
    const crypto = require('crypto');

    module.exports = (config, jwt) => {
        return {
            signSlackRequest,
            generateGithubJWT
        };

        function signSlackRequest(payload) {
            const hmac = crypto.createHmac('sha256', getSlackPrivateKey());
            hmac.update(payload);

            return hmac.digest('hex');
        }

        function getSlackPrivateKey() {
            return process.env[config.get('slack.SIGNING_SECRET')];
        }

        function generateGithubJWT() {
            return jwt.sign(getGithubJWTPayload(), getGithubKey(), getJWTOptions());
        }

        function getJWTOptions() {
            return {
                algorithm: 'RS256',
                expiresIn: (10 * 60),
                mutatePayload: true
            };
        }

        function getGithubJWTPayload() {
            return {
                iss: getGithubAppId()
            };
        }

        function getGithubKey() {
            return process.env[config.get('github.APP_KEY')];
        }

        function getGithubAppId() {
            return process.env[config.get('github.APP_ID')];
        }
    };
})();
