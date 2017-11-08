require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;

const errorUtils = require('@util/errorUtils');

describe('error utils', () => {
  'use strict';
  describe('format error', () => {
    it('should correctly return an error object with an error', () => {
      const err      = new Error('this is an error');
      const message  = 'this is a custom error message';
      const newError = errorUtils.formatError(message, err);
      expect(newError).to.eql({
        error: {
          message,
          err
        }
      });
    });
    it('should correctly return an error object without an error', () => {
      const message  = 'this is a custom error message';
      const newError = errorUtils.formatError(message);
      expect(newError).to.eql({error: {message}});
    });
    it('should correctly return an error object with an attached status code, and error', () => {
      const err     = new Error('i am an error');
      const message = 'not found';
      const newErr  = errorUtils.formatError(message, err, 404);
      expect(newErr).to.eql({
        error: {
          message,
          err,
          status: 404
        }
      });
    });
    it('should correctly return an error object with an attached status code and no error', () => {
      const message = 'not found';
      const newErr  = errorUtils.formatError(message, null, 404);
      expect(newErr).to.eql({
        error: {
          message,
          status: 404
        }
      });
    });
  });
  describe('format sendable error', () => {
    it('should format an error correctly to be delivered to the user when there is an error present', () => {
      const err      = new Error('this is an error');
      const message  = 'this is a custom error message';
      const newError = errorUtils.formatSendableError(message, err);
      expect(newError).to.eql({error: {message: `${message}: ${err.message}`}});
    });
    it('should format an error correctly to be delivered to the user when there is not an error present', () => {
      const message  = 'this is a custom error message';
      const newError = errorUtils.formatSendableError(message);
      expect(newError).to.eql({error: {message}});
    });
    it('should strip  the status code before sending', () => {
      const message  = 'this is a custom error message';
      const newError = errorUtils.formatSendableError(message, null, 404);
      expect(newError).to.eql({error: {message}});
    });
  });
  describe('format sendable error from object', () => {
    let message, error;
    beforeEach(() => {
      message = 'this is a message';
      error   = new Error('this is an error');
    });
    it('should format a sendable error from a created error object containing an error', () => {
      const formattedError         = errorUtils.formatError(message, error);
      const sendableFormattedError = errorUtils.formatSendableErrorFromObject(formattedError);
      expect(sendableFormattedError).to.eql({error: {message: `${message}: ${error.message}`}});
    });
    it('should format a sendable error from a created error object not containing an error', () => {
      const formattedError         = errorUtils.formatError(message);
      const sendableFormattedError = errorUtils.formatSendableErrorFromObject(formattedError);
      expect(sendableFormattedError).to.eql({error: {message}});
    });
    it('should format a sendable error from a created error object not containing an error, but containing a status code', () => {
      const formattedError         = errorUtils.formatError(message, null, 404);
      const sendableFormattedError = errorUtils.formatSendableErrorFromObject(formattedError);
      expect(sendableFormattedError).to.eql({error: {message}});
    });
  });
  describe('update error message', () => {
    it('should correctly handle updating an error message when an error is present', () => {
      const err        = new Error('this is an error');
      const error      = errorUtils.formatError('this is the old message', err);
      const updatedErr = errorUtils.updateErrorMessage('this is a new message', error);
      expect(updatedErr).to.eql(errorUtils.formatError('this is a new message', err));
    });
    it('should correctly handle updating an error message when an error is not present', () => {
      const error      = errorUtils.formatError('this is the old message');
      const updatedErr = errorUtils.updateErrorMessage('this is a new message', error);
      expect(updatedErr).to.eql(errorUtils.formatError('this is a new message'));
    });
    it('should correctly handle updating an error message when a status is present', () => {
      const error      = errorUtils.formatError('this is the old message', null, 404);
      const updatedErr = errorUtils.updateErrorMessage('this is a new message', error);
      expect(updatedErr).to.eql(errorUtils.formatError('this is a new message', null, 404));
    });
  });
  describe('update status code', () => {
    it('should update a status code when a code already exists on the object', () => {
      const error      = errorUtils.formatError('this is a message', null, 404);
      const updatedErr = errorUtils.updateStatusCode(500, error);
      expect(updatedErr).to.eql(errorUtils.formatError('this is a message', null, 500));
    });
    it('should update a status code when there is no existing code on the error', () => {
      const error      = errorUtils.formatError('this is a message', null);
      const updatedErr = errorUtils.updateStatusCode(500, error);
      expect(updatedErr).to.eql(errorUtils.formatError('this is a message', null, 500));
    });
  });
});
