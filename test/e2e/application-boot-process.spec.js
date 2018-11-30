(() => {
    const TestUtil = require('../common/test.util');
    const { TestsCommon } = TestUtil;

    const {
        config, expect,
        TestConstants
    } = TestsCommon;

    describe('Required Application Environment Config: ', () => {
        it('should have required environment variables defined.', () => {
            expect(config.get('github.OATH_TOKEN_NAME')).toNotEqual(TestConstants.CONFIG_CONSTANTS.DEFAULT_VALUE);
            expect(config.get('github.USERNAME')).toNotEqual(TestConstants.CONFIG_CONSTANTS.DEFAULT_VALUE);
            expect(config.get('slack.SIGNING_SECRET')).toNotEqual(TestConstants.CONFIG_CONSTANTS.DEFAULT_VALUE);
            expect(config.get('slack.test_signature')).toNotEqual(TestConstants.CONFIG_CONSTANTS.DEFAULT_VALUE);
            expect(config.get('slack.test_payload')).toNotEqual(TestConstants.CONFIG_CONSTANTS.DEFAULT_VALUE);

            expect(process.env[config.get('github.OATH_TOKEN_NAME')]).toExist();
            expect(process.env[config.get('github.USERNAME')]).toExist();
            expect(process.env[config.get('slack.SIGNING_SECRET')]).toExist();
            expect(process.env[config.get('slack.test_signature')]).toExist();
            expect(process.env[config.get('slack.test_payload')]).toExist();
        });
    });

    describe('Application (not server): ', () => {
        it('should start successfully.', () => {
            let appModule = null;

            return TestUtil.startTestApplication()
                .then((app) => {
                    appModule = app;
                    expect(appModule.getApplication()).toExist();
                })
                .then(TestUtil.shutdownApplication);
        });
    });
})();

