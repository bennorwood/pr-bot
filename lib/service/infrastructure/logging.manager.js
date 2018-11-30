(() => {
    const path = require('path');

    module.exports = (morgan, rfs, config) => {
        return {
            register
        };

        function register(app) {
            // create a rotating write stream
            const accessLogStream = rfs('access.log', {
                interval: '1d', // rotate daily
                path: path.join(__dirname, config.get('logging.path'))
            });

            // setup the logger
            app.use(morgan(config.get('logging.format'), { stream: accessLogStream }));

            // log only 4xx and 5xx responses to console
            app.use(morgan(config.get('logging.format'), {
                skip: (req, res) => res.statusCode < 400
            }));
        }
    };
})();
