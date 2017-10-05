/**
 * This Model will represent the authentication details for a User.
 */
const mongoose = require('mongoose');
const Logger = require('@util/Logger')('AUTH_MODEL');

const UserAuthSchema = mongoose.Schema({
  email: String,
  user: mongoose.Schema.ObjectId,
  firebaseId: String
}, {collection: 'user_auth'});

const UserAuthModel = mongoose.model('UserAuth', UserAuthSchema);

module.exports = {
  schema: UserAuthSchema,
  model: UserAuthModel
};
