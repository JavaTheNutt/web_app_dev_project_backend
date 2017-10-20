require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const userController = require('@user/userController');
const userService    = require('@user/service/userService');
const authService    = require('@Auth/service/authService');
describe('user controller', function () {
  describe('create new user', function () {
    let req, res, next, createUserStub, createAuthStub, setCustomUserClaim, sendStub, sendStubContainer, statusStub,
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
    });
    it('should call res.send with a status of 200 when all details are present', async function () {
      setCustomClaimsStub.resolves(true);
      createUserStub.resolves({data:returnedUser});
      createAuthStub.resolves({data:returnedAuth});
      await userController.createNewUser(req, res, next);
      expect(createUserStub).to.be.calledOnce;
      expect(createAuthStub).to.be.calledOnce;
      expect(setCustomClaimsStub).to.be.calledOnce;
      expect(setCustomClaimsStub).to.be.calledWith(returnedAuth.firebaseId);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(201);
      expect(sendStub).to.be.calledOnce;
      expect(sendStub).to.be.calledWith({data: returnedUser});
    });
    it('should call res.send with a status of 500 when there is no user email', async function () {
      req.body.customAuthUser.email = null;
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message:'token was parsed successfully but is missing details'}});
    });
    it('should call res.send with a status of 500 when there is no firebase id', async function () {
      req.body.customAuthUser.firebaseId = null;
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message:'token was parsed successfully but is missing details'}});
    });
    it('should call res.send with 500 when user save fails because of a thrown error', async () => {
      'use strict';
      const err = new Error('this is a firebase error');
      const fakeError = {error:{message: 'an error occurred during the user save operation', err}};
      createUserStub.resolves(fakeError);
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message: `${fakeError.error.message}: ${fakeError.error.err.message}`}});
    });
    it('should call res.send with 500 when user save fails because of an unthrown error', async () => {
      'use strict';
      const fakeError = {error:{message: 'an error occurred during the auth save operation'}};
      createUserStub.resolves(fakeError);
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message: `${fakeError.error.message}`}});
    });
    it('should call res.send with 500 when auth save fails because of a thrown error', async () => {
      'use strict';
      const err = new Error('this is a firebase error');
      const fakeError = {error:{message: 'an error occurred during the auth save operation', err}};
      createUserStub.resolves({data:returnedUser});
      createAuthStub.resolves(fakeError);
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message: `${fakeError.error.message}: ${fakeError.error.err.message}`}});
    });
    it('should call res.send with 500 when auth save fails because of an unthrown error', async () => {
      'use strict';
      const fakeError = {error:{message: 'an error occurred during the auth save operation'}};
      createUserStub.resolves({data:returnedUser});
      createAuthStub.resolves(fakeError);
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message: `${fakeError.error.message}`}});
    });
    it('should call res.send with 500 when adding custom claims fails', async () => {
      'use strict';
      const err = new Error('this is a firebase error');
      const fakeError = {error:{message: 'there was an error while adding custom claims', err}};
      createUserStub.resolves({data:returnedUser});
      createAuthStub.resolves({data:returnedAuth});
      setCustomClaimsStub.resolves(fakeError);
      await userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error:{message: `${fakeError.error.message}: ${fakeError.error.err.message}`}});
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
      handleAddAddressStub.resolves({data:amendedUser});
      await userController.addAddress(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({data:amendedUser});
    });
    it('should handle an error response from add address service', async () => {
      const err = new Error('an error has occurred');
      const fakeError = {error: {message: 'an error has occurred', err}};
      handleAddAddressStub.resolves(fakeError);
      await userController.addAddress(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith({error: {message:`${fakeError.error.message}: ${fakeError.error.err.message}`}});
    });
    afterEach(() => {
      sandbox.restore();
    })
  })
});
