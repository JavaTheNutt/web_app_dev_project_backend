require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon          = require('sinon');
const ObjectID       = require('mongoose').Types.ObjectId;
const admin          = require('firebase-admin');
const sandbox        = sinon.sandbox.create();
const authMiddleware = require('@Auth/authMiddleware');
const authService    = require('@Auth/service/authService');
const userAuth       = require('@Auth/models/UserAuth').model;
const errorUtils = require('@util/errorUtils');
describe('auth middleware', function () {
  'use strict';
  describe('new user auth', () => {
    let req, next;
    beforeEach(() => {
      next = sandbox.spy();
    });
    it('should set the is new flag on the request', async () => {
      req = {};
      await(authMiddleware.authenticateNew(req, {}, next));
      expect(req.isNewUser).to.be.true;
      expect(next).to.be.calledOnce;
    });
    afterEach(() => {
      sandbox.restore();
    })
  });
  describe('app authentication', () => {
    let req, res, next, statusStub, sendStub, verifyTokenStub, handleClaimValidationStub, decodedToken;
    beforeEach(() => {
      req                       = {
        headers: {
          token: 'testtoken'
        }
      };
      sendStub                  = {send: sandbox.stub()};
      statusStub                = sandbox.stub().returns(sendStub);
      res                       = {
        status: statusStub
      };
      next                      = sandbox.stub();
      verifyTokenStub           = sandbox.stub(authService, 'validateToken');
      handleClaimValidationStub = sandbox.stub(authService, 'handleClaimValidation');
      decodedToken              = {
        sub: 'somefirebaseidhere',
        email: 'test@test.com'
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should call next with no params when details are valid and token is not custom and not new', async () => {
      verifyTokenStub.resolves({data:decodedToken});
      handleClaimValidationStub.resolves({data:{
        firebaseId: decodedToken.sub,
        email: decodedToken.email,
        user: 'somemongoidhere'
      }});
      await authMiddleware.authenticate(req, res, next);
      expect(verifyTokenStub).to.be.calledOnce;
      expect(verifyTokenStub).to.be.calledWith(req.headers.token);
      expect(handleClaimValidationStub).to.be.calledOnce;
      //expect(fetchUserStub).to.be.calledWith('somefirebaseidhere');
      expect(next).to.be.calledOnce;

    });
    it('should fail when no token is present', async function () {
      req.headers.token = null;
      await authMiddleware.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith(errorUtils.formatError('authentication failed'));
    });
    it('should fail when no headers are present', async function () {
      req.headers = null;
      await authMiddleware.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith(errorUtils.formatError('authentication failed'));
    });
    it('should return 401 when token is deemed invalid', async function () {
      const err = new Error('this is an error');
      verifyTokenStub.resolves(errorUtils.formatError('this is an error wrapper', err));
      await authMiddleware.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith(errorUtils.formatError('authentication failed'));
    })
  });

});
