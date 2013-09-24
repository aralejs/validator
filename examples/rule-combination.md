# 校验规则组合

- order:5

-------------

<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-form-1.0-src.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-button-orange-1.3-full.css" />

## 或校验

注册表单中有一个常见的场景是：用户名是电子邮箱或者密码。但是我们拥有的校验规则是电子邮箱和手机号码，应该怎么办？

使用校验规则组合可以组合出新的规则完成这种校验。

<div class="cell">
    <form id="test-form" class="ui-form" >
        <div class="ui-form-item">
            <label for="username" class="ui-label"><span class="ui-form-required">*</span>用户名：</label>
            <input id="username" name="username" class="ui-input" required />
            <div class="ui-form-explain">用户名为电子邮箱或手机号码。</div>
        </div>
        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>
    </form>
</div>


````javascript
seajs.use(['widget', '$', 'validator'], function(Widget, $, Validator) {
    $(function() {
        //1. 获取校验规则对象
        var email = Validator.getRule('email');
        //2. 组合校验规则
        var emailOrMobile = email.or('mobile');
        //3. 注册新的校验规则
        Validator.addRule('emailOrMobile', emailOrMobile, '{{display}}的格式必须是电子邮箱或者手机号码。');

        var v = new Validator({
            element: '#test-form'
        });
        // 某个字段添加rule
        v.addItem({
            element: '[name=username]',
            required: true,
            rule: 'emailOrMobile',
            display: '用户名',
            errormessageNotEmail: '特殊的错误提示会显示！(配置优先)'
        });
    });
});
````

## 非校验

<div class="cell">
    <form id="test-form2" class="ui-form">
        <div class="ui-form-item">
            <label for="subject" class="ui-label"><span class="ui-form-required">*</span>主题：</label>
            <input id="subject" name="subject" class="ui-input" />
            <div class="ui-form-explain">请输入主题。</div>
        </div>
        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>
    </form>
</div>

````javascript
seajs.use(['widget', '$', 'validator'], function(Widget, $, Validator) {
    // 非email规则
    Validator.addRule('notEmail', Validator.getRule('email').not(), '不能输入email!');

    var v = new Validator({
        element: '#test-form2'
    });

    // 某个字段添加rule
    v.addItem({
        element: '[name=subject]',
        required: true,
        rule: 'notEmail',
        errormessageNotEmail: '特殊的错误提示会显示！(配置优先)'
    });

});

````
