# History

---

## 0.9.2

`tag:fixed` [#20](https://github.com/aralejs/validator/issues/20) 修复异步校验不能正常工作的bug。

`tag:imporved` itemValidate 和 itemValidated 事件发布的时候增加 event 对象，且showMessage和hideMessage被调用的时候也增加event 对象，以方便开发者判定当前的检验是由哪种事件触发。

## 0.9.1

`tag:improved` [#17](https://github.com/aralejs/validator/issues/17) 增加 skipHidden 选项，以支持跳过隐藏DOM校验。

`tag:improved` [#16](https://github.com/aralejs/validator/issues/16) 增加 failSilently 选项，以便支持当校验 DOM 不存在时不报错。

`tag:fixed` [#14](https://github.com/aralejs/validator/issues/14) 修复 ie6 下对 textarea 报异常。

`tag:improved` [#1](https://github.com/aralejs/validator/issues/1) Validator.query 静态方法和 v.query 实例方法利用 Widget.query 重构。

`tag:fixed` [#5](https://github.com/aralejs/validator/issues/5) 修复组合校验规则时错误信息不能正确返回的问题。

`tag:improved` [#7](https://github.com/aralejs/validator/issues/7) removeItem时同时remove掉这个item对应的error的dom。

`tag:changed` 将 validator.js 中 `:input` 选择器改为 `input,textarea,select` 以便支持手机端 zepto。

`tag:changed` 将对 arale.widget 的依赖从 1.0.2 升级到 1.0.3

## 0.9.0

`tag:fixed` 修复 DOM 中指定 `data-explain=""`，无法正确获取默认提示信息的bug。

## 0.8.9

`tag:changed` **重要** formValidated 事件原来接受的参数是 `(element, err)` 现在改变为 `(err, results, element)`

`tag:improved` addRule、addItem 和 setMessage 支持一次操作多个。且都返回 this 对象，支持链式操作。

`tag:improved` 支持初始化时传入**非** form 外层容器作为 element。

`tag:improved` destroy 的时候增加恢复 novalidate 属性值。

`tag:new` 增加 displayHelper 函数类型 attr，自动获取 display 属性功能。默认规则：首先获取 for 属性与 input 的 id 匹配的 label，取其文本值；如果匹配不成功，则使用 input 的 name 值。

`tag:new` 增加 autoFocus attribute，默认自动 focus 在第一个出错的表单元素上。

## 0.8.8

`tag:fixed` 使用 `"adsg".charAt(0)` 而不是 `"aasdg"[0]` 这种方式，因为 ie7 下的 bug

`tag:changed` required 规则的错误提示文案从'{{display}}不能为空。'改为 '请输入{{display}}。'

`tag:improved` 对 widget 的依赖从 1.0.0 变为 1.0.2

`tag:changed` addRule 的时候，同名规则可以覆盖了（0.8.8之前不能覆盖）
