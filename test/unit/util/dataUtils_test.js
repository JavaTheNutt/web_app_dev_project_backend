require('module-alias/register');
const chai   = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();
const dataUtils = require('@util/dataUtils');
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
    })
  })
});
