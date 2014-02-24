/*
 * 
 * function manager
 * 
 * ---
 * @Copyright(c) 2014, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * @version 0.2.0
 * @updated 2014/02/24
 * @author falsandtru https://github.com/falsandtru/
 * @CodingConventions Google JavaScript Style Guide
 * ---
 * Note:
 * 
 * ---
 * Example:
 * 
 */

( function () {
  var manager, accessor, container, holder ;
  
  if ( document ) {
    container = document.createElement('div') ;
    container.innerHTML = '<!--[if IE 8]><wbr><![endif]-->' ;
    holder = document.createElement('_holder') ;
    accessor = !Object.defineProperty || container.firstChild && container.firstChild.nodeType === 1 ? document.getElementsByTagName('_accessor')[0] || document.createElement('_accessor') : false ;
    if ( accessor ) {
      ( Object.defineProperty ? document.createDocumentFragment() : document.getElementsByTagName('head')[0] ).appendChild( holder )
      holder.appendChild( accessor ) ;
    } else {
      container = holder = null ;
    }
    accessor = null ;
  }
  
  function parseFunc( fn ){
    var ret ;
    fn = fn.toString() ;
    ret = fn.match( /^function[^(]*\([^)]*\)[^{]*|{(?:.|[\n\r])*}$/gm ) ;
    ret[0] = ret[0].replace( /^function[^(]*\(|\).*$/gm, '' ) ;
    ret[1] = ret[1].replace( /^{|}$/g, '' ) ;
    ret.splice.apply( {}, [ 0, 1 ].concat( ret[0] && ret[0].match( /\w+/g ) ) ) ;
    return ret ;
  }
  
  window.FuncManager = function ( names, param ) {
    var store = {}, onPropertyChange ;
    this.accessor = accessor = holder ? holder.firstChild.cloneNode() : {} ;
    this.manager = manager = function ( name, param ) {
      name = name || '' ;
      param = param || {} ;
      store[ name ] && store[ name ].detachEvent("onpropertychange", onPropertyChange);
      
      name && ( accessor[ name ] = null ) ;
      manager[ name ] = new function () {
        var instance, list ;
        instance = this ;
        list = [] ;
        
        this.get = function () {
          return function () {
            var names, name, len, manager, accessor, store, parseFunc, container, holder ;
            var list, onPropertyChange ;
            
            var _arguments_, _return_, _param_ ;
            _arguments_ = [].slice.call( arguments ) ;
            _param_ = param ;
            instance.each( function () {
              var instance, param ;
              _return_ = arguments[ 1 ].apply( this, _arguments_.concat( !arguments[ 0 ] ? _param_.params : _param_.chain ? [ _return_ ] : [] ) ) ;
            } ) ;
            return _return_ ;
          } ;
        } ;
        this.set = function () {
          return instance.push.apply( instance, [].slice.call( arguments ) ) ;
        } ;
        this.get = param.ctor ? eval( '(1&&function(){' +
                                        parseFunc( param.ctor ).pop() + ';\n' +
                                        'return function(){\n' +
                                          parseFunc( instance.get ).pop().replace( /arguments\[ 1 \]/, 'eval("(1&&"+arguments[ 1 ].toString()+")")' ) + ';\n' +
                                        '}' +
                                      '})' ).call( instance )
                              : this.get ;
        
        this.acc = accessor ;
        this.exec = function () {
          return instance.get().apply( instance, [].slice.call( arguments ) ) ;
        } ;
        this.each = function ( callback ) {
          var fn, ret ;
          for ( var i = 0 ; fn = list[ i ] ; i++ ) {
            ret = callback.call( instance, i, fn ) ;
            switch ( typeof ret ) {
              case 'function':
                list[ i ] = ret ;
                break ;
                
              default:
                switch ( ret ) {
                  case false:
                    return ;
                }
            }
          }
        } ;
        this.replace = function ( mat, rep ) {
          var fn, ret ;
          for ( var i = 0 ; fn = list[ i ] ; i++ ) {
            if ( mat === fn || mat.toString() === fn.toString() ) {
              typeof rep === 'function' ? list.splice( i, 1, rep ) : list.splice( i, 1 ) ;
            }
          }
        } ;
        this.clear = function () {
          list = [] ;
        } ;
        
        this.push = function () {
          var args, ret ;
          args = [].slice.call( arguments ) ;
          
          for ( var i = 0, arg ; arg = args[ i ] ; i++ ) {
            typeof arg !== 'function' && args.splice( i--, 1 ) ;
          }
          param.unique && instance.each( function ( index, fn ) {
            for ( var i = 0, arg ; arg = args[ i ] ; i++ ) {
              if ( fn === arg || ( fn = fn.toString() ) === arg.toString() ) {
                fn !== instance.get().toString() && fn !== instance.exec.toString() && args.splice( i--, 1 ) ;
              }
            }
          } ) ;
          return [].push.apply( list, args ) ;
        } ;
        this.pop = function () {
          return list.pop() ;
        } ;
        this.unshift = function ( fn ) {
          return [].unshift.apply( list, [].slice.call( arguments ) ) ;
        } ;
        this.shift = function () {
          return list.shift() ;
        } ;
        
        switch ( true ) {
          // Modern browsers, IE9+
          case !!Object.defineProperty:
            try {
              Object.defineProperty(accessor, name, {
                get: this.get,
                set: this.set
              });
              break ;
            } catch (e) {}
          
          // Older Mozilla
          case !!accessor.__defineGetter__:
            try {
              accessor.__defineGetter__(name, this.get);
              accessor.__defineSetter__(name, this.set);
              break ;
            } catch (e) {}
          
          // IE6-8
          default:
            holder.appendChild( accessor ) ;
            onPropertyChange = function (event){
              if (event.propertyName === name) {
                instance.acc.detachEvent("onpropertychange", arguments.callee);
                instance.set(accessor[ name ]);
                instance.acc[ name ] = instance.exec;
                instance.acc.attachEvent("onpropertychange", arguments.callee);
              }
            };
            
            store[ name ] = accessor;
            
            name && ( accessor[ name ] = instance.exec );
            accessor.attachEvent("onpropertychange", onPropertyChange);
        }
        return instance ;
      } ;
      return accessor;
    }
    
    if ( names ) {
      names = names.split( /[\s,]{1,}/ ) ;
      for ( var i = 0, len = names.length, name ; i < len ; i++ ) {
        manager(names[ i ], param);
      }
    }
  }
} )() ;
