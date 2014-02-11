/*
 * 
 * function manager
 * 
 * ---
 * @Copyright(c) 2013, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * @version 0.0.0
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
  var name, manager, accessor, df ;
  df = document.createDocumentFragment() ;
  window.fma = accessor = {} ;
  window.fm = manager = function func_manager( name, connect ) {
    accessor[ name ] = null ;
    manager[ name ] = new function () {
      var instance, list ;
      instance = this ;
      list = [] ;
      
      this.get = function ( fn ) {
        return function () {
          var fn, arg, ret, i = 0 ;
          arg = [].slice.call( arguments ) ;
          while ( typeof ( fn = list[ i++ ] ) === 'function' ) {
            ret = fn.apply( this, arg.concat( connect ? ret : [] ) ) ;
          }
          return ret ;
        } ;
      } ;
      this.set = function () {
        return instance.push.apply( this, [].slice.call( arguments ) ) ;
      } ;
      
      this.exec = function () {
        return instance.get()() ;
      } ;
      
      this.push = function () {
        return [].push.apply( list, [].slice.call( arguments ) ) ;
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
      this.clear = function () {
        list = [] ;
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
          window.fma = document.createElement('dummy') ;
          df.appendChild( window.fma )
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
    } ;
  }
} )() ;
