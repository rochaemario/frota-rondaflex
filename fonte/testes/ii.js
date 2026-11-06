
const st={k:{id:'k',kit:true,comps:[{id:'a',qtd:1},{id:'b',qtd:2}]},a:{id:'a',desc:'Filtro A',codigo:'111',un:'un'},b:{id:'b',desc:'Oleo B',codigo:'222',un:'L'}};
const stById=i=>st[i],isKit=x=>!!(x&&x.kit),stCod=x=>x.codigo,kitComps=k=>k.comps.map(c=>({c,s:st[c.id]}));
function itensInforme(t){const out=[],ix={};
  const add=o=>{const k=o.estoqueId||('#'+(o.pid||o.desc));if(ix[k]){ix[k].qtd=Math.round(((Number(ix[k].qtd)||0)+(Number(o.qtd)||0))*10)/10;return}ix[k]={...o};out.push(ix[k])};
  (t.itens||[]).forEach(i=>{const k=i.estoqueId&&stById(i.estoqueId);
    if(k&&isKit(k)){const n=Number(i.qtd)||1;kitComps(k).forEach(({c,s})=>add({desc:s.desc,espec:stCod(s),estoqueId:s.id,un:s.un||'un',qtd:Math.round(n*(Number(c.qtd)||1)*10)/10}))}
    else add(i)});
  return out}
console.log(JSON.stringify(itensInforme({itens:[{estoqueId:'k',qtd:1,un:'kit',desc:'Kit'},{estoqueId:'a',qtd:0,desc:'Filtro A plano'},{desc:'Avulso',qtd:3,un:'un'}]})));