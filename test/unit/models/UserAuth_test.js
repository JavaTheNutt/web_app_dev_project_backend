/**
 * This is the test suite for the UserAuth model
 */
require('module-alias/register');
const expect = require('chai').expect;
const ObjectID = require('mongoose').Types.ObjectId;
const UserAuth = require('@root/models/UserAuth').model;

describe('UserAuth model', function () {
  let userAuthDetails = {};
  const userId = ObjectID();
  beforeEach(function () {
    userAuthDetails = {
      email: 'test@test.com',
      user: userId,
      firebaseId: 'uu0SMEK2itPcoQrvpfKXXOjZ5cL2'
    }
  });
  it('should create a user model with correct details', function () {
    const userAuth = new UserAuth(userAuthDetails);
    expect(userAuth.validateSync()).to.not.exist;
    expect(userAuth.user.toString()).to.equal(userId.toString());
    expect(userAuth.email).to.equal(userAuthDetails.email);
    expect(userAuth.firebaseId).to.equal(userAuthDetails.firebaseId);
  })
});
