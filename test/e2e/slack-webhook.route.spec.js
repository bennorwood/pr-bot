((global) => {
    const TestUtil = require('../common/test.util');
    const { TestsCommon } = TestUtil;

    const {
        config, expect, request,
        BotInteractionHelper
    } = TestsCommon;

    let app = null;
    global.describe('POST /slack/command/open-prs', () => {
        global.before((done) => {
            TestUtil.startTestApplication()
                .then((appModule) => {
                    app = appModule.getApplication();
                    done();
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
                .post('/slack/command/open-prs')
                .type('form')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400)
                .then((response) => {
                    expect(response.body.code).toBe(400);
                    expect(response.body.message).toBe('Bad Request');
                    expect(response.body.debugMessage).toBe('Request signature is invalid.');
                });
        });

        it('should succeed when POST is from slack.', () => {
            const req = request(app);
            return req
                .post('/slack/command/open-prs')
                .type('form')
                .send(process.env[config.get('tests.test_slack_payload')])
                .set('Accept', /json/)
                .set('accept-encoding', 'gzip, deflate')
                .set('x-slack-signature', process.env[config.get('tests.test_slack_signature')])
                .set('x-slack-request-timestamp', 1543273102)
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body.response_type).toBe('in_channel');
                    expect(response.body.text).toBe('Querying Github, one moment please... ⌛');
                    return BotInteractionHelper.waitForDelayedResponse();
                });
        });
    });

    global.describe('POST /slack/open-prs', () => {
        global.before((done) => {
            TestUtil.startTestApplication()
                .then((appModule) => {
                    app = appModule.getApplication();
                    done();
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

        it('should fail when POST is not signed correctly.', () => {
            const req = request(app);
            return req
                .post('/slack/open-prs')
                .send({ text: 'platform' })
                .set('Accept', /json/)
                .set('accept-encoding', 'gzip, deflate')
                .expect('Content-Type', /json/)
                .expect(400)
                .then((response) => {
                    expect(response.body.code).toBe(400);
                    expect(response.body.message).toBe('Bad Request');
                    expect(response.body.debugMessage).toBe('Request signature is invalid.');
                });
        });

        it('should succeed when POST is signed correctly.', () => {
            const req = request(app);
            return req
                .post('/slack/open-prs')
                .send({})
                .set('Accept', /json/)
                .set('accept-encoding', 'gzip, deflate')
                .set('x-pr-bot-signature', process.env[config.get('tests.test_app_signature')])
                .set('x-pr-bot-request-timestamp', 1544563840)
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(response.body.response_type).toBe('in_channel');
                    expect(response.body.text).toBe('Querying Github, one moment please... ⌛');
                    return BotInteractionHelper.waitForDelayedResponse();
                });
        });
    });
})(global);

