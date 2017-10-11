/**
 * Application entry point
 * @type {*|createApplication}
 */

//This module allows me to set aliases in my package.json, to let me use absolute
// paths https://github.com/ilearnio/module-alias
require('module-alias/register');
const admin                  = require('firebase-admin');
const app                    = require('express')();
const bodyParser             = require('body-parser');
const config                 = require('../config/config');
const firebaseServiceAccount = require('../config/firebaseServiceKey.json'); //not included in repo, needs to be
                                                                             // created on clone
const Logger                 = require('@util/Logger')('INDEX');
const mongoose               = require('mongoose');
const authService = require('@Auth/authService');
Logger.info(`log level : ${config.logLevel}`);

//set the app to log every request
app.use(Logger.requestLogger);

//global middleware setup
app.use(bodyParser.json());

//mongoose setup
mongoose.Promise = Promise;
mongoose.connect(config.db.uri, {useMongoClient: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', () => {
  'use strict';
  Logger.info(`database connection opened`);
});

//set up firebase
admin.initializeApp({
  credential: admin.credential.cert(config.firebase.credential),
  databaseUrl: config.firebase.databaseUrl
});

//App authentication for every request.
app.use(async (req, res, next)=>{
  Logger.info(`testing auth token`);
  const authResult = await authService.authenticate();
  if(!authResult){
    Logger.warn(`authentication request was unsuccessful`);
    return res.status(401).send('authentication was unsuccessful');
  }
  if(!req.body){
    Logger.verbose('request had no body, creating body as empty object');
    req.body = {}
  }
  req.body.customAuthUser = auth;
  Logger.verbose(`authentication succeeded, proceeding`);
  return next();
});
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
app.use((err, req, res, next) => {
  'use strict';
  res.status(500).send('there was an error here');
});
