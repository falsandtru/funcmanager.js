/*
 * 
 * function manager
 * 
 * ---
 * @Copyright(c) 2013, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * @version 0.0.4
 * @updated 2014/02/11
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

( function () {
  var name, manager, accessor, space ;
  window.fma = accessor = {} ;
  window.fm = manager = function func_manager( name, param ) {
    param = param || {} ;
    accessor[ name ] = null ;
    return manager[ name ] = new function () {
      var instance, list ;
      instance = this ;
      list = [] ;
      
      this.get = function () {
        return function () {
          var fn, args, ret ;
          args = [].slice.call( arguments ) ;
          instance.each( function ( index, fn ) {
            ret = fn.apply( instance, args.concat( param.connect ? !index ? param.params : [ ret ] : [] ) ) ;
          } ) ;
          return ret ;
        } ;
      } ;
      this.set = function () {
        return instance.push.apply( instance, [].slice.call( arguments ) ) ;
      } ;
      
      this.exec = function () {
        return instance.get().apply( instance, [].slice.call( arguments ) ) ;
      } ;
      this.each = function ( callback ) {
        var fn, ret ;
        for ( var i = 0 ; fn = list[ i ] ; i++ ) {
          ret = callback( i, fn ) ;
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
            fn.toString() === arg.toString() && args.splice( i--, 1 ) ;
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
          if ( !space ) {
            window.fma = document.createElement('func_manager') ;
            space = document.createElement('div') ;
            space.innerHTML = '<!--[if IE 8]><wbr><![endif]-->' ;
            space = space.firstChild ;
            space = space && space.nodeType === 1 ? document.createDocumentFragment() : document.getElementsByTagName('head')[0] ;
            space.appendChild( window.fma ) ;
          }
          
          var onPropertyChange = function (event) {
          
            if (event.propertyName == name) {
              // temporarily remove the event so it doesn't fire again and create a loop
              window.fma.detachEvent("onpropertychange", onPropertyChange);
              
              // get the changed value, run it through the set function
              instance.set(window.fma[name]);
              
              // restore the get function
              window.fma[name] = instance.exec;
              
              // restore the event
              window.fma.attachEvent("onpropertychange", onPropertyChange);
            }
          };  
          
          window.fma[name] = instance.exec;
          window.fma.attachEvent("onpropertychange", onPropertyChange);
      }
      return instance ;
    } ;
  }
} )() ;
