((global) => {
    const TestUtil = require('../common/test.util');
    const { TestsCommon } = TestUtil;

    const {
        config, expect, request,
        BotInteractionHelper
    } = TestsCommon;

    let app = null;
    describe('POST /slack/open-prs', () => {
        global.before(() => {
            TestUtil.startTestApplication()
                .then((appModule) => {
                    app = appModule.getApplication();
                });
        });

        global.after(() => {
            TestUtil.shutdownApplication();
            if (BotInteractionHelper.hasPendingResponse()) {
                const err = {
                    message: 'Has pending response in test suite.'
                };
                throw err;
            }
        });

        it('should fail to respond when POST is not from slack.', () => {
            const req = request(app);
            return req
                .post('/slack/open-prs')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400)
                .then((response) => {
                    expect(response.body.code).toBe(400);
                    expect(response.body.message).toBe('Bad Request');
                    expect(response.body.debugMessage).toBe('Request is not from slack.');
                });
        });

        it('should succeed when POST is from slack.', () => {
            const req = request(app);
            return req
                .post('/slack/open-prs')
                .type('form')
                .send(process.env[config.get('slack.test_payload')])
                .set('Accept', /json/)
                .set('accept-encoding', 'gzip, deflate')
                .set('x-slack-signature', process.env[config.get('slack.test_signature')])
                .set('x-slack-request-timestamp', 1543273102)
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body.response_type).toBe('in_channel');
                    expect(response.body.text).toBe('Querying Github, one moment please... ⌛');
                    return BotInteractionHelper.waitForDelayedResponse();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    });
})(global);

