/**
 * This module represents the authentication middleware that will be called on a per request basis
 * @module auth/middleware
 *
 */
const Logger      = require('@util/Logger')('AUTH_MIDDLEWARE');
const authService = require('@Auth/service/authService');
const errorUtils  = require('@util/errorUtils');
module.exports    = exports = {
  /**
   * The middleware that will capture requests for new users and add a flag to the requests
   * @param req {Object} the request
   * @param res {Object} the response
   * @param next {Function} the next callback
   * @memberOf module:auth/middleware
   */
  authenticateNew(req, res, next) {
    'use strict';
    Logger.info('middleware called for new user route');
    req.isNewUser = true;
    next();
  },
  /**
   * Main application authentication middleware that will be called on every request
   * @param req {Object} the request
   * @param res {Object} the response
   * @param next {Function} the next callback
   * @memberOf module:auth/middleware
   */
  async authenticate(req, res, next) {
    'use strict';
    Logger.info('authentication middleware invoked');
    Logger.info(`is request for new user? ${req.isNewUser ? 'yes' : 'no'}`);
    if (!req || !req.headers || !req.headers.authorization) {
      Logger.warn('there is data missing from the request');
      return res.status(401).send(errorUtils.formatError('authentication failed'));
    }
    Logger.verbose('required data is present');
    const decodedToken = await authService.validateToken(req.headers.authorization.substring(req.headers.authorization.indexOf('Bearer=') + 'Bearer='.length).trim());
    if (decodedToken.error) {
      Logger.warn('returned token has errors');
      return res.status(401).send(errorUtils.formatError('authentication failed'));
    }
    Logger.verbose('token is assumed valid');
    Logger.verbose(`decoded token: ${JSON.stringify(decodedToken)}`);
    const customUserAuth = await authService.handleClaimValidation(decodedToken, req.isNewUser);
    Logger.verbose(`claims returned: ${JSON.stringify(customUserAuth)}`);
    if (!req.body) {
      Logger.info('request does not contain a body, creating body');
      req.body = {};
    }
    req.body.customAuthUser = customUserAuth;
    return next();
  }
};


