/**
 * 
 * Function Manager
 * 
 * @name FuncManager
 * @version 0.4.0
 * ---
 * @author falsandtru https://github.com/falsandtru/funcmanager.js/
 * @copyright 2014, falsandtru
 * @license MIT
 * 
 */

(function (window, document, undefined) {

  var NAME = 'FuncManager',
      NAMESPACE = window;

  NAMESPACE[NAME] = function (names, options) {

    switch (this) {
      case window:
      case NAMESPACE:
        return FuncManager.call({}, names, options);
    }
    switch (typeof names) {
      case 'string':
        names = names.split(/[\s,]{1,}/);
        break;
    }

    var acsm = new AccessorManager(),
        accessor = acsm.accessor ? acsm.accessor.cloneNode() : {},
        events = {};

    if (names instanceof Array) {
      (function () {
        for (var i = 0, len = names.length; i < len; i++) {
          manager.call(this, names[i], options)
        }
      }).call(this);
    }

    return {
      accessor: accessor,
      manager: manager,
      context: this,
      arguments: [accessor, manager],
      contextArguments: [this, [accessor, manager]]
    };

    function construct(fn, options, members) {
      return eval(fn).call(this);
    }

    function manager(name, options) {
      name = name || '';
      options = options || {};

      var context = this;

      events[name] && acsm.accessor && accessor.detachEvent("onpropertychange", events[name]);

      var members = new function () {
        var members = this,
            funcs = [];

        function exec() {
          var names, AccessorManager, acsm, accessor, events, manager, exec;

          var _arguments_, _return_, _options_;
          _arguments_ = [].slice.call(arguments);
          _options_ = options;
          members.each.call(this, function () {
            var members, options;
            _return_ = arguments[1].apply(this, _arguments_.concat(!arguments[0] ? _options_.params : _options_.chain ? [_return_] : []));
          });
          return _return_;
        }
        exec = options.ctor ? construct.call(context,
                                             '(1&&function(){' +
                                               dissolveFunction(options.ctor).pop() + ';\n' +
                                               dissolveFunction(function () { return exec; }).pop().replace('exec', new Function(dissolveFunction(exec).pop()).toString().replace('anonymous', '')).replace(/([\w\[\]]+)\.apply/, 'eval("(1&&"+$1.toString()+")").apply') + ';\n' +
                                             '})',
                                             options,
                                             members
                                            )
                            : exec;

        this.get = function () {
          return exec;
        };
        this.set = function () {
          return members.push.apply(members, [].slice.call(arguments));
        };

        this.acc = accessor;
        this.exec = function () {
          return members.get().apply(this, [].slice.call(arguments));
        };
        this.each = function (callback) {
          // thisは呼び出し元指定のコンテキスト
          var fn, ret;
          for (var i = 0; fn = funcs[i]; i++) {
            ret = callback.call(this, i, fn);
            switch (typeof ret) {
              case 'function':
                funcs[i] = ret;
                break;

              default:
                switch (ret) {
                  case false:
                    return;
                }
            }
          }
        };
        this.replace = function (mat, rep) {
          var fn, ret;
          for (var i = 0; fn = funcs[i]; i++) {
            if (mat === fn || mat.toString() === fn.toString()) {
              typeof rep === 'function' ? funcs.splice(i, 1, rep) : funcs.splice(i, 1);
            }
          }
        };
        this.clear = function () {
          funcs = [];
        };
        this.release = function () {
          acsm.holder && acsm.holder.removeChild(accessor);
        };

        this.push = function () {
          var args, ret;
          args = [].slice.call(arguments);

          for (var i = 0, arg; arg = args[i]; i++) {
            typeof arg !== 'function' && args.splice(i--, 1);
          }
          options.unique && members.each(function (index, fn) {
            for (var i = 0, arg; arg = args[i]; i++) {
              if (fn === arg || (fn = fn.toString()) === arg.toString()) {
                fn !== members.get().toString() && fn !== members.exec.toString() && args.splice(i--, 1);
              }
            }
          });
          return [].push.apply(funcs, args);
        };
        this.pop = function () {
          return funcs.pop();
        };
        this.unshift = function (fn) {
          return [].unshift.apply(funcs, [].slice.call(arguments));
        };
        this.shift = function () {
          return funcs.shift();
        };
      }

      accessor[name] = null;
      switch (acsm.type) {
        case 'ecma':
          Object.defineProperty(accessor, name, {
            get: members.get,
            set: members.set
          });
          break;

        case 'old':
          accessor.__defineGetter__(name, members.get);
          accessor.__defineSetter__(name, members.set);
          break;

        case 'element':
          Object.defineProperty(accessor, name, {
            get: members.get,
            set: members.set
          });
          break;

        case 'dom':
        default:
          acsm.holder.appendChild(accessor);
          function onPropertyChangeHandler(event) {
            if (event.propertyName === name) {
              members.acc.detachEvent("onpropertychange", arguments.callee);
              members.set(accessor[name]);
              members.acc[name] = members.exec;
              members.acc.attachEvent("onpropertychange", arguments.callee);
            }
          };

          events[name] = onPropertyChangeHandler;

          accessor[name] = members.exec;
          accessor.attachEvent("onpropertychange", onPropertyChangeHandler);
          break;
      }
      manager[name] = {};

      for (var i in members) {
        accessor[name][i] = members[i];
        manager[name][i] = members[i];
      }
      return accessor;
    }
  };

  function dissolveFunction(fn) {
    var ret;
    fn = fn.toString();
    ret = fn.match(/^function[^(]*\([^)]*\)[^{]*|{(?:.|[\n\r])*}$/gm);
    ret[0] = ret[0].replace(/^function[^(]*\(|\).*$/gm, '');
    ret[1] = ret[1].replace(/^{|}$/g, '');
    ret.splice.apply({}, [0, 1].concat(ret[0] && ret[0].match(/\w+/g)));
    return ret;
  }
  
  function AccessorManager() {
    try {
      var obj = {};
      Object.defineProperty(obj, 'test', {
        get: Function(),
        set: Function()
      });
      this.type = 'ecma';
      return;
    } catch (e) { }

    try {
      var obj = {};
      obj.__defineGetter__('test', Function());
      obj.__defineSetter__('test', Function());
      this.type = 'old';
      return;
    } catch (e) { }

    try {
      var obj = document.createElement('FM_ACCESSOR');
      Object.defineProperty(obj, 'test', Function());
      Object.defineProperty(obj, 'test', Function());
      this.accessor = document.createElement('FM_ACCESSOR');
      this.type = 'element';
      return;
    } catch (e) { }

    this.holder = document.createElement('FM_HOLDER');
    this.accessor = document.createElement('FM_ACCESSOR');
    document.getElementsByTagName('head')[0].appendChild(this.holder);
    this.type = 'dom';
  };

})(window, window.document, void 0);
