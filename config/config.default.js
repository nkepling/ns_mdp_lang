'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');


// Add requirejs paths
config.requirejsPaths.plotly = './node_modules/plotly.js/dist/plotly.min';
// Add/overwrite any additional settings here
// config.server.port = 8080;
// config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_my_app';

validateConfig(config);
config.plugin.allowServerExecution = true;
module.exports = config;
