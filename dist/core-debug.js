// Thanks to Caolan McMahon. These codes blow come from his project Async(https://github.com/caolan/async).
define("arale/validator/0.9.2/async-debug", [], function(require, exports, module) {
    var async = {};
    module.exports = async;
    //// cross-browser compatiblity functions ////
    var _forEach = function(arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };
    var _map = function(arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function(x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };
    var _keys = function(obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
    //// exported async module functions ////
    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === "undefined" || !process.nextTick) {
        async.nextTick = function(fn) {
            setTimeout(fn, 0);
        };
    } else {
        async.nextTick = process.nextTick;
    }
    async.forEach = function(arr, iterator, callback) {
        callback = callback || function() {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, function(x) {
            iterator(x, function(err) {
                if (err) {
                    callback(err);
                    callback = function() {};
                } else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                }
            });
        });
    };
    async.forEachSeries = function(arr, iterator, callback) {
        callback = callback || function() {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function() {
            iterator(arr[completed], function(err) {
                if (err) {
                    callback(err);
                    callback = function() {};
                } else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    } else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    var doParallel = function(fn) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [ async.forEach ].concat(args));
        };
    };
    var doSeries = function(fn) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [ async.forEachSeries ].concat(args));
        };
    };
    var _asyncMap = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
            return {
                index: i,
                value: x
            };
        });
        eachfn(arr, function(x, callback) {
            iterator(x.value, function(err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function(err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.series = function(tasks, callback) {
        callback = callback || function() {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function(fn, callback) {
                if (fn) {
                    fn(function(err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        } else {
            var results = {};
            async.forEachSeries(_keys(tasks), function(k, callback) {
                tasks[k](function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function(err) {
                callback(err, results);
            });
        }
    };
});

define("arale/validator/0.9.2/utils-debug", [ "./rule-debug", "./async-debug", "$-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), Rule = require("./rule-debug");
    var u_count = 0;
    function unique() {
        return "__anonymous__" + u_count++;
    }
    function parseRule(str) {
        //eg. valueBetween{min: 1, max: 2}
        var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);
        return {
            name: match[1],
            param: parseJSON(match[2])
        };
    }
    // convent string such as {a: 1, b: 2}, {"a":1, b: '2'} to object
    function parseJSON(str) {
        if (!str) return null;
        var NOTICE = 'Invalid option object "' + str + '".';
        // remove braces
        str = str.slice(1, -1);
        var result = {};
        var arr = str.split(",");
        $.each(arr, function(i, v) {
            arr[i] = $.trim(v);
            if (!arr[i]) throw new Error(NOTICE);
            var arr2 = arr[i].split(":");
            var key = $.trim(arr2[0]), value = $.trim(arr2[1]);
            if (!key || !value) throw new Error(NOTICE);
            result[getValue(key)] = $.trim(getValue(value));
        });
        // 'abc' -> 'abc'  '"abc"' -> 'abc'
        function getValue(str) {
            if (str.charAt(0) == '"' && str.charAt(str.length - 1) == '"' || str.charAt(0) == "'" && str.charAt(str.length - 1) == "'") {
                return eval(str);
            }
            return str;
        }
        return result;
    }
    function parseRules(str) {
        if (!str) return null;
        return str.match(/[a-zA-Z0-9\-\_]+(\{[^\{\}]*\})?/g);
    }
    function parseDom(field) {
        var field = $(field);
        var result = {};
        var arr = [];
        //parse required attribute
        var required = field.attr("required");
        if (required) {
            arr.push("required");
            result.required = true;
        }
        //parse type attribute
        var type = field.attr("type");
        if (type && type != "submit" && type != "cancel" && type != "checkbox" && type != "radio" && type != "select" && type != "select-one" && type != "file" && type != "hidden" && type != "textarea") {
            if (!Rule.getRule(type)) {
                throw new Error('Form field with type "' + type + '" not supported!');
            }
            arr.push(type);
        }
        //parse min attribute
        var min = field.attr("min");
        if (min) {
            arr.push('min{"min":"' + min + '"}');
        }
        //parse max attribute
        var max = field.attr("max");
        if (max) {
            arr.push("max{max:" + max + "}");
        }
        //parse minlength attribute
        var minlength = field.attr("minlength");
        if (minlength) {
            arr.push("minlength{min:" + minlength + "}");
        }
        //parse maxlength attribute
        var maxlength = field.attr("maxlength");
        if (maxlength) {
            arr.push("maxlength{max:" + maxlength + "}");
        }
        //parse pattern attribute
        var pattern = field.attr("pattern");
        if (pattern) {
            var regexp = new RegExp(pattern), name = unique();
            Rule.addRule(name, regexp);
            arr.push(name);
        }
        //parse data-rule attribute to get custom rules
        var rules = field.attr("data-rule");
        rules = rules && parseRules(rules);
        if (rules) arr = arr.concat(rules);
        result.rule = arr.length == 0 ? null : arr.join(" ");
        return result;
    }
    var helpers = {};
    function helper(name, fn) {
        if (fn) {
            helpers[name] = fn;
            return this;
        }
        return helpers[name];
    }
    module.exports = {
        parseRule: parseRule,
        parseRules: parseRules,
        parseDom: parseDom,
        helper: helper
    };
});

define("arale/validator/0.9.2/rule-debug", [ "./async-debug", "$-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug" ], function(require, exports, module) {
    var rules = {}, messages = {}, $ = require("$-debug"), async = require("./async-debug"), Widget = require("arale/widget/1.0.3/widget-debug");
    var Rule = Widget.extend({
        initialize: function(name, operator) {
            this.name = name;
            if (operator instanceof RegExp) {
                this.operator = function(opts, commit) {
                    var result = operator.test($(opts.element).val());
                    commit(result ? null : opts.rule, _getMsg(opts, result));
                };
            } else if (typeof operator == "function") {
                this.operator = function(opts, commit) {
                    var result = operator(opts, function(result, msg) {
                        commit(result ? null : opts.rule, msg || _getMsg(opts, result));
                    });
                    if (result !== undefined) {
                        commit(result ? null : opts.rule, _getMsg(opts, result));
                    }
                };
            } else {
                throw new Error("The second argument must be a regexp or a function.");
            }
        },
        and: function(name, options) {
            if (name instanceof Rule) {
                var target = name;
            } else {
                var target = getRule(name, options);
            }
            if (!target) {
                throw new Error('No rule with name "' + name + '" found.');
            }
            var that = this;
            var operator = function(opts, commit) {
                that.operator(opts, function(err, msg) {
                    if (err) {
                        commit(err, _getMsg(opts, !err));
                    } else {
                        target.operator(opts, commit);
                    }
                });
            };
            return new Rule(null, operator);
        },
        or: function(name, options) {
            if (name instanceof Rule) {
                var target = name;
            } else {
                var target = getRule(name, options);
            }
            if (!target) {
                throw new Error('No rule with name "' + name + '" found.');
            }
            var that = this;
            var operator = function(opts, commit) {
                that.operator(opts, function(err, msg) {
                    if (err) {
                        target.operator(opts, commit);
                    } else {
                        commit(null, _getMsg(opts, true));
                    }
                });
            };
            return new Rule(null, operator);
        },
        not: function(options) {
            var target = getRule(this.name, options);
            var operator = function(opts, commit) {
                target.operator(opts, function(err, msg) {
                    if (err) {
                        commit(null, _getMsg(opts, true));
                    } else {
                        commit(true, _getMsg(opts, false));
                    }
                });
            };
            return new Rule(null, operator);
        }
    });
    function addRule(name, operator, message) {
        if ($.isPlainObject(name)) {
            $.each(name, function(i, v) {
                if ($.isArray(v)) addRule(i, v[0], v[1]); else addRule(i, v);
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
        if (opts.message) {
            // user specifies a message
            if ($.isPlainObject(opts.message)) {
                msgtpl = opts.message[b ? "success" : "failure"];
            } else {
                //just string
                msgtpl = b ? "" : opts.message;
            }
        } else {
            // use default
            msgtpl = messages[ruleName][b ? "success" : "failure"];
        }
        return msgtpl ? compileTpl(opts, msgtpl) : msgtpl;
    }
    function setMessage(name, msg) {
        if ($.isPlainObject(name)) {
            $.each(name, function(i, v) {
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
    function getOperator(name) {
        return rules[name].operator;
    }
    function getRule(name, opts) {
        if (opts) {
            var rule = rules[name];
            return new Rule(null, function(options, commit) {
                rule.operator($.extend(null, options, opts), commit);
            });
        } else {
            return rules[name];
        }
    }
    function compileTpl(obj, tpl) {
        var result = tpl;
        var regexp1 = /\{\{[^\{\}]*\}\}/g, regexp2 = /\{\{(.*)\}\}/;
        var arr = tpl.match(regexp1);
        arr && $.each(arr, function(i, v) {
            var key = v.match(regexp2)[1];
            var value = obj[$.trim(key)];
            result = result.replace(v, value);
        });
        return result;
    }
    addRule("required", function(options) {
        var element = $(options.element);
        var t = element.attr("type");
        switch (t) {
          case "checkbox":
          case "radio":
            var checked = false;
            element.each(function(i, item) {
                if ($(item).prop("checked")) {
                    checked = true;
                    return false;
                }
            });
            return checked;

          default:
            return Boolean(element.val());
        }
    }, "请输入{{display}}");
    addRule("email", /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, "{{display}}的格式不正确");
    addRule("text", /.*/);
    addRule("password", /.*/);
    addRule("radio", /.*/);
    addRule("checkbox", /.*/);
    addRule("url", /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, "{{display}}的格式不正确");
    addRule("number", /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/, "{{display}}的格式不正确");
    addRule("date", /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/, "{{display}}的格式不正确");
    addRule("min", function(options) {
        var element = options.element, min = options.min;
        return Number(element.val()) >= Number(min);
    }, "{{display}}必须大于或者等于{{min}}");
    addRule("max", function(options) {
        var element = options.element, max = options.max;
        return Number(element.val()) <= Number(max);
    }, "{{display}}必须小于或者等于{{max}}");
    addRule("minlength", function(options) {
        var element = options.element;
        var l = element.val().length;
        return l >= Number(options.min);
    }, "{{display}}的长度必须大于或等于{{min}}");
    addRule("maxlength", function(options) {
        var element = options.element;
        var l = element.val().length;
        return l <= Number(options.max);
    }, "{{display}}的长度必须小于或等于{{max}}");
    addRule("mobile", /^1\d{10}$/, "请输入正确的{{display}}");
    addRule("confirmation", function(options) {
        var element = options.element, target = $(options.target);
        return element.val() == target.val();
    }, "两次输入的{{display}}不一致，请重新输入");
    module.exports = {
        addRule: addRule,
        setMessage: setMessage,
        getRule: getRule,
        getOperator: getOperator
    };
});

define("arale/validator/0.9.2/item-debug", [ "./utils-debug", "./rule-debug", "./async-debug", "$-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), utils = require("./utils-debug"), Widget = require("arale/widget/1.0.3/widget-debug"), async = require("./async-debug"), Rule = require("./rule-debug");
    var setterConfig = {
        value: function() {},
        setter: function(val) {
            return typeof val != "function" ? utils.helper(val) : val;
        }
    };
    var Item = Widget.extend({
        attrs: {
            rule: "",
            display: null,
            displayHelper: null,
            triggerType: {
                setter: function(val) {
                    if (!val) return val;
                    var element = $(this.get("element")), type = element.attr("type");
                    var b = element.get(0).tagName.toLowerCase().indexOf("select") > -1 || type == "radio" || type == "checkbox";
                    if (b && (val.indexOf("blur") > -1 || val.indexOf("key") > -1)) return "change";
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
        setup: function() {
            if (this.get("required")) {
                if (!this.get("rule") || this.get("rule").indexOf("required") < 0) {
                    this.set("rule", "required " + this.get("rule"));
                }
            }
            if (!this.get("display") && typeof this.get("displayHelper") == "function") {
                this.set("display", this.get("displayHelper")(this));
            }
        },
        execute: function(callback, context) {
            context = context || {};
            if (this.get("skipHidden") && eleIsHidden(this.element)) {
                callback && callback(null, "", this.element);
                return this;
            }
            this.trigger("itemValidate", this.element, context.event);
            var rules = utils.parseRules(this.get("rule")), that = this;
            if (!rules) {
                callback && callback(null, "", this.element);
                return this;
            }
            _metaValidate(this.element, this.get("required"), rules, this.get("display"), function(err, msg) {
                if (err) {
                    var message = that.get("errormessage") || that.get("errormessage" + upperFirstLetter(err)) || msg;
                } else {
                    var message = msg;
                }
                that.trigger("itemValidated", err, message, that.element, context.event);
                callback && callback(err, message, that.element);
            });
            return this;
        }
    });
    function upperFirstLetter(str) {
        str = String(str);
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function _metaValidate(ele, required, rules, display, callback) {
        if (!required) {
            var truly = false;
            var t = ele.attr("type");
            switch (t) {
              case "checkbox":
              case "radio":
                var checked = false;
                ele.each(function(i, item) {
                    if ($(item).prop("checked")) {
                        checked = true;
                        return false;
                    }
                });
                truly = checked;
                break;

              default:
                truly = Boolean(ele.val());
            }
            if (!truly) {
                callback && callback(null, null);
                return;
            }
        }
        if (!$.isArray(rules)) throw new Error("No validation rule specified or not specified as an array.");
        var tasks = [];
        $.each(rules, function(i, item) {
            var obj = utils.parseRule(item), ruleName = obj.name, param = obj.param;
            var rule = Rule.getOperator(ruleName);
            if (!rule) throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');
            var options = $.extend({}, param, {
                element: ele,
                display: param && param.display || display,
                rule: ruleName
            });
            tasks.push(function(cb) {
                rule(options, cb);
            });
        });
        async.series(tasks, function(err, results) {
            callback && callback(err, results[results.length - 1]);
        });
    }
    function eleIsHidden(ele) {
        if (!ele) return true;
        ele = ele[0] || ele;
        return !ele.offsetHeight;
    }
    module.exports = Item;
});

define("arale/validator/0.9.2/core-debug", [ "./async-debug", "./utils-debug", "./rule-debug", "./item-debug", "$-debug", "arale/widget/1.0.3/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug" ], function(require, exports, module) {
    var $ = require("$-debug"), async = require("./async-debug"), Widget = require("arale/widget/1.0.3/widget-debug"), utils = require("./utils-debug"), Item = require("./item-debug");
    var validators = [];
    var setterConfig = {
        value: function() {},
        setter: function(val) {
            return typeof val != "function" ? utils.helper(val) : val;
        }
    };
    // 记录外层容器是否是 form 元素
    var isForm;
    // 记录 form 原来的 novalidate 的值，因为初始化时需要设置 novalidate 的值，destroy的时候需要恢复。
    var novalidate_old = undefined;
    var Core = Widget.extend({
        attrs: {
            triggerType: "blur",
            checkOnSubmit: true,
            //是否在表单提交前进行校验，默认进行校验。
            stopOnError: false,
            //校验整个表单时，遇到错误时是否停止校验其他表单项。
            autoSubmit: true,
            //When all validation passed, submit the form automatically.
            checkNull: true,
            //除提交前的校验外，input的值为空时是否校验。
            onItemValidate: setterConfig,
            onItemValidated: setterConfig,
            onFormValidate: setterConfig,
            onFormValidated: setterConfig,
            // 此函数用来定义如何自动获取校验项对应的 display 字段。
            displayHelper: function(item) {
                var labeltext, name;
                var id = item.element.attr("id");
                if (id) {
                    labeltext = $("label[for=" + id + "]").text();
                    if (labeltext) {
                        labeltext = labeltext.replace(/^[\*\s\:\：]*/, "").replace(/[\*\s\:\：]*$/, "");
                    }
                }
                name = item.element.attr("name");
                //this.set('display', labeltext || name);
                return labeltext || name;
            },
            showMessage: setterConfig,
            // specify how to display error messages
            hideMessage: setterConfig,
            // specify how to hide error messages
            autoFocus: true,
            // Automatically focus at the first element failed validation if true.
            failSilently: false,
            // If set to true and the given element passed to addItem does not exist, just ignore.
            skipHidden: false
        },
        setup: function() {
            //Validation will be executed according to configurations stored in items.
            var that = this;
            this.items = [];
            isForm = this.element.get(0).tagName.toLowerCase() == "form";
            if (isForm) {
                novalidate_old = this.element.attr("novalidate");
                //disable html5 form validation
                this.element.attr("novalidate", "novalidate");
                //If checkOnSubmit is true, then bind submit event to execute validation.
                if (this.get("checkOnSubmit")) {
                    this.element.submit(function(e) {
                        e.preventDefault();
                        that.execute(function(err) {
                            if (!err) {
                                that.get("autoSubmit") && that.element.get(0).submit();
                            }
                        });
                    });
                }
            }
            this.on("formValidate", function() {
                var that = this;
                $.each(this.items, function(i, item) {
                    that.query(item.element).get("hideMessage").call(that, null, item.element);
                });
            });
            this.on("itemValidated", function(err, message, element) {
                if (err) this.query(element).get("showMessage").call(this, message, element); else this.query(element).get("hideMessage").call(this, message, element);
            });
            if (this.get("autoFocus")) {
                this.on("formValidated", function(err, results) {
                    if (err) {
                        var firstEle = null;
                        $.each(results, function(i, args) {
                            var error = args[0], ele = args[2];
                            if (error) {
                                firstEle = ele;
                                return false;
                            }
                        });
                        that.trigger("autoFocus", firstEle);
                        firstEle.focus();
                    }
                });
            }
            validators.push(this);
        },
        Statics: $.extend({
            helper: utils.helper
        }, require("./rule-debug"), {
            autoRender: function(cfg) {
                var validator = new this(cfg);
                $("input, textarea, select", validator.element).each(function(i, input) {
                    input = $(input);
                    var type = input.attr("type");
                    if (type == "button" || type == "submit" || type == "reset") {
                        return true;
                    }
                    var options = {};
                    if (type == "radio" || type == "checkbox") {
                        options.element = $("[type=" + type + "][name=" + input.attr("name") + "]", validator.element);
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
            query: function(selector) {
                return Widget.query(selector);
            },
            // TODO 校验单项静态方法的实现需要优化
            validate: function(options) {
                var element = $(options.element);
                var validator = new Core({
                    element: element.parents()
                });
                validator.addItem(options);
                validator.query(element).execute();
                validator.destroy();
            }
        }),
        addItem: function(cfg) {
            var that = this;
            if ($.isArray(cfg)) {
                $.each(cfg, function(i, v) {
                    that.addItem(v);
                });
                return this;
            }
            cfg = $.extend({
                triggerType: this.get("triggerType"),
                checkNull: this.get("checkNull"),
                displayHelper: this.get("displayHelper"),
                showMessage: this.get("showMessage"),
                hideMessage: this.get("hideMessage"),
                failSilently: this.get("failSilently"),
                skipHidden: this.get("skipHidden")
            }, cfg);
            if ($(cfg.element).length == 0) {
                if (cfg.failSilently) {
                    return this;
                } else {
                    throw new Error("element does not exist");
                }
            }
            var item = new Item(cfg);
            this.items.push(item);
            item.set("_handler", function(e) {
                if (!item.get("checkNull") && !item.element.val()) return;
                item.execute(null, {
                    event: e
                });
            });
            var t = item.get("triggerType");
            t && this.element.on(t, "[" + DATA_ATTR_NAME + "=" + stampItem(item) + "]", item.get("_handler"));
            item.on("all", function(eventName) {
                this.trigger.apply(this, [].slice.call(arguments));
            }, this);
            return this;
        },
        removeItem: function(selector) {
            var target = selector instanceof Item ? selector.element : $(selector), items = this.items, that = this;
            var j;
            $.each(this.items, function(i, item) {
                if (target.get(0) == item.element.get(0)) {
                    j = i;
                    item.get("hideMessage").call(that, null, item.element);
                    that.element.off(item.get("triggerType"), "[" + DATA_ATTR_NAME + "=" + stampItem(item) + "]", item.get("_handler"));
                    item.destroy();
                    return false;
                }
            });
            j !== undefined && this.items.splice(j, 1);
            return this;
        },
        execute: function(callback) {
            var that = this;
            this.trigger("formValidate", this.element);
            var complete = function() {
                var hasError = null;
                $.each(results, function(i, v) {
                    hasError = Boolean(v[0]);
                    return !hasError;
                });
                that.trigger("formValidated", Boolean(hasError), results, that.element);
                callback && callback(Boolean(hasError), results, that.element);
            };
            var results = [];
            if (this.get("stopOnError")) {
                async.forEachSeries(this.items, function(item, cb) {
                    item.execute(function(err, message, ele) {
                        results.push([].slice.call(arguments, 0));
                        cb(err);
                    });
                }, complete);
            } else {
                async.forEach(this.items, function(item, cb) {
                    item.execute(function(err, message, ele) {
                        results.push([].slice.call(arguments, 0));
                        // Async doesn't allow any of tasks to fail, if you want the final callback executed after all tasks finished. So pass none-error value to task callback instead of the real result.
                        cb(null);
                    });
                }, complete);
            }
            return this;
        },
        destroy: function() {
            if (isForm) {
                if (novalidate_old == undefined) this.element.removeAttr("novalidate"); else this.element.attr("novalidate", novalidate_old);
                this.element.unbind("submit");
            }
            var that = this;
            $.each(this.items, function(i, item) {
                that.removeItem(item);
            });
            var j;
            $.each(validators, function(i, validator) {
                if (validator == this) {
                    j = i;
                    return false;
                }
            });
            validators.splice(j, 1);
            Core.superclass.destroy.call(this);
        },
        query: function(selector) {
            var target = Widget.query(selector), result = null;
            $.each(this.items, function(i, item) {
                if (item === target) {
                    result = target;
                    return false;
                }
            });
            return result;
        }
    });
    var DATA_ATTR_NAME = "data-validator-set";
    function stampItem(item) {
        var set = item.element.attr(DATA_ATTR_NAME);
        if (!set) {
            set = item.cid;
            item.element.attr(DATA_ATTR_NAME, set);
        }
        return set;
    }
    module.exports = Core;
});