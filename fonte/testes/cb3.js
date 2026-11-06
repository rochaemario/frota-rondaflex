const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const ids=Object.keys(seed).filter(k=>k.startsWith('equipamentos/')).map(k=>k.split('/')[1]);
const pick=ids.filter(i=>/^(CB|PC|MN|CP)-/.test(i)).slice(0,8);
// histórico sintético de meses anteriores (só resumos)
['2026-05','2026-06','2026-07','2026-08','2026-09'].forEach((m,k)=>{const eq={};pick.forEach((id,j)=>{const h=120+j*15+k*10,lh=(/CB/.test(id)?9:/PC/.test(id)?14:/MN/.test(id)?12:8)*(1+((j+k)%3-1)*0.05);eq[id]={lt:Math.round(h*lh),n:6,l:Math.round(h*lh),h}});seed['comb/'+m]={eq}});
// base em setembro para alguns equipamentos
pick.forEach((id,j)=>{const e=seed['equipamentos/'+id];if(e&&e.horimetro!==''&&e.horimetro!=null){e.combBase={h:Number(e.horimetro)-60,data:'2026-09-28',pend:0};e.combUlt={mes:'2026-09',id:'x'+j};e.combUltData='2026-09-28'}});
(async()=>{const b=await chromium.launch();const sc=process.argv[2]||'light';const pg=await (await b.newContext({viewport:{width:390,height:844},colorScheme:sc})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(800);
 const lanca=async(id,dt,hm,l,cheio=true)=>{await pg.evaluate(()=>document.querySelector('header').click());await W(200);await pg.click('#fab');await W();await pg.click('[data-m="abast"]');await W();
  await pg.selectOption('#ab-eq',id);await pg.fill('#ab-dt',dt);await pg.fill('#ab-hm',String(hm));await pg.fill('#ab-l',String(l));if(!cheio)await pg.click('[data-ch="0"]');await W(200);
  const pv=await pg.$eval('#ab-prev',e=>e.innerText).catch(()=>'');await pg.click('#sheet button[form="fab-f"]');await W(500);
  const g=await pg.$('#ab-g [data-go]');if(g){await g.click();await W(500)}return pv};
 const hmOf=id=>pg.evaluate(id=>Object.values(window.__store).find(x=>x.codigo===id||false)?.horimetro,id);
 const out=[];
 const L0=[];let j=-1;for(const id of pick){const h=Number(await pg.evaluate(id=>window.__store['equipamentos/'+id].horimetro,id))||0;if(!h)continue;j++;L0.push(id);
   out.push([id,await lanca(id,'2026-10-05',h+40,(/CB/.test(id)?9:/PC/.test(id)?14:12)*100,true)]);
   if(j===0){out.push(['parcial',await lanca(id,'2026-10-10',h+70,120,false)]);out.push(['cheio após parcial',await lanca(id,'2026-10-15',h+110,500,true)])}
   if(j===1)out.push(['fora',await lanca(id,'2026-10-12',h+60,700,true)]);}
 console.log(JSON.stringify(out,null,0));
 await pg.evaluate(()=>document.querySelector('header').click());await W(200);await pg.click('#fab');await W();await pg.click('[data-m="abast"]');await W();await pg.selectOption('#ab-eq',L0[1]);await pg.fill('#ab-hm',String(Number(await pg.evaluate(id=>window.__store['equipamentos/'+id].horimetro,L0[1]))+50));await pg.fill('#ab-l','480');await W();await pg.screenshot({path:'cb-form2.png'});
 await pg.evaluate(()=>document.querySelector('header').click());await W();
 await pg.click('[data-acc="comb"]');await W(500);await pg.screenshot({path:`c3-${sc}-1.png`});
 await pg.evaluate(id=>document.querySelector(`[data-cbe="${id}"]`).scrollIntoView({block:'center'}),L0[0]);await pg.click(`[data-cbe="${L0[0]}"]`);await W(500);await pg.screenshot({path:`c3-${sc}-2.png`});
 await pg.click('#cb-ab');await W(500);await pg.screenshot({path:`c3-${sc}-3.png`});
 console.log('card',await pg.$eval('#cb-card',e=>e.innerText.replace(/\s+/g,' ')),'| lista',await pg.$eval('#cb-abl',e=>e.innerText.replace(/\s+/g,' ')));
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('[data-acc="comb"]');await W(300);
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('[data-cbe]')].find(x=>/CP-02/.test(x.textContent));b.scrollIntoView({block:'center'});b.click()});await W(500);await pg.screenshot({path:`c4-${sc}-vazio.png`});
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="abast"]');await W();await pg.selectOption('#ab-eq',L0[1]);await pg.fill('#ab-hm',String(Number(await pg.evaluate(id=>window.__store['equipamentos/'+id].horimetro,L0[1]))+50));await pg.fill('#ab-l','480');await W();await pg.screenshot({path:`c4-${sc}-form.png`});
 await pg.click('[data-ch="0"]');await W();await pg.screenshot({path:`c4-${sc}-formp.png`});
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="excluir"]');await W();await pg.click('[data-m="dl-ab"]');await W(800);
 await pg.evaluate(()=>{const b=document.querySelector('#sheet [data-ia]');b.click()});await W();await pg.screenshot({path:`c4-${sc}-del.png`});
 console.log('mes doc',await pg.evaluate(()=>JSON.stringify(window.__store['comb/2026-10'].dia)));
 console.log('ERR',errs);await b.close()})();
