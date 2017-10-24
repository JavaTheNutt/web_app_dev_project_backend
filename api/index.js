/**
 * Application entry point
 * @type {*|createApplication}
 */

//This module allows me to set aliases in my package.json, to let me use absolute
// paths https://github.com/ilearnio/module-alias
require('module-alias/register');
const admin                  = require('firebase-admin');
const app                    = require('express')();
const cors                   = require('cors');
const bodyParser             = require('body-parser');
const config                 = require('../config/config');
const Logger         = require('@util/Logger')('INDEX');
const mongoose       = require('mongoose');
const authMiddleware = require('@Auth/authMiddleware');
Logger.info(`log level : ${config.logLevel}`);

//set the app to log every request
app.use(Logger.requestLogger);

//global middleware setup
app.use(bodyParser.json());
app.use(cors());

//mongoose setup
mongoose.Promise = Promise;
mongoose.connect(config.db.uri, {useMongoClient: true});
const db = mongoose.connection;
/*eslint no-console: off*/
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', () => {
    'use strict';
    Logger.info('database connection opened');
});

//set up firebase
admin.initializeApp({
    credential: admin.credential.cert(config.firebase.credential),
    databaseUrl: config.firebase.databaseUrl
});

//set flag on new user request
app.use('/user/new', authMiddleware.authenticateNew);

//App authentication for every request.
app.use(authMiddleware.authenticate);

//load routes
require('./router')(app);

//create server
const server = app.listen(config.port, () => {
    'use strict';
    Logger.info(`server started at ${server.address().address} on port ${server.address().port}`);
});

//set up error logger
app.use(Logger.errorLogger);

//default error handler
app.use((err, req, res) => {
    'use strict';
    Logger.warn('the default error handler has been invoked. An unexpected error has occurred.');
    Logger.error(`error: ${JSON.stringify(err)}`);
    res.status(500).send({error: 'an unexpected error has occurred'});
});
app.use((req, res) => {
    'use strict';
    Logger.warn('default route handler called, returning 404');
    res.status(404).send({error: 'the requested resource was not found'});
});
