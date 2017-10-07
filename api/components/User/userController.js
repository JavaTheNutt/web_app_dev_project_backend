/**
 * This is the controller for dealing with the User model.
 *
 * @module user/userController
 */
const Logger   = require('@util/Logger')('USER_CTRL');
const _        = require('lodash');
module.exports = {
  /**
   * Create new User
   *
   * @memberOf module:user/userController
   * @param req {Object} the request object
   * @param res {Object} Response the response object
   * @param next {Function} next callback
   */
  createNewUser(req, res, next) {
    'use strict';
    Logger.info(`request made to create new user`);
    if(!checkCreateRequest(req)){
      Logger.warn(`error while validating params, returning 400`);
      res.status(400);
      return res.send('missing data');
    }

    res.status(200);
    return res.send('user created');
  }

};
function checkCreateRequest(req){
  'use strict';
  Logger.info(`testing request params for create new user`);
  if (_.isEmpty(req.body) || !req.body.user.email || !req.body.user.firebaseId) {
    Logger.warn(`there is data missing!`);
    Logger.verbose(`request body: ${JSON.stringify(req.body)}`);
    return false;
  }
  Logger.info(`required params present, proceeding`);
  return true;
}
