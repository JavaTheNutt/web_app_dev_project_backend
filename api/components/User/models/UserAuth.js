/**
 * This Model will represent the authentication details for a User.
 */
const mongoose       = require('mongoose');
const Logger         = require('@util/Logger')('AUTH_MODEL');
const validator      = require('@user/models/validation/modelValidation');
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

const UserAuthModel = mongoose.model('UserAuth', UserAuthSchema);

module.exports = {
  schema: UserAuthSchema,
  model: UserAuthModel
};
