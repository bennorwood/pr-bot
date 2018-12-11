(() => {
    const crypto = require('crypto');

    module.exports = (config, jwt) => {
        return {
            signSlackRequest,
            generateGithubJWT,
            timingSafeEquals,
            signApplicationRequest
        };

        function timingSafeEquals(a, b) {
            // timingSafeEqual will prevent any timing attacks. Arguments must be buffers
            const generatedHash = Buffer.from(a, 'utf-8');
            const providedHash = Buffer.from(b, 'utf-8');

            let hashEquals = false;
            try {
                // timingSafeEqual will return an error if the input buffers are not the same length.
                hashEquals = crypto.timingSafeEqual(generatedHash, providedHash);
            } catch (e) {
                hashEquals = false;
            }

            return hashEquals;
        }

        function signSlackRequest(payload) {
            const hmac = crypto.createHmac('sha256', getSlackPrivateKey());
            return signPayload(hmac, payload);
        }

        function signApplicationRequest(payload) {
            const hmac = crypto.createHmac('sha256', getPRBotPrivateKey());
            return signPayload(hmac, payload);
        }

        function signPayload(hmac, payload) {
            hmac.update(payload);
            return hmac.digest('hex');
        }

        function getPRBotPrivateKey() {
            return process.env[config.get('SIGNING_SECRET')];
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
