# History

---

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
