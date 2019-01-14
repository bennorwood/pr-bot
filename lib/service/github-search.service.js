((global) => {
    module.exports = (fetch, config, githubAppService) => {
        const baseApiUrl = config.get('github.apiBaseUrl');

        return {
            getPRsForUser,
            getGithubUIPRQueryURL
        };

        async function getPRsForUser(user) {
            const requestOptions = await getRequestOptions({});

            return fetch(fetchUrl(user), requestOptions).then(parseResponse)
                .catch(async (responseErr) => {
                    console.log('Token may have expired. Retrying the request...', responseErr);
                    githubAppService.getJWTToken(true);

                    return fetch(fetchUrl(user), requestOptions).then(parseResponse);
                });
        }

        function parseResponse(response) {
            return githubAppService.parseStream(response);
        }

        async function getRequestOptions(params) {
            const authMode = config.get('github.authMode');
            const headers = await githubAppService.createHeaderForRequest(authMode);

            return Object.assign({
                method: 'GET',
                headers
            }, params);
        }

        function fetchUrl(user) {
            return getGithubAPIPRQueryURL(baseApiUrl, user);
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
