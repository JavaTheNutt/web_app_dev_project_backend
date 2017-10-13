const admin    = require('firebase-admin');
const Logger   = require('@util/Logger')('AUTH_SERVICE');
const UserAuth = require('@Auth/models/UserAuth').model;
module.exports = {
  async authenticate(req, res, next) {
    'use strict';
    Logger.info(`authentication middleware invoked`);
    if (!req || !req.headers || !req.headers.token) {
      Logger.warn(`there is data missing from the request`);
      return res.status(401).send('authentication failed');
    }
    Logger.verbose(`required data is present`);
    const decodedToken = await this.validateToken(req.headers.token);
    if (!decodedToken) {
      Logger.warn(`returned token is not truthy`);
      return res.status(401).send('authentication failed');
    }
    Logger.verbose(`token is assumed valid`);
    Logger.verbose(`decoded token: ${JSON.stringify(decodedToken)}`);
    if (!req.body) {
      Logger.info(`request does not contain a body, creating body`);
      req.body = {};
    }
    req.body.customAuthUser = {email: decodedToken.sub};
    return next();
  },
  async validateToken(token) {
    'use strict';
    Logger.info(`request received to validate authentication token`);
    if (!token || typeof token !== 'string' || token.length < 1) {
      Logger.warn(`token is not valid format`);
      return false;
    }
    Logger.verbose(`token is valid format, testing validity`);
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      //fixme need to check the format of returned tokens
      return decodedToken;
    } catch (err) {
      Logger.error(`an error has occurred while validating firebase token`);
      return false;
    }
  },
  async createAuthUser(authDetails){
    Logger.info(`request recieved to create new user auth object`);
    Logger.verbose(`new user auth details: ${JSON.stringify(authDetails)}`);
    const newAuth = new UserAuth(formatAuthDetails(authDetails));
    try {
      await newAuth.save();
      Logger.verbose(`auth details assumed saved`);
      Logger.verbose(`new details: ${JSON.stringify(newAuth)}`);
      return newAuth;
    } catch (e) {
      Logger.warn(`an error occurred while saving auth object`);
      Logger.error(`error: ${e}`);
      return null;
    }

  }
};
function formatAuthDetails(details){
  'use strict';
  Logger.info(`request recieved to format new auth details`);
  Logger.verbose(`details to be formatted: ${JSON.stringify(details)}`);
  return{
    email: details.email,
    firebaseId: details.firebaseId,
    user: details.user
  }
}
