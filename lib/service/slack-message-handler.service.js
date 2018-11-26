((global) =>{
    module.exports = (fetch, config, cryptoService) => {
        
        const colors = config.get('colors');
        const colorsLength = colors.length;
        const slackWebhookUrl = process.env[config.get('github.slackWebHookURL')];
        const baseGithubUrl = 'https://github.com';

        return {
            postSlackMessageFromGithubSearchResponse,
            createSlackMessageFromGithubSearchResponse,
            verifyRequestFromSlack
        };

        function getGithubPRQueryURL(username) {
            return [
                baseGithubUrl,
                '/pulls?utf8=✓',
                '&q=' + [
                    global.encodeURIComponent('is:open'),
                    global.encodeURIComponent('is:pr'),
                    global.encodeURIComponent('archived:false'),
                    global.encodeURIComponent('user:WaitrInc'),
                    global.encodeURIComponent(`author:${username}`)
                ].join('+')
            ].join('');
        }
    
        function postSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData) {
            return createSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData)
                .then(function(response){
                    return fetch(slackWebhookUrl, {
                        method: 'POST',
                        body:    global.JSON.stringify(response),
                        headers: { 'Content-Type': 'application/json' },
                    });
                });
        }
    
        function createSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData) {
            const response = {
                response_type: 'in_channel',
                text: 'Open Pull Requests (PRs)',
                attachments: []
            };
    
            githubSearchData.forEach((prs, i) => {
                const member = teamMembers[i];
    
                response.attachments.push({
                    color: colors[i % colorsLength],
                    author_name: member.fullname,
                    author_link: baseGithubUrl + `/${member.userid}`,
                    title: `${member.userid}'s open PRs`,
                    title_link: getGithubPRQueryURL(member.userid),
                    fields: prs.items.map(item => {
                        return {
                            value: item.html_url,
                            short: false,
                        };
                    }),
                });
            });
    
            return Promise.resolve(response);
        }

        function verifyRequestFromSlack(req) {
            const signedSecret = req.get('X-Slack-Signature');
            const payload = extractPayloadToSign(req);
            const expectedSignedSecret = getPrefix() + cryptoService.signSlackRequest(payload);

            console.log(payload, signedSecret, expectedSignedSecret);
            if(expectedSignedSecret !== signedSecret) {
                throw 'Signatures do not match! Request is not from slack.';
            }

            return true;
        }

        function getPrefix() {
            return [
                config.get('slack.version'),
                '='
            ].join('');
        }

        function extractPayloadToSign(req) {
            const version = config.get('slack.version');
            const timestamp = req.get('X-Slack-Request-Timestamp');
            const body = req.body;
            
            const payload = [version, timestamp, body].join(':');

            return payload;
        }
    };

})(global);