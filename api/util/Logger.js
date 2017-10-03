/**
 * This module is used to configure Winston for logging in the application
 * It will write to files while in development, but just the console in production
 * It will also export request and error loggers for express.
 */

const winston        = require('winston');
const config         = require('../../config/config');
const expressWinston = require('express-winston');
//create console logger regardless of environment
const Logger         = new (winston.Logger)({
  transports: [new (winston.transports.Console)({
    colorize: true,
    prettyPrint: true
  })]
});

if (config.env !== 'production') {
  //if development mode, log verbosely to files ...
  Logger.level = 'verbose';
  Logger.add(winston.transports.File, {
    name: 'debug-log',
    filename: './log/server_debug_log.log',
    level: 'verbose',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    timestamp: true,
    json: false
  });
  Logger.add(winston.transports.File, {
    name: 'error-log',
    filename: './log/server_error_log.log',
    level: 'error',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    timestamp: true,
    json: false
  })
} else {
  //... if production, no file logging and only errors in console
  Logger.level = 'error';
}
/*These two logger instances must be exported, so that they can be added before and after the routes */
const expressLogger = new (expressWinston.logger)({
  winstonInstance: Logger
});
const expressErrorLogger = new (expressWinston.errorLogger)({
  winstonInstance: Logger
});

// export logger as a function so that a module name can be passed when instantiating logger
module.exports = function (moduleName) {
  'use strict';
  moduleName = moduleName || 'UNSPECIFIED_MODULE'; //handle undefined module name
  return {
    error(text) {
      Logger.error(`${moduleName}: ${text}`)
    },
    info(text) {
      Logger.info(`${moduleName}: ${text}`)
    },
    warn(text) {
      Logger.warn(`${moduleName}: ${text}`)
    },
    verbose(text) {
      Logger.verbose(`${moduleName}: ${text}`)
    },
    requestLogger: expressLogger,
    errorLogger: expressErrorLogger
  }
};
