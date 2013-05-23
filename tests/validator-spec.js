define(function(require) {
    var Core = require('../src/validator'),
        $ = require('$'),
        expect = require('expect');

    describe('validator', function() {

        if (!$('#test-form').length) {
            $('<form id="test-form" style="display:none"><input name="email" id="email" /><input name="password" id="password" /></form>')
                .appendTo(document.body);
        }

        it('basic', function() {
        });
    });
});
