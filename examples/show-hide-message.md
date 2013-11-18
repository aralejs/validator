# 公用消息容器

- order:4

-------------

如果多个校验项公用了一个消息提示容器，容易出现消息互相覆盖的情况。可以通过单独定制 showMessage 和 hideMessage 来完成。


````html
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
````

````js
seajs.use(['validator', '$'], function(Validator, $) {
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
            rule: '',
            display: '开始日期'
        })
        .addItem({
            element: '#end',
            required: true,
            rule: '',
            display: '结束日期',
            showMessage: function(message, element) {
                // 结束日期出错后会调用这个函数。如果前面的开始日期没有出错的时候才显示自己的出错消息。
                var startErr = $.trim(this.getExplain(element).html());
                if (!startErr) {
                    this.getExplain(element).html(message);
                    this.getItem(element).addClass(this.get('itemErrorClass'));
                }
            },
            hideMessage: function(message, element) {
                // 结束日期校验通过后会调用这个函数。如果前面的开始日期没有出错的时候才清空消息。
                var startErr = $.trim(this.getExplain(element).html());
                if (!startErr) {
                    this.getExplain(element).html(element.attr('data-explain') || ' ');
                    this.getItem(element).removeClass(this.get('itemErrorClass'));
                }
            }
        });


        // 直接显示某个错误信息
        var item = validator.query('#start');
        console.log(item.getMessage('required'));

        // 强制显示字段的错误信息
        //validator.get("showMessage").call(validator, item.getMessage('required'), item.element);
    });
});
````
