const testUtils = require('./testUtils');
const chai      = require('chai');
// noinspection Annotator
const expect    = chai.expect;
const sinon     = require('sinon');
chai.use(require('sinon-chai'));
const USER_COLLECTION      = 'users';
const USER_AUTH_COLLECTION = 'user_auth';
const sandbox              = sinon.sandbox.create();
const userController       = require('@user/userController');
const User                 = require('@user/models/User').model;
const UserAuth             = require('@Auth/models/UserAuth').model;
describe('user controller', () => {
  'use strict';
  describe('user creation', () => {
    let req, res, next, statusStub, sendStub,sendStubContainer;
    before(async () => {
      await testUtils.initialSetup([USER_COLLECTION, USER_AUTH_COLLECTION]);
    });
    beforeEach(async () => {
      req        = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere'
          }
        }
      };
      sendStub   = sandbox.stub();
      sendStubContainer = {send: sendStub};
      statusStub = sandbox.stub().returns(sendStubContainer);
      res        = {
        send: sendStub,
        status: statusStub
      };
      next       = sandbox.stub();
      let existingUser = new User({email: 'test1@test.com'});
      await existingUser.save();
    });
    it('should create a user successfully', async () => {
      await userController.createNewUser(req, res, next);
      const foundUser = await User.find({email: req.body.customAuthUser.email});
      const foundAuth = await UserAuth.find({user: foundUser._id});
      expect(foundUser).to.exist;
      expect(foundAuth).to.exist;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledWith('user created');
      expect(res.send).to.be.calledOnce;
    });
    it('should call res.status with 400 when the users email already exists', async ()=>{
      req.body.customAuthUser.email = 'test1@test.com';
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('error creating user');
    });
    afterEach(async () => {
      await testUtils.clearCollection([USER_COLLECTION, USER_AUTH_COLLECTION]);
      sandbox.restore();
    });
    after((done) => {
      testUtils.closeConnection(done);
    });
  });
});
