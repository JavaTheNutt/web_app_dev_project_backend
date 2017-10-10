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
