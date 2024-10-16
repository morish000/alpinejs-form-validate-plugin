var w=(t,i,r,e)=>{let a,n=function(s){let c=e&&!a;a&&clearTimeout(a),a=setTimeout(()=>{a=null,e||i.call(t,s)},r),c&&i.call(t,s)};return n.cancel=()=>a&&clearTimeout(a),n};var D=(t,i,r,{leading:e=!0,trailing:a=!0}={})=>{let n,s=0,c=function(d){let p=Date.now();!s&&!e&&(s=p);let o=r-(p-s);o<=0?((e||s)&&(i.call(t,d),s=p),n!==null&&clearTimeout(n)):a&&(n&&clearTimeout(n),n=setTimeout(()=>{(!e||s)&&(i.call(t,d),s=e?Date.now():0)},o))};return c.cancel=()=>n&&clearTimeout(n),c};var b=(t,...i)=>{let r={...t};return i.reduce((e,a)=>(Object.entries(a).forEach(([n,s])=>{typeof s!="function"&&s instanceof Object&&n in e&&e[n]instanceof Object?e[n]=b(e[n],s):s!=null&&(e[n]=s)}),e),r)};var S=t=>{let i={};return Object.entries(t).forEach(([r,e])=>{i[r]=Array.isArray(e)?e:[e]}),i};var L=t=>{let i={};return Object.entries(t).forEach(([r,e])=>{let a=null,n=null;if(Array.isArray(e)?typeof e[0]=="function"?(a=e[0],n=Array.isArray(e[1])?e[1]:[e[1]]):n=e:typeof e=="object"&&Object.keys(e).every(s=>s==="v"||s==="m")&&("v"in e||"m"in e)?(a="v"in e?Array.isArray(e.v)||typeof e.v=="function"?e.v:[e.v]:null,n="m"in e?Array.isArray(e.m)?e.m:[e.m]:null):e!==null&&(n=[e]),!n)throw new Error(`Message undefined. validation key: ${r}`);i[r]={v:a??[],m:n}}),i};var O=t=>({report:!0,trigger:{target:t,event:"submit",preventDefault:!0,before:null,after:null}}),A=()=>({v:{},m:{},onChange:!0,onBlur:!1,onInput:!1,inputLimit:"none",inputLimitOpts:{debounce:{wait:250,immediate:!1},throttle:{wait:500,options:{leading:!1,trailing:!0}}}});var T=()=>({resolve:t=>{let i;if(t.type==="radio"){let r=t.form;if(!r)throw new Error("A form element is required.");let e=r.querySelector(`input[type="radio"][name="${t.name}"]:checked`);i=e?e.value:""}else if(t.type==="checkbox"){let r=t.form;if(!r)throw new Error("A form element is required.");let e=r.querySelectorAll(`input[type="checkbox"][name="${t.name}"]:checked`);i=Array.from(e).map(a=>a.value)}else t.type==="file"&&t instanceof HTMLInputElement?i=t.files?Array.from(t.files):[]:t.tagName.toLowerCase()==="select"&&t instanceof HTMLSelectElement?i=t.multiple?Array.from(t.selectedOptions).map(r=>r.value):t.value:i=t.value;return i},isEmpty:t=>t?typeof t=="string"?t.trim()==="":t.length===0:!0});var R=()=>{let t=["valueMissing","typeMismatch","patternMismatch","tooLong","tooShort","rangeUnderflow","rangeOverflow","stepMismatch","badInput"];return(i,r)=>{if(i.checkValidity())return null;let e=t.find(a=>i.validity[a]&&r[a]);return e?r[e]:[i.validationMessage]}};var I=(t,i)=>(r,e,{inputLimit:a,inputLimitOpts:n})=>{if(!a)return e;let[s,c]=a.split(":");switch(s){case"debounce":return t(r,e,Number(c??n.debounce.wait),n.debounce.immediate);case"throttle":return i(r,e,Number(c??n.throttle.wait),n.throttle.options);case"none":return e;default:if(s)throw new Error(`Input rate limitter not found: ${s}.`);return e}};var $=()=>({addUpdateListener:()=>{},removeUpdateListener:()=>{},resolve:(...t)=>t.length>0?t[0].toString():""});var P=t=>({messageResolver:i},r=t.reactive({}))=>(i.addUpdateListener(()=>{Object.values(r).forEach(e=>{(e.value||e.param.length>0)&&(e.value=i.resolve(...e.param),e.handleMessage(e.value))})}),{create:(e,a)=>{r[e.id]={handleMessage:a,param:[],value:""},a("")},delete:e=>{r[e.id].handleMessage(""),delete r[e.id]},set:(e,a=[])=>{let n=i.resolve(...a);r[e.id].param=a,r[e.id].value=n,r[e.id].handleMessage(n)},get:e=>r[e.id]?r[e.id].value:"",clear:e=>{r[e.id].param=[],r[e.id].value="",r[e.id].handleMessage("")}});var j=t=>(i,r,{messageStore:e,html5ValidationMessageResolver:a,fieldValueResolver:n,customFieldValidators:s})=>function(){if(e.clear(i),!i.checkValidity()){e.set(i,a(i,r.m)??[]),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:failed`));return}let c=n.resolve(i);if(!i.required&&n.isEmpty(c)){e.clear(i),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:success`));return}for(let[d,{v:p,m:o}]of Object.entries(r.v)){if(typeof p=="function"){if(!p(i,c)){e.set(i,o),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:failed`));return}continue}for(let F of s)if(F.isSupported(d)&&!F.validate(i,c,d,p)){e.set(i,o),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:failed`));return}}i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:success`))};var H=(t,{report:i})=>function(){return Array.from(t.elements).forEach(r=>{r._x_validation?.validate()}),i?t.reportValidity():t.checkValidity()};var q=({createMessageStore:t,createFormValidator:i,createFieldValidator:r,formDefaultConfig:e,fieldDefaultConfig:a})=>({defaultFunctionsOptions:n={},defaultFormOptions:s={},defaultFieldOptions:c={}}={})=>d=>{let p=(()=>{let o={fieldValueResolver:n.fieldValueResolver??T(),messageResolver:n.messageResolver??$(),customFieldValidators:n.customFieldValidators??[],inputRateLimitter:n.inputRateLimitter??I(w,D),html5ValidationMessageResolver:n.html5ValidationMessageResolver??R()};return{...o,messageStore:n.messageStore??t(d)(o)}})();d.directive("validate-form",(o,{expression:F},{evaluate:V,cleanup:v})=>{let m=(()=>{let y={...e(o)},x={...s},M={...F?V(F):{}},_=b(y,x,M);return _.trigger.target=M.trigger?.target??x.trigger?.target??y.trigger.target,_})(),{before:E,after:h,preventDefault:g}=m.trigger,C=i(o,m),l=y=>{E?.call(o,y);let x=C.call(o);h?.call(o,y),!x&&g&&y.preventDefault(),x?o.dispatchEvent(new CustomEvent(`${d.prefixed("validate")}:success`)):o.dispatchEvent(new CustomEvent(`${d.prefixed("validate")}:failed`))},{target:f,event:u}=m.trigger;f.addEventListener(u,l),o._x_validation=m,v(()=>{f.removeEventListener(u,l),delete o._x_validation})}),d.directive("validate",(o,{expression:F},{evaluate:V,cleanup:v})=>{if(!o.id||!o.name)throw new Error("Validation error: Form elements with validation rules must have an id and name attribute.");let m=(()=>{let l=b(a(),c,F?V(F):{});return l.v=L(l.v),l.m=S(l.m),l})(),E=r(d)(o,m,p),h=({before:l,after:f},u)=>y=>{l?.call(o,y),u.apply(o),o.reportValidity(),f?.call(o,y)},g=[],C=(l,f,u)=>{l&&u&&g.push({eventName:f,handler:u})};C(!!m.onChange||!m.onBlur&&!m.onInput,"change",h(!m.onChange||m.onChange===!0?{}:m.onChange,E)),C(!!m.onBlur,"blur",h(!m.onBlur||m.onBlur===!0?{}:m.onBlur,E)),C(!!m.onInput,"input",p.inputRateLimitter(o,h(!m.onInput||m.onInput===!0?{}:m.onInput,E),m)),o._x_validation={...m,formSubmit:!o.form,validate:function(){E(),this.formSubmit=!0,["radio","checkbox"].includes(o.type)&&Array.from(o.form?.querySelectorAll(`input[type="${o.type}"][name="${o.name}"]`)??[]).filter(l=>l!==o&&!l.hasAttribute(d.prefixed("validate"))).forEach(l=>{g.forEach(({eventName:f,handler:u})=>{l.addEventListener(f,u)})})}},p.messageStore.create(o,l=>{o.setCustomValidity(l)}),g.forEach(({eventName:l,handler:f})=>{o.addEventListener(l,f)}),v(()=>{["radio","checkbox"].includes(o.type)&&Array.from(o.form?.querySelectorAll(`input[type="${o.type}"][name="${o.name}"]`)??[]).filter(l=>l!==o&&!l.hasAttribute(d.prefixed("validate"))).forEach(l=>{g.forEach(({eventName:f,handler:u})=>{l.removeEventListener(f,u)})}),g.forEach(({eventName:l,handler:f})=>{o.removeEventListener(l,f),f.cancel?.()}),p.messageStore.delete(o),delete o._x_validation})}),d.directive("validate-message-for",(o,{expression:F},{effect:V})=>{V(()=>{let v=document.querySelector(F);d.mutateDom(()=>{o.textContent=v?p.messageStore.get(v):""})})})},U=q({createMessageStore:P,createFormValidator:H,createFieldValidator:j,formDefaultConfig:O,fieldDefaultConfig:A}),be=U();export{U as createValidatePlugin,be as createValidatePluginDefault,q as createValidatePluginInternal};
//# sourceMappingURL=alpinejs_form_validate_plugin.mjs.map
