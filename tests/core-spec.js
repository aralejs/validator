define(function(require) {
    var Core = require('../src/core'),
        Item = require('../src/item'),
        $ = require('$'),
        expect = require('expect');

    describe('validator-core', function() {

        var validator;
        beforeEach(function() {
            $('<form id="test-form" style="display:none"><input name="email" id="email" /><input name="password" id="password" /></form>')
                .appendTo(document.body);
            validator = new Core({
                element: '#test-form'
            });
        });

        afterEach(function() {
            validator.destroy();
            $('#test-form').remove();
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


        it('element is disabled', function() {
            validator.addItem({
                element: '[name=email]',
                required: true
            });
            $("[name=email]").attr("disabled", true);

            validator.on('formValidated', function(err, results) {
                expect(err).to.be(false);
                expect(results.length).to.be(1);
            });

            validator.execute();

            $("[name=email]").removeAttr("disabled");
        });


        it('destroy + hideMessage use this.query', function() {
            validator.addItem({
                element: '[name=email]',
                required: true,
                hideMessage: function(message, element) {
                    expect(this.query(element)).to.be.ok()
                }
            });

            validator.destroy();
            expect(validator.items).to.be(undefined);
        });


        it('item.getMessage() ', function() {
            // custom error message
            validator.addItem({
                element: '[name=email]',
                required: true,
                errormessageRequired: 'a',
                errormessageEmail: 'abcd',
                rule: 'email'
            });

            expect(validator.items[0].getMessage('required')).to.be('a');
            expect(validator.items[0].getMessage('email')).to.be('abcd');

            // custom rule
            Core.addRule('test', function(options) {
                options.index = 9;

                return false;
            }, '第{{index}}个字符有问题！');
            validator.addItem({
                element: '[name=email]',
                rule: 'test'
            });
            expect(validator.items[1].getMessage('test', false, {index: 9})).to.be('第9个字符有问题！');

            validator.addItem({
                element: '[name=email]',
                rule: 'test',
                errormessageTest: '这里的错误提示中的{{index}}不会被替换！'
            });
            expect(validator.items[2].getMessage('test', false, {index: 9})).to.be('这里的错误提示中的9不会被替换！');
        });

    });
});
