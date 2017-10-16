const admin    = require('firebase-admin');
const _        = require('lodash');
const Logger   = require('@util/Logger')('AUTH_SERVICE');
const UserAuth = require('@Auth/models/UserAuth').model;
module.exports = exports = {
  async authenticateNew(req, res, next) {
    'use strict';
    Logger.info(`middleware called for new user route`);
    req.isNewUser = true;
    next();
  },
  async authenticate(req, res, next) {
    'use strict';
    Logger.info(`authentication middleware invoked`);
    Logger.info(`is request for new user? ${req.isNewUser ? 'yes' : 'no'}`);
    if (!req || !req.headers || !req.headers.token) {
      Logger.warn(`there is data missing from the request`);
      return res.status(401).send('authentication failed');
    }
    Logger.verbose(`required data is present`);
    const decodedToken = await exports.validateToken(req.headers.token);
    if (!decodedToken) {
      Logger.warn(`returned token is not truthy`);
      return res.status(401).send('authentication failed');
    }
    Logger.verbose(`token is assumed valid`);
    Logger.verbose(`decoded token: ${JSON.stringify(decodedToken)}`);
    const userId = await exports.fetchAuthByFirebaseId(decodedToken.sub);

    if (!req.body) {
      Logger.info(`request does not contain a body, creating body`);
      req.body = {};
    }
    req.body.customAuthUser = {
      email: decodedToken.email,
      firebaseId: decodedToken.sub,
      user: userId
    };
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
    Logger.verbose(`token to validate: ${JSON.stringify(token)}`);
    const decodedToken = await exports.decodeToken(token);
    Logger.verbose(`decoded token fetched`);
    Logger.verbose(`decoded token: ${JSON.stringify(decodedToken)}`);
    if(!decodedToken){
      Logger.warn(`token is not valid`);
      return false;
    }
    return decodedToken;
    /*try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      Logger.verbose(`token decoded without error`);
      Logger.verbose(`decoded token: ${decodedToken}`);
      return decodedToken;
    } catch (err) {
      Logger.warn(`an error has occurred while validating firebase token`);
      Logger.error(`error: ${err}`);
      return false;
    }*/
  },
  async decodeToken(token) {
    'use strict';
    Logger.info(`request recieved to decode firebase token`);
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      Logger.verbose(`token decoded without error`);
      Logger.verbose(`decoded token: ${decodedToken}`);
      return decodedToken;
    } catch (err) {
      Logger.warn(`an error has occurred while validating firebase token`);
      Logger.error(`error: ${err}`);
      return false;
    }
  },
  checkCustomClaims(token) {
    'use strict';
    Logger.info(`request recieved to test if user claim exists`);
    Logger.verbose(`token: ${JSON.stringify(token)}`);
    return !!token.user;
  },
  async setCustomClaims(firebaseId, claims) {
    'use strict';
    Logger.info(`request made to create custom claims`);
    Logger.verbose(`firebaseId, ${firebaseId}`);
    try {
      await admin.auth().setCustomUserClaims(firebaseId, claims);
    } catch (e) {
      Logger.warn(`an error occourred while setting custom user claims`);
      Logger.error(`error: ${e}`);
    }
  },
  async createUserClaim(firebaseId) {
    'use strict';
    Logger.info(`request made to add user ID to firebase claims`);
    Logger.verbose(`firebase id: ${firebaseId}`);
    const authUser = await exports.fetchAuthByFirebaseId(firebaseId);
    Logger.verbose(`auth user fetched without error`);
    Logger.verbose(`auth user: ${JSON.stringify(authUser)}`);
    if (!authUser) {
      Logger.warn(`auth user is non existant`);
      return false;
    }
    if (!authUser.user) {
      Logger.warn(`no user field attached to returned auth object, aborting`);
      return null;
    }
    const claimToBeReturned = {user: authUser.user.toString()};
    Logger.verbose(`claim to be returned: ${claimToBeReturned}`);
    await exports.setCustomClaims(firebaseId, claimToBeReturned);
    return claimToBeReturned;
  },
  async createAuthUser(authDetails) {
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
  },
  async fetchAuthByFirebaseId(firebaseId) {
    'use strict';
    Logger.info(`request made to fetch auth object by firebase id`);
    Logger.verbose(`firebase id: ${firebaseId}`);
    try {
      const auth = await UserAuth.findOne({firebaseId});
      Logger.verbose(`auth record fecthed without error`);
      Logger.verbose(`fetched record: ${JSON.stringify(auth)}`);
      if (!auth || _.isEmpty(auth)) {
        Logger.warn(`auth object is undefined`);
        return false;
      }
      Logger.verbose(`auth fetch assumed successful`);
      return auth;
    } catch (err) {
      Logger.warn(`error while fetching auth object`);
      Logger.error(`error: ${JSON.stringify(err)}`);
      return false;
    }
  }
};

function formatAuthDetails(details) {
  'use strict';
  Logger.info(`request recieved to format new auth details`);
  Logger.verbose(`details to be formatted: ${JSON.stringify(details)}`);
  return {
    email: details.email,
    firebaseId: details.firebaseId,
    user: details.user
  }
}

