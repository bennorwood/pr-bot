(() => {
    const fetch = require('node-fetch');
    const TestsCommon = require('../common/tests.common');

    const {
        BotInteractionHelper, chalk, container,
        expect,
        TestConstants
    } = TestsCommon;

    async function manualOverride(responseUrl, options) {
        console.log('  -> fake-node-fetch: ', chalk.yellow(responseUrl));
        // hijack delayed response requests during tests
        return (TestConstants.NODE_FETCH_CAUGHT_REQUESTS.indexOf(responseUrl) !== -1) ?
            recieveResponse(responseUrl, options) :
            fetch(responseUrl, options);
    }

    function recieveResponse(responseUrl, options) {
        console.log('  -> fake-node-fetch (Request Caught!): Asserting things about request...');
        assertionMethods[responseUrl](options);
        BotInteractionHelper.finishDelayedResponse('recieved');
    }

    const assertionMethods = {
        [TestConstants.FAKE_WEBHOOK_URL]: (options) => {
            assertSlackResponsePayload(options);
        },
        [TestConstants.SLACK_PLATFORM_WEHOOK]: (options) => {
            assertSlackResponsePayload(options);
        }
    };

    function assertSlackResponsePayload(options) {
        const body = JSON.parse(options.body);
        expect(options.method).toBe('POST');
        expect(body.response_type).toBe('in_channel');

        if (body.attachments && body.attachments.length > 0) {
            expect(body.text).toBe('Open Pull Requests (PRs)');
            body.attachments.forEach((attachment) => {
                expect(attachment.color).toExist();
                expect(attachment.title).toExist();
                expect(attachment.author_name).toExist();
                expect(attachment.author_link).toExist();
                expect(attachment.title_link).toExist();
                attachment.fields.forEach((field) => {
                    expect(field.value).toExist();
                });
            });
        } else {
            expect(body.text).toBe('There are no Open PRs to review');
            expect(body.attachments).toEqual(null);
        }
    }

    function swapWithFakeNodeFetch() {
        console.log(chalk.cyan('Swapping node-fetch dependency...'));
        // Swap real redis with fake redis
        container.swapModule('node-fetch', [], () => manualOverride);
    }

    module.exports = swapWithFakeNodeFetch;
})();
