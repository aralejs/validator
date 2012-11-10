# 组合校验

---------

````iframe

<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.base-1.2-src.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-form-1.0-src.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-button-orange-1.1-full.css" />

<div class="cell">
    <form id="test-form" class="ui-form">
        <div class="ui-form-item">
            <label for="start" class="ui-label"><span class="ui-form-required">*</span>起止日期：</label>
            <input id="start" name="start" class="ui-input ui-input-date" type="text" />
            -
            <input id="end" name="end" class="ui-input ui-input-date" type="text" />
        </div>

        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>
    </form>
</div>

<script>
seajs.use(['../src/validator', '$'], function(Validator, $) {
    $(function() {
        var validator = new Validator({
            element: '#test-form',
            onFormValidated: function(err, results, form) {
                console && console.log && console.log(err, results, form);
            }
        });

        validator.addItem({
            element: '#start',
            required: true,
            rule: 'email',
            display: '用户名'
        })
    });
});
</script>

````
