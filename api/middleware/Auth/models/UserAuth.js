/**
 * This Model will represent the authentication details for a User.
 *
 * @module auth/models
 */
const mongoose       = require('mongoose');
const validator      = require('@user/models/validation/modelValidation');
/**
 * Schema definition for user model
 */
const UserAuthSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: validator.validateEmail,
      message: 'Email is poorly formatted'
    }
  },
  user: {
    type: String, //currently cannot store this as an ObjectId as any twelve character string will be parsed to a 24
    // character objectId, which will pass validation. see this:
    // https://github.com/Automattic/mongoose/issues/1959
    required: false,
    validate: {
      validator: validator.validateOptionalObjectId,
      message: 'Object Id is improperly formatted'
    }
  },
  firebaseId: {
    type: String,
    required: true
  }
}, {collection: 'user_auth'});

/**
 * Model definition for user model
 */
const UserAuthModel = mongoose.model('UserAuth', UserAuthSchema);

/**
 * Export both module and schema
 * @type {{schema: Schema, model: model}}
 */
module.exports = {
  schema: UserAuthSchema,
  model: UserAuthModel
};
