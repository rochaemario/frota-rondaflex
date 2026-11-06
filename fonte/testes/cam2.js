const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__PAPEL='admin';window.__LOGGED=true;window.__CODE=null;
  window.BarcodeDetector=class{static async getSupportedFormats(){return ['qr_code']}async detect(){return window.__CODE?[{rawValue:window.__CODE,format:'qr_code'}]:[]}}},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://localhost/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||350);
const fab=async m=>{await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click(`[data-m="${m}"]`);await W(400)};
const vis=sel=>p.evaluate(s=>{const e=document.querySelector(s);return !!(e&&e.offsetParent)},sel);
const ler=async code=>{await W(500);await p.evaluate(c=>window.__CODE=c,code);await W(700);await p.evaluate(()=>window.__CODE=null)};
await fab('mv-entrada');console.log('inicio: qtd visível',await vis('#mv-q'),'botão lançar ativo',await p.evaluate(()=>!document.getElementById('mv-go').disabled),'câmera',await vis('#mv-cam'));
await p.screenshot({path:'n1.png'});
await p.fill('#mv-c','462');await W(200);await p.screenshot({path:'n2.png'});await p.click('#mv-hit [data-pk]');await W(300);
console.log('selecionado: card',await vis('#mv-card'),'qtd',await vis('#mv-q'),'campo código',await vis('#mv-c'),'lançar ativo',await p.evaluate(()=>!document.getElementById('mv-go').disabled));
await p.fill('#mv-q','3');await p.screenshot({path:'n3.png'});
await p.click('#mv-card');await W(400);console.log('abriu cadastro:',await p.evaluate(()=>document.querySelector('#sheet h2').textContent));
await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W(400);console.log('voltou: card',await vis('#mv-card'),'qtd',await p.inputValue('#mv-q'));
await p.click('#mv-tr');await W(200);console.log('trocar: código visível',await vis('#mv-c'),'qtd oculta',!(await vis('#mv-q')));
await p.click('#mv-cam');await ler('00450000181611|1|5263125.000|03090302');await p.click('[data-u]');await W(300);console.log('câmera escolheu:',await p.evaluate(()=>document.querySelector('#mv-card b').textContent));
await p.click('#mv-tr');await p.fill('#mv-c','ZZ-999');await W(200);await p.click('#mv-cad');await W(400);console.log('cadastrar: ref',await p.inputValue('#s-ref'),'idstep?',await vis('#s-idq'));
// cadastro novo
await fab('novo');await p.click('[data-m="st"]');await W(400);console.log('cadastro: id visível',await vis('#s-idq'),'form oculto',!(await vis('#s-desc')),'salvar oculto',!(await vis('.sh-foot')));
await p.fill('#s-idq','273');await W(200);await p.screenshot({path:'n4.png'});console.log('sugestões:',await p.evaluate(()=>document.querySelector('#s-idh').innerText.replace(/\n+/g,' | ')));
await p.click('#s-go');await W(300);console.log('seguiu: ref',await p.inputValue('#s-ref'),'desc visível',await vis('#s-desc'),'salvar',await vis('.sh-foot'));
// estoque
await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.querySelector('[data-acc="estoque"]').click());await W(300);await p.screenshot({path:'n5.png'});
await p.click('#es-cam');await ler('360-8960');await p.click('[data-u]');await W(400);console.log('estoque câmera abriu:',await p.evaluate(()=>document.querySelector('#sheet h2').textContent));
// kit
await fab('novo');await p.click('[data-m="kit"]');await W(400);await p.click('#k-cam');await ler('462-1171');await p.click('[data-u]');await W(300);console.log('kit select:',await p.evaluate(()=>[...document.querySelectorAll('[data-kc] select')].map(s=>s.value).join(',')));
// preventiva
await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.querySelector('[data-acc="manut"]').click());await W(300);await p.evaluate(()=>document.querySelector('[data-a="new-tr"]').click());await W(400);await p.click('[data-rg="prev"]');await W(400);await p.selectOption('#t-eq','PC-02');await W(500);
await p.click('#t-cam');await ler('462-1171');await p.click('[data-u]');await W(400);console.log('preventiva toast:',await p.evaluate(()=>document.querySelector('.toast')?.textContent));
await p.screenshot({path:'n6.png'});
console.log('ERR',errs);await b.close()})();
