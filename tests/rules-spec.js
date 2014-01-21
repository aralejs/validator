define(function (require) {
    var Core = require('core'),
        $ = require('$'),
        expect = require('expect');

    describe('rules', function () {

        beforeEach(function () {
            $('<form id="test-form" style="display:none"><input name="email" id="email" /><input name="password" id="password" /></form>')
                .appendTo(document.body);
        });

        afterEach(function () {
            $('[name=email]').val('');
            $('#test-form').remove();
        });

        it('email', function () {
            $('[name=email]').val('abc');
            Core.validate({
                element: '[name=email]',
                rule: 'email',
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('email');
                    expect(message).to.be.ok();
                    expect(element.get(0)).to.be($('[name=email]').get(0));
                }
            });

            $('[name=email]').val('abc@gmail.com');
            Core.validate({
                element: '[name=email]',
                rule: 'email',
                onItemValidated: function (error, message, element) {
                    expect(error).to.not.be.ok();
                    expect(message).to.not.be.ok();
                    expect(element.get(0)).to.be($('[name=email]').get(0));
                }
            });
        });

        it('email trim', function () {
            $('[name=email]').val('abc');
            Core.validate({
                element: '[name=email]',
                rule: 'email',
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('email');
                    expect(message).to.be.ok();
                    expect(element.get(0)).to.be($('[name=email]').get(0));
                }
            });

            $('[name=email]').val(' abc@gmail.com  ');
            Core.validate({
                element: '[name=email]',
                rule: 'email',
                onItemValidated: function (error, message, element) {
                    expect(error).to.not.be.ok();
                    expect(message).to.not.be.ok();
                    expect(element.get(0)).to.be($('[name=email]').get(0));
                }
            });
        });

        it('text password radio checkbox', function () {
            $.each(['', 'a', '#@#', '..'], function (j, value) {
                $('[name=email]').val(value);
                $.each(['text', 'password', 'radio', 'checkbox'], function (i, type) {
                    Core.validate({
                        element: '[name=email]',
                        rule: type,
                        onItemValidated: function (error, message, element) {
                            expect(error).to.not.be.ok();
                            expect(message).to.not.be.ok();
                            expect(element.get(0)).to.be($('[name=email]').get(0));
                        }
                    });
                });
            });
        });

        it('url', function () {
            $.each(['ads', 'http', 'https://', 'https'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'url',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['http://shaoshuai', 'https://shaoshuai', 'http://shaoshuai.me', 'https://shaoshuai.me', 'http://www.shaoshuai.me', 'https://www.shaoshuai.me/asdg', 'https://shaoshuai.me/'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'url',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('number', function () {
            $.each(['123', '1', '1e+1', '1e-2', '1e+2', '0.4', '0.3E+1', '0.22e-13', '.3', '.4E+3', '+1.3E-3'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'number',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['a', '.', '1.3e', '1.23.1', '+33e', '.4E3'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'number',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('date', function () {
            $.each(['1912-03-22', '1912-3-22', '2222-02-02', '01/31/1999', '1989年1月2号', '1989年1月2日'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'date',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['12-03-22', '2212-113-02', '1/31/1999', '89年1月2号'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'date',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('min', function () {
            $.each(['1', '2'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'min{min:1}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['0', '-1'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'min{min:1}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('max', function () {
            $.each(['1', '0', '-1'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'max{max:1}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['2', '3'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'max{max:1}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('minlength', function () {
            $.each(['aaaaa', 'aasdsa'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'minlength{min:5}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['s', 'ssds'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'minlength{min:5}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('maxlength', function () {
            $.each(['asdsa', 'asds', '1'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'maxlength{max:5}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['asdfdss', 'sdasdf'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'maxlength{max:5}',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('mobile', function () {
            $.each(['18767382931', '13323232345', '12090983432'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'mobile',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.not.be.ok();
                        expect(message).to.not.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });

            $.each(['2123212343', '123', '3223221232'], function (j, value) {
                $('[name=email]').val(value);
                Core.validate({
                    element: '[name=email]',
                    rule: 'mobile',
                    onItemValidated: function (error, message, element) {
                        expect(error).to.be.ok();
                        expect(message).to.be.ok();
                        expect(element.get(0)).to.be($('[name=email]').get(0));
                    }
                });
            });
        });

        it('confirmation', function () {
            $('[name=email]').val('abc');
            $('[name=password]').val('abc');
            Core.validate({
                element: '[name=password]',
                rule: 'confirmation{target: "[name=email]"}',
                onItemValidated: function (error, message, element) {
                    expect(error).to.not.be.ok();
                    expect(message).to.not.be.ok();
                    expect(element.get(0)).to.be($('[name=password]').get(0));
                }
            });

            $('[name=password]').val('ab');
            Core.validate({
                element: '[name=password]',
                rule: 'confirmation{target: "[name=email]"}',
                onItemValidated: function (error, message, element) {
                    expect(error).to.be.ok();
                    expect(message).to.be.ok();
                    expect(element.get(0)).to.be($('[name=password]').get(0));
                }
            });
        });


        // 自定义规则
        it("custom rules", function (done) {
            Core.addRule('myemail', function (options) {
                var element = options.element;
                return element.val() === "abc@gmail.com";
            }, '{{display}}必须是abc@gmail.com');

            $('[name=email]').val('abc@gmail.com');
            Core.validate({
                element: '[name=email]',
                rule: 'myemail',
                onItemValidated: function (error, message, element) {
                    expect(error).to.not.be.ok();
                    expect(message).to.not.be.ok();

                    done();
                }
            });
        });

        it("issue 31", function (done) {
            var validatorObj;
            Core.addRule('myemail', function (options) {
                validatorObj = this;
                var element = options.element;
                return element.val() === "abc@gmail.com";
            }, '{{display}}必须是abc@gmail.com');

            $('[name=email]').val('abc@gmail.com');
            Core.validate({
                element: '[name=email]',
                rule: 'myemail',
                onItemValidated: function (error, message, element) {
                    expect(validatorObj instanceof Core).to.be(true);
                    expect(!!validatorObj.addItem).to.be(true);
                    done();
                }
            });
        });

        it("issue 37", function () {
            Core.addRule('test', function (options) {
                options.index = 9;

                return false;
            }, '第{{index}}个字符有问题！');


            $('[name=email]').val('abc@gmail.com');

            Core.validate({
                element: '[name=email]',
                rule: 'test',
                onItemValidated: function (error, message, element) {
                    expect(message).to.be('第9个字符有问题！');
                }
            });

            Core.validate({
                element: '[name=email]',
                rule: 'test',
                errormessageTest: '这里的错误提示中的{{index}}不会被替换！',
                onItemValidated: function (error, message, element) {
                    expect(message).to.be('这里的错误提示中的9不会被替换！');
                }
            });
        });

        it("issue 43: required is a function", function () {
            // required: true, 为空时
            $('[name=email]').val('');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return true;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('required');
                }
            });

            // required: true, 非空时
            $('[name=email]').val('xxx');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return true;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('minlength');
                }
            });

            // required: false, 为空时
            $('[name=email]').val('');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return false;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be(null);
                }
            });
            // required: false, 非空时
            $('[name=email]').val('xxx');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return false;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('minlength');
                }
            });

            // required 由其他条件决定，初始化的时候为 false ，校验前为 true ，为空时
            var isRequired1 = false;
            $('[name=email]').val('');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return isRequired1;
                },
                onItemValidate: function(){
                    isRequired1 = true;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('required');
                }
            });

            // required 由其他条件决定，初始化的时候为 false ，校验前为 true ，非空时
            var isRequired2 = false;
            $('[name=email]').val('xxx');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return isRequired2;
                },
                onItemValidate: function(){
                    isRequired2 = true;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('minlength');
                }
            });

            // required 由其他条件决定，初始化的时候为 true ，校验前为 false ，为空时
            var isRequired3 = true;
            $('[name=email]').val('');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return isRequired3;
                },
                onItemValidate: function(){
                    isRequired3 = false;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be(null);
                }
            });

            // required 由其他条件决定，初始化的时候为 true ，校验前为 false ，非空时
            var isRequired4 = true;
            $('[name=email]').val('xxx');
            Core.validate({
                element: '[name=email]',
                rule: 'minlength{min:5}',
                required: function() {
                    return isRequired4;
                },
                onItemValidate: function(){
                    isRequired4 = false;
                },
                onItemValidated: function (error, message, element) {
                    expect(error).to.be('minlength');
                }
            });
        });

    });
});
