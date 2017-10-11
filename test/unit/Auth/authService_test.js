require('module-alias/register');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const admin = require('firebase-admin');
const sandbox = sinon.sandbox.create();
const authService = require('@Auth/authService');
describe('auth service', function(){
  'use strict';
  describe('app authentication', ()=>{
    let req, verifyTokenStub;
    beforeEach(()=>{
      req = {
        headers: {
          token: 'testtoken'
        }
      };
      verifyTokenStub = sandbox.stub(authService, 'validateToken');
    });
    afterEach(()=>{
      sandbox.restore();
    });
    it('should return the required details when a token is present', async ()=>{
      verifyTokenStub.resolves({sub: 'test@test.com'});
      const result = await authService.authenticate(req);
      expect(result.email).to.exist;
    });
    it('should fail when called with no params', async()=>{
      const result = await authService.authenticate();
      expect(result).to.be.false;
    });
    it('should fail when no token is present', async function () {
      req.headers.token = null;
      const result = await authService.authenticate(req);
      expect(result).to.be.false;
    });
    it('should fail when no headers are present', async function () {
      req.headers = null;
      const result = await authService.authenticate(req);
      expect(result).to.be.false;
    });
  });
  describe('jwt validation', ()=>{
    let verifyStub;
    let decodedToken = {sub: 'test@test.com'};
    afterEach(function(){
      sandbox.restore();
    });
    it('should return true when it recieves a jwt to validate', async function (){
      verifyStub = {verifyIdToken: sandbox.stub().resolves(decodedToken)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken('testtoken');
      expect(result).to.exist;
      expect(verifyStub.verifyIdToken).to.be.calledWith('testtoken');
      expect(verifyStub.verifyIdToken).to.be.calledOnce;
      expect(result.sub).to.equal(decodedToken.sub)
    });
    it('should fail when passed an empty string', async function(){
      verifyStub = {verifyIdToken: sandbox.stub().resolves(false)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken('');
      expect(result).to.be.false;
      expect(verifyStub.verifyIdToken).to.not.be.called;
    });
    it('should fail when passed an no params', async function(){
      verifyStub = {verifyIdToken: sandbox.stub().resolves(false)};
      sandbox.stub(admin, 'auth').returns(verifyStub);
      const result = await authService.validateToken();
      expect(result).to.be.false;
      expect(verifyStub.verifyIdToken).to.not.be.called;
    });
    it('should fail when passed null', async function(){
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
  })
});
