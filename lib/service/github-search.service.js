((global) => {
    module.exports = (fetch, config, githubAppService) => {
        const baseApiUrl = config.get('github.apiBaseUrl');

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
                    console.log('Token may have expired. Retrying the request...', responseErr);
                    githubAppService.getJWTToken(true);

                    return fetch(fetchUrl(user), getRequestOptions({})).then(parseResponse);
                });
        }

        function parseResponse(response) {
            return githubAppService.parseStream(response);
        }

        function getRequestOptions(params) {
            return Object.assign({
                method: 'GET',
                headers: githubAppService.createHeaderForRequest('token')
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
