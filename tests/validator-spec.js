define(function(require) {
    var Core = require('validator'),
        expect = require('expect'),
        $ = require('$');

    describe('validator', function() {

        if (!$('#test-form').length) {
            $('<form id="test-form" style="display:none"><input name="email" id="email" /><input name="password" id="password" /></form>')
                .appendTo(document.body);
        }

        it('basic', function() {
        });
    });
});
