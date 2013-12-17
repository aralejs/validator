define(function(require) {
    var Validator = require('validator'),
        $ = require('$'),
        expect = require('expect');

    describe('explain message', function() {

        var validator;
        beforeEach(function() {
            $('<form id="test-form">\
                <div class="ui-form-item">\
                <input name="email" id="email" />\
                <div class="ui-form-explain">explain1</div>\
                </div>\
                <div class="ui-form-item">\
                <input name="password" id="password" data-explain="explain2" />\
                </div>\
                <div class="ui-form-item ui-form-item-error">\
                <input name="username" id="username" />\
                <div class="ui-form-explain">explain3</div>\
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

        it('save explain message from DOM', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });
            expect($('[name=email]').attr('data-explain')).to.be('explain1');
            expect($('[name=email]').next().html()).to.be('explain1');
        });

        it('show explain message from data-explain', function() {
            validator.addItem({
                element: '[name=password]',
                required: true
            });
            $('[name=password]').focus();
            expect($('[name=password]').next().html()).to.be('explain2');
        });

        it('should not fetch explain message under error item', function() {
            validator.addItem({
                element: '[name=username]',
                required: true
            });
            expect($('[name=username]').attr('data-explain')).not.to.be('explain3');
            $('[name=username]').focus();
            expect($('[name=username]').next().html()).to.be('');
        });

    });
});

