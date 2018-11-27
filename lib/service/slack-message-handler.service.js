((global) =>{
    module.exports = (fetch, config, cryptoService, githubSearchService) => {
        
        const colors = config.get('colors');
        const colorsLength = colors.length;
        const slackWebhookUrl = process.env[config.get('slack.slackWebHookURL')];
        const baseGithubUrl = 'https://github.com';

        return {
            postSlackMessageFromGithubSearchResponse,
            createSlackMessageFromGithubSearchResponse,
            verifyRequestFromSlack,
            getImmediateResponsePayload,
            sendDelayedResponse
        };

        
    
        async function postSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData) {
            const response = await createSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData);
            return await fetch(slackWebhookUrl, {
                method: 'POST',
                body:    global.JSON.stringify(response),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        function createFieldsListFromGithubItems(items, attachment) {
            const maxFieldDisplay = config.get('maxPRDisplay');
            const fields = [];
            let avatarUrl = null;

            for(let index = 0; index < maxFieldDisplay && index < items.length; index++) {
                let item = items[index];
                avatarUrl = avatarUrl || item.assignee.avatar_url;
                
                fields.push({
                    value: item.html_url,
                    short: false,
                });
            }

            // if the assignee was set on one of the PRs, lets use the image url of the assignee
            attachment.author_icon = avatarUrl;

            return fields;
        }

        function createAttachment(githubUserPRData, member, color) {
            const attachment = {
                color: color,
                title: `${member.userid}'s open PRs`,
                author_name: member.fullname,
                author_link: baseGithubUrl + `/${member.userid}`,
                title_link: githubSearchService.getGithubUIPRQueryURL(baseGithubUrl, member.userid)
            };

            attachment.fields = createFieldsListFromGithubItems(githubUserPRData.items, attachment);
            return attachment;
        }

        function setNoPrMessage(response) {
            return global.Object.assign(response, {
                response_type: 'in_channel',
                text: 'There are no Open PRs to review',
                attachments: null
            });
        }

        function getImmediateResponsePayload() {
            return {
                response_type: 'in_channel',
                text: 'Querying Github, one moment please... ⌛'
            };
        }

        async function sendDelayedResponse(responseUrl, payload) {
            return await fetch(responseUrl, {
                method: 'POST',
                body:    global.JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
        }
    
        function createSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData) {
            const response = {
                response_type: 'in_channel',
                text: 'Open Pull Requests (PRs)',
                attachments: []
            };

            githubSearchData.forEach((userPrData, i) => {
                const member = teamMembers[i];
                const color = colors[i % colorsLength];

                if(userPrData.items && userPrData.items.length > 0) {
                    response.attachments.push(createAttachment(userPrData, member, color));
                }
            });

            if(response.attachments.length < 1){
                setNoPrMessage(response);
            }
    
            return Promise.resolve(response);
        }

        function verifyRequestFromSlack(req) {
            const signedSecret = req.get('X-Slack-Signature');
            const payload = extractPayloadToSign(req);
            const expectedSignedSecret = getPrefix() + cryptoService.signSlackRequest(payload);

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