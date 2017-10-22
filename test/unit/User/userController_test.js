require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const userController = require('@user/userController');
const userService    = require('@user/service/userService');
const authService    = require('@Auth/service/authService');
const errorUtils = require('@util/errorUtils');
describe('user controller', function () {
  describe('create new user', function () {
    let req, res, next, createUserStub, createAuthStub, setCustomUserClaim, sendStub, sendStubContainer, statusStub, deleteUserStub, deleteAuthStub,
        setCustomClaimsStub;
    const returnedUser = {
      _id: 'someidhere',
      email: 'test@test.com'
    };
    const returnedAuth = {
      _id: 'someotheridhere',
      user: returnedUser._id,
      firebaseId: 'someFirebaseIdHere'
    };
    beforeEach(function () {
      'use strict';
      next                = sandbox.spy();
      req                 = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'uu0SMEK2itPcoQrvpfKXXOjZ5cL2'
          }
        }
      };
      sendStub            = sandbox.stub();
      sendStubContainer   = {send: sendStub};
      statusStub          = sandbox.stub().returns(sendStubContainer);
      res                 = {
        send: sendStub,
        status: statusStub
      };
      createUserStub      = sandbox.stub(userService, 'createUser');
      createAuthStub      = sandbox.stub(authService, 'createAuthUser');
      setCustomUserClaim  = sandbox.stub(authService, 'createUserClaim');
      setCustomClaimsStub = sandbox.stub(authService, 'setCustomClaims');
      deleteUserStub = sandbox.stub(userService, 'deleteUser');
      deleteAuthStub = sandbox.stub(authService, 'deleteAuthRecordById');
    });
    it('should call res.send with a status of 201 when all details are present', async function () {
      setCustomClaimsStub.resolves(true);
      createUserStub.resolves(returnedUser);
      createAuthStub.resolves(returnedAuth);
      await userController.createNewUser(req, res, next);
      expect(createUserStub).to.be.calledOnce;
      expect(deleteAuthStub).to.not.be.called;
      expect(deleteUserStub).to.not.be.called;
      expect(createAuthStub).to.be.calledOnce;
      expect(setCustomClaimsStub).to.be.calledOnce;
      expect(setCustomClaimsStub).to.be.calledWith(returnedAuth.firebaseId);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(201);
      expect(sendStub).to.be.calledOnce;
      expect(sendStub).to.be.calledWith(returnedUser);
    });
    describe('error checking', ()=>{
      'use strict';
      describe('validation', ()=>{
        it('should call res.send with a status of 500 when there is no user email', async function () {
          req.body.customAuthUser.email = null;
          await userController.createNewUser(req, res, next);
          expect(res.status).to.be.calledOnce;
          expect(deleteAuthStub).to.not.be.called;
          expect(deleteUserStub).to.not.be.called;
          expect(setCustomUserClaim).to.not.be.called;
          expect(res.status).to.be.calledWith(500);
          expect(res.send).to.be.calledOnce;
          expect(res.send).to.be.calledWith(errorUtils.formatSendableError('token was parsed successfully but is missing details'));
        });
        it('should call res.send with a status of 500 when there is no firebase id', async function () {
          req.body.customAuthUser.firebaseId = null;
          await userController.createNewUser(req, res, next);
          expect(deleteAuthStub).to.not.be.called;
          expect(deleteUserStub).to.not.be.called;
          expect(res.status).to.be.calledOnce;
          expect(setCustomUserClaim).to.not.be.called;
          expect(res.status).to.be.calledWith(500);
          expect(res.send).to.be.calledOnce;
          expect(res.send).to.be.calledWith(errorUtils.formatSendableError('token was parsed successfully but is missing details'));
        });
      });
      describe('errors', ()=>{
        let err;
        beforeEach(()=>{
          err = new Error('this is a firebase error');
        });
        describe('user save operation', ()=>{
          const message = 'an error occurred during the user save operation';
          it('should call res.send with 500 when user save fails because of a thrown error', async () => {
            'use strict';
            createUserStub.resolves(errorUtils.formatError(message, err));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.not.be.called;
            expect(deleteUserStub).to.not.be.called;
            expect(res.status).to.be.calledOnce;
            expect(setCustomUserClaim).to.not.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableError(message, err));
          });
          it('should call res.send with 500 when user save fails because of an unthrown error', async () => {
            'use strict';
            createUserStub.resolves(errorUtils.formatError(message));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.not.be.called;
            expect(deleteUserStub).to.not.be.called;
            expect(res.status).to.be.calledOnce;
            expect(setCustomUserClaim).to.not.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableError(message));
          });
        });
        describe('auth save operation', ()=>{
          const message = 'an error occurred during the auth save operation';
          it('should call res.send with 500 when auth save fails because of a thrown error', async () => {
            'use strict';
            createUserStub.resolves(returnedUser);
            createAuthStub.resolves(errorUtils.formatSendableError(message, err));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.not.be.called;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomClaimsStub).to.not.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableError(message, err));
          });
          it('should call res.send with 500 when auth save fails because of an unthrown error', async () => {
            'use strict';
            createUserStub.resolves(returnedUser);
            createAuthStub.resolves(errorUtils.formatError(message));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.not.be.called;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomUserClaim).to.not.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableError(message));
          });
        });
        describe('add auth claims', ()=>{
          const message = 'there was an error while adding custom claims';
          it('should call res.send with 500 when adding custom claims fails', async () => {
            'use strict';
            createUserStub.resolves(returnedUser);
            createAuthStub.resolves(returnedAuth);
            setCustomClaimsStub.resolves(errorUtils.formatError(message, err));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.be.calledOnce;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomClaimsStub).to.be.calledOnce;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableError(message, err));
          });
        });
        describe('cleanup', ()=>{
          const originalError = errorUtils.formatError('this is an error message', new Error('I caused the error to be thrown'));
          it('should return the original error when the delete user operation fails during the auth save operation', async ()=>{
            createUserStub.resolves({data:returnedUser});
            createAuthStub.resolves(originalError);
            deleteUserStub.resolves(errorUtils.formatError('an error occurred during the delete operation', new Error('oops')));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.not.be.called;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomClaimsStub).to.not.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableErrorFromObject(originalError));
          });
          it('should return the original error if the delete user operation fails during claims creation', async ()=>{
            createUserStub.resolves({data:returnedUser});
            createAuthStub.resolves({data:returnedAuth});
            setCustomClaimsStub.resolves(originalError);
            deleteUserStub.resolves(errorUtils.formatError('an error occurred during the delete operation', new Error('oops')));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.be.calledOnce;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomClaimsStub).to.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableErrorFromObject(originalError));
          });
          it('should return the original error if the delete auth operation fails during claims creation', async ()=>{
            createUserStub.resolves({data:returnedUser});
            createAuthStub.resolves({data:returnedAuth});
            setCustomClaimsStub.resolves(originalError);
            deleteUserStub.resolves(true);
            deleteAuthStub.resolves(errorUtils.formatError('an error occurred during the delete operation', new Error('oops')));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.be.calledOnce;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomClaimsStub).to.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableErrorFromObject(originalError));
          });
          it('should return the original error if the both delete auth and delete user operations fail during claims creation',async ()=>{
            createUserStub.resolves({data:returnedUser});
            createAuthStub.resolves({data:returnedAuth});
            setCustomClaimsStub.resolves(originalError);
            deleteUserStub.resolves(errorUtils.formatError('an error occurred during the delete operation', new Error('oops')));
            deleteAuthStub.resolves(errorUtils.formatError('an error occurred during the delete operation', new Error('oops')));
            await userController.createNewUser(req, res, next);
            expect(deleteAuthStub).to.be.calledOnce;
            expect(deleteUserStub).to.be.calledOnce;
            expect(res.status).to.be.calledOnce;
            expect(setCustomClaimsStub).to.be.called;
            expect(res.status).to.be.calledWith(500);
            expect(res.send).to.be.calledOnce;
            expect(res.send).to.be.calledWith(errorUtils.formatSendableErrorFromObject(originalError));
          });
        });
      });
    });
    afterEach(function () {
      'use strict';
      sandbox.restore();
    });
  });
  describe('add address', () => {
    'use strict';
    let handleAddAddressStub, sendContainer, sendStub, statusStub, req, res, next, amendedUser, savedAddress;
    beforeEach(() => {
      handleAddAddressStub = sandbox.stub(userService, 'handleAddAddress');
      sendStub             = sandbox.stub();
      sendContainer        = {send: sendStub};
      statusStub           = sinon.stub().returns(sendContainer);
      req                  = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'somefirebaseidhere'
          },
          address: {
            text: '123 fake street'
          }
        }
      };
      res                  = {
        send: sendStub,
        status: statusStub
      };
      next                 = sandbox.stub();
      savedAddress         = {
        _id: 'someotheridhere',
        text: '123 fake street'
      };
      amendedUser          = {
        _id: 'someidhere',
        email: req.body.customAuthUser.email,
        addresses: [savedAddress]
      }
    });
    it('should call res.send with a status of 200 when adding an address is successful', async () => {
      handleAddAddressStub.resolves(amendedUser);
      await userController.addAddress(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith(amendedUser);
    });
    it('should handle an error response from add address service', async () => {
      const err = new Error('an error has occurred');
      const fakeError = errorUtils.formatError('an error has occurred', err);
      handleAddAddressStub.resolves(fakeError);
      await userController.addAddress(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith(errorUtils.formatSendableErrorFromObject(fakeError));
    });
    afterEach(() => {
      sandbox.restore();
    })
  })
});
