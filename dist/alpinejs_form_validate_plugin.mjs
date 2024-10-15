var w=(t,i,r,e)=>{let a,n=function(l){let p=e&&!a;a&&clearTimeout(a),a=setTimeout(()=>{a=null,e||i.call(t,l)},r),p&&i.call(t,l)};return n.cancel=()=>a&&clearTimeout(a),n};var S=(t,i,r,{leading:e=!0,trailing:a=!0}={})=>{let n,l=0,p=function(d){let c=Date.now();!l&&!e&&(l=c);let o=r-(c-l);o<=0?((e||l)&&(i.call(t,d),l=c),n!==null&&clearTimeout(n)):a&&(n&&clearTimeout(n),n=setTimeout(()=>{(!e||l)&&(i.call(t,d),l=e?Date.now():0)},o))};return p.cancel=()=>n&&clearTimeout(n),p};var b=(t,...i)=>{let r={...t};return i.reduce((e,a)=>(Object.entries(a).forEach(([n,l])=>{typeof l!="function"&&l instanceof Object&&n in e&&e[n]instanceof Object?e[n]=b(e[n],l):l!=null&&(e[n]=l)}),e),r)};var D=t=>{let i={};return Object.entries(t).forEach(([r,e])=>{i[r]=Array.isArray(e)?e:[e]}),i};var L=t=>{let i={};return Object.entries(t).forEach(([r,e])=>{let a=null,n=null;if(Array.isArray(e)?typeof e[0]=="function"?(a=e[0],n=Array.isArray(e[1])?e[1]:[e[1]]):n=e:typeof e=="object"&&Object.keys(e).every(l=>l==="v"||l==="m")&&("v"in e||"m"in e)?(a="v"in e?Array.isArray(e.v)||typeof e.v=="function"?e.v:[e.v]:null,n="m"in e?Array.isArray(e.m)?e.m:[e.m]:null):e!==null&&(n=[e]),!n)throw new Error(`Message undefined. validation key: ${r}`);i[r]={v:a??[],m:n}}),i};var O=t=>({report:!0,trigger:{target:t,event:"submit",preventDefault:!0,before:null,after:null}}),A=()=>({v:{},m:{},report:!1,onChange:!0,onBlur:!1,onInput:!1,inputLimit:"none",inputLimitOpts:{debounce:{wait:250,immediate:!1},throttle:{wait:500,options:{leading:!1,trailing:!0}}}});var R=()=>({resolve:t=>{let i;if(t.type==="radio"){let r=t.form;if(!r)throw new Error("A form element is required.");let e=r.querySelector(`input[type="radio"][name="${t.name}"]:checked`);i=e?e.value:""}else if(t.type==="checkbox"){let r=t.form;if(!r)throw new Error("A form element is required.");let e=r.querySelectorAll(`input[type="checkbox"][name="${t.name}"]:checked`);i=Array.from(e).map(a=>a.value)}else t.type==="file"&&t instanceof HTMLInputElement?i=t.files?Array.from(t.files):[]:t.tagName.toLowerCase()==="select"&&t instanceof HTMLSelectElement?i=t.multiple?Array.from(t.selectedOptions).map(r=>r.value):t.value:i=t.value;return i},isEmpty:t=>t?typeof t=="string"?t.trim()==="":t.length===0:!0});var T=()=>{let t=["valueMissing","typeMismatch","patternMismatch","tooLong","tooShort","rangeUnderflow","rangeOverflow","stepMismatch","badInput"];return(i,r)=>{if(i.checkValidity())return null;let e=t.find(a=>i.validity[a]&&r[a]);return e?r[e]:[i.validationMessage]}};var I=(t,i)=>(r,e,{inputLimit:a,inputLimitOpts:n})=>{if(!a)return e;let[l,p]=a.split(":");switch(l){case"debounce":return t(r,e,Number(p??n.debounce.wait),n.debounce.immediate);case"throttle":return i(r,e,Number(p??n.throttle.wait),n.throttle.options);case"none":return e;default:if(l)throw new Error(`Input rate limitter not found: ${l}.`);return e}};var $=()=>({addUpdateListener:()=>{},removeUpdateListener:()=>{},resolve:(...t)=>t.length>0?t[0].toString():""});var P=t=>({messageResolver:i},r=t.reactive({}))=>(i.addUpdateListener(()=>{Object.values(r).forEach(e=>{(e.value||e.param.length>0)&&(e.value=i.resolve(...e.param),e.handleMessage(e.value))})}),{create:(e,a)=>{r[e.id]={handleMessage:a,param:[],value:""},a("")},delete:e=>{r[e.id].handleMessage(""),delete r[e.id]},set:(e,a=[])=>{let n=i.resolve(...a);r[e.id].param=a,r[e.id].value=n,r[e.id].handleMessage(n)},get:e=>r[e.id]?r[e.id].value:"",clear:e=>{r[e.id].param=[],r[e.id].value="",r[e.id].handleMessage("")}});var j=t=>(i,r,{messageStore:e,html5ValidationMessageResolver:a,fieldValueResolver:n,customFieldValidators:l})=>function(){e.clear(i);let p=i._x_validation?.formSubmit&&r.report;if(!(p?i.reportValidity():i.checkValidity())){e.set(i,a(i,r.m)??[]),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:failed`));return}let d=n.resolve(i);if(!i.required&&n.isEmpty(d)){e.clear(i),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:success`));return}for(let[c,{v:o,m:F}]of Object.entries(r.v)){if(typeof o=="function"){if(!o(i,d)){e.set(i,F),p&&i.reportValidity(),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:failed`));return}continue}for(let g of l)if(g.isSupported(c)&&!g.validate(i,d,c,o)){e.set(i,F),p&&i.reportValidity(),i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:failed`));return}}i.dispatchEvent(new CustomEvent(`${t.prefixed("validate")}:success`))};var H=(t,{report:i})=>function(){return Array.from(t.elements).forEach(r=>{r._x_validation?.validate()}),i?t.reportValidity():t.checkValidity()};var q=({createMessageStore:t,createFormValidator:i,createFieldValidator:r,formDefaultConfig:e,fieldDefaultConfig:a})=>({defaultFunctionsOptions:n={},defaultFormOptions:l={},defaultFieldOptions:p={}}={})=>d=>{let c=(()=>{let o={fieldValueResolver:n.fieldValueResolver??R(),messageResolver:n.messageResolver??$(),customFieldValidators:n.customFieldValidators??[],inputRateLimitter:n.inputRateLimitter??I(w,S),html5ValidationMessageResolver:n.html5ValidationMessageResolver??T()};return{...o,messageStore:n.messageStore??t(d)(o)}})();d.directive("validate-form",(o,{expression:F},{evaluate:g,cleanup:E})=>{let m=(()=>{let y={...e(o)},x={...l},_={...F?g(F):{}},M=b(y,x,_);return M.trigger.target=_.trigger?.target??x.trigger?.target??y.trigger.target,M})(),{before:V,after:h,preventDefault:v}=m.trigger,C=i(o,m),s=y=>{V?.call(o,y);let x=C.call(o);h?.call(o,y),!x&&v&&y.preventDefault(),x?o.dispatchEvent(new CustomEvent(`${d.prefixed("validate")}:success`)):o.dispatchEvent(new CustomEvent(`${d.prefixed("validate")}:failed`))},{target:f,event:u}=m.trigger;f.addEventListener(u,s),o._x_validation=m,E(()=>{f.removeEventListener(u,s),delete o._x_validation})}),d.directive("validate",(o,{expression:F},{evaluate:g,cleanup:E})=>{if(!o.id||!o.name)throw new Error("Validation error: Form elements with validation rules must have an id and name attribute.");let m=(()=>{let s=b(a(),p,o.form?._x_validation?.report!=null?{report:o.form?._x_validation.report}:{},F?g(F):{});return s.v=L(s.v),s.m=D(s.m),s})(),V=r(d)(o,m,c),h=({before:s,after:f},u)=>y=>{s?.call(o,y),u.apply(o),f?.call(o,y)},v=[],C=(s,f,u)=>{s&&u&&v.push({eventName:f,handler:u})};C(!!m.onChange||!m.onBlur&&!m.onInput,"change",h(!m.onChange||m.onChange===!0?{}:m.onChange,V)),C(!!m.onBlur,"blur",h(!m.onBlur||m.onBlur===!0?{}:m.onBlur,V)),C(!!m.onInput,"input",c.inputRateLimitter(o,h(!m.onInput||m.onInput===!0?{}:m.onInput,V),m)),o._x_validation={...m,formSubmit:!o.form,validate:function(){V(),this.formSubmit=!0,["radio","checkbox"].includes(o.type)&&Array.from(o.form?.querySelectorAll(`input[type="${o.type}"][name="${o.name}"]`)??[]).filter(s=>s!==o&&!s.hasAttribute(d.prefixed("validate"))).forEach(s=>{v.forEach(({eventName:f,handler:u})=>{s.addEventListener(f,u)})})}},c.messageStore.create(o,s=>{o.setCustomValidity(s),o._x_validation?.formSubmit&&s&&m.report&&o.reportValidity()}),v.forEach(({eventName:s,handler:f})=>{o.addEventListener(s,f)}),E(()=>{["radio","checkbox"].includes(o.type)&&Array.from(o.form?.querySelectorAll(`input[type="${o.type}"][name="${o.name}"]`)??[]).filter(s=>s!==o&&!s.hasAttribute(d.prefixed("validate"))).forEach(s=>{v.forEach(({eventName:f,handler:u})=>{s.removeEventListener(f,u)})}),v.forEach(({eventName:s,handler:f})=>{o.removeEventListener(s,f),f.cancel?.()}),c.messageStore.delete(o),delete o._x_validation})}),d.directive("validate-message-for",(o,{expression:F},{effect:g})=>{g(()=>{let E=document.querySelector(F);d.mutateDom(()=>{o.textContent=E?c.messageStore.get(E):""})})})},U=q({createMessageStore:P,createFormValidator:H,createFieldValidator:j,formDefaultConfig:O,fieldDefaultConfig:A}),be=U();export{U as createValidatePlugin,be as createValidatePluginDefault,q as createValidatePluginInternal};
//# sourceMappingURL=alpinejs_form_validate_plugin.mjs.map