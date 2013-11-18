# 动态改变校验规则

- order:6

-------------

根据不同的场景变换校验规则


````html
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-form-1.0-src.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-button-orange-1.1-full.css" />

<div class="cell">
    <form id="test-form" class="ui-form">
        <div class="ui-form-item">
            <label class="ui-label"><span class="ui-form-required">*</span>联系方式：</label>
            <input id="phone" type="radio" name="contact" value='phone' />
            <label for="phone">Phone</label>
            <input id="mobile" type="radio" name="contact" value='mobile' />
            <label for="mobile">Mobile</label>
        </div>

        <div class="ui-form-item">
            <label class="ui-label" for="number"><span class="ui-form-required">*</span>号码：</label>
            <input id="number" class="ui-input" name="number" placeholder="7位数字" />
        </div>

        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>
    </form>
</div>
````

````js
seajs.use(['validator', '$'], function(Validator, $) {
    $(function() {
        var validator = new Validator({
            element: '#test-form'
        });

        validator.addItem({
            element: '[name=contact]',
            required: true,
            errormessageRequired: '请选择联系方式'
        })

        $('[name=contact]').change(function(e) {
            var contact = e.target.value;

            validator.removeItem('#number');

            if (contact == 'phone') {
                $('#number').attr('data-explain', '请输入7位数字');
                validator.addItem({
                    element: '#number',
                    //triggerType: 'keyup',
                    required: true,
                    rule: 'minlength{min:7} maxlength{max:7}',
                    display: '号码',
                    errormessageMinlength: '电话号码的长度必须为7位',
                    errormessageMaxlength: '电话号码的长度必须为7位'
                });
            } else {
                $('#number').attr('data-explain', '请输入11位数字');
                validator.addItem({
                    element: '#number',
                    //triggerType: 'keyup',
                    required: true,
                    rule: 'minlength{min:11} maxlength{max:11}',
                    display: '号码',
                    errormessageMinlength: '手机号码的长度必须为11位',
                    errormessageMaxlength: '手机号码的长度必须为11位'
                });
            }

        });
    });
});

````



类似 [#43](https://github.com/aralejs/validator/issues/43) 中的场景


````html
<div class="cell">
    <form id="test-form-1" class="ui-form">
        <div class="ui-form-item">
            <label for="telphone" class="ui-label">座机：</label>
            <input id="telphone-1" name="telphone-1" class="ui-input"/>
            <div class="ui-form-explain"></div>
        </div>
        <div class="ui-form-item">
            <label for="mobile" class="ui-label">手机：</label>
            <input id="mobile-1" name="mobile-1" class="ui-input"/>
            <div class="ui-form-explain"></div>
        </div>
        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>
    </form>
</div>
````
````js
seajs.use(['$', 'validator'], function($, Validator) {
    $(function() {
        var validator = new Validator({
            element: '#test-form-1'
        });

        var telphoneConfig = {
                element: '[name="telphone-1"]',
                rule: 'minlength{min:7} maxlength{max:7}',
                required: function() {
                    var mobileHasValue = !!$.trim($('[name="mobile"]').val()).length
                    return !mobileHasValue;
                },
                display: '号码',
                errormessageMinlength: '电话号码的长度必须为7位',
                errormessageMaxlength: '电话号码的长度必须为7位'
            },
            mobileConfig = {
                element: '[name="mobile-1"]',
                rule: 'minlength{min:11} maxlength{max:11}',
                required: function() {
                    var telphoneHasValue = !!$.trim($('[name="telphone"]').val()).length
                    return !telphoneHasValue;
                },
                display: '号码',
                errormessageMinlength: '手机号码的长度必须为11位',
                errormessageMaxlength: '手机号码的长度必须为11位'
            };

        validator.addItem(telphoneConfig);
        validator.addItem(mobileConfig);
    });
});
````