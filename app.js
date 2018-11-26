const container = require('./container');

container.startModule('server', { async: true })
    .then(function(/* app */){
        console.log('Web app started successfully.');
    })
    .catch(function(err) {
        console.log(err);
    });