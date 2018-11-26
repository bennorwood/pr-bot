(() =>{
    const config = require('config');
    const colors = config.get('colors');

    module.exports = {
        createResponse
    };

    function createResponse(githubSearchData) {
        const response = {
            response_type: 'in_channel',
            text: 'Open Pull Requests (PRs)',
            attachments: []
        };

        githubSearchData.forEach((prs, i) => {
            response.attachments.push({
                color: colors[i],
                author_name: 'Ben Norwood',
                author_link: 'https://github.com/bennorwood',
                title: 'bennorwood\'s open PRs',
                title_link: 'https://github.com/pulls?utf8=✓&q=is%3Aopen+is%3Apr+archived%3Afalse+author%3Abennorwood',
                fields: prs.items.map(item => {
                    return {
                        value: item.html_url,
                        short: false,
                    };
                }),
            });
        });

        return response;
    }
})();