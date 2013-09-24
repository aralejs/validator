define(function(require) {
    var Utils = require('../src/utils'),
        $ = require('$'),
        expect = require('expect');

    describe('utils.isHidden()', function() {
        var elem = null;

        afterEach(function() {
            elem.remove();
        });

        it("select", function() {
            elem = $('<select style="display: none;"><option>1</option><option>2</option></select>').appendTo("body");

            expect(Utils.isHidden(elem)).to.be(true);
            elem.show();
            expect(Utils.isHidden(elem)).to.be(false);
        });

        it("visibility: hidden", function() {
            elem = $('<div style="display: none;width:40px;height:40px;"></div>').appendTo("body");
            expect(Utils.isHidden(elem)).to.be(true);
            elem.show();
            expect(Utils.isHidden(elem)).to.be(false);
            elem.css("visibility", "hidden");
            expect(Utils.isHidden(elem)).to.be(false); // 不可见但占文档流
        });
        it("input hidden", function() {
            elem = $('<input type="hidden" name="test" value="0" />').appendTo("body");
            expect(Utils.isHidden(elem)).to.be(true);
            elem.show();
            expect(Utils.isHidden(elem)).to.be(true);
        });
        it("table", function() {
            elem = $('<table style="display: none;"><tbody><tr id="row"><td></td></tr></tbody></table>').appendTo("body");
            expect(Utils.isHidden(elem)).to.be(true);
            elem.show();
            expect(Utils.isHidden(elem)).to.be(false); // IE<=7 下, table 里面没有 <td> 时返回 true
        });
        it("tr", function() {
            elem = $('<table style="display: none;"><tbody><tr id="row" style="display: none;"><td></td></tr></tbody></table>').appendTo("body");

            var trElem = elem.find("#row");
            expect(Utils.isHidden(trElem)).to.be(true);
            trElem.show();
            expect(Utils.isHidden(trElem)).to.be(false); // todo: 父级不可见时, 不应该是 false
            expect(trElem.is(":hidden")).to.be(true);
            elem.show();
            expect(Utils.isHidden(trElem)).to.be(false);
        });
        it("div width/height: 0", function() {
            elem = $('<div style="width:0;height:0;overflow: hidden;"></div>').appendTo("body");
            expect(Utils.isHidden(elem)).to.be(true); // IE6, 空 div 不设 overflow: hidden, 返回为 false
        });
    });
});
