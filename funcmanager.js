/*
 * 
 * Function Manager
 * 
 * @name FuncManager
 * @version 0.3.2
 * ---
 * @template JavaScriptMinimalMVCTemplate
 * @author falsandtru https://github.com/falsandtru/
 * @copyright 2014, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * ---
 * Note:
 * 
 */

(function(window, document, undefined, _$) {
  
  var NAMESPACE = window;
  
  var $, jQuery = $ = null;
  
  var M, V, C;
  
  /* MODEL */
  M = {
    // ネームスペース（プロパティネーム）
    NAME: 'FuncManager',
    
    // 共有データ保存用オブジェクト
    store: {},
    
    // 共有/個別データ管理
    stock: function(key, value){
      if (this.constructor === arguments.callee) {
        // 個別データを設定
        this.guid = ++M.COUNT;
        arguments.callee[this.guid] = this;
        // keyがguidと重複する可能性がなければ
        // keyをネームスペースにしてオブジェクトを保存
        if (arguments.length && !(key > 0)) {
          arguments.callee[key] = this;
        }
        return;
      }
      
      switch (arguments.length) {
        case 0:
          // 個別データ保存用オブジェクトを返す
          return new arguments.callee;
        case 1:
          // 共有データを取得
          return M.store[key];
        case 2:
        default:
          // 共有データを設定
          return M.store[key] = value;
      }
    },
    
    main: function(context, names, param) {
      context.stock = M.stock();
      switch (typeof names) {
        case 'string':
          names = names.split(/[\s,]{1,}/);
      }
      if (names instanceof Array) {
        var i = 0, len = names.length, name;
        for (; i < len; i++) {
          context.manager(names[i], param)
        }
      }
      return context;
    },
    
    parseFunc: function(fn){
      var ret;
      fn = fn.toString();
      ret = fn.match(/^function[^(]*\([^)]*\)[^{]*|{(?:.|[\n\r])*}$/gm);
      ret[0] = ret[0].replace(/^function[^(]*\(|\).*$/gm, '');
      ret[1] = ret[1].replace(/^{|}$/g, '');
      ret.splice.apply({}, [0, 1].concat(ret[0] && ret[0].match(/\w+/g)));
      return ret;
    },
    
    // jQuery.extendだけ抜粋
    jQuery: jQuery || arguments[arguments.length - 1]
    
    /*
    // FactoryMethodパターン
    // サブクラスを作成して利用する機能のフォーマット
    Factory: function() {
      this.guid = ++M.COUNT;
      M.OBJECTS[this.guid] = this;
      
    },
    
    // Commandパターン
    // 複雑な処理を代行させる機能のフォーマット
    Command: function() {
      this.guid = ++M.COUNT;
      M.OBJECTS[this.guid] = this;
      
    }
    */
  };
  
  /* VIEW */
  V = {
    DEFINE_TYPE: '',
    HOLDER: null,
    ACCESSOR: null,
    
    initialize: function() {
      try {
        var obj = {};
        Object.defineProperty(obj, 'test', {
          get: Function(),
          set: Function()
        });
        V.DEFINE_TYPE = 'ECMA';
        return;
      } catch (e) {}
      
      try {
        var obj = {};
        obj.__defineGetter__('test', Function());
        obj.__defineSetter__('test', Function());
        V.DEFINE_TYPE = 'old';
        return;
      } catch (e) {}
      
      try {
        var obj = document.createElement('_ACCESSOR');
        Object.defineProperty(obj, 'test', Function());
        Object.defineProperty(obj, 'test', Function());
        V.ACCESSOR = document.createElement('_ACCESSOR');
        V.DEFINE_TYPE = 'element';
        return;
      } catch (e) {}
      
      V.HOLDER = document.createElement('_HOLDER');
      V.ACCESSOR = document.createElement('_ACCESSOR');
      document.getElementsByTagName('head')[0].appendChild(V.HOLDER);
      V.DEFINE_TYPE = 'dom';
    }
  };
  
  /* CONTROLLER */
  C = {
    EXEC: function() {
      return M.MAIN.apply(M, [C.EXTEND(this)].concat([].slice.call(arguments)));
    },
    
    PROPERTIES: {
      accessor: true
    },
    
    FUNCTIONS: {},
    
    METHODS: {
      accessor: function() {return V.ACCESSOR ? V.ACCESSOR.cloneNode() : {};},
      manager: function(name, param) {
        name = name || '';
        param = param || {};
        
        var context = this,
            accessor = context.accessor,
            manager = context.manager,
            stock = context.stock;
        
        stock[name] && accessor.detachEvent("onpropertychange", stock[name]);
        
        accessor[name] = null;
        manager[name] = new function() {
          var instance, list;
          instance = this;
          list = [];
          
          this.get = function() {
            return function() {
              var names, name, len, manager, accessor, stock;
              var list, onPropertyChange;
              
              var _arguments_, _return_, _param_;
              _arguments_ = [].slice.call(arguments);
              _param_ = param;
              instance.each(function() {
                var instance, param;
                _return_ = arguments[1].apply(this, _arguments_.concat(!arguments[0] ? _param_.params : _param_.chain ? [_return_] : []));
              });
              return _return_;
            };
          };
          this.set = function() {
            return instance.push.apply(instance, [].slice.call(arguments));
          };
          this.get = param.ctor ? eval('(1&&function(){' +
                                          M.parseFunc(param.ctor).pop() + ';\n' +
                                          'return function(){\n' +
                                            M.parseFunc(instance.get).pop().replace(/([\w\[\]]+)\.apply/, 'eval("(1&&"+$1.toString()+")").apply') + ';\n' +
                                          '}' +
                                        '})').call(instance)
                                : this.get;
          
          this.acc = accessor;
          this.exec = function() {
            return instance.get().apply(instance, [].slice.call(arguments));
          };
          this.each = function(callback) {
            var fn, ret;
            for (var i = 0; fn = list[i]; i++) {
              ret = callback.call(instance, i, fn);
              switch (typeof ret) {
                case 'function':
                  list[i] = ret;
                  break;
                  
                default:
                  switch (ret) {
                    case false:
                      return;
                  }
              }
            }
          };
          this.replace = function(mat, rep) {
            var fn, ret;
            for (var i = 0; fn = list[i]; i++) {
              if (mat === fn || mat.toString() === fn.toString()) {
                typeof rep === 'function' ? list.splice(i, 1, rep) : list.splice(i, 1);
              }
            }
          };
          this.clear = function() {
            list = [];
          };
          this.release = function() {
            context = null;
            V.HOLDER && V.HOLDER.removeChild(accessor);
          };
          
          this.push = function() {
            var args, ret;
            args = [].slice.call(arguments);
            
            for (var i = 0, arg; arg = args[i]; i++) {
              typeof arg !== 'function' && args.splice(i--, 1);
            }
            param.unique && instance.each(function(index, fn) {
              for (var i = 0, arg; arg = args[i]; i++) {
                if (fn === arg || (fn = fn.toString()) === arg.toString()) {
                  fn !== instance.get().toString() && fn !== instance.exec.toString() && args.splice(i--, 1);
                }
              }
            });
            return [].push.apply(list, args);
          };
          this.pop = function() {
            return list.pop();
          };
          this.unshift = function(fn) {
            return [].unshift.apply(list, [].slice.call(arguments));
          };
          this.shift = function() {
            return list.shift();
          };
          
          switch (V.DEFINE_TYPE) {
            case 'ECMA':
              Object.defineProperty(accessor, name, {
                get: this.get,
                set: this.set
              });
              break;
              
            case 'old':
              accessor.__defineGetter__(name, this.get);
              accessor.__defineSetter__(name, this.set);
              break;
              
            case 'element':
              Object.defineProperty(accessor, name, {
                get: this.get,
                set: this.set
              });
              break;
              
            case 'dom':
            default:
              V.HOLDER.appendChild(accessor);
              function onPropertyChange(event){
                if (event.propertyName === name) {
                  instance.acc.detachEvent("onpropertychange", arguments.callee);
                  instance.set(accessor[name]);
                  instance.acc[name] = instance.exec;
                  instance.acc.attachEvent("onpropertychange", arguments.callee);
                }
              };
              
              stock[name] = onPropertyChange;
              
              accessor[name] = instance.exec;
              accessor.attachEvent("onpropertychange", stock[name]);
          }
          return instance;
        };
        return accessor;
      }
    }
  };
















































// >>>>>  Template Driver  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  M = ($ || _$).extend(true, {
    // スクリプトロード時に一度だけ実行される
    INIT: function() {
      M.initialize();
    },
    initialize: function() {},

    // uidを生成
    UID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16).toUpperCase();
      });
    },

    // プラグインの本体
    MAIN: function() {
      return M.main.apply(this, arguments);
    }
  }, M);

  V = ($ || _$).extend(true, {
    // VIEWのルート document/window
    DRIVER: document,
    $DRIVER: $ && $(document),

    // スクリプトロード時に一度だけ実行される
    INIT: function() {
      V.OBSERVE();
      V.initialize();
    },
    initialize: function() {},

    // VIEWが監視するMVCイベントを登録
    OBSERVE: function() {},

    // VIEWにする要素を選択/解除する
    BIND: function() {},
    UNBIND: function() {},

    // イベント、データ属性、クラスなどで使用する名前
    NAMES: {},

    // UIのイベントに登録されるハンドラ
    EVENTS: {}
  }, V);

  C = ($ || _$).extend(true, {
    // CONTROLLERのルート
    DRIVER: V.DRIVER,
    $DRIVER: V.$DRIVER,

    // スクリプトロード時に一度だけ実行される
    INIT: function() {
      // プラグインに関数を設定してネームスペースに登録
      // $.mvc.func, $().mvc.funcとして実行できるようにするための処理
      if (NAMESPACE && NAMESPACE == NAMESPACE.window) {
        NAMESPACE[M.NAME] = C.EXEC;
      } else {
        NAMESPACE[M.NAME] = NAMESPACE.prototype[M.NAME] = C.EXEC;
      }

      C.UPDATE_PROPERTIES(NAMESPACE[M.NAME], C.FUNCTIONS);
      C.REGISTER_FUNCTIONS(NAMESPACE[M.NAME]);
      C.OBSERVE();
      C.initialize();
    },
    initialize: function() {},

    // CONTROLLERが監視するMVCイベントを登録
    OBSERVE: function() {},

    // コンテキストを更新する
    EXTEND: function($context) {
      if ($context === NAMESPACE || NAMESPACE && NAMESPACE == NAMESPACE.window) {
        // コンテキストをプラグインに変更
        $context = NAMESPACE[M.NAME];
      } else
      // $().mvc()として実行された場合の処理
      if ($context instanceof NAMESPACE) {
        if ($context instanceof jQuery) {
          // コンテキストへの変更をend()で戻せるようadd()
          $context = $context.add();
        }
      }
      // コンテキストのプロパティを更新
      C.UPDATE_PROPERTIES($context, C.FUNCTIONS);
      C.UPDATE_PROPERTIES($context, C.METHODS);
      // コンテキストに関数とメソッドを設定
      C.REGISTER_FUNCTIONS($context);
      C.REGISTER_METHODS($context);
      return $context;
    },

    // プラグインとして代入される
    EXEC: function() {
      C.execute.apply(this, arguments);
      return M.MAIN.apply(this, arguments);
    },
    execute: function() {},

    // プラグインのプロパティを更新する
    UPDATE_PROPERTIES: function($context, funcs) {
      var props = C.PROPERTIES;

      var i;
      for (i in props) {
        if (funcs[i]) {
          $context[i] = _$.proxy(funcs[i], $context)();
        }
      }
      return $context;
    },

    // プラグインにCONTROLLERの関数を登録する
    REGISTER_FUNCTIONS: function($context) {
      var funcs = C.FUNCTIONS,
          props = C.PROPERTIES;

      var i;
      for (i in funcs) {
        if (!props[i]) {
          $context[i] = _$.proxy(funcs[i], $context);
        }
      }
      return $context;
    },

    // プラグインにCONTROLLERのメソッドを登録する
    REGISTER_METHODS: function($context) {
      var funcs = C.METHODS,
          props = C.PROPERTIES;

      var i;
      for (i in funcs) {
        if (!props[i]) {
          $context[i] = _$.proxy(funcs[i], $context);
        }
      }
      return $context;
    },

    // プラグインに登録されるプロパティ
    PROPERTIES: {
      'uid': true
    },

    // プラグインに登録される関数
    FUNCTIONS: {},

    // プラグインに登録されるメソッド
    METHODS: {
      uid: M.UID
    }
  }, C);

  M.INIT();
  V.INIT();
  C.INIT();

