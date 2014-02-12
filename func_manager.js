/*
 * 
 * function manager
 * 
 * ---
 * @Copyright(c) 2013, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * @version 0.0.5
 * @updated 2014/02/12
 * @author falsandtru https://github.com/falsandtru/
 * @CodingConventions Google JavaScript Style Guide
 * ---
 * Note:
 * 
 * ---
 * Example:
 * 
 * ---
 * Document:
 * -
 * 
 */

( function ( manager_name, accessor_name ) {
  var name, manager, accessor, element, namespace ;
  
  function parseFunc( fn ){
    var ret ;
    fn = fn.toString() ;
    ret = fn.match( /^function[^(]*\([^)]*\)[^{]*|{(?:.|[\n\r])*}$/gm ) ;
    ret[0] = ret[0].replace( /^function[^(]*\(|\).*$/gm, '' ) ;
    ret[1] = ret[1].replace( /^{|}$/g, '' ) ;
    ret.splice.apply( {}, [ 0, 1 ].concat( ret[0] && ret[0].match( /\w+/g ) ) ) ;
    return ret ;
  }
  namespace = {} ;
  window[ accessor_name ] = accessor = {} ;
  window[ manager_name ] = manager = function func_manager( name, param ) {
    param = param || {} ;
    accessor[ name ] = null ;
    return manager[ name ] = new function () {
      var instance, list ;
      instance = this ;
      list = [] ;
      
      this.get = function () {
        return function () {
          var manager_name, accessor_name ;
          var name, manager, accessor, element, namespace, parseFunc ;
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
      
      this.exec = function () {
        return instance.get().apply( instance, [].slice.call( arguments ) ) ;
      } ;
      this.each = function ( callback ) {
        var fn, ret ;
        for ( var i = 0 ; fn = list[ i ] ; i++ ) {
          ret = callback.call( this, i, fn ) ;
          switch ( typeof ret ) {
            case 'function':
              list[ i ] = ret ;
              break ;
              
            default:
              switch ( ret ) {
                case false:
                case null:
                  list.splice( i--, 1 ) ;
                  break ;
              }
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
            if ( fn === arg || fn.toString() === arg.toString() ) {
              args.splice( i--, 1 ) ;
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
          function onPropertyChange(event) {
            if (event.propertyName === name) {
              accessor.detachEvent("onpropertychange", onPropertyChange);
              instance.set(accessor[name]);
              accessor[name] = instance.exec;
              accessor.attachEvent("onpropertychange", onPropertyChange);
            }
          }
          
          if ( !element || !( accessor = document.getElementsByTagName('func_manager')[0] ) ) {
            window[ accessor_name ] = accessor = document.createElement('func_manager') ;
            element = document.createElement('div') ;
            element.innerHTML = '<!--[if IE 8]><wbr><![endif]-->' ;
            element = element.firstChild ;
            element = element && element.nodeType === 1 ? document.createDocumentFragment() : document.getElementsByTagName('head')[0] ;
            element.appendChild( accessor ) ;
          }
          namespace[ name ] && namespace[ name ]();
          namespace[ name ] = function () {
            accessor.detachEvent("onpropertychange", onPropertyChange);
          } ;
          
          accessor[name] = instance.exec;
          accessor.attachEvent("onpropertychange", onPropertyChange);
      }
      return instance ;
    } ;
  }
} )('fm', 'fma') ;
