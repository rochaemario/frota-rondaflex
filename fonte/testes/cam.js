const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__PAPEL='admin';window.__LOGGED=true;window.__CODE=null;
  window.BarcodeDetector=class{static async getSupportedFormats(){return ['qr_code','ean_13']}async detect(){if(window.__CODE){const v=window.__CODE;return [{rawValue:v,format:'qr_code'}]}return []}}},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://localhost/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||350);
const fab=async m=>{await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click(`[data-m="${m}"]`);await W(400)};
// 1 entrada com QR CAT
await fab('mv-entrada');console.log('botão no campo:',await p.evaluate(()=>!!document.querySelector('#mv-c').parentNode.querySelector('.rd-b')));
await p.click('.rd-b');await W(800);await p.evaluate(()=>window.__CODE='00450000181611|1|5263125.000|03090302');await W(800);
console.log('resultado:',await p.evaluate(()=>document.querySelector('.rdr-r').innerText.replace(/\n+/g,' | ')));await p.screenshot({path:'cam1.png'});
await p.click('[data-u]');await W(400);await p.evaluate(()=>window.__CODE=null);
console.log('campo:',await p.inputValue('#mv-c'),'| hit:',await p.evaluate(()=>document.querySelector('#mv-hit').innerText.replace(/\n/g,' ')));
await p.screenshot({path:'cam2.png'});
// 2 código desconhecido -> ligar
await p.fill('#mv-c','');await p.click('.rd-b');await W(600);await p.evaluate(()=>window.__CODE='7891234567895');await W(700);
console.log('desconhecido:',await p.evaluate(()=>[...document.querySelectorAll('.rdr-r .btn')].map(b=>b.textContent+(b.classList.contains('pri')?'*':'')).join(' / ')));
await p.screenshot({path:'cam3.png'});
await p.click('[data-l]');await W(300);await p.click('[data-rit="cat-462-1171"]');await W(800);
console.log('ligado:',await p.inputValue('#mv-c'),await p.evaluate(async()=>JSON.stringify((await window.__sb.from('docs').select('data').eq('path','estoque/cat-462-1171').maybeSingle()).data.data.eans)));
// relendo o mesmo código agora reconhece
await p.fill('#mv-c','');await p.evaluate(()=>window.__CODE=null);await p.click('.rd-b');await W(600);await p.evaluate(()=>window.__CODE='7891234567895');await W(700);
console.log('relido:',await p.evaluate(()=>document.querySelector('.rdr-r').innerText.replace(/\n+/g,' | ')));
// voltar do android fecha leitor
await p.goBack({waitUntil:'commit'}).catch(()=>{});await W(400);console.log('leitor fechado:',!(await p.$('.rdr')),'sheet aberto:',await p.evaluate(()=>!document.getElementById('scrim').hidden));
await p.evaluate(()=>window.__CODE=null);
// 3 peça nova -> cadastrar
await p.fill('#mv-c','');await p.click('.rd-b');await W(600);await p.evaluate(()=>window.__CODE='00450000157949|1|2229021.000|09030101');await W(700);
console.log('nova:',await p.evaluate(()=>[...document.querySelectorAll('.rdr-r .btn')].map(b=>b.textContent+(b.classList.contains('pri')?'*':'')).join(' / ')));
await p.click('[data-c]');await W(600);await p.evaluate(()=>window.__CODE=null);console.log('cadastro ref:',await p.inputValue('#s-ref'));
await p.screenshot({path:'cam4.png'});
// botões nas demais telas
const telas={};await p.evaluate(()=>document.querySelector('header').click());await W(400);
await p.evaluate(()=>document.querySelector('[data-acc="estoque"]').click());await W(300);telas.estoque=await p.evaluate(()=>!!document.querySelector('#esq+.rd-b'));
await fab('novo');await p.click('[data-m="kit"]');await W(400);telas.kit=await p.evaluate(()=>!!document.querySelector('.rd-kb'));
await p.evaluate(()=>document.querySelector('header').click());await W(300);await fab('editar');await p.click('[data-m="ed-st"]');await W(400);telas.editar=await p.evaluate(()=>!!document.querySelector('#pe-q+.rd-b'));
await p.evaluate(()=>document.querySelector('header').click());await W(300);await fab('editar');await p.click('[data-m="ed-eq"]');await W(400);telas.editarEquip_semCamera=await p.evaluate(()=>!document.querySelector('#pe-q+.rd-b'));
await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.getElementById('cartb').click());await W(400);await p.evaluate(()=>{const b=document.querySelector('#sheet .ct-add');b&&b.click()});await W(300);telas.lista=await p.evaluate(()=>!!document.querySelector('.ct-c+.rd-b'));
await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.querySelector('[data-acc="manut"]').click());await W(300);telas.preventivas_semCamera=await p.evaluate(()=>!document.querySelector('#pq+.rd-b'));
await p.evaluate(()=>document.querySelector('[data-a="new-tr"]').click());await W(400);await p.click('[data-rg="prev"]');await W(400);await p.selectOption('#t-eq','CB-03');await W(500);telas.preventiva_cd=await p.evaluate(()=>document.querySelectorAll('input.cd+.rd-b').length);
await p.screenshot({path:'cam5.png'});
console.log(JSON.stringify(telas));console.log('ERR',errs);await b.close()})();
