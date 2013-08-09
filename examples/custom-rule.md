# 自定义规则
----------------------------


<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-form-1.0-src.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-button-orange-1.3-full.css" />

## 多项组合或校验

类似 [#43](https://github.com/aralejs/validator/issues/43) 中的场景

<div class="cell">
    <form id="test-form" class="ui-form">
        <div class="ui-form-item">
            <label for="telphone" class="ui-label">座机：</label>
            <input id="telphone" name="telphone" class="ui-input"/>
            <div class="ui-form-explain"></div>
        </div>
        <div class="ui-form-item">
            <label for="mobile" class="ui-label">手机：</label>
            <input id="mobile" name="mobile" class="ui-input"/>
            <div class="ui-form-explain"></div>
        </div>
        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>
    </form>
</div>


````js
seajs.use(['widget', '$', 'validator'], function(Widget, $, Validator) {
    $(function() {
        var validator = new Validator({
            element: '#test-form'
        });

        var telphoneConfig = {
                element: '[name="telphone"]',
                rule: 'minlength{min:7} maxlength{max:7}',
                display: '号码',
                errormessageMinlength: '电话号码的长度必须为7位',
                errormessageMaxlength: '电话号码的长度必须为7位'
            },
            mobileConfig = {
                element: '[name="mobile"]',
                rule: 'minlength{min:11} maxlength{max:11}',
                display: '号码',
                errormessageMinlength: '手机号码的长度必须为11位',
                errormessageMaxlength: '手机号码的长度必须为11位'
            };
        var telphoneBind = true,
            mobileBind = false;

        validator.addItem($.extend({required: true}, telphoneConfig));

        $('[name="telphone"]').focus(function() {
            validator.removeItem('[name="mobile"]');
            mobileBind = false;
        });
        $('[name="telphone"]').blur(function() {
            if (!$.trim($(this).val()).length) {
                validator.addItem($.extend({required: true}, mobileConfig));
                mobileBind = true;
            } else if (!telphoneBind) {
                validator.addItem($.extend({required: true}, telphoneConfig));
                telphoneBind = true;
            }
        });
        $('[name="mobile"]').focus(function() {
            validator.removeItem('[name="telphone"]');
            telphoneBind = false;
        });
        $('[name="mobile"]').blur(function() {
            if (!$.trim($(this).val()).length) {
                validator.addItem($.extend({required: true}, telphoneConfig));
                telphoneBind = true;
            } else if (!mobileBind) {
                validator.addItem($.extend({required: true}, mobileConfig));
                mobileBind = true;
            }
        });
    });
});
````
