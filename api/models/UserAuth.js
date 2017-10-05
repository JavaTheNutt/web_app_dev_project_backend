/**
 * This Model will represent the authentication details for a User.
 */
const mongoose = require('mongoose');
const Logger   = require('@util/Logger')('AUTH_MODEL');

const UserAuthSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
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
