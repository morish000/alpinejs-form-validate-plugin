var l=t=>({isSupported:o=>typeof t[o]=="function",validate:(o,r,e,a)=>{let i=t[e];if(typeof i=="function"){let s=i(r,...a);return typeof s=="boolean"?s:!1}return!1}});var m=()=>({resolve:t=>{let o;if(t.type==="radio"){let r=t.form;if(!r)throw new Error("A form element is required.");let e=r.querySelector(`input[type="radio"][name="${t.name}"]:checked`);o=e?e.value:""}else if(t.type==="checkbox"){let r=t.form;if(!r)throw new Error("A form element is required.");let e=r.querySelectorAll(`input[type="checkbox"][name="${t.name}"]:checked`);o=Array.from(e).map(a=>a.value)}else t.type==="file"&&t instanceof HTMLInputElement?o=t.files?Array.from(t.files):[]:t.tagName.toLowerCase()==="select"&&t instanceof HTMLSelectElement?o=t.multiple?Array.from(t.selectedOptions).map(r=>r.value):t.value:o=t.value;return o},isEmpty:t=>t?typeof t=="string"?t.trim()==="":t.length===0:!0});var u=()=>{let t=["valueMissing","typeMismatch","patternMismatch","tooLong","tooShort","rangeUnderflow","rangeOverflow","stepMismatch","badInput"];return(o,r)=>{if(o.checkValidity())return null;let e=t.find(a=>o.validity[a]&&r[a]);return e?r[e]:[o.validationMessage]}};var f=(t,o)=>(r,e,{inputLimit:a,inputLimitOpts:i})=>{if(!a)return e;let[s,n]=a.split(":");switch(s){case"debounce":return t(r,e,Number(n??i.debounce.wait),i.debounce.immediate);case"throttle":return o(r,e,Number(n??i.throttle.wait),i.throttle.options);case"none":return e;default:if(s)throw new Error(`Input rate limitter not found: ${s}.`);return e}};var F=()=>({addUpdateListener:()=>{},removeUpdateListener:()=>{},resolve:(...t)=>t.length>0?t[0].toString():""});var v=t=>({messageResolver:o},r=t.reactive({}))=>(o.addUpdateListener(()=>{Object.values(r).forEach(e=>{(e.value||e.param.length>0)&&(e.value=o.resolve(...e.param),e.handleMessage(e.value))})}),{create:(e,a)=>{r[e.id]={handleMessage:a,param:[],value:""},a("")},delete:e=>{r[e.id].handleMessage(""),delete r[e.id]},set:(e,a)=>{let i=o.resolve(...a);r[e.id].param=a,r[e.id].value=i,r[e.id].handleMessage(i)},get:e=>r[e.id]?r[e.id].value:"",clear:e=>{r[e.id].param=[],r[e.id].value="",r[e.id].handleMessage("")}});export{l as createCustomFieldValidator,m as createFieldValueResolver,u as createHtml5ValidationMessageResolver,f as createInputRateLimitter,F as createMessageResolver,v as createMessageStore};
//# sourceMappingURL=index.mjs.map
