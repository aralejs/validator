define(function(require) {
    var Core = require('../src/validator'),
        $ = require('$');

    describe('validator', function() {

        if (!$('#test-form').length) {
            $('<form id="test-form"><input name="email" id="email" /><input name="password" id="password" /></form>')
                .appendTo(document.body);
        }

        test('basic', function() {
        });
    });
});
