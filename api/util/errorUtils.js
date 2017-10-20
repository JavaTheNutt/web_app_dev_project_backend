const Logger = require('@util/Logger')('ERROR_UTILS');
module.exports = exports = {
  /**
   * Format errors
   * @param message {string} the error message
   * @param err{Error|void} optional thrown error
   * @returns {{error: {message: string}}}
   */
  formatError(message, err){
    'use strict';
    Logger.verbose(`request made to format error`);
    const returnedError = {error:{message:message}};
    if(err){
      Logger.verbose(`error is present`);
      returnedError.error.err = err;
    }
    Logger.verbose(`error to be returned: ${JSON.stringify(returnedError)}`);
    return returnedError;
  }
};
