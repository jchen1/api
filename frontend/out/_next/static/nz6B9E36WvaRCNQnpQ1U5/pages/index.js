(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{"/0+H":function(e,t,n){"use strict";t.__esModule=!0,t.isInAmpMode=i,t.useAmp=function(){return i(o.default.useContext(a.AmpStateContext))};var r,o=(r=n("q1tI"))&&r.__esModule?r:{default:r},a=n("lwAK");function i(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.ampFirst,n=void 0!==t&&t,r=e.hybrid,o=void 0!==r&&r,a=e.hasQuery;return n||o&&(void 0!==a&&a)}},"/bYT":function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return p}));var r=n("q1tI"),o=n.n(r),a=n("vOnD"),i=o.a.createElement,c=a.a.label.withConfig({displayName:"inputcontainer__Label",componentId:"sc-1rkjcax-0"})(["height:2.5rem;display:inline-flex;align-items:center;border-radius:5px 0 0 5px;border:1px solid #d8d8d8;border-right:0;background-color:white;cursor:text;flex-grow:1;margin:0;input{-webkit-appearance:none;border:none;outline:0;padding:0;font-size:1rem;padding:0 0.5rem;font-family:inherit;}"]),u=a.a.button.withConfig({displayName:"inputcontainer__Button",componentId:"sc-1rkjcax-1"})(["height:2.5rem;display:inline-block;cursor:pointer;user-select:none;background-color:#f03009;text-align:center;text-transform:uppercase;outline:0;border:1px solid #f03009;letter-spacing:0.15rem;padding:0 1rem;border-radius:0 5px 5px 0;color:white;transition:background ease-in 0.2s;flex-grow:1;margin:0;&:hover{background-color:#bd0000;border-color:#bd0000;}"]),l=a.a.form.withConfig({displayName:"inputcontainer__Form",componentId:"sc-1rkjcax-2"})(["display:flex;align-items:center;justify-content:center;"]),s=a.a.div.withConfig({displayName:"inputcontainer__Container",componentId:"sc-1rkjcax-3"})(["display:flex;align-items:center;justify-content:space-between;@media screen and (max-width:640px){flex-direction:column;}margin-bottom:1rem;width:100%;padding:0 2rem;"]),f=a.a.form.withConfig({displayName:"inputcontainer__HourContainer",componentId:"sc-1rkjcax-4"})(["border:1px solid #d8d8d8;border-radius:5px;display:flex;align-items:center;justify-content:center;background-color:white;margin:0 0 0 1rem;@media screen and (max-width:640px){margin:1rem 0 0 0;}label{cursor:pointer;height:2.5rem;display:flex;align-items:center;justify-content:center;padding:0 1rem;font-size:1rem;font-family:inherit;user-select:none;}label:not(:last-of-type){border-right:1px solid #d8d8d8;}input{display:none;}input:checked + label{background-color:#f03009;color:white;}"]),d=a.a.div.withConfig({displayName:"inputcontainer__EventContainer",componentId:"sc-1rkjcax-5"})(["display:flex;flex-direction:column;align-items:",";@media screen and (max-width:640px){align-items:center;}"],(function(e){return e.align}));function p(e){var t=e.ws,n=e.hours,a=e.setHours,p=Object(r.useState)(""),m=p[0],h=p[1];return i(s,null,i(d,{align:"center"},i("h2",null,"Send an event!"),i(l,{onSubmit:function(e){e.preventDefault(),t.send(JSON.stringify({type:"message",message:m})),h("")}},i(c,{key:"a"},i("input",{key:"b",type:"text",value:m,onChange:function(e){return h(e.target.value)}})),i(u,null,"Send"))),i(d,{align:"center",key:n},i("h2",null,"Time"),i(f,null,[12,24,48].map((function(e){return i(o.a.Fragment,{key:e},i("input",{type:"radio",id:"".concat(e),value:e,checked:n===e,onChange:function(e){return a(parseInt(e.target.value))}}),i("label",{key:e,checked:n===e,htmlFor:"".concat(e)},e,"h"))})))))}},"7W2i":function(e,t,n){var r=n("SksO");e.exports=function(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&r(e,t)}},"8Kt/":function(e,t,n){"use strict";t.__esModule=!0,t.defaultHead=l,t.default=void 0;var r=u(n("q1tI")),o=u(n("Xuae")),a=n("lwAK"),i=n("FYa8"),c=n("/0+H");function u(e){return e&&e.__esModule?e:{default:e}}function l(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=[r.default.createElement("meta",{charSet:"utf-8"})];return e||t.push(r.default.createElement("meta",{name:"viewport",content:"width=device-width"})),t}function s(e,t){return"string"===typeof t||"number"===typeof t?e:t.type===r.default.Fragment?e.concat(r.default.Children.toArray(t.props.children).reduce((function(e,t){return"string"===typeof t||"number"===typeof t?e:e.concat(t)}),[])):e.concat(t)}var f=["name","httpEquiv","charSet","itemProp"];function d(e,t){return e.reduce((function(e,t){var n=r.default.Children.toArray(t.props.children);return e.concat(n)}),[]).reduce(s,[]).reverse().concat(l(t.inAmpMode)).filter(function(){var e=new Set,t=new Set,n=new Set,r={};return function(o){var a=!0;if(o.key&&"number"!==typeof o.key&&o.key.indexOf("$")>0){var i=o.key.slice(o.key.indexOf("$")+1);e.has(i)?a=!1:e.add(i)}switch(o.type){case"title":case"base":t.has(o.type)?a=!1:t.add(o.type);break;case"meta":for(var c=0,u=f.length;c<u;c++){var l=f[c];if(o.props.hasOwnProperty(l))if("charSet"===l)n.has(l)?a=!1:n.add(l);else{var s=o.props[l],d=r[l]||new Set;d.has(s)?a=!1:(d.add(s),r[l]=d)}}}return a}}()).reverse().map((function(e,t){var n=e.key||t;return r.default.cloneElement(e,{key:n})}))}var p=(0,o.default)();function m(e){var t=e.children;return(r.default.createElement(a.AmpStateContext.Consumer,null,(function(e){return r.default.createElement(i.HeadManagerContext.Consumer,null,(function(n){return r.default.createElement(p,{reduceComponentsToState:d,handleStateChange:n,inAmpMode:(0,c.isInAmpMode)(e)},t)}))})))}m.rewind=p.rewind;var h=m;t.default=h},Bnag:function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}},EbDI:function(e,t){e.exports=function(e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}},FYa8:function(e,t,n){"use strict";var r;t.__esModule=!0,t.HeadManagerContext=void 0;var o=((r=n("q1tI"))&&r.__esModule?r:{default:r}).default.createContext(null);t.HeadManagerContext=o},Ijbi:function(e,t,n){var r=n("WkPL");e.exports=function(e){if(Array.isArray(e))return r(e)}},Nsbk:function(e,t){function n(t){return e.exports=n=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},n(t)}e.exports=n},PJYZ:function(e,t){e.exports=function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}},RIqP:function(e,t,n){var r=n("Ijbi"),o=n("EbDI"),a=n("ZhPi"),i=n("Bnag");e.exports=function(e){return r(e)||o(e)||a(e)||i()}},RNiq:function(e,t,n){"use strict";function r(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function o(e){return function(e){if(Array.isArray(e))return r(e)}(e)||function(e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(e){if("string"===typeof e)return r(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}n.r(t),n.d(t,"default",(function(){return S}));var i=n("8Kt/"),c=n.n(i),u=n("q1tI"),l=n.n(u),s=n("vOnD"),f=n("pZAB"),d=n("mQkX"),p=n("/bYT"),m=n("RdKN"),h=l.a.createElement;function y(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}var v=s.a.div.withConfig({displayName:"pages__Container",componentId:"sc-18kpeh0-0"})(["min-height:100vh;padding:0 2rem;display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:1400px;width:100%;margin:0 auto;"]),g=s.a.main.withConfig({displayName:"pages__Main",componentId:"sc-18kpeh0-1"})(["flex:1;display:flex;flex-direction:column;justify-content:flex-start;align-items:center;width:100%;"]),b=s.a.div.withConfig({displayName:"pages__TitleContainer",componentId:"sc-18kpeh0-2"})(["display:flex;margin:0 0 1rem 0;align-items:center;justify-content:space-evenly;h1{font-size:3rem;margin:0;}"]),w=s.a.div.withConfig({displayName:"pages__WSIndicator",componentId:"sc-18kpeh0-3"})(["background-color:",";height:1rem;width:1rem;border-radius:50%;display:inline-block;margin-left:1rem;"],(function(e){return e.color})),x=s.a.div.withConfig({displayName:"pages__FeedContainer",componentId:"sc-18kpeh0-4"})(["padding:0 2rem;max-height:40rem;flex:1 1 33%;@media screen and (max-width:640px){flex:1 1 100%;}"]),k=s.a.div.withConfig({displayName:"pages__WidgetContainer",componentId:"sc-18kpeh0-5"})(["padding:0 2rem;flex:1 1 67%;display:flex;flex-wrap:wrap;@media screen and (max-width:640px){flex:1 1 100%;padding:0;}"]),j=s.a.div.withConfig({displayName:"pages__EventContainer",componentId:"sc-18kpeh0-6"})(["overflow-y:auto;height:100%;"]),O=s.a.div.withConfig({displayName:"pages__InnerContainer",componentId:"sc-18kpeh0-7"})(["display:flex;width:100%;flex-direction:row-reverse;@media screen and (max-width:640px){flex-wrap:wrap;}"]);function _(e,t){var n=new WebSocket("wss://api.jeffchen.dev:444");return n.onmessage=function(t){var n=JSON.parse(t.data);e((function(e){var t=n.events.reduce((function(t,n){if("all"===n.event||"keys"===n.event)return console.warn("unsupported event type ".concat(n.event,", skipping")),t;n.time=new Date(n.time),t.hasOwnProperty("all")||(t.all=[]),t.all.push(n);var r="".concat(n.event,"-").concat(Math.floor(n.time.getTime()/1e3/60));return e.keys.hasOwnProperty(r)||(e.keys[r]=!0,t.hasOwnProperty(n.event)||(t[n.event]={events:[],last:[]}),["int","bigint","real"].includes(n.type)&&(t[n.event].last.push(n),t[n.event].last=t[n.event].last.filter((function(e){return n.time.getTime()-e.time.getTime()<9e5})),n.dataAvg=t[n.event].last.reduce((function(e,t){return e+t.data}),0)/Math.max(1,t[n.event].last.length)),t[n.event].events.push(n)),t}),function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?y(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):y(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},e));return Object.keys(t).reduce((function(e,n){return e[n]="all"===n||"keys"===n?t[n]:{events:o(t[n].events).sort((function(e,t){return e.time.getTime()-t.time.getTime()})),last:t[n].last},e}),{})}))},n.onclose=function(){return setTimeout((function(){var n=_(e,t);return t(n)}),1e3)},n}function S(){var e=Object(u.useState)(24),t=e[0],n=e[1],r=Object(u.useState)({all:[],keys:{}}),o=r[0],a=r[1],i=Object(u.useState)(null),l=i[0],s=i[1];Object(u.useEffect)((function(){var e=_(a,s);return e.onopen=function(){e.send(JSON.stringify({type:"connect",hours:t}))},s(e),function(){return e.close()}}),[]),Object(u.useEffect)((function(){l&&l.readyState===WebSocket.OPEN&&l.send(JSON.stringify({type:"historical",hours:t})),a({all:[],keys:{}})}),[t]);var y=o.all.slice(o.all.length-100).reverse().map((function(e,t){return Object(d.default)({event:e,idx:t})})),S=function(){if(!l)return"#f03009";switch(l.readyState){case WebSocket.OPEN:return"#68b723";case WebSocket.CONNECTING:return"#f37329";default:return"#f03009"}}(),C=m.typeOrder.map((function(e){return h(m.default,{key:e,type:e,events:o[e]})})),I=h(O,null,h(k,null,C),h(x,null,h("h2",null,"Raw Event Feed ",h("br",null)," (",o.all.length," received)"),h(j,null,y)));return h(v,null,h(c.a,null,h("title",null,"api.jeffchen.dev"),h("link",{rel:"icon",href:"https://jeffchen.dev/favicon.ico"})),h(f.default,null),h(g,null,h(b,null,h("h1",null,"Metrics"),h(w,{color:S})),h(p.default,{ws:l,hours:t,setHours:n}),I))}},SksO:function(e,t){function n(t,r){return e.exports=n=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},n(t,r)}e.exports=n},W8MJ:function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.exports=function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}},WkPL:function(e,t){e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}},Xuae:function(e,t,n){"use strict";var r=n("lwsE"),o=n("PJYZ"),a=n("W8MJ"),i=n("7W2i"),c=n("a1gu"),u=n("Nsbk"),l=n("RIqP");function s(e){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,r=u(e);if(t){var o=u(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return c(this,n)}}t.__esModule=!0,t.default=void 0;var f=n("q1tI"),d=!1;t.default=function(){var e,t=new Set;function n(n){e=n.props.reduceComponentsToState(l(t),n.props),n.props.handleStateChange&&n.props.handleStateChange(e)}return(function(c){i(l,c);var u=s(l);function l(e){var a;return r(this,l),a=u.call(this,e),d&&(t.add(o(a)),n(o(a))),a}return a(l,null,[{key:"rewind",value:function(){var n=e;return e=void 0,t.clear(),n}}]),a(l,[{key:"componentDidMount",value:function(){t.add(this),n(this)}},{key:"componentDidUpdate",value:function(){n(this)}},{key:"componentWillUnmount",value:function(){t.delete(this),n(this)}},{key:"render",value:function(){return null}}]),l}(f.Component))}},ZhPi:function(e,t,n){var r=n("WkPL");e.exports=function(e,t){if(e){if("string"===typeof e)return r(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(e,t):void 0}}},a1gu:function(e,t,n){var r=n("cDf5"),o=n("PJYZ");e.exports=function(e,t){return!t||"object"!==r(t)&&"function"!==typeof t?o(e):t}},cDf5:function(e,t){function n(t){return"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?e.exports=n=function(e){return typeof e}:e.exports=n=function(e){return e&&"function"===typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n(t)}e.exports=n},lwAK:function(e,t,n){"use strict";var r;t.__esModule=!0,t.AmpStateContext=void 0;var o=((r=n("q1tI"))&&r.__esModule?r:{default:r}).default.createContext({});t.AmpStateContext=o},lwsE:function(e,t){e.exports=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},mQkX:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return l}));var r=n("q1tI"),o=n.n(r),a=n("vOnD"),i=n("o1E3"),c=o.a.createElement,u=a.a.div.withConfig({displayName:"event__EventCard",componentId:"sc-18fd5cu-0"})(["padding:0.5rem 0.5rem 0.5rem 0;text-align:left;text-decoration:none;h3,p{margin:0;}display:flex;flex-direction:column;justify-content:center;p,em{font-size:0.8rem;}"]);function l(e){var t=e.event,n=e.idx;if(!t)return null;var r="hidden"===t.data?t.event:"".concat(t.event," - ").concat(Object(i.b)(t.data));return c(u,{key:"".concat(t.event,".").concat(t.source.major,".").concat(t.source.minor,".").concat(t.time.toString(),".").concat(n)},c("h3",null,r),c("p",null,t.time.toLocaleString()),c("em",null,t.source.major," - ",t.source.minor))}},pZAB:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return i}));var r=n("q1tI"),o=n.n(r).a.createElement,a="https://www.jeffchen.dev";function i(){return o("div",{className:"wrapper-masthead"},o("div",{className:"container"},o("header",{className:"masthead clearfix"},o("a",{href:"".concat(a,"/"),className:"site-avatar"},o("img",{src:"https://jeffchen.dev/images/profile.jpg"})),o("div",{className:"site-info"},o("h1",{className:"site-name"},o("a",{href:"".concat(a,"/")},"Jeff Chen")),o("p",{className:"site-description"},"Engineering & more")),o("nav",null,o("a",{href:"".concat(a,"/about/")},"About"),o("a",{href:"".concat(a,"/projects/")},"Projects"),o("a",{href:"".concat(a,"/resume/")},"R\xe9sum\xe9")))))}},vlRD:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n("RNiq")}])}},[["vlRD",0,1,2,3]]]);