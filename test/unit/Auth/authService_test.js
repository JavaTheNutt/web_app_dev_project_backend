require('module-alias/register');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const admin = require('firebase-admin');
const sandbox = sinon.sandbox.create();
const authService = require('@Auth/authService');
describe('auth service', ()=>{
  'use strict';
  describe('jwt validation', ()=>{
    beforeEach(()=>{
      sandbox.stub(admin, 'auth').callsFake('verifyIdToken').resolves(true);
    });
    afterEach(()=>{
      sandbox.restore();
    });
    it('should return true when it recieves a jwt to validate', async ()=>{
      const result = await authService.validateToken('testtoken');
      expect(result).to.be.true;
    })
  })
});
