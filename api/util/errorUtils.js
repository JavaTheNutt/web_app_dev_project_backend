const Logger   = require('@util/Logger')('ERROR_UTILS');
module.exports = exports = {
    /**
     * Format errors
     * @param message {string} the error message
     * @param err{Error|undefined} optional thrown error
     * @returns {{error: {message: string}}}
     */
    formatError(message, err) {
        'use strict';
        Logger.verbose('request made to format error');
        const returnedError = {error: {message}};
        if (err) {
            Logger.verbose('error is present');
            returnedError.error.err = err;
        }
        Logger.verbose(`error to be returned: ${JSON.stringify(returnedError)}`);
        return returnedError;
    },
    updateErrorMessage(msg, err) {
        'use strict';
        Logger.info('request made to update an error message');
        Logger.verbose(`attempting to add ${msg} to ${JSON.stringify(err)}`);
        return exports.formatError(msg, err.error.err);
    },
    /**
     * Format error to be sent to the client
     * @param message {string} custom error message
     * @param err {Error|void}
     * @returns {{error: {message: string}}}
     */
    formatSendableError(message, err) {
        'use strict';
        Logger.verbose('request made to format error to be sent to user');
        const returnedError = {error: {message}};
        if (err) {
            Logger.verbose('error is present');
            returnedError.error.message += `: ${err.message}`;
        }
        Logger.verbose(`returned error: ${JSON.stringify(returnedError)}`);
        return returnedError;
    },
    /**
     *
     * @param errorObj
     * @returns {*|{error: {message: string}}}
     */
    formatSendableErrorFromObject(errorObj) {
        'use strict';
        Logger.verbose('request made to format sendable error from object');
        Logger.verbose(`error: ${JSON.stringify(errorObj)}`);
        return exports.formatSendableError(errorObj.error.message, errorObj.error.err);
    }
};
