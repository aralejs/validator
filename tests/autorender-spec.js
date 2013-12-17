define(function(require) {
    var Validator = require('validator'),
        $ = require('$'),
        expect = require('expect'),
        Widget = require('widget');

    describe('autorender', function() {

        it('auto render from html', function() {
            $('<form id="test-form" data-widget="validator">\
                <input id="username" name="username" class="ui-input" type="email" required data-display="用户名" />\
                <input id="password" name="password" type="password" class="ui-input" data-explain="请输入5-20位的密码。" value="123" required minlength="5" data-display="密码" />\
                <input class="ui-button-text" value="确定" type="submit">\
              </form>').appendTo(document.body);

            Widget.autoRenderAll();
            expect(Widget.query('#test-form') instanceof Validator).to.be.ok();

            $('#test-form').remove();
        });

    });
});
