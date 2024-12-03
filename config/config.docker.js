var config = require('./config.default'), // We will only augment the default config.
    validateConfig = require('webgme/config/validator');

config.authentication.enable = false;
// 1. The token keys live outside of the container. (Only needed if authentication is turned on.)
// config.authentication.jwt.privateKey = '/dockershare/keys/EXAMPLE_PRIVATE_KEY';
// config.authentication.jwt.publicKey = '/dockershare/keys/EXAMPLE_PUBLIC_KEY';

// 2. Blob files should be put outside..
config.blob.fsDir = '/dockershare/blob-local-storage';

// This is the exposed port from the docker container.
config.server.port = 8888;

// This gets the right address of the linked mongo container N.B. container must be named mongo
config.mongo.uri = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT + '/multi';

validateConfig(config);
module.exports = config;