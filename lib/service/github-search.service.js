((global) => {
    module.exports = (fetch, config, cryptoService) => {
        const baseApiUrl = config.get('github.apiBaseUrl');
        let jwt = null;
        return {
            getPRsForUser,
            getPRsForUsers,
            getGithubUIPRQueryURL
        };

        function getPRsForUsers(users) {
            const promises = [];

            users.forEach((user) => {
                promises.push(getPRsForUser(user.userid));
            });

            return Promise.all(promises);
        }

        function getPRsForUser(user) {
            return fetch(fetchUrl(user), getRequestOptions({})).then(parseResponse)
                .catch((responseErr) => {
                    console.log('JWT token may have expired. Retrying the request...', responseErr);
                    getJWTToken(true);

                    return fetch(fetchUrl(user), getRequestOptions({})).then(parseResponse);
                });
        }

        function parseResponse(response) {
            let parsedResponse = [];
            return new Promise((resolve, reject) => {
                response.body.on('data', (chunk) => {
                    parsedResponse.push(chunk);
                });

                response.body.on('end', () => {
                    parsedResponse = global.JSON.parse(parsedResponse.join(''));
                    resolve(parsedResponse);
                });

                response.body.on('error', (err) => {
                    reject(err);
                });
            });
        }

        function getRequestOptions(params) {
            return Object.assign({
                method: 'GET',
                headers: createHeaderForRequest()
            }, params);
        }

        function retrieveToken() {
            return process.env[config.get('github.OATH_TOKEN_NAME')];
        }

        function retrieveUsername() {
            return process.env[config.get('github.USERNAME')];
        }

        function fetchUrl(user) {
            return getGithubAPIPRQueryURL(baseApiUrl, user);
        }

        function createHeaderForRequest() {
            return {
                Authorization: generateBearerAuthenticationToken(),
                Connection: 'close',
                'Content-Type': 'application/json'
            };
        }

        function generateBasicAuthenticationToken() {
            return [
                'Basic',
                Buffer.from([retrieveUsername(), retrieveToken()].join(':')).toString('base64')
            ].join(' ');
        }

        function getJWTToken(shouldCreateNewToken = false) {
            jwt = (shouldCreateNewToken || !jwt) ? cryptoService.generateGithubJWT() : jwt;
        }

        function generateBearerAuthenticationToken() {
            return [
                'Bearer',
                getJWTToken()
            ].join(' ');
        }

        function getGithubUIPRQueryURL(baseUrl, username) {
            return [
                baseUrl,
                '/pulls?utf8=✓',
                '&', getQueryParameter(username)
            ].join('');
        }

        function getQueryParameter(username) {
            return `q=${[
                global.encodeURIComponent('is:open'),
                global.encodeURIComponent('is:pr'),
                global.encodeURIComponent('archived:false'),
                global.encodeURIComponent('user:WaitrInc'),
                global.encodeURIComponent(`author:${username}`)
            ].join('+')}`;
        }

        function getGithubAPIPRQueryURL(baseUrl, username) {
            return [
                baseUrl,
                '/search/issues',
                '?', getQueryParameter(username)
            ].join('');
        }
    };
})(global);
