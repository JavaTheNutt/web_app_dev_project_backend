require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();
const dataUtils = require('@util/dataUtils');
const errorUtils = require('@util/errorUtils');
describe('data utils', ()=>{
  'use strict';
  describe('format data', ()=>{
    it('should format a data response from an object', ()=>{
      const dataPiece = {foo:'bar'};
      const result = dataUtils.formatData(dataPiece);
      expect(result).to.eql({data:dataPiece});
    });
    it('should return the data that it is given if it is already wrapped', ()=>{
      const data = {data:{foo:'bar'}};
      const result = dataUtils.formatData(data);
      expect(result).to.eql(data);
    });
    it('should strip extra properties', ()=>{
      const data = {data:{foo:'bar'}, message: 'hello'};
      const result = dataUtils.formatData(data);
      expect(result.message).to.not.exist;
    });
    it('should handle errors passed as data', ()=>{
      const err = errorUtils.formatError('this is a message', new Error('this is an error'));
      const result = dataUtils.formatData(err);
      expect(result).to.eql(err);
    });
    it('should handle undefined data', ()=>{
      const result = dataUtils.formatData();
      expect(result).to.not.exist;
    });
    it('should handle null data', ()=>{
      const result = dataUtils.formatData(null);
      expect(result).to.not.exist;
    });
    it('should treat false as a regular data property', ()=>{
      const result = dataUtils.formatData(false);
      expect(result).to.eql({data: false});
    });
    it('should treat 0 as a regular data property', ()=>{
      const result = dataUtils.formatData(0);
      expect(result).to.eql({data: 0});
    });
    it('should return properly wrapped errors when directly passed', ()=>{
      const err = new Error('this is an error');
      const result = dataUtils.formatData(err);
      expect(result).to.eql(errorUtils.formatError('data service was passed a raw error', err));
    });
    it('should return properly wrapped errors when passed inside data object', ()=>{
      const err = new Error('this is an error');
      const result = dataUtils.formatData({data:err});
      expect(result).to.eql(errorUtils.formatError('data service was passed a raw error', err));
    })
  })
});
