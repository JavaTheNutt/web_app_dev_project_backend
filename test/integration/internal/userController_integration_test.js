require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon   = require('sinon');
const sandbox = sinon.sandbox.create();
const ObjectId = require('mongoose').Types.ObjectId;

const User           = require('@user/models/User').model;
const userController = require('@user/userController');
const UserAuth       = require('@Auth/models/UserAuth').model;
const errorUtils = require('@util/errorUtils');
const admin          = require('firebase-admin');

describe('user controller', () => {
  'use strict';
  describe('add new user', () => {
    let saveUserStub, saveAuthStub, req, res, next, sendStub, sendStubContainer, statusStub, fetchAuthStub, authStub,
        setCustomUserClaimsStubContainer, setCustomUserClaimsStub, deleteUserStub, deleteAuthStub;
    beforeEach(() => {
      saveUserStub                     = sandbox.stub(User.prototype, 'save');
      saveAuthStub                     = sandbox.stub(UserAuth.prototype, 'save');
      deleteUserStub = sandbox.stub(User, 'findByIdAndRemove');
      deleteAuthStub = sandbox.stub(UserAuth, 'findByIdAndRemove');
      req                              = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere'
          }
        }
      };
      sendStub                         = sandbox.stub();
      sendStubContainer                = {send: sendStub};
      statusStub                       = sandbox.stub().returns(sendStubContainer);
      res                              = {
        send: sendStub,
        status: statusStub
      };
      next                             = sandbox.stub();
      fetchAuthStub                    = sandbox.stub(UserAuth, 'findOne');
      setCustomUserClaimsStub          = sandbox.stub();
      setCustomUserClaimsStubContainer = {setCustomUserClaims: setCustomUserClaimsStub};
      authStub                         = sandbox.stub(admin, 'auth').returns(setCustomUserClaimsStubContainer);
    });
    it('should call res.send with a status of 200 when the operation is successful', async () => {
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(201);
      expect(res.send).to.be.calledOnce;
      const sendArgs = sendStub.getCalls()[0].args;
      console.log(JSON.stringify(sendArgs));
      expect(sendArgs[0]).to.be.have.all.keys('_id', 'email', 'addresses');
    });
    it('should call res.send with a status of 400 when user save fails', async () => {
      const saveUserError = new Error('an error has occurred');
      const expectedResponse = {
        error: {message:`an error occurred during the user save operation: ${saveUserError.message}`}
      };
      saveUserStub.throws(saveUserError);
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith(expectedResponse);
    });
    it('should call res.send with a status of 400 when auth save fails', async () => {
      const saveAuthError = new Error('an error has occurred');
      saveAuthStub.throws(saveAuthError);
      const expectedResponse = {
        error: {message:`an error occurred while saving auth record: ${saveAuthError.message}`}
      };
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith(expectedResponse);
    });
    it('should call res.send with a status of 400 when addition of custom claims fails', async () => {
      const setClaimsError = new Error('an error has occurred');
      const expectedResponse = {
        error: {message:`there was an error while adding custom claims: ${setClaimsError.message}`}
      };
      setCustomUserClaimsStub.throws(setClaimsError);
      fetchAuthStub.resolves({data:{
        _id: 'someidhere',
        email: 'test@test.com',
        user: 'someuseridhere',
        firebaseId: 'somefirebaseidhere'
      }});
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith(expectedResponse);
    });
    afterEach(() => {
      sandbox.restore();
    });
  });
  describe('update user', ()=>{
    let req, res, next, statusStub, sendStub, sendStubContainer, updateStub, resolvedUser, err, errMessage;
    beforeEach(() => {
      req               = {
        body: {
          customAuthUser: {
            user: ObjectId()
          },
          updateParams: {
            firstName: 'joe',
            surname: 'bloggs'
          }
        }
      };
      sendStub          = sandbox.stub();
      sendStubContainer = {send: sendStub};
      statusStub        = sandbox.stub().returns(sendStubContainer);
      res               = {
        send: sendStub,
        status: statusStub
      };
      next              = sandbox.spy();
      updateStub        = sandbox.stub(User, 'findByIdAndUpdate');
      resolvedUser      = {
        _id: req.body.customAuthUser.user,
        email: 'test@test.com',
        firstName: req.body.updateParams.firstName,
        surname: req.body.updateParams.surname
      };
      errMessage = 'there was an error while updating user';
      err = new Error('this error was caused during a DB write')
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should a copy of the new user with a status of 200 when user is updated', async() => {
      updateStub.resolves(resolvedUser);
      const result = await userController.updateUser(req, res, next);
      expect(statusStub).to.be.calledWith(200);
      expect(sendStub).to.be.calledWith(resolvedUser);
    });
    it('should return a properly formatted error object in the case of an error', async()=>{
      updateStub.resolves(errorUtils.formatError(errMessage, err));
      const result = await userController.updateUser(req, res, next);
      expect(statusStub).to.be.calledWith(400);
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError(errMessage, err))
    });
    it('should return a properly formatted error when there are no update params',async ()=>{
      req.body.updateParams = null;
      const result = await userController.updateUser(req, res, next);
      expect(statusStub).to.be.calledWith(400);
      expect(updateStub).to.not.be.called;
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError('no update params provided'))
    });
    it('should return a properly formatted error when update params are empty', async ()=>{
      req.body.updateParams = {};
      const result = await userController.updateUser(req, res, next);
      expect(updateStub).to.not.be.called;
      expect(statusStub).to.be.calledWith(400);
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError('no update params provided'))
    });
  });
  describe('fetch current user', ()=>{
    let req, res, next, fetchStub, statusStub, sendStub, sendStubContainer, userId, returnedUser;
    beforeEach(() => {
      userId            = ObjectId();
      fetchStub         = sandbox.stub(User, 'findById');
      sendStub          = sandbox.stub();
      sendStubContainer = {send: sendStub};
      statusStub        = sandbox.stub().returns(sendStubContainer);
      req               = {
        body: {
          customAuthUser: {
            user: userId
          }
        }
      };
      res ={
        status: statusStub,
        send: sendStub
      };
      returnedUser      = {
        _id: userId,
        email: 'test@test.com'
      }
    });
    afterEach(()=>{
      sandbox.restore();
    });
    it('should return 200 when user fetch is successful', async () => {
      fetchStub.resolves(returnedUser);
      await userController.fetchUserById(req, res, next);
      expect(statusStub).to.be.calledWith(200);
      expect(sendStub).to.be.calledWith(returnedUser);
    });
    it('should return 500 when user save fails becuase of an error', async () => {
      const err = new Error('im an error that occurred during fetch');
      const msg = 'error occurred while fetching user';
      fetchStub.throws(err);
      await userController.fetchUserById(req, res, next);
      expect(statusStub).to.be.calledWith(500);
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError(msg, err));
    });
    it('should return 500 when user save fails because of undefined value', async () => {
      const msg = 'user returned is not valid';
      fetchStub.resolves(undefined);
      await userController.fetchUserById(req, res, next);
      expect(statusStub).to.be.calledWith(500);
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError(msg));
    });
    it('should return 500 when user save fails because of empty value', async () => {
      const msg = 'user returned is not valid';
      fetchStub.resolves({});
      await userController.fetchUserById(req, res, next);
      expect(statusStub).to.be.calledWith(500);
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError(msg));
    });
  });
  describe('add new address', () => {
    let findOneAndUpdateStub, addressToBeAdded, req, res, next, sendStub, sendStubContainer, statusStub, amendedUser;
    beforeEach(() => {
      sendStub             = sandbox.stub();
      sendStubContainer    = {send: sendStub};
      statusStub           = sandbox.stub().returns(sendStubContainer);
      findOneAndUpdateStub = sandbox.stub(User, 'findOneAndUpdate');
      addressToBeAdded     = {
        text: '123, fake street',
        geo: {
          lat: 10,
          lng: 10
        }
      };
      amendedUser          = {
        _id: 'someidhere',
        email: 'test@test.com',
        addresses: [addressToBeAdded]
      };
      req                  = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere',
            user: 'someidhere'
          },
          address: addressToBeAdded
        }
      };
      res                  = {
        status: statusStub,
        send: sendStub
      };
      next                 = sandbox.stub();
    });
    it('should successfully add an address', async () => {
      findOneAndUpdateStub.resolves(amendedUser);
      await userController.addAddress(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(200);
      expect(sendStub).to.be.calledOnce;
      expect(sendStub).to.be.calledWith(amendedUser);
    });
    it('should return a 400 error when address addition fails', async () => {
      const err = new Error('an error has occurred');
      findOneAndUpdateStub.throws(err);
      await userController.addAddress(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(400);
      expect(sendStub).to.be.calledOnce;
      expect(sendStub).to.be.calledWith(errorUtils.formatSendableError('an error occurred while updating the user', err));
    });
    afterEach(() => {
      sandbox.restore();
    })
  });

});
