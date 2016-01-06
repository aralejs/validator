var Validator = require('../index'),
    $ = require('spm-jquery'),
    expect = require('spm-expect.js');

describe('display text', function() {

    var validator;
    beforeEach(function() {
        $('<form id="test-form">\
            <div class="ui-form-item">\
            <input name="email" id="email" />\
            </div>\
            <div class="ui-form-item">\
            <label for="password">密码</label>\
            <input name="password" id="password" />\
            </div>\
            <div class="ui-form-item">\
            <label for="username[1]">用户</label>\
            <input name="username" id="username[1]" />\
            </div>\
          </form>').appendTo(document.body);
        validator = new Validator({
            element: '#test-form'
        });
    });

    afterEach(function() {
        validator.destroy();
        $('#test-form').remove();
    });

    it('should get display text from input name', function() {
        validator.addItem({
            element: '[name=email]',
            required: true
        });
        var displayHelper = validator.get('displayHelper');
        expect(displayHelper(validator.query('[name=email]'))).to.be('email');
    });

    it('should get display text from label text matched input name', function() {
        validator.addItem({
            element: '[name=password]',
            required: true
        });
        var displayHelper = validator.get('displayHelper');
        expect(displayHelper(validator.query('[name=password]'))).to.be('密码');
    });

    it('should get display text from label text matched input name with []', function() {
        validator.addItem({
            element: '[name="username"]',
            required: true
        });
        var displayHelper = validator.get('displayHelper');
        expect(displayHelper(validator.query('[name="username"]'))).to.be('用户');
    });

});
