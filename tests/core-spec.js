define(function(require) {
    var Core = require('../src/core'),
        Item = require('../src/item'),
        $ = require('$-debug'),
        expect = require('expect');

    describe('validator-core', function() {

        if (!$('#test-form').length) {
            $('<form id="test-form" style="display:none"><input name="email" id="email" /><input name="password" id="password" /></form>')
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

        it('element', function() {
            expect(validator.element.is('#test-form')).to.be(true);
        });

        it('query', function() {
            expect(Core.query('#test-form')).to.be(validator);

            validator.addItem({
                element: '[name=email]',
                required: true
            });
            expect(Core.query('[name=email]') instanceof Item).to.be(true);
        });

        it('execute', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });
            validator.execute(function(err, results, ele) {
                expect(err).to.be(true);
                expect(results instanceof Array).to.be(true);
                expect(results[0][0]).to.be('required');
                expect(results[0][1]).to.be('请输入email');
                expect(results[0][2].get(0)).to.be($('[name=email]').get(0));
                expect(ele.get(0)).to.be($('#test-form').get(0));
            });
        });

        it('events', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            validator.on('formValidate', function(ele) {
                expect(ele.get(0)).to.be($('#test-form').get(0));
            });

            validator.on('formValidated', function(err, results, ele) {
                expect(err).to.be(true);
                expect(results instanceof Array).to.be(true);
                expect(results[0][0]).to.be('required');
                expect(results[0][1]).to.be('请输入email');
                expect(results[0][2].get(0)).to.be($('[name=email]').get(0));
                expect(ele.get(0)).to.be($('#test-form').get(0));
            });

            validator.execute();
        });

        it('required', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            validator.execute(function(err) {
                expect(Boolean(err)).to.be(true);
            });

            $('[name=email]').val('someValue');
            validator.execute(function(err) {
                expect(Boolean(err)).to.be(false);
            });
            $('[name=email]').val('');

        });

        it('email', function() {
            validator.addItem({
                element: '[name=email]',
                required: true,
                errormessageRequired: 'a',
                errormessageEmail: 'abcd',
                rule: 'email'
            });

            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(err).to.be('required');
                expect(msg).to.be('a');
                expect(element.get(0)).to.be($('[name=email]').get(0));
            });

            $('[name=email]').val('abc');
            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(err).to.be('email');
                expect(msg).to.be('abcd');
                expect(element.get(0)).to.be($('[name=email]').get(0));
            });

            Core.query('[name=email]').set('errormessageEmail', 'sss');
            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(err).to.be('email');
                expect(msg).to.be('sss');
                expect(element.get(0)).to.be($('[name=email]').get(0));
            });

            $('[name=email]').val('abc@g.cn');
            Core.query('[name=email]').execute(function(err, msg, element) {
                expect(Boolean(err)).to.be(false);
                expect(Boolean(msg)).to.be(false);
                expect(element.get(0)).to.be($('[name=email]').get(0));
            });

            $('[name=email]').val('');
            
        });

        it('removeItem', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });

            expect(Core.query('[name=email]')).not.to.be(null);
            validator.removeItem('[name=email]');
            expect(Core.query('[name=email]')).to.not.be.ok();
        });

        it('stopOnError false', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            })
            .addItem({
                element: '[name=password]',
                required: true
            });

            validator.on('formValidated', function(err, results) {
                expect(results.length).to.be(2);
            })

            validator.execute();


        });

        it('stopOnError true', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            })
            .addItem({
                element: '[name=password]',
                required: true
            });

            validator.set('stopOnError', true);
            validator.on('formValidated', function(err, results) {
                expect(results.length).to.be(1);
            });

            validator.execute();
        });

    });
});
