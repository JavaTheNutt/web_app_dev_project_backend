/**
 * This is the test suite for the model validations that will be shared between models
 */
require('module-alias/register');
const expect = require('chai').expect;

const validationService = require('@user/models/validation/modelValidation');

const ObjectId = require('mongoose').Types.ObjectId;
describe('model validation', () => {
  describe('email validation', () => {
    it('returns false with incorrect emails', () => {
      let tmpEmail = 'joe';
      let res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;
      tmpEmail = 'joe@.com';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;
      tmpEmail = '@joe.com';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;
      tmpEmail = '@.com';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;
      tmpEmail = '@joe.';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;
      tmpEmail = 'joe@joe.c';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;
      tmpEmail = 'joe@joe.';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail}" was a correct email`).to.be.false;

    });
    it('returns true for valid emails', () => {
      let tmpEmail = 'joewemyss@gmail.com';
      let res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail} was an invalid email`).to.be.true;
      tmpEmail = 'joewemyss@gmail.co.uk';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail} was an invalid email`).to.be.true;
      tmpEmail = 'joe.wemyss@gmail.co.uk';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail} was an invalid email`).to.be.true;
      tmpEmail = 'joewemyss+social@gmail.co.uk';
      res      = validationService.validateEmail(tmpEmail);
      expect(res, `thought "${tmpEmail} was an invalid email`).to.be.true;
    });
  });
  describe('object id validation', () => {
    it('should return true for valid object ids', () => {
      const oid1 = ObjectId();
      const oid2 = ObjectId();
      const oid3 = ObjectId();
      let result = validationService.validateObjectId(oid1);
      expect(result).to.be.true;
      result = validationService.validateObjectId(oid2);
      expect(result).to.be.true;
      result = validationService.validateObjectId(oid3);
      expect(result).to.be.true;
    });
    it('should return false for invalid object ids', () => {
      const test01 = 'wwwwwwwwwwwwww';
      const test02 = 'thisisadummystringtotestoid';
      const test03 = '01hj67thbtrs';
      let result   = validationService.validateObjectId(test01);
      expect(result).to.be.false;
      result = validationService.validateObjectId(test02);
      expect(result).to.be.false;
      result = validationService.validateObjectId(test03);
      expect(result).to.be.false;
    });
  });
  describe('optional object id validation', () => {
    it('should return true if a valid id is passed', () => {
      const res = validationService.validateOptionalObjectId(ObjectId());
      expect(res).to.be.true;
    });
    it('should return true when params are undefined', () => {
      const res = validationService.validateOptionalObjectId();
      expect(res).to.be.true;
    });
    it('should return true when params are null', () => {
      const res = validationService.validateOptionalObjectId(null);
      expect(res).to.be.true;
    });
    it('should return true when params are empty string', () => {
      const res = validationService.validateOptionalObjectId('');
      expect(res).to.be.true;
    });
    it('should return false when params are invalid object id', () => {
      const res = validationService.validateOptionalObjectId('wwwwwwwwwwww');
      expect(res).to.be.false;
    });

  });
});
