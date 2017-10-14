const testUtils = require('./testUtils');
const chai      = require('chai');
// noinspection Annotator
const expect    = chai.expect;
const sinon     = require('sinon');
chai.use(require('sinon-chai'));
const USER_COLLECTION = 'users';
const USER_AUTH_COLLECTION  = 'user_auth';
const sandbox = sinon.sandbox.create();
const userController = require('@user/userController');
const User = require('@user/models/User').model;
const UserAuth = require('@Auth/models/UserAuth').model;
describe('user controller', ()=>{
  'use strict';
  describe('user creation', ()=>{
    let req, res, next, statusStub, sendStub;
    before((done)=>{
      testUtils.initialSetup([USER_COLLECTION, USER_AUTH_COLLECTION], done);
    });
    beforeEach(()=>{
      req = {
        body:{
          customAuthUser:{
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere'
          }
        }
      };
      sendStub = sinon.stub();
      statusStub = sinon.stub().returns(sendStub);
      res = {
        send: sendStub,
        status: statusStub
      };
      next = sinon.stub();
    });
    it('should create a user successfully', async ()=>{
      await userController.createNewUser(req, res, next);
      const foundUser = await User.find({email: req.body.customAuthUser.email});
      const foundAuth = await UserAuth.find({user: foundUser._id});
      expect(foundUser).to.exist;
      expect(foundAuth).to.exist;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledWith('user created');
      expect(res.send).to.be.calledOnce;

    });
    afterEach((done)=>{
      testUtils.clearCollection([USER_COLLECTION, USER_AUTH_COLLECTION], done);
      sandbox.restore();
    });
    after((done)=>{
      testUtils.closeConnection(done);
    });
  });
});
