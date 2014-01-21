define(function(require) {
    var Validator = require('validator'),
        $ = require('$'),
        expect = require('expect');

    describe('bugs', function() {

        var validator;
        beforeEach(function() {
        });

        afterEach(function() {
            validator.destroy();
            $('#test-form').remove();
        });

        // fixed by https://github.com/aralejs/validator/commit/b037e4e8e82dc5bf4d40a2e922f43ac5b8d1a20c
        it('multiable form has same name field', function() {
            $('<form id="test-form">\
                <input name="email" id="email" />\
              </form>').appendTo(document.body);
            $('<form id="test-form2">\
                <input name="email" id="email" />\
              </form>').appendTo(document.body);
            validator = new Validator({
                element: '#test-form'
            });
            validator.addItem({
               element: '[name=email]',
               required: true
            });
            var validator2 = new Validator({
                element: '#test-form2'
            });
            validator2.addItem({
               element: '[name=email]',
               required: true
            });

            expect(validator.items[0].element.length).to.be(1);
            expect(validator2.items[0].element.length).to.be(1);

            validator2.destroy();
            $('#test-form2').remove();
        });

        it('query item error', function() {
            $('<form id="test-form">\
                <input name="email" id="email" />\
              </form>').appendTo(document.body);
            $('<form id="test-form2">\
                <input name="email" id="email" />\
                <input name="password" id="password" />\
              </form>').appendTo(document.body);
            validator = new Validator({
                element: '#test-form'
            });
            validator.addItem({
               element: '[name=email]',
               required: true
            });

            var validator2 = new Validator({
                element: '#test-form2'
            });
            validator2.addItem({
               element: '[name=email]',
               required: true
            });
            validator2.addItem({
               element: '[name=password]',
               required: true
            });

            expect(validator.query('[name="email"]').element[0]).to.be($('#test-form [name=email]')[0]);
            expect(validator2.query('[name="email"]').element[0]).to.be($('#test-form2 [name=email]')[0]);
            expect(validator2.query('[name="password"]').element[0]).to.be($('#test-form2 [name=password]')[0]);

            validator2.destroy();
            $('#test-form2').remove();
        });

    });
});
