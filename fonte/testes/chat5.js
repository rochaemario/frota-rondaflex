const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const papel=process.argv[2]||'admin';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp;const N=Date.now();
 window.__AVISOS=[{id:'a1',de:'u2',para:['u1'],texto:'Filtro separador do CB-05 acabou. Pode pedir 2?',anexos:[{t:'item',id:'cat-526-3121'},{t:'eq',id:'CB-05'}],ts:N-26*3600e3,estado:{u1:'visto'},lido_u1:N-25*3600e3,entr_u1:N-25*3600e3,
   resp:[{de:'u1',texto:'Vou ver o saldo.',ts:N-25*3600e3},{de:'u2',texto:'Ja confirmei com a Sotreq, chega sexta.',ts:N-3600e3},{de:'u2',texto:'Deixa separado o do CB-17 tambem.',ts:N-1800e3}]},
  {id:'a2',de:'u1',para:['u2','u3'],texto:'Horimetro do PC-02 parado',anexos:[],ts:N-5000e3,estado:{u2:'visto'},resp:[]}]},[seed,papel]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
const W=ms=>p.waitForTimeout(ms||500);
await p.goto('http://frota.test/');await W(800);await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(1800);
console.log('sino:',await p.evaluate(()=>document.querySelector('#bell i')?.textContent),await p.evaluate(()=>!document.querySelector('#bell i')?.hidden));
await p.click('#bell');await W(700);await p.screenshot({path:'chat1.png'});
console.log('lista:',await p.$$eval('.av-r',a=>a.map(x=>x.innerText.replace(/\s+/g,' '))));
await p.click('[data-av="a1"]');await W(900);await p.screenshot({path:'chat2.png'});
console.log('divisor:',await p.evaluate(()=>document.querySelector('#cv-new')?.textContent),'| topo:',await p.textContent('#cv-top'));
await p.evaluate(()=>document.querySelector('.cb-ax').scrollIntoView({block:'center'}));await p.screenshot({path:'ax1.png'});console.log('DBG',await p.evaluate(()=>{const b=document.querySelector('.xb-f b');const c=document.querySelector('.cv-ax');const r=[];for(const sh of document.styleSheets){try{for(const ru of sh.cssRules){if(ru.selectorText&&b.matches(ru.selectorText)&&/font-size/.test(ru.cssText))r.push(ru.cssText.slice(0,120))}}catch(e){}}return [getComputedStyle(b).fontSize,c.getBoundingClientRect().width,c.parentElement.getBoundingClientRect().width,getComputedStyle(c).display,r]}));await p.click('.cb-ax [data-axo]');await W(400);await p.screenshot({path:'ax2.png'});console.log('acoes anexo:',await p.textContent('.cb-acts:not([hidden])'));
const axl=await p.$('[data-axl]');if(axl){await axl.click();await W(900)}console.log('apos lista:',await p.evaluate(()=>document.querySelector('.xb-ok')?.textContent));
await p.fill('#av-tx','Pode deixar, vou pedir hoje.');await p.click('#av-send');await W(1200);
console.log('ultima:',await p.evaluate(()=>{const l=[...document.querySelectorAll('.cb.me')];return l[l.length-1].innerText.replace(/\s+/g,' ')}),'| tique:',await p.evaluate(()=>{const l=[...document.querySelectorAll('.cb.me .tk')];return l[l.length-1].className}));
await p.screenshot({path:'chat3.png'});
const d=await p.evaluate(()=>window.__sb.from('docs').select('path,data').eq('path','avisos/a1'));console.log('doc keys:',JSON.stringify(Object.keys((d.data&&d.data[0]||d.data||{}).data||{})));
// tocar no tique
await p.evaluate(()=>{const l=[...document.querySelectorAll('.cb.me .tk')];l[l.length-1].click()});await W(300);console.log('info:',await p.evaluate(()=>document.querySelector('.cb-info')?.innerText.replace(/\s+/g,' ')));
await p.screenshot({path:'chat4.png'});
await p.evaluate(()=>window.__sb.rpc('doc_update',{p_path:'avisos/a1',p_patch:{entr_u2:Date.now()+500}}));await W(800);console.log('apos entregue:',await p.evaluate(()=>{const l=[...document.querySelectorAll('.cb.me .tk')];return l[l.length-1].getAttribute('title')}));
await p.evaluate(()=>window.__sb.rpc('doc_update',{p_path:'avisos/a1',p_patch:{lido_u2:Date.now()+800}}));await W(800);console.log('apos lido:',await p.evaluate(()=>{const l=[...document.querySelectorAll('.cb.me .tk')];return l[l.length-1].className}),'| topo:',await p.textContent('#cv-top'));
await p.click('#sheet [data-back]');await W(600);console.log('lista depois:',await p.$$eval('.av-r',a=>a.map(x=>x.innerText.replace(/\s+/g,' '))),'sino:',await p.evaluate(()=>document.querySelector('#bell i')?.hidden));
console.log('ERR',errs);await b.close()})();
