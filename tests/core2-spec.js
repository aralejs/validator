define(function(require) {
    var Core = require('../src/core'),
        Item = require('../src/item'),
        $ = require('$');

    describe('validator-core', function() {

        if (!$('#container').length) {
            $('<div id="container"><input name="email" id="email" /><input name="password" id="password" /></div>')
                .appendTo(document.body);
        }

        var validator;
        beforeEach(function() {
            validator = new Core({
                element: '#container'
            });
        });

        afterEach(function() {
            validator.destroy();
        });

        test('element', function() {
            expect(validator.element.is('#container')).toBe(true);
        });

        test('execute', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });
            validator.execute(function(err, results, ele) {
                expect(err).toBe(true);
                expect(results instanceof Array).toBe(true);
                expect(results[0][0]).toBe('required');
                expect(results[0][1]).toBe('请输入email');
                expect(results[0][2].get(0)).toBe($('[name=email]').get(0));
                expect(ele.get(0)).toBe($('#container').get(0));
            });
        });

        test('events', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            validator.on('formValidate', function(ele) {
                expect(ele.get(0)).toBe($('#container').get(0));
            });

            validator.on('formValidated', function(err, results, ele) {
                expect(err).toBe(true);
                expect(results instanceof Array).toBe(true);
                expect(results[0][0]).toBe('required');
                expect(results[0][1]).toBe('请输入email');
                expect(results[0][2].get(0)).toBe($('[name=email]').get(0));
                expect(ele.get(0)).toBe($('#container').get(0));
            });

            validator.execute();
        });


               
    });
});

