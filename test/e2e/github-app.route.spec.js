((global) => {
    const TestUtil = require('../common/test.util');
    const { TestsCommon } = TestUtil;

    const {
        expect, request
    } = TestsCommon;

    let app = null;
    describe('POST /github/install', () => {
        global.before((done) => {
            TestUtil.startTestApplication()
                .then((appModule) => {
                    app = appModule.getApplication();
                    done();
                });
        });

        it('should succeed when POST-ing install from github.', () => {
            const req = request(app);
            return req
                .post('/github/install')
                .set('Accept', /json/)
                .set('accept-encoding', 'gzip, deflate')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((response) => {
                    expect(JSON.stringify(response.body)).toEqual('{"data":"ok"}');
                });
        });
    });
})(global);
