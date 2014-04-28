/*
 * 
 * Function Manager
 * 
 * @name FuncManager
 * @version 0.2.0
 * ---
 * @template JavaScriptMinimalMVC
 * @author falsandtru https://github.com/falsandtru/
 * @copyright 2014, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * ---
 * Note:
 * 
 */

(function(window, document, undefined) {
  
  var NAMESPACE = window;
  
  var $, jQuery = $ = null;
  
  var M, V, C;
  
  /* MODEL */
  M = {
    // ネームスペース（プロパティネーム）
    NAME: 'FuncManager',
    
    NAMES: {
      CHANGE: 'mvc.change'
    },
    
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
      context = C.REGISTER_METHODS(M.jQuery.extend(true, {}, NAMESPACE[M.NAME]));
      context.accessor = V.ACCESSOR ? V.ACCESSOR.cloneNode() : {};
      context.manager = manager;
      context.stock = M.stock();
      if (names) {
        names = names.split(/[\s,]{1,}/);
        var i = 0, len = names.length, name;
        for (; i < len; i++) {
          manager(names[i], param)
        }
      }
      return context;
      
      function manager(name, param) {
        name = name || '';
        param = param || {};
        
        var accessor = context.accessor,
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
                                            M.parseFunc(instance.get).pop().replace(/arguments\[1\]/, 'eval("(1&&"+arguments[1].toString()+")")') + ';\n' +
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
    
    FUNCTIONS: {},
    
    METHODS: {}
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
// >>>>>  Template Driver  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  
  M = ($ || M.jQuery).extend(true, {
    // ネームスペース（プロパティネーム）
    NAME: 'mvc',
    
    // スクリプトロード時に一度だけ実行される
    INIT: function() {
      M.initialize();
    },
    initialize: function() {},
    
    // インスタンスオブジェクトを保存領域から取得するIDとして使用
    COUNT: 0,
    
    // プラグインの本体
    MAIN: function() {
      return M.main.apply(this, arguments);
    }
  }, M);
  
  V = ($ || M.jQuery).extend(true, {
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
  
  C = ($ || M.jQuery).extend(true, {
    // CONTROLLERのルート
    DRIVER: V.DRIVER,
    $DRIVER: V.$DRIVER,
    
    // スクリプトロード時に一度だけ実行される
    INIT: function() {
      // プラグインに関数を設定してネームスペースに登録
      // $.mvc.func, $().mvc.funcとして実行できるようにするための処理
      if (NAMESPACE && NAMESPACE == NAMESPACE.window) {
        NAMESPACE[M.NAME] = C.REGISTER_FUNCTIONS(C.EXEC);
      } else {
        NAMESPACE[M.NAME] = NAMESPACE.prototype[M.NAME] = C.REGISTER_FUNCTIONS(C.EXEC);
      }
      
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
        // コンテキストに関数とメソッドを設定
        C.REGISTER_FUNCTIONS($context);
        C.REGISTER_METHODS($context);
      }
      return $context;
    },
    
    // プラグインとして代入される
    EXEC: function() {
      C.execute.apply(this, arguments);
      return M.MAIN.apply(this, arguments);
    },
    execute: function() {},
    
    // CONTROLLERの関数をプラグインに登録する
    REGISTER_FUNCTIONS: function($context) {
      return M.jQuery.extend(true, $context, C.FUNCTIONS);
    },
    
    // CONTROLLERのメソッドをプラグインに登録する
    REGISTER_METHODS: function($context) {
      return M.jQuery.extend(true, $context, C.METHODS);
    },
    
    // プラグインに登録される関数
    FUNCTIONS: {},
    
    // プラグインに登録されるメソッド
    METHODS: {}
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
  var jQuery=function(){},class2type=function(){var a={},d="Boolean Number String Function Array Date RegExp Object Error".split(" "),b,e;for(b=d.length;e=d[--b];)a["[object "+e+"]"]=e.toLowerCase();return a}(),core_hasOwn=class2type.hasOwnProperty,core_toString=class2type.toString;
jQuery.support=function(a){var d,b,e,h,f,g,c=document.createElement("div");c.setAttribute("className","t");c.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";d=c.getElementsByTagName("*")||[];b=c.getElementsByTagName("a")[0];if(!b||!b.style||!d.length)return a;e=document.createElement("select");h=e.appendChild(document.createElement("option"));d=c.getElementsByTagName("input")[0];b.style.cssText="top:1px;float:left;opacity:.5";a.getSetAttribute="t"!==c.className;a.leadingWhitespace=
3===c.firstChild.nodeType;a.tbody=!c.getElementsByTagName("tbody").length;a.htmlSerialize=!!c.getElementsByTagName("link").length;a.style=/top/.test(b.getAttribute("style"));a.hrefNormalized="/a"===b.getAttribute("href");a.opacity=/^0.5/.test(b.style.opacity);a.cssFloat=!!b.style.cssFloat;a.checkOn=!!d.value;a.optSelected=h.selected;a.enctype=!!document.createElement("form").enctype;a.html5Clone="<:nav></:nav>"!==document.createElement("nav").cloneNode(!0).outerHTML;a.inlineBlockNeedsLayout=!1;a.shrinkWrapBlocks=
!1;a.pixelPosition=!1;a.deleteExpando=!0;a.noCloneEvent=!0;a.reliableMarginRight=!0;a.boxSizingReliable=!0;d.checked=!0;a.noCloneChecked=d.cloneNode(!0).checked;e.disabled=!0;a.optDisabled=!h.disabled;try{delete c.test}catch(k){a.deleteExpando=!1}d=document.createElement("input");d.setAttribute("value","");a.input=""===d.getAttribute("value");d.value="t";d.setAttribute("type","radio");a.radioValue="t"===d.value;d.setAttribute("checked","t");d.setAttribute("name","t");b=document.createDocumentFragment();
b.appendChild(d);a.appendChecked=d.checked;a.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked;c.attachEvent&&(c.attachEvent("onclick",function(){a.noCloneEvent=!1}),c.cloneNode(!0).click());for(g in{submit:!0,change:!0,focusin:!0})c.setAttribute(b="on"+g,"t"),a[g+"Bubbles"]=b in window||!1===c.attributes[b].expando;c.style.backgroundClip="content-box";c.cloneNode(!0).style.backgroundClip="";a.clearCloneStyle="content-box"===c.style.backgroundClip;for(g in jQuery(a))break;a.ownLast="0"!==
g;jQuery(function(){var d,b,e=document.getElementsByTagName("body")[0];e&&(d=document.createElement("div"),d.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",e.appendChild(d).appendChild(c),c.innerHTML="<table><tr><td></td><td>t</td></tr></table>",b=c.getElementsByTagName("td"),b[0].style.cssText="padding:0;margin:0;border:0;display:none",f=0===b[0].offsetHeight,b[0].style.display="",b[1].style.display="none",a.reliableHiddenOffsets=f&&0===b[0].offsetHeight,
c.innerHTML="",c.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",jQuery.swap(e,null!=e.style.zoom?{zoom:1}:{},function(){a.boxSizing=4===c.offsetWidth}),window.getComputedStyle&&(a.pixelPosition="1%"!==(window.getComputedStyle(c,null)||{}).top,a.boxSizingReliable="4px"===(window.getComputedStyle(c,null)||{width:"4px"}).width,b=c.appendChild(document.createElement("div")),
b.style.cssText=c.style.cssText="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",b.style.marginRight=b.style.width="0",c.style.width="1px",a.reliableMarginRight=!parseFloat((window.getComputedStyle(b,null)||{}).marginRight)),typeof c.style.zoom!==core_strundefined&&(c.innerHTML="",c.style.cssText="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;width:1px;padding:1px;display:inline;zoom:1",
a.inlineBlockNeedsLayout=3===c.offsetWidth,c.style.display="block",c.innerHTML="<div></div>",c.firstChild.style.width="5px",a.shrinkWrapBlocks=3!==c.offsetWidth,a.inlineBlockNeedsLayout&&(e.style.zoom=1)),e.removeChild(d),d=c=b=b=null)});d=e=b=h=b=d=null;return a}({});
jQuery.extend=jQuery.prototype.extend=function(){var a,d,b,e,h,f=arguments[0]||{},g=1,c=arguments.length,k=!1;"boolean"===typeof f&&(k=f,f=arguments[1]||{},g=2);"object"===typeof f||jQuery.isFunction(f)||(f={});c===g&&(f=this,--g);for(;g<c;g++)if(null!=(h=arguments[g]))for(e in h)a=f[e],b=h[e],f!==b&&(k&&b&&(jQuery.isPlainObject(b)||(d=jQuery.isArray(b)))?(d?(d=!1,a=a&&jQuery.isArray(a)?a:[]):a=a&&jQuery.isPlainObject(a)?a:{},f[e]=jQuery.extend(k,a,b)):void 0!==b&&(f[e]=b));return f};
jQuery.extend({type:function(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?class2type[core_toString.call(a)]||"object":typeof a},isPlainObject:function(a){var d;if(!a||"object"!==jQuery.type(a)||a.nodeType||jQuery.isWindow(a))return!1;try{if(a.constructor&&!core_hasOwn.call(a,"constructor")&&!core_hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(b){return!1}if(jQuery.support.ownLast)for(d in a)return core_hasOwn.call(a,d);for(d in a);return void 0===d||
core_hasOwn.call(a,d)},isFunction:function(a){return"function"===jQuery.type(a)},isArray:Array.isArray||function(a){return"array"===jQuery.type(a)},isWindow:function(a){return null!=a&&a==a.window}});return jQuery;
}());
