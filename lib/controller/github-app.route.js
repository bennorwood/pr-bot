(() => {
    const routeContext = '/github';

    module.exports = () => {
        return {
            register
        };

        function register(app) {
            app.post(`${routeContext}/install`, installApp);
        }

        function installApp(req, res) {
            console.log(req.body);
            res.send({
                data: 'ok'
            });
        }
    };
})();
