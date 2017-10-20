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
      const message = "this is a custom error message";
      const newError = errorUtils.formatError(message, err);
      expect(newError).to.eql({error:{message: message, err}});
    });
    it('should correctly return an error object without an error', ()=>{
      const message = "this is a custom error message";
      const newError = errorUtils.formatError(message);
      expect(newError).to.eql({error:{message: message}});
    });
  });
  describe('format sendable error', ()=>{
    it('should format an error correctly to be delivered to the user when there is an error present', ()=>{
      const err = new Error('this is an error');
      const message = "this is a custom error message";
      const newError = errorUtils.formatSendableError(message, err);
      expect(newError).to.eql({error:{message: `${message}: ${err.message}`}});
    });
    it('should format an error correctly to be delivered to the user when there is not an error present', ()=>{
      const message = "this is a custom error message";
      const newError = errorUtils.formatSendableError(message);
      expect(newError).to.eql({error:{message: `${message}`}});
    });
  });
  describe('format sendable error from object', ()=>{
    let message, error;
    beforeEach(()=>{
      message = 'this is a message';
      error = new Error('this is an error');
    });
    it('should format a sendable error from a created error object containing an error', ()=>{
      const formattedError = errorUtils.formatError(message, error);
      const sendableFormattedError = errorUtils.formatSendableErrorFromObject(formattedError);
      expect(sendableFormattedError).to.eql({error:{message: `${message}: ${error.message}`}})
    });
    it('should format a sendable error from a created error object not containing an error', ()=>{
      const formattedError = errorUtils.formatError(message);
      const sendableFormattedError = errorUtils.formatSendableErrorFromObject(formattedError);
      expect(sendableFormattedError).to.eql({error:{message: `${message}`}})
    });
  })
});
