(() => {
    process.env.NODE_ENV =  (process.env.NODE_ENV) ? process.env.NODE_ENV : 'dev';
    
    const path = require('path');
    const config = require('config');
    const express = require('express');
    const PORT = process.env.PORT || config.get('port');

    // Simple server with a few exposed endpoints
    const app = express();

    // Add Routes
    const routeFiles = [
        'slack-webhook.route'
    ];

    routeFiles.forEach(function(filename){
        const routeBootstrapper = require(path.join(__dirname, 'lib/controller', filename));

        routeBootstrapper(app);
    });

    console.log('Server booted in mode: ' + config.util.getEnv('NODE_ENV'));
    app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

})();