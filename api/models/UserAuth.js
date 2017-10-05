/**
 * This Model will represent the authentication details for a User.
 */
const mongoose = require('mongoose');
const Logger   = require('@util/Logger')('AUTH_MODEL');
const validator = require('@root/models/validation/modelValidation');
const UserAuthSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: validator.validateEmail,
      message: 'Email is poorly formatted'
    }
  },
  user: mongoose.Schema.ObjectId,
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
