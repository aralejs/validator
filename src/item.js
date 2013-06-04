define(function (require, exports, module) {
    var $ = require('$'),
        utils = require('./utils'),
        Widget = require('widget'),
        async = require('./async'),
        Rule = require('./rule');

    var setterConfig = {
        value: $.noop,
        setter: function (val) {
            return $.isFunction(val) ? val : utils.helper(val);
        }
    };
    var Item = Widget.extend({
        attrs: {
            rule: '',
            display: null,
            displayHelper: null,
            triggerType: {
                setter: function (val) {
                    if (!val)
                        return val;

                    var element = $(this.get('element')),
                        type = element.attr('type');

                    // 将 select, radio, checkbox 的 blur 和 key 事件转成 change
                    var b = element.is("select") || type == 'radio' || type == 'checkbox';
                    if (b && (val.indexOf('blur') > -1 || val.indexOf('key') > -1))
                        return 'change';
                    return val;
                }
            },
            required: false,
            checkNull: true,
            errormessage: null,
            onItemValidate: setterConfig,
            onItemValidated: setterConfig,
            showMessage: setterConfig,
            hideMessage: setterConfig
        },

        setup: function () {
            // 强制给 required 的项设置 required 规则
            if (this.get('required')) {
                if (!this.get('rule') || this.get('rule').indexOf('required') < 0) {
                    this.set('rule', 'required ' + this.get('rule'));
                }
            }

            if (!this.get('display') && $.isFunction(this.get('displayHelper'))) {
                this.set('display', this.get('displayHelper')(this));
            }
        },

        execute: function (callback, context) {
            var self = this;

            context = context || {};
            // 如果是设置了不检查不可见元素的话, 直接 callback
            if (self.get('skipHidden') && !self.element.is(':visible')) {
                callback && callback(null, '', self.element);
                return self;
            }

            self.trigger('itemValidate', self.element, context.event);

            var rules = utils.parseRules(self.get('rule'));

            if (!rules) {
                callback && callback(null, '', self.element);
                return self;
            }

            _metaValidate(self.element, self.get('required'), rules, self.get('display'), function (err, msg) {
                var message = err ? (self.get('errormessage') || self.get('errormessage' + upperFirstLetter(err)) || msg): msg;

                self.trigger('itemValidated', err, message, self.element, context.event);
                callback && callback(err, message, self.element);
            });

            return self;
        }
    });

    function upperFirstLetter(str) {
        str = str + "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function _metaValidate(ele, required, rules, display, callback) {
        if (!required) {
            var truly = false;
            var t = ele.attr('type');
            switch (t) {
                case 'checkbox':
                case 'radio':
                    var checked = false;
                    ele.each(function (i, item) {
                        if ($(item).prop('checked')) {
                            checked = true;
                            return false;
                        }
                    });
                    truly = checked;
                    break;
                default:
                    truly = !!ele.val();
            }

            if (!truly) {
                callback && callback(null, null);
                return;
            }
        }

        if (!$.isArray(rules))
            throw new Error('No validation rule specified or not specified as an array.');

        var tasks = [];

        $.each(rules, function (i, item) {
            var obj = utils.parseRule(item),
                ruleName = obj.name,
                param = obj.param;

            var ruleOperator = Rule.getOperator(ruleName);
            if (!ruleOperator)
                throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');

            var options = $.extend({}, param, {
                element: ele,
                display: (param && param.display) || display,
                rule: ruleName
            });

            tasks.push(function (cb) {
                ruleOperator(options, cb);
            });
        });

        async.series(tasks, function (err, results) {
            callback && callback(err, results[results.length - 1]);
        });
    }

    module.exports = Item;
});
