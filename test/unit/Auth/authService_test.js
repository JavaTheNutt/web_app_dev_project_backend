require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon       = require('sinon');
const ObjectID    = require('mongoose').Types.ObjectId;
const admin       = require('firebase-admin');
const sandbox     = sinon.sandbox.create();
const authService = require('@Auth/authService');
const userAuth    = require('@Auth/models/UserAuth').model;
describe('auth service', function () {
  'use strict';
  describe('app authentication', () => {
    let req, res, next, statusStub, sendStub, verifyTokenStub;
    beforeEach(() => {
      req             = {
        headers: {
          token: 'testtoken'
        }
      };
      sendStub        = {send: sandbox.stub()};
      statusStub      = sandbox.stub().returns(sendStub);
      res             = {
        status: statusStub
      };
      next            = sandbox.stub();
      verifyTokenStub = sandbox.stub(authService, 'validateToken');
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should call next with no params when details are valid', async () => {
      verifyTokenStub.resolves({sub: 'test@test.com'});
      await authService.authenticate(req, res, next);
      expect(next).to.be.calledOnce;
      expect(next).to.be.calledWith();
    });
    it('should fail when no token is present', async function () {
      req.headers.token = null;
      await authService.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith('authentication failed');
    });
    it('should fail when no headers are present', async function () {
      req.headers = null;
      await authService.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith('authentication failed');
    });
    it('should return 401 when token is deemed invalid', async function () {
      verifyTokenStub.resolves(false);
      await authService.authenticate(req, res, next);
      expect(statusStub).to.be.calledOnce;
      expect(statusStub).to.be.calledWith(401);
      expect(sendStub.send).to.be.calledOnce;
      expect(sendStub.send).to.be.calledWith('authentication failed');
    })
  });
  describe('jwt validation', () => {
    let verifyStub;
    let decodedToken = {sub: 'test@test.com'};
    afterEach(function () {
      sandbox.restore();
    });
    it('should return true when it recieves a jwt to validate', async function () {
      verifyStub = {verifyIdToken: sandbox.stub().resolves(decodedToken)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken('testtoken');
      expect(result).to.exist;
      expect(verifyStub.verifyIdToken).to.be.calledWith('testtoken');
      expect(verifyStub.verifyIdToken).to.be.calledOnce;
      expect(result.sub).to.equal(decodedToken.sub)
    });
    it('should fail when passed an empty string', async function () {
      verifyStub = {verifyIdToken: sandbox.stub().resolves(false)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken('');
      expect(result).to.be.false;
      expect(verifyStub.verifyIdToken).to.not.be.called;
    });
    it('should fail when passed an no params', async function () {
      verifyStub = {verifyIdToken: sandbox.stub().resolves(false)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken();
      expect(result).to.be.false;
      expect(verifyStub.verifyIdToken).to.not.be.called;
    });
    it('should fail when passed null', async function () {
      verifyStub = {verifyIdToken: sandbox.stub().resolves(false)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken(null);
      expect(result).to.be.false;
      expect(verifyStub.verifyIdToken).to.not.be.called;
    });
    it('should handle errors gracefully', async function () {
      verifyStub = {verifyIdToken: sandbox.stub().throws(Error('a firebase error occurred'))};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken('testtoken');
      expect(result).to.be.false;
      expect(verifyStub.verifyIdToken).to.be.calledOnce;
    })
  });
  describe('user auth creation', () => {
    let saveStub, authDetails;
    beforeEach(() => {
      saveStub    = sandbox.stub(userAuth.prototype, 'save');
      authDetails = {
        foo: 'bar',
        email: 'test@test.com',
        user: ObjectID().toString(),
        firebaseId: 'somefirebaseidhere'
      }
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should create a new user when provided with correct details', async () => {
      const res = await authService.createAuthUser(authDetails);
      expect(res).to.exist;
      expect(res.foo).to.not.exist;
      expect(res.email).to.equal(authDetails.email);
      expect(res.user.toString()).to.equal(authDetails.user.toString());
      expect(res.firebaseId).to.equal(authDetails.firebaseId);
    });
    it('should handle errors gracefully', async () => {
      saveStub.throws(Error('an error has occurred'));
      const res = await authService.createAuthUser(authDetails);
      expect(res).to.not.exist;
    })
  })
});
