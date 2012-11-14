define(function(require) {
    var Core = require('../src/core'),
        Item = require('../src/item'),
        $ = require('$');

    describe('validator-core', function() {

        if (!$('#test-form').length) {
            $('<form id="test-form"><input name="email" id="email" /><input name="password" id="password" /></form>')
                .appendTo(document.body);
        }

        var validator;
        beforeEach(function() {
            validator = new Core({
                element: '#test-form'
            });
        });

        afterEach(function() {
            validator.destroy();
        });

        test('element', function() {
            expect(validator.element.is('#test-form')).toBe(true);
        });

        test('query', function() {
            expect(Core.query('#test-form')).toBe(validator);

            validator.addItem({
                element: '[name=email]',
                required: true
            });
            expect(Core.query('[name=email]') instanceof Item).toBe(true);
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
                expect(ele.get(0)).toBe($('#test-form').get(0));
            });
        });

        test('events', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            validator.on('formValidate', function(ele) {
                expect(ele.get(0)).toBe($('#test-form').get(0));
            });

            validator.on('formValidated', function(err, results, ele) {
                expect(err).toBe(true);
                expect(results instanceof Array).toBe(true);
                expect(results[0][0]).toBe('required');
                expect(results[0][1]).toBe('请输入email');
                expect(results[0][2].get(0)).toBe($('[name=email]').get(0));
                expect(ele.get(0)).toBe($('#test-form').get(0));
            });

            validator.execute();
        });

        test('required', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            validator.execute(function(err) {
                expect(Boolean(err)).toBe(true);
            });

            $('[name=email]').val('someValue');
            validator.execute(function(err) {
                expect(Boolean(err)).toBe(false);
            });
            $('[name=email]').val('');

        });

        test('email', function() {
            validator.addItem({
                element: '[name=email]',
                required: true,
                errormessageRequired: 'a',
                errormessageEmail: 'abcd',
                rule: 'email'
            });

            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(err).toBe('required');
                expect(msg).toBe('a');
                expect(element.get(0)).toBe($('[name=email]').get(0));
            });

            $('[name=email]').val('abc');
            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(err).toBe('email');
                expect(msg).toBe('abcd');
                expect(element.get(0)).toBe($('[name=email]').get(0));
            });

            Core.query('[name=email]').set('errormessageEmail', 'sss');
            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(err).toBe('email');
                expect(msg).toBe('sss');
                expect(element.get(0)).toBe($('[name=email]').get(0));
            });

            $('[name=email]').val('abc@g.cn');
            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(Boolean(err)).toBe(false);
                expect(Boolean(msg)).toBe(false);
                expect(element.get(0)).toBe($('[name=email]').get(0));
            });

            $('[name=email]').val('');
            
        });

        test('removeItem', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            expect(Core.query('[name=email]')).not.toBe(null);
            validator.removeItem('[name=email]');
            expect(Core.query('[name=email]')).toBe(null);
        });

        test('stopOnError false', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            })
            .addItem({
                element: '[name=password]',
                required: true
            });

            var count = 0;
            validator.on('itemValidated', function(err) {
                count ++;
                expect(count).toBeLessThan(3);
            });

            validator.execute();


        });

        test('stopOnError true', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            })
            .addItem({
                element: '[name=password]',
                required: true
            });

            validator.set('stopOnError', true);
            var count = 0;
            validator.on('itemValidated', function(err) {
                count ++;
                expect(count).toBeLessThan(2);
            });

            validator.execute();
        });

    });
});
