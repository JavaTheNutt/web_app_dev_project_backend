/**
 * This module provides utils required by the auth middleware.
 * @module auth/service
 */
const admin      = require('firebase-admin');
const _          = require('lodash');
const Logger     = require('@util/Logger')('AUTH_SERVICE');
const UserAuth   = require('@Auth/models/UserAuth').model;
const errorUtils = require('@util/errorUtils');
module.exports   = exports = {
  stripBearer(token) {
    'use strict';
    Logger.info('request made to strip bearer from token');
    Logger.verbose(`token: ${JSON.stringify(token)}`);
    if(token.indexOf('Bearer ') !== 0) return errorUtils.formatError('token does not conform to OAuth2 spec', null, 401);
    token = token.substring(token.indexOf('Bearer ') + 'Bearer '.length).trim();
    Logger.verbose(`token is now: ${JSON.stringify(token)}`);
    return token;
  },
  stripQuotes(token){
    'use strict';
    Logger.info('request made to strip superflous quotes from token');
    Logger.verbose(`token is currently: ${JSON.stringify(token)}`);
    /*token = token.indexOf('\\"') !== -1 ? token.substring(token.indexOf('\\"') + 1): token;
    Logger.verbose(`token is now: ${JSON.stringify(token)}`);*/
    token = token.lastIndexOf('\\"') !== -1 ? token.slice(token.indexOf('\\"') + 1,token.lastIndexOf('\\"')) + '"': token;
    Logger.verbose(`token is now: ${token}`);
    if(token[0] === '"') token = token.substring(1);
    Logger.verbose(`token is now: ${JSON.stringify(token)}`);
    if(token[token.length -1] ==='"') token = token.substring(0, token.length -1);
    Logger.verbose(`token is now: ${JSON.stringify(token)}`);
    return token;
  },
  stripToken(token){
    'use strict';
    Logger.info('attempting to sanitise token');
    Logger.verbose(`token: ${JSON.stringify(token)}`);
    token = exports.stripBearer(token);
    if(token.error){
      Logger.warn('an erorr occured while stripping the token');
      return token;
    }
    token = exports.stripQuotes(token);
    Logger.verbose(`token is now: ${JSON.stringify(token)}`);
    return token;
  },
  /**
   * This function converts firebase tokens to the auth claims that will be used throughout the application.
   * It will also try to add the user claim if it does not already exist
   * @param token {Object} decoded firebase token
   * @param isNewUser {Boolean} the flag to determine if this is a request to create a new user
   * @returns {Promise.<{firebaseId: (*|string|string|string), email}>} the claims
   * @memberOf module:auth/service
   */
  async handleClaimValidation(token, isNewUser) {
    'use strict';
    Logger.info('request recieved to validate custom claims');
    Logger.verbose(`is new user? ${isNewUser}`);
    Logger.verbose(`token: ${JSON.stringify(token)}`);
    const claims = {
      firebaseId: token.sub,
      email: token.email
    };
    if (isNewUser) {
      Logger.verbose(`request is for new user, returning standard claims. claims: ${JSON.stringify(claims)}`);
      return claims;
    }
    Logger.verbose('request is not for new user, testing for custom claims');
    const userId = token.user || await exports.fetchUserIdFromFirebaseId(claims.firebaseId);
    Logger.verbose(`user id fetched. user id : ${userId}`);
    if (!userId) {
      Logger.warn('no user id found, returning standard claims');
      return claims;
    }
    claims.user = userId;
    return claims;
  },
  /**
   * Wrapper to fetch user id from from a firebase id.
   * @param firebaseId {String} the firebase id of the user
   * @returns {Promise.<*>} The id of the user if successful, null otherwise
   *
   * @memberOf module:auth/service
   */
  async fetchUserIdFromFirebaseId(firebaseId) {
    'use strict';
    Logger.info('request recieved to fetch user id from firebase id');
    const returnedAuth = await exports.fetchAuthByFirebaseId(firebaseId);
    Logger.verbose(`auth returned: ${JSON.stringify(returnedAuth)}`);
    if (returnedAuth.error) {
      Logger.warn('an error occurred while fetching auth record');
      return returnedAuth;
    }
    if (!returnedAuth.user) {
      Logger.warn('user field is null on auth object');
      return errorUtils.formatError('auth record contains no user field');
    }
    Logger.verbose('auth assumed valid');
    return returnedAuth.user.toString();
  },
  /**
   * Handle validation and decoding of tokens
   * @param token {String} the encrypted firebase token
   * @returns {Promise.<*>} the decoded token if successful, false otherwise
   *
   * @memberOf module:auth/service
   */
  async validateToken(token) {
    'use strict';
    Logger.info('request received to validate authentication token');
    if (!token || typeof token !== 'string' || token.length <= 5) {
      Logger.warn('token is not valid format');
      return errorUtils.formatError('token is not valid format');
    }
    Logger.verbose('token is valid format, testing validity');
    Logger.verbose(`token to validate: ${JSON.stringify(token)}`);
    const decodedToken = await exports.decodeToken(token);
    Logger.verbose('decoded token fetched');
    Logger.verbose(`decoded token: ${JSON.stringify(decodedToken)}`);
    if (decodedToken.error) {
      Logger.warn('token is not valid');
      return decodedToken;
    }
    Logger.verbose('token is assumed valid');
    return decodedToken;
  },
  /**
   * Wrapper for token decoding
   * @param token {String} the encrypted token
   * @returns {Promise.<*>} the decoded token if successful, false otherwise
   *
   * @memberOf module:auth/service
   */
  async decodeToken(token) {
    'use strict';
    Logger.info('request recieved to decode firebase token');
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      Logger.verbose('token decoded without error');
      Logger.verbose(`decoded token: ${decodedToken}`);
      return decodedToken;
    } catch (err) {
      Logger.warn('an error has occurred while validating firebase token');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('an error occurred while decoding firebase token', err);
    }
  },
  /**
   * Check if the user claim exists
   * @param token {String} the decoded token
   * @returns {boolean} true if the claims exist, false otherwise
   *
   * @memberOf module:auth/service
   */
  checkCustomClaims(token) {
    'use strict';
    Logger.info('request recieved to test if user claim exists');
    Logger.verbose(`token: ${JSON.stringify(token)}`);
    return !!token.user;
  },
  /**
   * Wrapper for setting custom claims on firebase
   * @param firebaseId
   * @param claims
   * @returns {Promise.<boolean|object>}
   *
   * @memberOf module:auth/service
   */
  async setCustomClaims(firebaseId, claims) {
    'use strict';
    Logger.info('request made to create custom claims');
    Logger.verbose(`firebaseId, ${firebaseId}`);
    try {
      await admin.auth().setCustomUserClaims(firebaseId, claims);
      return true;
    } catch (err) {
      Logger.warn('an error occourred while setting custom user claims');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('there was an error while adding custom claims', err);
    }
  },
  /**
   * Create a user claim to be set on firebase
   * @param firebaseId {String}
   * @returns {Promise.<*>} The claims constaining the userId if it can be found, false otherwise
   *
   * @memberOf module:auth/service
   */
  async createUserClaim(firebaseId) {
    'use strict';
    Logger.info('request made to add user ID to firebase claims');
    Logger.verbose(`firebase id: ${firebaseId}`);
    const authUser = await exports.fetchAuthByFirebaseId(firebaseId);
    Logger.verbose('auth user fetched without error');
    Logger.verbose(`auth user: ${JSON.stringify(authUser)}`);
    if (authUser.error) {
      Logger.warn('auth user is non existant');
      return authUser;
    }
    if (!authUser.user) {
      Logger.warn('no user field attached to returned auth object, aborting');
      return errorUtils.formatError('no user field attached to auth record');
    }
    const claimToBeReturned = {user: authUser.user.toString()};
    Logger.verbose(`claim to be returned: ${claimToBeReturned}`);
    await exports.setCustomClaims(firebaseId, claimToBeReturned);
    return claimToBeReturned;
  },
  /**
   * Wrapper for creating user auth model
   * @param authDetails {Object} the details to be used to create a new user
   * @returns {Promise.<Object>} the new user if successful, false otherwise
   *
   * @memberOf module:auth/service
   */
  async createAuthUser(authDetails) {
    Logger.info('request recieved to create new user auth object');
    Logger.verbose(`new user auth details: ${JSON.stringify(authDetails)}`);
    const newAuth = new UserAuth(formatAuthDetails(authDetails));
    try {
      await newAuth.save();
      Logger.verbose('auth details assumed saved');
      Logger.verbose(`new details: ${JSON.stringify(newAuth)}`);
      return newAuth;
    } catch (err) {
      Logger.warn('an error occurred while saving auth object');
      Logger.error(`error: ${err}`);
      return errorUtils.formatError('an error occurred while saving auth record', err);
    }
  },
  /**
   * wrapper for fetching an auth object by firebase id
   * @param firebaseId {String} the firebase id
   * @returns {Promise.<*>} The Auth record if successful, false otherwise
   *
   * @memberOf module:auth/service
   */
  async fetchAuthByFirebaseId(firebaseId) {
    'use strict';
    Logger.info('request made to fetch auth object by firebase id');
    Logger.verbose(`firebase id: ${firebaseId}`);
    try {
      const auth = await UserAuth.findOne({firebaseId});
      Logger.verbose('auth record fecthed without error');
      Logger.verbose(`fetched record: ${JSON.stringify(auth)}`);
      if (!auth || _.isEmpty(auth)) {
        Logger.warn('auth object is undefined');
        return errorUtils.formatError('requested auth record not found');
      }
      Logger.verbose('auth fetch assumed successful');
      return auth;
    } catch (err) {
      Logger.warn('error while fetching auth object');
      Logger.error(`error: ${JSON.stringify(err)}`);
      return errorUtils.formatError('there was an error while fetching specified auth record', err);
    }
  },
  /**
   * wrapper to delete auth record by id
   * @param authId {ObjectId} the auth records identifier
   * @returns {Promise.<*>}
   */
  async deleteAuthRecordById(authId) {
    'use strict';
    Logger.info(`request made to delete auth record for ${JSON.stringify(authId)}`);
    try {
      await UserAuth.findByIdAndRemove(authId);
      Logger.verbose('auth record assumed deleted');
      return true;
    } catch (err) {
      Logger.warn('error occurred while removing user auth');
      Logger.error(`error: ${JSON.stringify(err)}`);
      return errorUtils.formatError('an error has occurred while removing user auth', err);
    }
  }
};

/**
 * format the auth details for insertion
 * @param details{object} the user details
 * @returns {object}
 */
function formatAuthDetails(details) {
  'use strict';
  Logger.info('request recieved to format new auth details');
  Logger.verbose(`details to be formatted: ${JSON.stringify(details)}`);
  return {
    email: details.email,
    firebaseId: details.firebaseId,
    user: details.user
  };
}
