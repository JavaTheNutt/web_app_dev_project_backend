require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();
const errorUtils = require('@util/errorUtils');

describe('error utils', ()=>{
  'use strict';
  describe('format error', ()=>{
    it('should correctly return an error object with an error', ()=>{
      const err = new Error('this is an error');
      const message = "this is a custom erorr message";
      const newError = errorUtils.formatError(message, err);
      expect(newError).to.eql({error:{message: message, err}});
    });
    it('should correctly return an error object without an error', ()=>{
      const message = "this is a custom error message";
      const newError = errorUtils.formatError(message);
      expect(newError).to.eql({error:{message: message}});
    });
  })
});
