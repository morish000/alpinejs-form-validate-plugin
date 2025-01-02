const o=i=>r=>{const n=i.i18next();let t=[];return r.watch(()=>i.timestamp,()=>t.forEach(e=>e())),{addUpdateListener:e=>{t.includes(e)||t.push(e)},removeUpdateListener:e=>{t=t.filter(s=>s!==e)},resolve:(...e)=>{const[s,p]=e;return n.exists(s)?n.t(s,p):s}}};export{o as createI18NextMessageResolver};
//# sourceMappingURL=i18next_message_resolver.mjs.map
