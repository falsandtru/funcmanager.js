# function manager
function managerは複数のJavaScript関数を1つの関数にまとめ、アクセサ形式で容易に管理できるようにするスクリプトです。

## 概要
複数のJavaScript関数を1つの関数にまとめます。コールバック関数の作成などに便利です。

```javascript
var accessor = new FuncManager().manager('demo') ;

var count = 0;
accessor.demo = function(){count++};
accessor.demo = function(){return count};
accessor.demo(); // 1
```

## 使用法

### Register

#### FuncManager( [ Names as array ] )
`new FuncManager()`を実行すると関数管理オブジェクトが追加される`manager`とアクセサが追加される`accessor`の2つを持つオブジェクトを作成します。主に関数管理オブジェクトは管理関数の操作、アクセサは管理関数の設定と全管理関数実行関数の取得に使用します。IE6-7ではブラウザ対応のためHEAD要素に独自要素が追加されます。**DOM要素の既定のプロパティと同じプロパティ名はIE8以前のブラウザでエラーが発生する可能性があるため使用しないことを推奨します。**

```javascript
var ret = new FuncManager();
ret.manager;  // function
ret.accessor; // object
```

```javascript
var ret = new FuncManager(['test']);
ret.accessor.test; // accessor
```

#### accessor
作成されたアクセサを持ちます。

#### manager( Name as string [, Options as object ] )
accessorのプロパティにアクセサを、managerのプロパティに管理関数を操作するオブジェクトを作成します。

##### Options

###### ctor as function
アクセサのコンストラクタを設定します。この関数はアクセサの設定時に実行され、管理関数の実行時には実行されません。

```javascript
var ret, fm, fa ;
ret = new FuncManager() ;
fa = ret.accessor ;
fm = ret.manager ;

fm('ctor', { ctor: function(){
  var count=0;
  this.rate = 2;
} });

fa.ctor = function(){count++};
fa.ctor = function(){return count * this.rate};
fa.ctor(); // 2
fa.ctor(); // 4
```

###### params as array
最初の管理関数に与えられる引数の末尾に追加する引数を設定します。

```javascript
fm('params', { params: [ 1 ] });

fa.params = function(count){return count};
fa.params(); // 1
```

###### unique as boolean
`true`を設定すると同じ関数を重複して追加しません。

```javascript
fm('unique', { unique: true });

var count=0;
fa.unique = function(){count++};
fa.unique = function(){count++};
fa.unique = function(){return count};
fa.unique(); // 1
```

###### chain as boolean
`true`を設定すると実行した管理関数の戻り値を次に実行する管理関数の引数の末尾に追加します。

```javascript
fm('chain', { chain: true });

var count=0;
fa.chain = function(){return ++count};
fa.chain = function(count){return count};
fa.chain(); // 1
```

### Method

#### get()
すべての管理関数を実行する関数を返します。

#### set( Function as function )
関数を末尾に追加します。

#### exec()
すべての管理関数を実行します。

#### each( Callback as function( index, function ) )
コールバック関数を実行します。`false`を返すと処理を抜けます。

#### replace( Match as function [, Replace as function ] )
第一引数の関数を走査し第二引数の関数と置換します。第二引数を設定しないか関数以外を設定すると一致した関数を削除します。

#### clear()
すべての管理関数を削除します。

#### push( Function as function )
末尾に関数を追加します。

#### unshift( Function as function )
先頭に関数を追加します。

#### pop()
末尾の管理関数を削除します。

#### shift()
先頭の管理関数を削除します。

## 記述例
ページの初期化、イベントやjQueryのコールバックなどに利用できます。

```javascript
(function(){
  var accessor = this;

  /* init
     ========================================================================== */
  $(this.init);
  this.init = this.clientenv;
  this.init = this.preload;
  this.init = this.pjax;
  this.init = this.visibilitytrigger;

  /* reset
     ========================================================================== */
  this.reset = function() {$(document).trigger('preload');};
  this.reset = this.visibilitytrigger;

  /* component
     ========================================================================== */

  /* clientenv
     -------------------------------------------------------------------------- */
  this.clientenv = function(){
    $.clientenv({ font: { lang: 'ja' } })
    .addClass('hardware platform os windowsXP:lte windowsXP:gt browser ie ie8:lte')
    .addClass('font', 'Meiryo, メイリオ', 'meiryo')
    .clientenv({not: false})
    .addClass('touch');
  };

  /* preload
     -------------------------------------------------------------------------- */
  this.preload = function(){
    // 省略
  };

  /* pjax
     -------------------------------------------------------------------------- */
  this.pjax = function(){
    // 省略
  };

  /* visibilitytrigger
     -------------------------------------------------------------------------- */
  this.visibilitytrigger = function(){
    $.visibilitytrigger();

    $.vt({
      ns: "sh",
      trigger: "pre.sh",
      callback: function(){ SyntaxHighlighter && SyntaxHighlighter.highlight(SyntaxHighlighter.defaults,this); },
      ahead: [0, '*1'],
      step: 0,
      skip: true
    }).disable();

    $.vt.enable().vtrigger();
  };

  return this;
}).call(new FuncManager(
  [
    'init',
    'reset',
    'preload',
    'pjax',
    'visibilitytrigger',
    'clientenv'
  ]
).accessor);
```

## ライセンス
MIT License
