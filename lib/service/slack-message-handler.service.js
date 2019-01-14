((global) => {
    module.exports = (fetch, config, cryptoService, githubSearchService, githubManagerService) => {
        const colors = config.get('colors');
        const colorsLength = colors.length;
        const baseGithubUrl = 'https://github.com';

        return {
            searchForPrs,
            createSlackMessageFromGithubSearchResponse,
            verifyRequestFromSlack,
            getImmediateResponsePayload,
            sendDelayedResponse
        };

        async function searchForPrs(teamName) {
            // TODO: Could query for this directly in the future to get list of people from github instead of maintaining config
            const teamMembers = config.get(`teams.${teamName}.members`);

            const responses = await githubManagerService.getPRsForUsers(teamMembers);
            return createSlackMessageFromGithubSearchResponse(teamMembers, responses);
        }

        function extractAssigneeAvatarUrl(items) {
            let avatarUrl = null;

            for (let index = 0; index < items.length && !avatarUrl; index++) {
                const item = items[index];
                if (item.assignee) {
                    avatarUrl = avatarUrl || item.assignee.avatar_url;
                }
            }

            return avatarUrl;
        }

        function createFieldsListFromGithubItems(items) {
            const maxFieldDisplay = config.get('maxPRDisplay');
            const fields = [];

            for (let index = 0; index < maxFieldDisplay && index < items.length; index++) {
                const item = items[index];
                fields.push({
                    value: item.html_url,
                    short: false,
                });
            }

            return fields;
        }

        function createAttachment(githubUserPRData, member, color) {
            const attachment = {
                color,
                title: `${member.userid}'s open PRs`,
                author_name: member.fullname,
                author_link: `${baseGithubUrl}/${member.userid}`,
                title_link: githubSearchService.getGithubUIPRQueryURL(baseGithubUrl, member.userid)
            };

            attachment.author_icon = extractAssigneeAvatarUrl(githubUserPRData.items);
            attachment.fields = createFieldsListFromGithubItems(githubUserPRData.items);
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
            return fetch(responseUrl, {
                method: 'POST',
                body: global.JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        function createSlackMessageFromGithubSearchResponse(teamMembers, githubSearchData) {
            const lastResponseHeaders = githubSearchData[githubSearchData.length - 1].headers;
            const response = {
                response_type: 'in_channel',
                text: 'Open Pull Requests (PRs)',
                attachments: []
            };

            githubSearchData.forEach((userPrData, i) => {
                const member = teamMembers[i];
                const color = colors[i % colorsLength];

                if (userPrData.items && userPrData.items.length > 0) {
                    response.attachments.push(createAttachment(userPrData, member, color));
                }
            });

            if (response.attachments.length < 1) {
                setNoPrMessage(response);
            }

            response.attachments.push(getFooterAttachment(lastResponseHeaders));
            return Promise.resolve(response);
        }

        function getFooterAttachment(headers) {
            return {
                text: '',
                ts: headers.get('X-RateLimit-Reset'),
                footer: `PR Bot | Remaining Rate Limit: ${headers.get('X-RateLimit-Remaining')}`,
                footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png'
            };
        }

        function verifyRequestFromSlack(req) {
            const signedSecret = req.get('X-Slack-Signature') || '';
            const payload = extractPayloadToSign(req);
            const expectedSignedSecret = getPrefix() + cryptoService.signSlackRequest(payload);

            if (!cryptoService.timingSafeEquals(expectedSignedSecret, signedSecret)) {
                return false;
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
            const { body } = req;

            const payload = [version, timestamp, body].join(':');

            return payload;
        }
    };
})(global);
