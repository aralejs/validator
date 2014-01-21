# Validate with Javascript

- order:2

-------------------------

````html

<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-form-1.0-src.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.alipay.com/al/alice.components.ui-button-orange-1.3-full.css" />

<div class="cell">
    <form id="test-form" class="ui-form">
        <div class="ui-form-item">
            <label for="username" class="ui-label"><span class="ui-form-required">*</span>用户名：</label>
            <input id="username" name="username" class="ui-input" type="text" />
            <div class="ui-form-explain">用户名为电子邮箱。</div>
        </div>

        <div class="ui-form-item ui-form-item-error">
            <label for="password" class="ui-label"><span class="ui-form-required">*</span>密码：</label>
            <input id="password" name="password" type="password" class="ui-input" data-explain="请输入5-20位的密码。" value="123" />
            <div class="ui-form-explain">密码的长度必须大于或等于5。</div>
        </div>

        <div class="ui-form-item">
            <label for="password-confirmation" class="ui-label"><span class="ui-form-required">*</span>重复输入密码：</label>
            <input id="password-confirmation" name="password-confirmation" type="password" class="ui-input" />
            <div class="ui-form-explain">请再输入一遍。</div>
        </div>

        <div class="ui-form-item">
            <label class="ui-label"><span class="ui-form-required">*</span>性别：</label>
            <input id="male" value="male" name="sex" type="radio" > <label for="male">Male</label>
            <input id="female" value="female" name="sex" type="radio"> <label for="female">Female</label>
        </div>

        <div class="ui-form-item">
            <label class="ui-label"><span class="ui-form-required">*</span>交通工具：</label>
            <label for="Bike"><input class="ui-hidden" name="vehicle" id="Bike" type="checkbox">自行车</label>
            <label for="Car"><input class="ui-hidden" name="vehicle" id="Car" type="checkbox">汽车</label>
        </div>

        <div class="ui-form-item">
            <label class="ui-label"><span class="ui-form-required">*</span>国籍：</label>
            <select name="country" >
              <option value="">请选择</option>
              <option value="china">China</option>
              <option value="usa">USA</option>
            </select>
        </div>


        <div class="ui-form-item">
			<label for="hidden-input" class="ui-label"><span class="ui-form-required">*</span>隐藏项：</label>
            <input type="hidden" id="hidden-input" value="" />
		</div>

        <div class="ui-form-item">
			<label for="note" class="ui-label"><span class="ui-form-required">*</span>备注：</label>
			<textarea class="ui-textarea" name="note" id="note"></textarea>
		</div>

        <div class="ui-form-item">
            <span class="ui-button-morange ui-button"><input class="ui-button-text" value="确定" type="submit"></span>
        </div>

    </form>


    <p>
        <a id="toogle-disabled" href="javascript:;" class="ui-button ui-button-lwhite">切换域 Disabled</a>
    </p>
</div>
````

````js
seajs.use(['validator', '$'], function(Validator, $) {
    $(function() {
        var t1 = (new Date).getTime();
        var validator = new Validator({
            element: '#test-form',
            onFormValidated: function(err, results, form) {
                window.console && console.log && console.log(err, results, form);
            },
            failSilently: true
        });
        var t2 = (new Date).getTime();
        document.title = (t2 - t1);

        validator.addItem({
            element: '#username',
            required: true,
            rule: 'email'
        })

        .addItem({
            element: '#password',
            required: true,
            rule: 'minlength{"min":5} maxlength{"max":20}'
        })

        .addItem({
            element: '#password-confirmation',
            required: true,
            rule: 'confirmation{target: "#password", name: "第一遍"}',
            errormessageRequired: '请再重复输入一遍密码，不能留空。'
        })

        .addItem({
            element: '[name=sex]',
            required: true,
            errormessageRequired: '请选择您的性别。'
        })

        .addItem({
            element: '[name=vehicle]',
            required: true,
            errormessageRequired: '请选择您的交通工具。'
        })

        .addItem({
            element: '[name=country]',
            required: true,
            errormessageRequired: '请选择您的国籍。'
        })
        
        .addItem({
            element: '[name=note]',
            required: true,
            errormessageRequired: '请填写备注'
        })

        // 隐藏的表单域默认是校验的，但是加了 skipHidden 之后就不校验了。也可以在 new Validator 中进行配置
        .addItem({
            skipHidden: true,
            element: '#hidden-input',
            required: true,
            errormessageRequired: '隐藏的表单域值为空哦'
        })

        // 这一项的DOM并不存在，由于设置了 failSilently 所以不会报错。
        .addItem({
            element: '[name=notExisted]',
            required: true
        });


        $("#toogle-disabled").click(function() {
            for(var i = 0 ; i < validator.items.length; i++) {
                var item = validator.items[i].element;
                if (item.attr("disabled")) {
                    item.removeAttr("disabled");
                } else {
                    item.attr("disabled", true);
                }
            }
        });
    });
});
````
