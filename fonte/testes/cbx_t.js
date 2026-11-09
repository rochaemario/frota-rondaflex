const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const eq=(id,tipo,aloc,area,frente,hm)=>['equipamentos/'+id,{codigo:id,tipo,alocacao:aloc,area,frente,horimetro:hm,horimetroData:'2026-11-07',status:'ativo',itens:[],locador:'Rondaflex'}];
const seed=Object.fromEntries([eq('CAM-05','Caminhao','DM1','Mina','Geral',48210),eq('ESC-02','Escavadeira','DM1','Mina','UG',12430),eq('PC-01','Pa carregadeira','DM1','Planta','Britador',8112),eq('ESC-04','Escavadeira','PQ','','',5870),eq('MN-01','Motoniveladora','DM1','Mina','Geral',3000)]);
const today=new Date().toISOString().slice(0,10);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.addInitScript(([s])=>{window.__SEED=s;window.__PAPEL='admin';window.__LOGGED=1},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);await p.screenshot({path:'/home/claude/shots/0.png'});console.log('S?',await p.evaluate(()=>typeof S),await p.evaluate(()=>document.body.innerText.slice(0,200)));
if(await p.$('#lg-m')){await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await p.waitForTimeout(1500)}
const sh=n=>p.screenshot({path:'/home/claude/shots/'+n+'.png'});
await p.click('[data-acc="frota"]');await p.waitForTimeout(300);await p.click('[data-fr="comb"]');await p.waitForTimeout(400);await sh('1-hub');
await p.click('[data-cbx="cb"]');await p.waitForTimeout(600);await sh('2-comboio');
await p.click('#cbx-ab');await p.waitForTimeout(500);await sh('3-lote');
// preencher
const fill=async(id,h,l)=>{await p.fill(`[data-r="${id}"] [data-h]`,String(h));await p.fill(`[data-r="${id}"] [data-l]`,String(l));};
await fill('CAM-05',48390,220);await fill('ESC-02',12448,190);await fill('PC-01',8102,260);await p.waitForTimeout(500);
await p.click('[data-r="ESC-02"] [data-cu="planta"]');await p.waitForTimeout(200);
await p.fill('#cbx-q','esc-04');await p.waitForTimeout(500);await fill('ESC-04',5881,150);await p.waitForTimeout(500);await sh('4-pq');
await p.fill('#cbx-q','');await p.waitForTimeout(400);await sh('5-lote-filled');
await p.evaluate(()=>document.querySelector('#sheet .sh-body').scrollTo(0,9999));await sh('5b-lote-bottom');
console.log('botao:',await p.textContent('#lt-go'));
await p.click('#lt-go');await p.waitForTimeout(1200);await sh('6-apos');if(await p.$('[data-y]')){await p.click('[data-y]');await p.waitForTimeout(1500)}await sh('6b-lancado');console.log('toast:',await p.evaluate(()=>document.querySelector('.toast')?.textContent));
console.log('rascunho restante:',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('cbx.'))));
// filtros
await p.click('[data-f="mina"]');await p.waitForTimeout(300);await sh('7-mina');await p.click('[data-sf="ug"]');await p.waitForTimeout(300);await sh('7b-ug');
// menu
await p.click('.cbx-mb');await p.waitForTimeout(200);await sh('8-menu');await p.click('.cbx-mb');
// voltar ao comboio, entrada
await p.click('#sheet [data-back]');await p.waitForTimeout(500);
await p.click('#cbx-en');await p.waitForTimeout(400);await sh('9-entrada');await p.fill('#en-l','8000');await p.click('.hd-pri');await p.waitForTimeout(800);
console.log('toast2:',await p.evaluate(()=>document.querySelector('.toast')?.textContent));await p.waitForTimeout(500);await sh('10-comboio-apos');
await p.click('#cbx-fm');await p.waitForTimeout(800);await sh('11-fechar');await p.fill('#fm-s','5000');await p.click('.hd-pri');await p.waitForTimeout(900);await sh('12-comboio-fechado');
await p.click('#cbx-fm');await p.waitForTimeout(900);await sh('13-fechar2');await p.click('#sheet [data-back]');await p.waitForTimeout(400);
await p.click('#sheet [data-back]');await p.waitForTimeout(400);await p.click('[data-cbx="rel"]');await p.waitForTimeout(800);await sh('14-rel');
await p.click('#sheet [data-back]');await p.waitForTimeout(400);await p.click('#fab');await p.waitForTimeout(400);await p.click('[data-m="aj"]');await p.waitForTimeout(400);await p.click('[data-m="cbx-aj"]');await p.waitForTimeout(700);await sh('15-ajustes');
await p.click('#sheet [data-back]');await p.waitForTimeout(300);await p.click('#sheet [data-back]');await p.waitForTimeout(300);await p.click('[data-m="comb"]');await p.waitForTimeout(400);await sh('16-menu-mais');
console.log('ERROS:',errs);await b.close()})();
