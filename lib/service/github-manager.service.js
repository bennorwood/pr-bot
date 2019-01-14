(() => {
    module.exports = (githubSearchService) => {
        const FIVE_MINUTES_IN_MILLISECONDS = 320 * 1000;
        const requestCache = {};

        return {
            getPRsForUser,
            getPRsForUsers
        };

        async function getPRsForUser(teamMember) {
            if (requestCache[teamMember] && requestCache[teamMember].ttl > Date.now()) {
                return requestCache[teamMember].cachedResponse;
            }

            const response = await githubSearchService.getPRsForUser(teamMember.userid);
            requestCache[teamMember] = {
                ttl: Date.now() + FIVE_MINUTES_IN_MILLISECONDS,
                cachedResponse: response
            };

            return response;
        }

        function getPRsForUsers(teamMembers) {
            const promises = [];
            teamMembers.forEach((member) => {
                promises.push(getPRsForUser(member));
            });

            return Promise.all(promises);
        }
    };
})();
