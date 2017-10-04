require('module-alias/register');
const expect = require('chai').expect;

const validationService = require('@root/models/validation/modelValidation');

describe('model validation', function () {
  describe('email validation', function () {
    it('returns false with incorrect emails', function () {
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
    it('returns true for valid emails', function () {
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
    })
  })
});
