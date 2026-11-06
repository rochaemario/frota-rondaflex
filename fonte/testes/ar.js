  nav('ar:'+sub,()=>formFiltroAr(eqId,sub));
  const eqs=S.equips.slice().sort(byCode);
  const cur=eqId&&eqById(eqId)?eqId:'';
  const filtros=S.estoque.filter(s=>s.tipo==='filtro'&&!isKit(s)).sort(byCode);
  openSheet({title:'Filtro de ar · '+esc(sub),sub:'Registre a troca ou limpeza do filtro',
  body:`${S.ajuste?AJ_BANNER:''}<form id="fa"><div class="fset">
    <label class="f">Equipamento<select id="a-eq" required data-eqs><option value="">Escolha…</option>${eqs.map(e=>`<option value="${esc(e.id)}"${cur===e.id?' selected':''}>${esc(e.codigo)} · ${esc(e.tipo)}</option>`).join('')}</select></label>
    <div class="f">Servico<div class="seg ar-seg" role="group" aria-label="Servico"><button type="button" data-sv="Troca" aria-pressed="true">Troca</button><button type="button" data-sv="Limpeza" aria-pressed="false">Limpeza</button></div></div>
    <div class="grid"><label class="f">Data<input id="a-dt" type="date" required value="${today()}"></label>
    <label class="f">Horimetro (h)<input id="a-hm" type="number" step="0.1" inputmode="decimal" required></label></div></div>
    <div class="fset" id="a-stw" style="margin-top:12px"><h3>Filtros trocados</h3>
      <div id="a-sug"></div>
      <div class="sug-w t-add"><div class="search">${I.search}<input id="a-q" type="search" placeholder="Adicionar filtro por codigo ou nome" autocomplete="off" aria-label="Adicionar filtro"></div><div class="sug" id="a-qh"></div></div>
      ${rdBtn('a-cam','Adicionar filtro pela camera')}<div id="a-its"></div></div>
    <div id="a-plan"></div>
    <div class="fset" style="margin-top:12px"><label class="f">Responsavel<input id="a-resp" placeholder="Mecanico ou oficina"></label>
    <label class="f">Observacoes<textarea id="a-obs"></textarea></label></div><div id="a-hmg"></div></form>`,
  foot:`<button class="btn pri" form="fa">Registrar ${esc(sub==='Motor'?'filtro de ar':'filtro da cabine')}</button>`,
  mount:sh=>{
    let sv='Troca';const sel=sh.querySelector('#a-eq'),hm=sh.querySelector('#a-hm');
    /* filtros do lancamento: um ou mais, cada um com a sua quantidade */
    const L=[];const box=sh.querySelector('#a-its'),sug=sh.querySelector('#a-sug');
    const drawL=()=>{box.innerHTML=L.length?`<div class="kl ar-kl">${L.map((c,i)=>{const x=stById(c.id);return `<div class="kr"><span class="n"><b>${esc(x?x.desc:'Item removido')}</b><small class="num">${esc(x?stCod(x):'')}${x?` · saldo ${nf(stQtd(x),1)}`:''}</small></span><input type="number" step="1" min="0" inputmode="numeric" value="${esc(c.q)}" data-aq="${i}" aria-label="Quantidade"><span class="u">${esc(x?stUn(x):'un')}</span><button type="button" class="x" data-ax="${i}" aria-label="Tirar">✕</button></div>`}).join('')}</div>`:'<p class="note" style="margin:10px 2px 0">Nenhum filtro adicionado. Sem filtro, o servico e registrado sem baixa no estoque.</p>';
      box.querySelectorAll('[data-aq]').forEach(q=>q.oninput=()=>{L[Number(q.dataset.aq)].q=q.value});
      box.querySelectorAll('[data-ax]').forEach(b=>b.onclick=()=>{L.splice(Number(b.dataset.ax),1);drawL();drawSug()});drawSug()};
    const add=x=>{if(!x)return;if(isKit(x)){toast('Escolha um filtro, nao um kit.');return}if(L.some(c=>c.id===x.id)){toast(`${x.desc} ja esta na lista`);return}L.push({id:x.id,q:1});drawL()};
    /* sugestoes: filtros de ar com encaixe neste equipamento (motor ou cabine primeiro) */
    const drawSug=()=>{const eid=sel.value,fit=filtros.filter(s=>(s.encaixe||[]).includes(eid)&&isAr(s)),pref=fit.filter(s=>sub==='Motor'?!isCabine(s):isCabine(s)),l=[...pref,...fit.filter(s=>!pref.includes(s))].filter(s=>!L.some(c=>c.id===s.id));
      sug.innerHTML=l.length?`<div class="ti-g ar-sg">Encaixe de fabrica · toque para adicionar</div><div class="tsec-l">${l.map(s=>esRow(s,{attr:`data-as="${esc(s.id)}"`})).join('')}</div>`:'';
      sug.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>add(stById(b.dataset.as)))};
    const q=sh.querySelector('#a-q'),qh=sh.querySelector('#a-qh');
    q.oninput=()=>{const k=nzCod(q.value);if(!k){qh.innerHTML='';return}
      const sc=x=>{const a=nzCod(stCod(x)),b=nzCod(x.ref);return a===k||b===k?0:a.startsWith(k)||b.startsWith(k)?1:a.includes(k)||b.includes(k)||nzCod(x.desc).includes(k)?2:9};
      const m=filtros.map(x=>[sc(x),x]).filter(a=>a[0]<9).sort((a,b)=>a[0]-b[0]||byCode(a[1],b[1])).slice(0,6).map(a=>a[1]);
      qh.innerHTML=m.length?`<div class="tsec-l">${m.map(x=>esRow(x,{attr:`data-ap2="${esc(x.id)}"`})).join('')}</div>`:'<div class="eqs-v">Nenhum filtro encontrado no estoque.</div>';
      qh.querySelectorAll('[data-ap2]').forEach(b=>b.onclick=()=>{q.value='';qh.innerHTML='';add(stById(b.dataset.ap2))})};
    const cm=sh.querySelector('#a-cam');if(cm)cm.onclick=()=>rdOpen({mode:'item',use:v=>{if(!v.item){toast('Filtro nao encontrado no estoque.');return}add(v.item)}});
    /* itens do plano do equipamento que esta troca cumpre (pre-marcados pelo nome) */
    const fillPlan=()=>{const e=eqById(sel.value),bx=sh.querySelector('#a-plan');const its=(e&&e.itens||[]).filter(i=>/\bar\b/i.test(itNome(i)+' '+(i.desc||'')));
      if(!its.length||sv!=='Troca'){bx.innerHTML='';return}
      const cab=i=>/condicionad|cabine/i.test(itNome(i)+' '+(i.desc||'')),pre=i=>sub==='Motor'?!cab(i):cab(i);
      bx.innerHTML=`<div class="fset" style="margin-top:12px"><h3>Itens do plano cumpridos</h3><div class="list">${its.map(i=>`<label class="chk"><input type="checkbox" data-pl="${esc(i.pid)}"${pre(i)?' checked':''}><span class="box"></span><div class="main"><b>${esc(itNome(i))}</b></div></label>`).join('')}</div></div>`};
    const fillHm=()=>{const e=eqById(sel.value);hm.value=e&&e.horimetro!==''&&e.horimetro!=null?e.horimetro:'';
      /* troca de equipamento: sugere de novo o filtro de encaixe (so se a lista estiver vazia) */
      if(!L.length){const fit=filtros.filter(s=>(s.encaixe||[]).includes(sel.value)&&isAr(s)),pref=fit.filter(s=>sub==='Motor'?!isCabine(s):isCabine(s));if(pref.length===1)L.push({id:pref[0].id,q:1})}
      drawL();fillPlan()};sel.onchange=fillHm;fillHm();
    sh.querySelectorAll('[data-sv]').forEach(b=>b.onclick=()=>{sv=b.dataset.sv;sh.querySelectorAll('[data-sv]').forEach(x=>x.setAttribute('aria-pressed',x===b));sh.querySelector('#a-stw').hidden=sv!=='Troca';fillPlan()});
    const hmSt={ok:false};[hm,sh.querySelector('#a-dt')].forEach(x=>x.addEventListener('input',()=>{hmSt.ok=false;hmSt.salto=false}));sel.addEventListener('change',()=>{hmSt.ok=false;hmSt.salto=false});
    sh.querySelector('#fa').onsubmit=async ev=>{ev.preventDefault();
      const e=eqById(sel.value);if(!e)return;
      const h0=Number(hm.value),dt0=sh.querySelector('#a-dt').value,g=hmGuard(sh.querySelector('#a-hmg'),e,h0,dt0,hmSt,()=>sh.querySelector('#fa').onsubmit({preventDefault(){}}));if(!g)return;
      const h=g.h,dl=g.dl,dt=dt0,nome=`Filtro de ar ${sub==='Motor'?'do motor':'do ar condicionado'}`;
      const lst=sv==='Troca'?L.map(c=>({st:stById(c.id),q:Number(c.q)||0})).filter(x=>x.st):[];
      const itens=lst.length?lst.map(({st,q})=>({pid:'',desc:st.desc,espec:stCod(st),qtd:q,un:st.un||'un',estoqueId:st.id})):[{pid:'',desc:`${nome} (${sv.toLowerCase()})`,espec:'',qtd:0,un:'un',estoqueId:''}];
      const ok=await safe(async()=>{
        const isAj=!!S.ajuste;
        await S.db.collection('trocas').add({tipo:'filtro_ar',sub,servico:sv,ajuste:isAj,equipId:e.id,data:dt,horimetro:h0,...(dl?{hmConv:h}:{}),resp:sh.querySelector('#a-resp').value.trim(),obs:sh.querySelector('#a-obs').value.trim(),proximaH:'',itens});
        const done=new Set([...sh.querySelectorAll('[data-pl]:checked')].map(c=>c.dataset.pl));
        const upd={};if(done.size)upd.itens=e.itens.map(i=>done.has(i.pid)?{...i,ultimaH:h,ultimaData:dt,proxH:'',reprog:''}:i);
        if(h>(Number(e.horimetro)||0)){upd.horimetro=h;upd.horimetroData=dt;upd.horimetroReg=today()}
        if(Object.keys(upd).length)await S.db.doc('equipamentos/'+e.id).update(upd);
        if(!isAj)for(const {st,q} of lst){if(!q)continue;await logBaixa(st.id,q,dt,e.id);await S.db.doc('estoque/'+st.id).update({qtd:Math.round(((Number(st.qtd)||0)-q)*10)/10})}
      },`Filtro de ar registrado (${sv.toLowerCase()})`);
      if(ok)finishReg(e.id);
    };
  }});
}