// <<<<<  Template Driver  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  
})(window, window.document, void 0, function() {
  /*!
   * jQuery JavaScript Library v1.10.2
   * http://jquery.com/
   *
   * Includes Sizzle.js
   * http://sizzlejs.com/
   *
   * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
   * Released under the MIT license
   * http://jquery.org/license
   *
   * Date: 2013-07-03T13:48Z
   */
var readyList,rootjQuery,core_strundefined="undefined",docElem=document.documentElement,_jQuery=window.jQuery,_$=window.$,class2type={},core_deletedIds=[],core_version="1.10.2",core_concat=core_deletedIds.concat,core_push=core_deletedIds.push,core_slice=core_deletedIds.slice,core_indexOf=core_deletedIds.indexOf,core_toString=class2type.toString,core_hasOwn=class2type.hasOwnProperty,core_trim=core_version.trim,jQuery=function(){},class2type=function(){var a={},c="Boolean Number String Function Array Date RegExp Object Error".split(" "),
b,e;for(b=c.length;e=c[--b];)a["[object "+e+"]"]=e.toLowerCase();return a}();function isArraylike(a){var c=a.length,b=jQuery.type(a);return jQuery.isWindow(a)?!1:1===a.nodeType&&c?!0:"array"===b||"function"!==b&&(0===c||"number"===typeof c&&0<c&&c-1 in a)}jQuery.fn=jQuery.prototype;
jQuery.extend=jQuery.fn.extend=function(){var a,c,b,e,g,f=arguments[0]||{},h=1,d=arguments.length,k=!1;"boolean"===typeof f&&(k=f,f=arguments[1]||{},h=2);"object"===typeof f||jQuery.isFunction(f)||(f={});d===h&&(f=this,--h);for(;h<d;h++)if(null!=(g=arguments[h]))for(e in g)a=f[e],b=g[e],f!==b&&(k&&b&&(jQuery.isPlainObject(b)||(c=jQuery.isArray(b)))?(c?(c=!1,a=a&&jQuery.isArray(a)?a:[]):a=a&&jQuery.isPlainObject(a)?a:{},f[e]=jQuery.extend(k,a,b)):void 0!==b&&(f[e]=b));return f};
jQuery.extend({type:function(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?class2type[core_toString.call(a)]||"object":typeof a},makeArray:function(a,c){var b=c||[];null!=a&&(isArraylike(Object(a))?jQuery.merge(b,"string"===typeof a?[a]:a):core_push.call(b,a));return b},merge:function(a,c){var b=c.length,e=a.length,g=0;if("number"===typeof b)for(;g<b;g++)a[e++]=c[g];else for(;void 0!==c[g];)a[e++]=c[g++];a.length=e;return a},isPlainObject:function(a){var c;if(!a||"object"!==
jQuery.type(a)||a.nodeType||jQuery.isWindow(a))return!1;try{if(a.constructor&&!core_hasOwn.call(a,"constructor")&&!core_hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(b){return!1}if(jQuery.support.ownLast)for(c in a)return core_hasOwn.call(a,c);for(c in a);return void 0===c||core_hasOwn.call(a,c)},isFunction:function(a){return"function"===jQuery.type(a)},isArray:Array.isArray||function(a){return"array"===jQuery.type(a)},isWindow:function(a){return null!=a&&a==a.window},proxy:function(a,
c){var b,e;"string"===typeof c&&(e=a[c],c=a,a=e);if(jQuery.isFunction(a))return b=core_slice.call(arguments,2),function(){return a.apply(c||this,b.concat(core_slice.call(arguments)))}}});
jQuery.support=function(a){var c,b,e,g,f,h,d=document.createElement("div");d.setAttribute("className","t");d.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";c=d.getElementsByTagName("*")||[];b=d.getElementsByTagName("a")[0];if(!b||!b.style||!c.length)return a;e=document.createElement("select");g=e.appendChild(document.createElement("option"));c=d.getElementsByTagName("input")[0];b.style.cssText="top:1px;float:left;opacity:.5";a.getSetAttribute="t"!==d.className;a.leadingWhitespace=
3===d.firstChild.nodeType;a.tbody=!d.getElementsByTagName("tbody").length;a.htmlSerialize=!!d.getElementsByTagName("link").length;a.style=/top/.test(b.getAttribute("style"));a.hrefNormalized="/a"===b.getAttribute("href");a.opacity=/^0.5/.test(b.style.opacity);a.cssFloat=!!b.style.cssFloat;a.checkOn=!!c.value;a.optSelected=g.selected;a.enctype=!!document.createElement("form").enctype;a.html5Clone="<:nav></:nav>"!==document.createElement("nav").cloneNode(!0).outerHTML;a.inlineBlockNeedsLayout=!1;a.shrinkWrapBlocks=
!1;a.pixelPosition=!1;a.deleteExpando=!0;a.noCloneEvent=!0;a.reliableMarginRight=!0;a.boxSizingReliable=!0;c.checked=!0;a.noCloneChecked=c.cloneNode(!0).checked;e.disabled=!0;a.optDisabled=!g.disabled;try{delete d.test}catch(k){a.deleteExpando=!1}c=document.createElement("input");c.setAttribute("value","");a.input=""===c.getAttribute("value");c.value="t";c.setAttribute("type","radio");a.radioValue="t"===c.value;c.setAttribute("checked","t");c.setAttribute("name","t");b=document.createDocumentFragment();
b.appendChild(c);a.appendChecked=c.checked;a.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked;d.attachEvent&&(d.attachEvent("onclick",function(){a.noCloneEvent=!1}),d.cloneNode(!0).click());for(h in{submit:!0,change:!0,focusin:!0})d.setAttribute(b="on"+h,"t"),a[h+"Bubbles"]=b in window||!1===d.attributes[b].expando;d.style.backgroundClip="content-box";d.cloneNode(!0).style.backgroundClip="";a.clearCloneStyle="content-box"===d.style.backgroundClip;for(h in jQuery.makeArray(a))break;a.ownLast=
"0"!==h;jQuery(function(){var c,b,e=document.getElementsByTagName("body")[0];e&&(c=document.createElement("div"),c.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",e.appendChild(c).appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",b=d.getElementsByTagName("td"),b[0].style.cssText="padding:0;margin:0;border:0;display:none",f=0===b[0].offsetHeight,b[0].style.display="",b[1].style.display="none",a.reliableHiddenOffsets=f&&0===b[0].offsetHeight,
d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",jQuery.swap(e,null!=e.style.zoom?{zoom:1}:{},function(){a.boxSizing=4===d.offsetWidth}),window.getComputedStyle&&(a.pixelPosition="1%"!==(window.getComputedStyle(d,null)||{}).top,a.boxSizingReliable="4px"===(window.getComputedStyle(d,null)||{width:"4px"}).width,b=d.appendChild(document.createElement("div")),
b.style.cssText=d.style.cssText="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",b.style.marginRight=b.style.width="0",d.style.width="1px",a.reliableMarginRight=!parseFloat((window.getComputedStyle(b,null)||{}).marginRight)),typeof d.style.zoom!==core_strundefined&&(d.innerHTML="",d.style.cssText="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;width:1px;padding:1px;display:inline;zoom:1",
a.inlineBlockNeedsLayout=3===d.offsetWidth,d.style.display="block",d.innerHTML="<div></div>",d.firstChild.style.width="5px",a.shrinkWrapBlocks=3!==d.offsetWidth,a.inlineBlockNeedsLayout&&(e.style.zoom=1)),e.removeChild(c),c=d=b=b=null)});c=e=b=g=b=c=null;return a}({});return jQuery;
}());
