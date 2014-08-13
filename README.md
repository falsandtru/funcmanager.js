# function manager
function managerは複数のJavaScript関数を1つの関数にまとめ、アクセサ形式で容易に管理できるようにするスクリプトです。

## 概要
複数のJavaScript関数を1つの関数にまとめます。コールバック関数の作成などに便利です。

```javascript
var accessor = FuncManager(['demo']) ;

var count = 0;
accessor.demo = function(){count++};
accessor.demo = function(){return count};
accessor.demo(); // 1
```

## 使用法

### Register

#### FuncManager( [ Names as array, Options as object ] )
`FuncManager()`を実行するとアクセサ作成関数`manager`、アクセサが追加される`accessor`などのメンバを持つオブジェクトを作成します。`manager`と`accessor`のメンバは関数管理オブジェクトを兼ねており、管理関数の操作を行えます。IE6-7ではブラウザ対応のためHEAD要素に独自要素が追加されます。**DOM要素の既定のプロパティと同じプロパティ名はIE8以前のブラウザでエラーが発生する可能性があるため使用しないことを推奨します。**

```javascript
var ret = FuncManager();
ret.manager;  // function
ret.accessor; // object
ret.context; // context
ret.arguments; // [accessor, manager]
ret.contextArguments; // [context, [accessor, manager]]
```

```javascript
var ret = FuncManager(['test']);
ret.accessor.test; // accessor
```

#### accessor
アクセサと関数管理オブジェクトをプロパティに持ちます。

#### manager( Name as string [, Options as object ] )
accessorのプロパティにアクセサと関数管理オブジェクトを、managerのプロパティに関数管理オブジェクトを作成します。

##### Options

###### ctor as function
アクセサのコンストラクタを設定します。この関数はアクセサの設定時に実行され、管理関数の実行時には実行されません。

```javascript
var ret, fm, fa ;
ret = FuncManager() ;
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
new Function().apply.apply(function (accessor) {
  var spec = accessor,
      initialize = true,
      always = true,
      finish = false;

/* init
  ========================================================================== */
  $(spec.init);
  spec.init = spec.clientenv;
  spec.init = spec.preload;
  spec.init = spec.pjax;
  spec.init = spec.visibilitytrigger;
  spec.init = function () {
    initialize = false;
  };

/* component
  ========================================================================== */

/* clientenv
  -------------------------------------------------------------------------- */
  spec.clientenv = function () {
    if (initialize) {
      $.clientenv({ font: { lang: 'ja' } })
      .addClass('hardware platform os windowsXP:lte windowsXP:gt browser ie ie8:lte')
      .addClass('font', 'Meiryo, メイリオ', 'meiryo')
      .clientenv({ not: false })
      .addClass('touch');
    }
  };

/* preload
  -------------------------------------------------------------------------- */
  spec.preload = function () {
    // 省略
  };

/* pjax
  -------------------------------------------------------------------------- */
  spec.pjax = function () {
    // 省略
  };

/* visibilitytrigger
  -------------------------------------------------------------------------- */
  spec.visibilitytrigger = function () {
    if (always) {
      $.visibilitytrigger();

      $.vt({
        ns: '.img.primary',
        trigger: '#primary img[data-original]',
        callback: function () { this.src = $(this).attr('data-original') },
        ahead: [0, .1],
        skip: true,
        terminate: false
      }).disable();

      $.vt({
        ns: '.img.secondary',
        trigger: '#secondary img[data-original]',
        callback: function () { this.src = $(this).attr('data-original') },
        ahead: [0, .1],
        skip: true,
        terminate: false
      }).disable();

      $.vt({
        ns: '.iframe.primary',
        trigger: '#primary iframe[data-original]',
        callback: function () { this.src = $(this).attr('data-original') },
        ahead: [0, .1],
        skip: true
      }).disable();

      $.vt({
        ns: ".sh.primary",
        trigger: "#primary pre.sh",
        callback: function () { SyntaxHighlighter && SyntaxHighlighter.highlight(SyntaxHighlighter.defaults, this); },
        ahead: [0, .1],
        step: 0,
        skip: true
      }).disable();

      $.vt.enable().vtrigger();
    }
  };

  return this;
},
FuncManager([
  'init',
  'preload',
  'pjax',
  'visibilitytrigger',
  'clientenv'
]).contextArguments);
```

## ライセンス
MIT License
