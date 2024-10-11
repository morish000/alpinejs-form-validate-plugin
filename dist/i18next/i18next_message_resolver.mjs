var o=i=>r=>{let n=i.i18next(),t=[];return r.watch(()=>i.timestamp,()=>t.forEach(e=>e())),{addUpdateListener:e=>{t.includes(e)||t.push(e)},removeUpdateListener:e=>{t=t.filter(s=>s!==e)},resolve:(...e)=>{let[s,p]=e;return n.exists(s)?n.t(s,p):s}}};export{o as createI18NextMessageResolver};
//# sourceMappingURL=i18next_message_resolver.mjs.map
