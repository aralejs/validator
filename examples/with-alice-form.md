# alice/form 应用范例

- order:3

---

````html
<link charset="utf-8" rel="stylesheet" href="http://assets.spmjs.org/alice/form/1.0.2/form.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.spmjs.org/alice/button/1.1.1/button.css" />
<link charset="utf-8" rel="stylesheet" href="http://assets.spmjs.org/alice/tiptext/1.1.0/tiptext.css" />
<style>
.ui-form {
  font-family: tahoma;
  margin-top: 40px;
}
</style>

<div class="cell">
    <form id="test-form" class="ui-form">

        <div class="ui-form-item">
            <label for="username" class="ui-label"><span class="ui-form-required">*</span>用户名：</label>
            <input id="username" name="username" class="ui-input" type="text" />
            <div class="ui-form-explain">用户名为电子邮箱。</div>
        </div>

        <div class="ui-form-item">
            <label for="password" class="ui-label"><span class="ui-form-required">*</span>密码：</label>
            <input id="password" name="password" type="password" class="ui-input" data-explain="请输入5-20位的密码。" value="123" />
            <div class="ui-form-explain">密码的长度必须大于或等于5。</div>
        </div>

        <div class="ui-form-item">
            <label for="password-confirmation" class="ui-label"><span class="ui-form-required">*</span>重复输入密码：</label>
            <input id="password-confirmation" name="password-confirmation" type="password" class="ui-input" />
            <div class="ui-form-explain ui-tiptext">请再输入一遍。</div>
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
            <input type="submit" class="ui-button ui-button-morange" value="确定">
        </div>

    </form>
</div>
````
````js
seajs.use(['validator', '$'], function(Validator, $) {
    $(function() {
        var NewValidator = Validator.extend({
            attrs: {
                showMessage: function (message, element) {
                    message = '<i class="ui-tiptext-icon iconfont">&#xF045;</i>\
                               <span class="ui-form-explain-text">' + message + '</span>';
                    this.getExplain(element)
                        .addClass('ui-tiptext ui-tiptext-error')
                        .html(message);
                    this.getItem(element).addClass(this.get('itemErrorClass'));
                }
            }
        });

        var validator = new NewValidator({
            element: '#test-form',
            onFormValidated: function(err, results, form) {
                window.console && console.log && console.log(err, results, form);
            },
            failSilently: true
        });

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

    });
});
````
