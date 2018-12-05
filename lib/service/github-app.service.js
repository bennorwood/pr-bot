(() => {
    module.exports = (fetch, config, cryptoService) => {
        const baseApiUrl = config.get('github.apiBaseUrl');
        let jwt = null;
        let accessToken = null;

        return {
            getRequestOptions,
            getJWTToken,
            createHeaderForRequest,
            parseStream
        };

        async function getInstallationToken() {
            try {
                let appInstallation = null;
                if (!accessToken || accessToken.expires_at < new Date()) {
                    const appInstallations = await getAppInstallations();
                    appInstallation = await findTargetInstallation(appInstallations);
                }
                return getInstallationTokenFromAppInstallation(appInstallation);
            } catch (e) {
                debugger;
                console.log(e);
                return false;
            }
        }

        function getAppInstallations() {
            const apiUrl = `${baseApiUrl}/app/installations`;

            return fetch(apiUrl, getRequestOptions({})).then(parseStream);
        }

        async function getInstallationTokenFromAppInstallation(installation) {
            if (installation) {
                const accessTokenUrl = installation.access_tokens_url;

                accessToken = await fetch(accessTokenUrl, getRequestOptions({ method: 'POST' })).then(parseStream);
                console.log('Token acquired! ', accessToken);
            }

            return accessToken.token;
        }

        function findTargetInstallation(installations) {
            const targetAppInstallAccount = config.get('github.accountInstallation');
            if (installations && !installations.message) {
                for (let index = 0; index < installations.length; index++) {
                    if (installations[index].id === targetAppInstallAccount) {
                        return installations[index];
                    }
                }
            } else if (installations.message) {
                throw installations;
            }

            return false;
        }

        function getRequestOptions(params) {
            return Object.assign({
                method: 'GET',
                headers: createHeaderForRequest('bearer')
            }, params);
        }

        function createHeaderForRequest(mode) {
            return {
                Authorization: getAuthorizationHeader(mode),
                Accept: 'application/vnd.github.machine-man-preview+json',
                Connection: 'close',
                'Content-Type': 'application/json',
                'User-Agent': config.get('appName')
            };
        }

        function getAuthorizationHeader(mode) {
            return getAuthorizationsMethods()[mode]();
        }

        function getAuthorizationsMethods() {
            const authorizationMethods = {
                basic: () => [
                    'Basic',
                    Buffer.from([retrieveUsername(), retrieveToken()].join(':')).toString('base64')
                ].join(' '),
                bearer: () => [
                    'Bearer',
                    getJWTToken()
                ].join(' '),
                token: () => [
                    'Token',
                    getInstallationToken()
                ].join(' ')
            };

            return authorizationMethods;
        }

        function parseStream(response) {
            return new Promise((resolve, reject) => {
                let parsedResponse = [];
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

        function getJWTToken(shouldCreateNewToken = false) {
            jwt = (shouldCreateNewToken || !jwt) ? cryptoService.generateGithubJWT() : jwt;

            return jwt;
        }

        function retrieveToken() {
            return process.env[config.get('github.OATH_TOKEN_NAME')];
        }

        function retrieveUsername() {
            return process.env[config.get('github.USERNAME')];
        }
    };
})();
