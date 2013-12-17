define(function (require, exports, module) {
  var Core = require('./core'),
      $ = require('$');

  var Validator = Core.extend({

    events: {
      'mouseenter .{{attrs.inputClass}}': 'mouseenter',
      'mouseleave .{{attrs.inputClass}}': 'mouseleave',
      'mouseenter .{{attrs.textareaClass}}': 'mouseenter',
      'mouseleave .{{attrs.textareaClass}}': 'mouseleave',
      'focus .{{attrs.itemClass}} input,textarea,select': 'focus',
      'blur .{{attrs.itemClass}} input,textarea,select': 'blur'
    },

    attrs: {
      explainClass: 'ui-form-explain',
      itemClass: 'ui-form-item',
      itemHoverClass: 'ui-form-item-hover',
      itemFocusClass: 'ui-form-item-focus',
      itemErrorClass: 'ui-form-item-error',
      inputClass: 'ui-input',
      textareaClass: 'ui-textarea',

      showMessage: function (message, element) {
        this.getExplain(element).html(message);
        this.getItem(element).addClass(this.get('itemErrorClass'));
      },

      hideMessage: function (message, element) {
        this.getExplain(element).html(element.attr('data-explain') || ' ');
        this.getItem(element).removeClass(this.get('itemErrorClass'));
      }
    },

    setup: function () {
      Validator.superclass.setup.call(this);

      var that = this;

      this.on('autoFocus', function (ele) {
        that.set('autoFocusEle', ele);
      })
    },

    addItem: function (cfg) {
      Validator.superclass.addItem.apply(this, [].slice.call(arguments));
      var item = this.query(cfg.element);
      if (item) {
        this._saveExplainMessage(item);
      }
      return this;
    },

    _saveExplainMessage: function (item) {
      var that = this;
      var ele = item.element;

      var explain = ele.attr('data-explain');
      // If explaining message is not specified, retrieve it from data-explain attribute of the target
      // or from DOM element with class name of the value of explainClass attr.
      // Explaining message cannot always retrieve from DOM element with class name of the value of explainClass
      // attr because the initial state of form may contain error messages from server.
      // ---
      // Also, If explaining message is under ui-form-item-error className
      // it could be considered to be a error message from server
      // that should not be put into data-explain attribute
      if (explain === undefined && !this.getItem(ele).hasClass(this.get('itemErrorClass'))) {
        ele.attr('data-explain', this.getExplain(ele).html());
      }
    },

    getExplain: function (ele) {
      var item = this.getItem(ele);
      var explain = item.find('.' + this.get('explainClass'));

      if (explain.length == 0) {
       explain = $('<div class="' + this.get('explainClass') + '"></div>').appendTo(item);
      }

      return explain;
    },

    getItem: function (ele) {
      ele = $(ele);
      var item = ele.parents('.' + this.get('itemClass'));

      return item;
    },

    mouseenter: function (e) {
      this.getItem(e.target).addClass(this.get('itemHoverClass'));
    },

    mouseleave: function (e) {
      this.getItem(e.target).removeClass(this.get('itemHoverClass'));
    },

    focus: function (e) {
      var target = e.target,
          autoFocusEle = this.get('autoFocusEle');

      if (autoFocusEle && autoFocusEle.has(target)) {
        var that = this;
        $(target).keyup(function (e) {
          that.set('autoFocusEle', null);
          that.focus({target: target});
        });
        return;
      }
      this.getItem(target).removeClass(this.get('itemErrorClass'));
      this.getItem(target).addClass(this.get('itemFocusClass'));
      this.getExplain(target).html($(target).attr('data-explain') || '');
    },

    blur: function (e) {
      this.getItem(e.target).removeClass(this.get('itemFocusClass'));
    }
  });


  module.exports = Validator;
});
