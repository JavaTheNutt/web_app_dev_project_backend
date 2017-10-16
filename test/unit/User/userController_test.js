require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const userController = require('@user/userController');
const userService    = require('@user/service/userService');
const authService    = require('@Auth/authService');
describe('user controller', function () {
  describe('create new user', function () {
    let req, res, next, createUserStub, createAuthStub, setCustomUserClaim;
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
      next           = sandbox.spy();
      req            = {
        body: {
          customAuthUser: {
            email: 'test@test.com',
            firebaseId: 'uu0SMEK2itPcoQrvpfKXXOjZ5cL2'
          }
        }
      };
      res            = {
        send: sandbox.spy(),
        status: sandbox.spy()
      };
      createUserStub = sandbox.stub(userService, 'createUser');
      createAuthStub = sandbox.stub(authService, 'createAuthUser');
      setCustomUserClaim = sandbox.stub(authService, 'createUserClaim');
    });
    it('should call res.send with a status of 200 when all details are present', async function () {
      createUserStub.resolves(returnedUser);
      createAuthStub.resolves(returnedAuth);
      await userController.createNewUser(req, res, next);
      expect(createUserStub).to.be.calledOnce;
      expect(createAuthStub).to.be.calledOnce;
      expect(setCustomUserClaim).to.be.calledOnce;
      expect(setCustomUserClaim).to.be.calledWith(returnedAuth.firebaseId);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('user created');
    });
    it('should call res.send with a status of 400 when there is no user email', function () {
      req.body.customAuthUser.email = null;
      userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('missing data');
    });
    it('should call res.send with a status of 400 when there is no firebase id', function () {
      req.body.customAuthUser.firebaseId = null;
      userController.createNewUser(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(setCustomUserClaim).to.not.be.called;
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith('missing data');
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
    it('should call res.send with a status of 200 when adding an address is successful'/*, async () => {
      handleAddAddressStub.resolves(amendedUser);
      await userController.addAddress(req, res, next);
      expect(res.status).to.be.calledOnce;
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledOnce;
      expect(res.send).to.be.calledWith(amendedUser);
    }*/);
    afterEach(() => {
      sandbox.restore();
    })
  })
});
