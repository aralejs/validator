define(function (require, exports, module) {

    var $ = require('$'),
        async = require('./async'),
        Widget = require('widget'),
        utils = require('./utils'),
        Item = require('./item');

    var validators = [];

    var setterConfig = {
        value: $.noop,
        setter: function (val) {
            return $.isFunction(val) ? val : utils.helper(val);
        }
    };

    var Core = Widget.extend({
        attrs: {
            triggerType: 'blur',
            checkOnSubmit: true,    // 是否在表单提交前进行校验，默认进行校验。
            stopOnError: false,     // 校验整个表单时，遇到错误时是否停止校验其他表单项。
            autoSubmit: true,       // When all validation passed, submit the form automatically.
            checkNull: true,        // 除提交前的校验外，input的值为空时是否校验。
            onItemValidate: setterConfig,
            onItemValidated: setterConfig,
            onFormValidate: setterConfig,
            onFormValidated: setterConfig,
            // 此函数用来定义如何自动获取校验项对应的 display 字段。
            displayHelper: function (item) {
                var labeltext, name;
                var id = item.element.attr('id');
                if (id) {
                    labeltext = $('label[for=' + id + ']').text();
                    if (labeltext) {
                        labeltext = labeltext.replace(/^[\*\s\:\：]*/, '').replace(/[\*\s\:\：]*$/, '');
                    }
                }
                name = item.element.attr('name');
                return labeltext || name;
            },
            showMessage: setterConfig, // specify how to display error messages
            hideMessage: setterConfig, // specify how to hide error messages
            autoFocus: true,           // Automatically focus at the first element failed validation if true.
            failSilently: false,       // If set to true and the given element passed to addItem does not exist, just ignore.
            skipHidden: false          // 如果 DOM 隐藏是否进行校验
        },

        setup: function () {
            //Validation will be executed according to configurations stored in items.
            var self = this;

            self.items = [];

            // 外层容器是否是 form 元素
            if (self.element.is("form")) {
                // 记录 form 原来的 novalidate 的值，因为初始化时需要设置 novalidate 的值，destroy 的时候需要恢复。
                self._novalidate_old = self.element.attr('novalidate');
                // disable html5 form validation
                // todo: http://bugs.jquery.com/ticket/12577
                try {
                    self.element.attr('novalidate', 'novalidate');
                } catch (e) {}

                //If checkOnSubmit is true, then bind submit event to execute validation.
                if (self.get('checkOnSubmit')) {
                    self.element.on("submit.validator", function (e) {
                        e.preventDefault();
                        self.execute(function (err) {
                            if (!err) {
                                self.get('autoSubmit') && self.element.get(0).submit();
                            }
                        });
                    });
                }
            }

            self.on('formValidate', function () {
                $.each(self.items, function (i, item) {
                    item.get('hideMessage').call(self, null, item.element);
                });
            });

            self.on('itemValidated', function (err, message, element, event) {  // todo: element -> item object
                this.query(element).get(err?'showMessage':'hideMessage').call(this, message, element, event);
            });

            self.get('autoFocus') && self.on('formValidated', function (err, results) {
                if (err) {
                    var firstElem = null;
                    $.each(results, function (i, args) {
                        var error = args[0],
                            elem = args[2];
                        if (error) {
                            firstElem = elem;
                            return false;
                        }
                    });
                    self.trigger('autoFocus', firstElem);
                    firstElem.focus();
                }
            });

            validators.push(self);
        },

        Statics: $.extend({helper: utils.helper}, require('./rule'), {
            autoRender: function (cfg) {

                var validator = new this(cfg);

                $('input, textarea, select', validator.element).each(function (i, input) {

                    input = $(input);
                    var type = input.attr('type');

                    if (type == 'button' || type == 'submit' || type == 'reset') {
                        return true;
                    }

                    var options = {};

                    if (type == 'radio' || type == 'checkbox') {
                        options.element = $('[type=' + type + '][name=' + input.attr('name') + ']', validator.element);
                    } else {
                        options.element = input;
                    }


                    if (!validator.query(options.element)) {

                        var obj = utils.parseDom(input);

                        if (!obj.rule) return true;

                        $.extend(options, obj);

                        validator.addItem(options);
                    }
                });
            },

            query: function (selector) {
                return Widget.query(selector);
            },

            // TODO 校验单项静态方法的实现需要优化
            validate: function (options) {
                var element = $(options.element);
                var validator = new Core({
                    element: element.parents()
                });

                validator.addItem(options);
                validator.query(element).execute();
                validator.destroy();
            }
        }),


        addItem: function (cfg) {
            var self = this;
            if ($.isArray(cfg)) {
                $.each(cfg, function (i, v) {
                    self.addItem(v);
                });
                return this;
            }

            cfg = $.extend({
                triggerType: self.get('triggerType'),
                checkNull: self.get('checkNull'),
                displayHelper: self.get('displayHelper'),
                showMessage: self.get('showMessage'),
                hideMessage: self.get('hideMessage'),
                failSilently: self.get('failSilently'),
                skipHidden: self.get('skipHidden')
            }, cfg);

            if (!$(cfg.element).length) {
                if (cfg.failSilently) {
                    return self;
                } else {
                    throw new Error('element does not exist');
                }
            }
            var item = new Item(cfg);

            self.items.push(item);

            item.delegateEvents(item.get('triggerType'), function (e) {
                if (!this.get('checkNull') && !this.element.val()) return;
                this.execute(null, {event: e});
            });

            item.on('all', function (eventName) {
                this.trigger.apply(this, [].slice.call(arguments));
            }, this);

            return this;
        },

        removeItem: function (selector) {
            var self = this,
                target = selector instanceof Item ? selector : findItemBySelector($(selector), self.items);

            erase(target, self.items);

            target.get('hideMessage').call(self, null, target.element);
            target.destroy();

            return self;
        },

        execute: function (callback) {
            var self = this;

            self.trigger('formValidate', self.element);

            var complete = function () {
                var hasError = false;
                $.each(results, function (i, v) {
                    hasError = !!v[0];
                    return !hasError;
                });

                self.trigger('formValidated', hasError, results, self.element);
                callback && callback(hasError, results, self.element);
            };

            var results = [];
            async[self.get('stopOnError') ? "forEachSeries" : "forEach" ](self.items, function (item, cb) {
                item.execute(function (err, message, ele) {
                    results.push([].slice.call(arguments, 0));

                    // Async doesn't allow any of tasks to fail, if you want the final callback executed after all tasks finished.
                    // So pass none-error value to task callback instead of the real result.
                    cb(self.get('stopOnError') ? err : null);
                });
            }, complete);

            return self;
        },

        destroy: function () {
            var self = this;

            if (self.element.is("form")) {
                // todo
                if (self._novalidate_old == undefined)
                    self.element.removeAttr('novalidate');
                else
                    self.element.attr('novalidate', self._novalidate_old);

                self.element.off('submit.validator');
            }


            for (var i = 0; i<=self.items.length-1;i++) {
                self.removeItem(self.items[i]);

            }

            /*$.each(self.items, function (i, item) {
                console.log(item, 'hi', i, self.items);
                self.removeItem(item);
            });
            console.log("hi");*/

            erase(self, validators);

            Core.superclass.destroy.call(this);
        },

        query: function (selector) {
            return findItemBySelector($(selector), this.items);

            // 不使用 Widget.query 是因为, selector 有可能是重复, 选择第一个有可能不是属于
            // 该组件的. 即使 再次使用 this.items 匹配, 也没法找到
            /*var target = Widget.query(selector),
                result = null;
            $.each(this.items, function (i, item) {
                if (item === target) {
                    result = target;
                    return false;
                }
            });
            return result;*/
        }
    });

    // 从数组中删除对应元素
    function erase(target, array) {
        for(var i=0; i<array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                return array;
            }
        }
    }

    function findItemBySelector(target, array) {
        var ret;
        $.each(array, function (i, item) {
            if (target.get(0) === item.element.get(0)) {
                ret = item;
                return false;
            }
        });
        return ret;
    }
    module.exports = Core;
});
