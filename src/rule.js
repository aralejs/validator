define(function (require, exports, module) {
    var $ = require('$'),

        rules = {},
        messages = {};

    function Rule(name, oper) {
        var self = this;

        self.name = name;

        if (oper instanceof RegExp) {
            self.operator = function (opts, commit) {
                var rslt = oper.test($(opts.element).val());
                commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
            };
        } else if ($.isFunction(oper)) {
            self.operator = function (opts, commit) {
                var rslt = oper.call(this, opts, function (result, msg) {
                    commit(result ? null : opts.rule, msg || _getMsg(opts, result));
                });
                // 当是异步判断时, 返回 undefined, 则执行上面的 commit
                if (rslt !== undefined) {
                    commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
                }
            };
        } else {
            throw new Error('The second argument must be a regexp or a function.');
        }
    }

    Rule.prototype.and = function (name, options) {
        var target = name instanceof Rule ? name : getRule(name, options);

        if (!target) {
            throw new Error('No rule with name "' + name + '" found.');
        }

        var that = this;
        var operator = function (opts, commit) {
            that.operator.call(this, opts, function (err, msg) {
                if (err) {
                    commit(err, _getMsg(opts, !err));
                } else {
                    target.operator.call(this, opts, commit);
                }
            });
        };

        return new Rule(null, operator);
    };
    Rule.prototype.or = function (name, options) {
        var target = name instanceof Rule ? name : getRule(name, options);

        if (!target) {
            throw new Error('No rule with name "' + name + '" found.');
        }

        var that = this;
        var operator = function (opts, commit) {
            that.operator.call(this, opts, function (err, msg) {
                if (err) {
                    target.operator.call(this, opts, commit);
                } else {
                    commit(null, _getMsg(opts, true));
                }
            });
        };

        return new Rule(null, operator);
    };
    Rule.prototype.not = function (options) {
        var target = getRule(this.name, options);
        var operator = function (opts, commit) {
            target.operator.call(this, opts, function (err, msg) {
                if (err) {
                    commit(null, _getMsg(opts, true));
                } else {
                    commit(true, _getMsg(opts, false))
                }
            });
        };

        return new Rule(null, operator);
    };


    function addRule(name, operator, message) {
        if ($.isPlainObject(name)) {
            $.each(name, function (i, v) {
                if ($.isArray(v))
                    addRule(i, v[0], v[1]);
                else
                    addRule(i, v);
            });
            return this;
        }

        if (operator instanceof Rule) {
            rules[name] = new Rule(name, operator.operator);
        } else {
            rules[name] = new Rule(name, operator);
        }
        setMessage(name, message);

        return this;
    }

    function _getMsg(opts, b) {
        var ruleName = opts.rule;
        var msgtpl;

        if (opts.message) { // user specifies a message
            if ($.isPlainObject(opts.message)) {
                msgtpl = opts.message[b ? 'success' : 'failure'];
                // if user's message is undefined，use default
                typeof msgtpl === 'undefined' && (msgtpl = messages[ruleName][b ? 'success' : 'failure']);
            } else {//just string
                msgtpl = b ? '' : opts.message
            }
        } else { // use default
            msgtpl = messages[ruleName][b ? 'success' : 'failure'];
        }

        return msgtpl ? compileTpl(opts, msgtpl) : msgtpl;
    }

    function setMessage(name, msg) {
        if ($.isPlainObject(name)) {
            $.each(name, function (i, v) {
                setMessage(i, v);
            });
            return this;
        }

        if ($.isPlainObject(msg)) {
            messages[name] = msg;
        } else {
            messages[name] = {
                failure: msg
            };
        }
        return this;
    }



    function getRule(name, opts) {
        if (opts) {
            var rule = rules[name];
            return new Rule(null, function (options, commit) {
                rule.operator($.extend(null, options, opts), commit);
            });
        } else {
            return rules[name];
        }
    }

    function compileTpl(obj, tpl) {
        var result = tpl;

        var regexp1 = /\{\{[^\{\}]*\}\}/g,
            regexp2 = /\{\{(.*)\}\}/;

        var arr = tpl.match(regexp1);
        arr && $.each(arr, function (i, v) {
            var key = v.match(regexp2)[1];
            var value = obj[$.trim(key)];
            result = result.replace(v, value);
        });
        return result;
    }

    addRule('required', function (options) {
        var element = $(options.element);

        var t = element.attr('type');
        switch (t) {
            case 'checkbox':
            case 'radio':
                var checked = false;
                element.each(function (i, item) {
                    if ($(item).prop('checked')) {
                        checked = true;
                        return false;
                    }
                });
                return checked;
            default:
                return Boolean($.trim(element.val()));
        }
    }, '请输入{{display}}');

    addRule('email', /^\s*([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})\s*$/, '{{display}}的格式不正确');

    addRule('text', /.*/);

    addRule('password', /.*/);

    addRule('radio', /.*/);

    addRule('checkbox', /.*/);

    addRule('url', /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, '{{display}}的格式不正确');

    addRule('number', /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/, '{{display}}的格式不正确');

    // 00123450 是 digits 但不是 number
    // 1.23 是 number 但不是 digits
    addRule('digits', /^\s*\d+\s*$/, '{{display}}的格式不正确');

    addRule('date', /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/, '{{display}}的格式不正确');

    addRule('min', function (options) {
        var element = options.element,
            min = options.min;
        return Number(element.val()) >= Number(min);
    }, '{{display}}必须大于或者等于{{min}}');

    addRule('max', function (options) {
        var element = options.element,
            max = options.max;
        return Number(element.val()) <= Number(max);
    }, '{{display}}必须小于或者等于{{max}}');

    addRule('minlength', function (options) {
        var element = options.element;
        var l = element.val().length;
        return l >= Number(options.min);
    }, '{{display}}的长度必须大于或等于{{min}}');

    addRule('maxlength', function (options) {
        var element = options.element;
        var l = element.val().length;
        return l <= Number(options.max);
    }, '{{display}}的长度必须小于或等于{{max}}');

    addRule('mobile', /^1\d{10}$/, '请输入正确的{{display}}');

    addRule('confirmation', function (options) {
        var element = options.element,
            target = $(options.target);
        return element.val() == target.val();
    }, '两次输入的{{display}}不一致，请重新输入');

    module.exports = {
        addRule: addRule,
        setMessage: setMessage,
        getMessage: function(options, isSuccess) {
            return _getMsg(options, isSuccess);
        },
        getRule: getRule,
        getOperator: function (name) {
            return rules[name].operator;
        }
    };

});
