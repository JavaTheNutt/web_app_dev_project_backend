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
const _      = require('lodash');

//set the app to log every request
app.use(Logger.requestLogger);
//test route
app.get('/', (req, res, next) => {
  'use strict';
  Logger.info(`request received to application root`);
  if (!req.query || !req.query.user || _.isEmpty(req.query.user)) {
    Logger.warn(`an error has occurred, no params recieved`);
    return next(new Error('there was an error'));
  }
  Logger.info(`request has query`);
  res.status(200).send('request sent')
});
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
