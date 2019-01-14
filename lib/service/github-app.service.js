(() => {
    module.exports = (fetch, config, cryptoService) => {
        const baseApiUrl = config.get('github.apiBaseUrl');
        let jwt = null;
        let accessToken = null;

        return {
            getJWTToken,
            createHeaderForRequest,
            parseStream
        };

        async function getInstallationToken() {
            try {
                let appInstallation = null;
                if (!accessToken || Date.parse(accessToken.expires_at) < new Date().getTime()) {
                    const appInstallations = await getAppInstallations();
                    appInstallation = await findTargetInstallation(appInstallations);
                }
                return getInstallationTokenFromAppInstallation(appInstallation);
            } catch (e) {
                console.log(e);
                return false;
            }
        }

        async function getAppInstallations() {
            const apiUrl = `${baseApiUrl}/app/installations`;
            const requestOptions = await getRequestOptions({});

            return fetch(apiUrl, requestOptions).then(parseStream);
        }

        async function getInstallationTokenFromAppInstallation(installation) {
            if (installation) {
                const accessTokenUrl = installation.access_tokens_url;
                const requestOptions = await getRequestOptions({ method: 'POST' });

                accessToken = await fetch(accessTokenUrl, requestOptions).then(parseStream);
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

        async function getRequestOptions(params) {
            const headers = await createHeaderForRequest('bearer');

            return Object.assign({
                method: 'GET',
                headers
            }, params);
        }

        async function createHeaderForRequest(mode) {
            const authHeaderValue = await getAuthorizationHeader(mode);
            return {
                Authorization: authHeaderValue,
                Accept: 'application/vnd.github.machine-man-preview+json',
                Connection: 'close',
                'Content-Type': 'application/json',
                'User-Agent': config.get('appName')
            };
        }

        function getAuthorizationHeader(mode) {
            return Promise.resolve(getAuthorizationsMethods()[mode]());
        }

        function getAuthorizationsMethods() {
            const authorizationMethods = {
                basic: () => `Basic ${Buffer.from([retrieveUsername(), retrieveToken()].join(':')).toString('base64')}`,
                bearer: () => `Bearer ${getJWTToken()}`,
                token: async () => {
                    await getInstallationToken();
                    return `Token ${accessToken.token}`;
                }
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
                    parsedResponse.headers = response.headers;
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
