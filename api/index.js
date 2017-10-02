const express = require('express');
const config = require('../config/config');
const Logger = require('./util/Logger')('INDEX');
const _ = require('lodash');

const app = express();

app.use(Logger.requestLogger);
app.get('/', (req, res, next)=>{
  'use strict';
  Logger.info(`request received to application root`);
  if(!req.query || !req.query.user || _.isEmpty(req.query.user)){
    Logger.warn(`an error has occurred, no params recieved`);
    return next(new Error('there was an error'));
  }
  Logger.info(`request has query`);
  res.status(200).send('request sent')
});

const server = app.listen(config.port, ()=>{
  'use strict';
  Logger.info(`server started at ${server.address().address} on port ${server.address().port}`);
});
app.use(Logger.errorLogger);
app.use((err, req, res, next)=>{
  'use strict';
  res.status(500).send('there was an error here');
});
