"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("prosemirror-state"),t=require("prosemirror-model"),n=require("prosemirror-transform"),r=require("prosemirror-collab"),o=function(){return(o=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function i(e,t,n,r){return new(n||(n=Promise))((function(o,i){function c(e){try{s(r.next(e))}catch(e){i(e)}}function a(e){try{s(r.throw(e))}catch(e){i(e)}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(c,a)}s((r=r.apply(e,t||[])).next())}))}function c(e,t){var n,r,o,i,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){c=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){c.label=i[1];break}if(6===i[0]&&c.label<o[1]){c.label=o[1],o=i;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(i);break}o[2]&&c.ops.pop(),c.trys.pop();continue}i=t.call(e,c)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,a])}}}var a=require("prosemirror-compress"),s=a.compressStepsLossy,l=a.compressStateJSON,u=a.uncompressStateJSON,f=a.compressSelectionJSON,p=a.uncompressSelectionJSON,h=a.compressStepJSON,d=a.uncompressStepJSON,v={".sv":"timestamp"},m=function(){function a(i){var c=i.firebaseRef,a=i.stateConfig,m=i.view,y=i.clientID,b=void 0===y?c.push().key:y,S=i.progress,g=void 0===S?function(){}:S;g(0);var w=this,O=this.checkpointRef=c.child("checkpoint"),N=this.changesRef=c.child("changes"),k=this.selectionsRef=c.child("selections"),J=this.selfSelectionRef=k.child(b);J.onDisconnect().remove();var R,x=this.selections={},C={},_=O.once("value").then((function(i){g(.5);var c=i.val()||{},y=c.d,S=c.k,_=void 0===S?-1:S;function q(e){return n.Step.fromJSON(a.schema,d(e))}function j(e,t){var n=e.docChanged,o=e.mapping;if(n)for(var i in x)({}).hasOwnProperty.call(x,i)&&(x[i]=x[i].map(t.doc,o));var c=r.sendableSteps(t);if(c){var a=c.steps,u=c.clientID;N.child(_+1).transaction((function(e){if(!e)return C[_+1]=a,{s:s(a).map((function(e){return h(e.toJSON())})),c:u,t:v}}),(function(e,n,r){var o=(r||{}).key;if(e||!o)console.error("updateCollab",e,c,o);else if(n&&Number(o)%100==0&&Number(o)>0){var i=l(t.toJSON()).d;O.set({d:i,k:o,t:v})}}),!1)}!t.selection.eq(R)&&(R=t.selection,J.set(f(R.toJSON())))}return _=Number(_),a.doc=y&&t.Node.fromJSON(a.schema,u({d:y}).doc),a.plugins=(a.plugins||[]).concat(r.collab({clientID:b})),N.startAt(null,String(_+1)).once("value").then((function(t){g(1);var n=w.view=m({stateConfig:a,updateCollab:j,selections:x}),i=n.editor||n,c=t.val();if(c){var s=[],l=[],u="_oldClient"+Math.random(),f=Object.keys(c).map(Number);_=Math.max.apply(Math,f);for(var h=0,d=f;h<d.length;h++){var v=c[d[h]].s;s.push.apply(s,v.map(q)),l.push.apply(l,new Array(v.length).fill(u))}i.dispatch(r.receiveTransaction(i.state,s,l))}function y(t){var n=t.key;if(n!==b){var r=t.val();if(r)try{x[n]=e.Selection.fromJSON(i.state.doc,p(r))}catch(e){console.warn("updateClientSelection",e)}else delete x[n];i.dispatch(i.state.tr)}}return k.on("child_added",y),k.on("child_changed",y),k.on("child_removed",y),N.startAt(null,String(_+1)).on("child_added",(function(e){_=Number(e.key);var t=e.val(),n=t.s,o=t.c,c=o===b?C[_]:n.map(q),a=new Array(c.length).fill(o);i.dispatch(r.receiveTransaction(i.state,c,a)),delete C[_]})),o({destroy:w.destroy.bind(w)},w)}))}));Object.defineProperties(this,{then:{value:_.then.bind(_)},catch:{value:_.catch.bind(_)}})}return a.prototype.destroy=function(){return i(this,void 0,void 0,(function(){var e=this;return c(this,(function(t){return this.catch((function(e){return e})).then((function(){e.changesRef.off(),e.selectionsRef.off(),e.selfSelectionRef.off(),e.selfSelectionRef.remove(),e.view.destroy()})),[2]}))}))},a.prototype.catch=function(){throw new Error("Method not implemented.")},a}();exports.FirebaseEditor=m;//# sourceMappingURL=index.js.map
