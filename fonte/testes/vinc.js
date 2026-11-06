/* o que prende um cadastro: com qualquer registro ligado, ele nao pode ser excluido (so desativado) */
async function vinculos(kind,id){const v=[],pl=(n,a,b)=>n+' '+(n===1?a:b);
  if(kind==='eq'){const e=eqById(id)||{},tr=S.trocas.filter(t=>t.equipId===id),n=f=>tr.filter(f).length;
    const pv=n(t=>!['reprog','hmtroca','filtro_ar'].includes(t.tipo)),fa=n(t=>t.tipo==='filtro_ar'),rp=n(t=>t.tipo==='reprog'),hm=n(t=>t.tipo==='hmtroca');
    if(pv)v.push(pl(pv,'preventiva','preventivas'));if(fa)v.push(pl(fa,'troca de filtro de ar','trocas de filtro de ar'));if(rp)v.push(pl(rp,'reprogramacao','reprogramacoes'));if(hm)v.push(pl(hm,'troca de horimetro','trocas de horimetro'));
    if(e.combBase||e.combUltData)v.push('abastecimentos');if(e.horimetroData)v.push('leitura de horimetro');if(e.alocacao)v.push('alocacao');
    try{const q=await S.db.collection('movs').where('equipId','==',id).get();if(q.size)v.push(pl(q.size,'movimento de estoque','movimentos de estoque'))}catch(x){}
    if((S.avisos||[]).some(a=>JSON.stringify(a).includes('"'+id+'"')))v.push('avisos');
    const li=(e.itens||[]).filter(i=>i.estoqueId).length;if(li)v.push(pl(li,'item do plano ligado ao estoque','itens do plano ligados ao estoque'))}
  else{const s=stById(id)||{};const u=S.trocas.filter(t=>(t.itens||[]).some(i=>i.estoqueId===id)).length;if(u)v.push('uso em '+pl(u,'preventiva','preventivas'));
    try{const q=await S.db.collection('movs').where('estoqueId','==',id).get();if(q.size)v.push(pl(q.size,'movimento','movimentos'))}catch(x){}
    const pq=S.equipsAll.filter(e=>(e.itens||[]).some(i=>i.estoqueId===id)).length;if(pq)v.push('plano de '+pl(pq,'equipamento','equipamentos'));
    const kt=S.estoqueAll.filter(k=>isKit(k)&&(k.comps||[]).some(c=>c.id===id)).length;if(kt)v.push(pl(kt,'kit','kits'));
    const en=(s.encaixe||[]).length;if(en)v.push('encaixe em '+pl(en,'equipamento','equipamentos'));if((Number(s.qtd)||0)!==0)v.push('saldo em estoque')}
  return v}
/* ativo / inativo: botao no cadastro (nunca caixa de marcar) */
const ehInativo=(kind,o)=>kind==='eq'?o.status==='inativo':!!o.inativo;
const atNome=k=>k==='eq'?'equipamento':k==='kit'?'kit':'item';
function atBox(kind,o){if(!o||!o.id)return '';const ina=ehInativo(kind,o),nome=atNome(kind),onde=kind==='eq'?' e do cronograma':' e dos alertas de estoque';
  return `<div class="fset at-f"><h3>Cadastro</h3><p class="note" style="margin:0 0 10px">${ina?`Este ${nome} esta <b>inativo</b>: fora das listas, buscas${onde}. O historico continua.`:`Este ${nome} esta <b>ativo</b>. Desativado, sai das listas, buscas${onde}; o historico continua.`}</p>
    <button type="button" class="btn ${ina?'pri':''} block" data-at="${ina?'on':'off'}">${ina?'Reativar':'Desativar'} ${nome}</button><div class="at-ask"></div></div>`}
function atBind(sh,kind,id){const b=sh.querySelector('[data-at]');if(!b)return;b.onclick=()=>{const on=b.dataset.at==='on',o=kind==='eq'?eqById(id):stById(id);if(!o)return;const nome=kind==='eq'?o.codigo:stCod(o),onde=kind==='eq'?' e do cronograma':' e dos alertas de estoque';
  const bx=sh.querySelector('.at-ask');bx.innerHTML=`<div class="eqv-ask" style="margin-top:10px"><b>${on?'Reativar':'Desativar'} ${esc(nome)}?</b><p class="note" style="margin:0">${on?'Volta para as listas, buscas'+onde.replace(' e do',' e o').replace(' e dos',' e os')+'.':'Sai das listas, buscas'+onde+'. Nada do historico e apagado.'}</p><div class="eqv-f"><button type="button" class="btn" data-x>Cancelar</button><button type="button" class="btn pri" data-go>${on?'Reativar':'Desativar'}</button></div></div>`;
  bx.querySelector('[data-x]').onclick=()=>bx.innerHTML='';bx.scrollIntoView({block:'center',behavior:'smooth'});
  bx.querySelector('[data-go]').onclick=async()=>{const upd=kind==='eq'?{status:on?'ativo':'inativo'}:{inativo:!on};
    if(await safe(()=>S.db.doc((kind==='eq'?'equipamentos/':'estoque/')+id).update(upd),on?'Reativado':'Desativado'))goBack()}}}
