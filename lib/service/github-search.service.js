(() => {
    module.exports = (fetch, config) => {
        return {
            getPRsForUser
        };

        function getPRsForUser(user) {
            return fetch(fetchUrl(user), getRequestOptions({})).then(parseResponse);
        }
    
        function parseResponse() {
            //debugger;
        }
    
        function getRequestOptions(params) {
            return Object.assign({
                headers: createHeaderForRequest()
            }, params);
        }
    
        function retrieveToken() {
            return process.env[config.get('github.GITHUB_OATH_TOKEN_NAME')];
        }
    
        function fetchUrl(user) {
            return `https://api.github.com/search/issues?q=+author:${user}+is:open+type:pr`;
        }
    
        function createHeaderForRequest() {
            return new fetch.Headers({
                Authorization: `Basic ${retrieveToken()}`,
                Connection: 'close',
                'Accept-Encoding': 'gzip,deflate',
                'Content-Type': 'application/json'
            });
        }
    };
})();