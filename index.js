(function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={i:d,l:!1,exports:{}};return a[d].call(e.exports,e,e.exports,b),e.l=!0,e.exports}var c={};return b.m=a,b.c=c,b.d=function(a,c,d){b.o(a,c)||Object.defineProperty(a,c,{configurable:!1,enumerable:!0,get:d})},b.n=function(a){var c=a&&a.__esModule?function(){return a['default']}:function(){return a};return b.d(c,'a',c),c},b.o=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)},b.p='/',b(b.s=0)})([function(a){'use strict';function b(a){return function(){var b=a.apply(this,arguments);return new Promise(function(a,c){function d(e,f){try{var g=b[e](f),h=g.value}catch(a){return void c(a)}return g.done?void a(h):Promise.resolve(h).then(function(a){d('next',a)},function(a){d('throw',a)})}return d('next')})}}var c=new Promise(function(){});a.exports=function(){var a,d,e=0,f=0;return function(g){function h(){var a=!o&&n==f&&(!k||k());return a||(m&&(m(),m=void 0),o=!0),a}var i=g.debounce,j=void 0===i?0:i,k=g.filter,l=g.distinctFirst,m=g.onCancel;if(l){if(a&&a.every(function(a,b){return l[b]===a}))return m&&m(),c;a=l}if(k&&!k())return m&&m(),c;var n=++f,o=!1;return clearTimeout(e),d&&d(),d=m,new Promise(function(a){n==f&&(e=setTimeout(function(){h()&&a({cancelled:function(){return!h()},resolver:function(){var a=b(regeneratorRuntime.mark(function a(b){var d;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(!h()){a.next=6;break}return a.next=3,b;case 3:if(d=a.sent,!h()){a.next=6;break}return a.abrupt('return',d);case 6:return a.abrupt('return',c);case 7:case'end':return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}(),wait:function(a){return new Promise(function(b){setTimeout(function(){h()&&b()},a)})}})},j))})}}}]);