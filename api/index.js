/**
 * Application entry point
 * @type {*|createApplication}
 */

//This module allows me to set aliases in my package.json, to let me use absolute
// paths https://github.com/ilearnio/module-alias
require('module-alias/register');
const app    = require('express')();
const config = require('../config/config');
const Logger = require('@util/Logger')('INDEX');

Logger.info(`log level : ${config.logLevel}`);

//set the app to log every request
app.use(Logger.requestLogger);

//load routes
require('./routes')(app);

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
