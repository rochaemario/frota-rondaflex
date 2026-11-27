// Dados de exemplo "cheios" para a varredura do item 49 (nomes longos, TAGs, OS com 1 a 4 responsaveis, listas cheias)
const TS=new Date('2026-11-25T10:00').getTime();
const d=n=>new Date(TS-n*864e5).toISOString().slice(0,10);
const seed={};
const TIPOS=[['CB','Caminhao basculante','Mercedes-Benz','Axor 3344 K 6x4'],['EH','Escavadeira hidraulica','Caterpillar','336D2 L'],['RE','Retroescavadeira','JCB','3CX Super 4x4'],
 ['MN','Motoniveladora','Caterpillar','140K'],['PC','Pa carregadeira','Volvo','L120H'],['TE','Trator de esteira','Komatsu','D61EX-23'],['CP','Caminhao pipa','Volkswagen','Constellation 31.320 6x4'],
 ['CL','Caminhao comboio lubrificante','Ford','Cargo 2622 6x4'],['RC','Rolo compactador','Dynapac','CA250D'],['VL','Veiculo leve','Toyota','Hilux SRV 2.8 4x4']];
const FR=['Britador primario','Pilha de descarte de esteril','Mina subterranea UG','Oficina da frota','Geral'];
let n=0;const EQ=[];
TIPOS.forEach(([s,t,m,mo],ti)=>{for(let i=1;i<=3;i++){const id=`${s}-${String(i+ti%3).padStart(2,'0')}`;n++;
  const it=(pid,desc,est,iv,uh)=>({pid,desc,espec:'',estoqueId:est,qtd:1,un:'un',ivSel:iv,ultimaH:uh,ultimaData:d(60)});
  const hm=1000+n*537;
  seed['equipamentos/'+id]={codigo:id,tipo:t,marca:m,modelo:mo,status:i===3&&ti===9?'inativo':'ativo',alocacao:ti===8&&i===2?'PQ':'DM1',area:ti%2?'Mina':'Planta',frente:FR[(ti+i)%FR.length],locador:i===2?'Locadora Transportes e Terraplanagem Nordeste Ltda':'Rondaflex',
    intervaloPrev:250,horimetro:i===1&&ti===4?'':hm,horimetroData:d(i),placa:'QWE-'+(1000+n),chassi:'9BM958074AB123456',
    itens:[it('p1','Filtro de oleo lubrificante do motor','FIL1',250,hm-300),it('p2','Filtro separador de agua do combustivel','FIL2',500,hm-100),it('p3','Oleo Mobil Delvac MX 15W-40','OL1',250,hm-260),it('p4','Filtro de ar primario do motor','FAR1','aval',hm-900)]};
  EQ.push(id)}});
const ST=[['FIL1','FIL-0001','P55-0449/WK 940/20','FILTRO DE OLEO LUBRIFICANTE DO MOTOR DIESEL ALTA EFICIENCIA','Donaldson','Filtros',4,2],
 ['FIL2','FIL-0002','PL420 / 1R-0762','FILTRO SEPARADOR DE AGUA DO COMBUSTIVEL PRIMARIO','Mann-Filter','Filtros',0,3],
 ['FAR1','FIL-0003','AF25667 / P781398','FILTRO DE AR PRIMARIO DO MOTOR RADIALSEAL','Fleetguard','Filtros',2,1],
 ['OL1','LUB-0001','MOBIL DELVAC MX 15W-40','OLEO LUBRIFICANTE MOTOR DIESEL MOBIL DELVAC MX 15W-40 BALDE 20 L','Mobil','Oleos',180,40],
 ['OL2','LUB-0002','HIDRAULICO AW 68','OLEO HIDRAULICO AW 68 TAMBOR 200 L','Lubrax','Oleos',35,50],
 ['MAN1','MAN-0001','','MANGUEIRA HIDRAULICA 1/2 POL R2 COM TERMINAIS PRENSADOS 1,20 M','Parker','Mangueiras',1,0],
 ['PEC1','PEC-0001','3E-9902','CORREIA DO ALTERNADOR POLY-V 8PK1680 REFORCADA','Gates','Pecas',3,1],
 ['PEC2','PEC-0002','1R-1808','ELEMENTO FILTRANTE DO SISTEMA HIDRAULICO RETORNO','Caterpillar','Pecas',12,2]];
ST.forEach(([id,alm,ref,desc,marca,tipo,qtd,minimo],i)=>seed['estoque/'+id]={alm,codigo:alm,ref,desc,marca,tipo,un:/^OL/.test(id)?'L':'un',qtd,minimo,local:'Prateleira B-'+(i+3)+' Almoxarifado central',
  encaixe:EQ.slice(0,6).map(e=>({equipId:e}))});
for(let i=0;i<40;i++)seed['estoque/X'+i]={alm:'PEC-'+String(100+i).padStart(4,'0'),codigo:'PEC-'+String(100+i).padStart(4,'0'),ref:'REF-'+(7000+i*13)+'/'+i,desc:'PECA DE REPOSICAO NUMERO '+i+' CONJUNTO COMPLETO COM VEDACOES',marca:i%3?'Bosch':'Original Caterpillar',tipo:'Pecas',un:'un',qtd:i%5,minimo:2};
seed['estoque/KIT1']={alm:'KIT-0001',codigo:'KIT-CB-AXOR3344-500H',desc:'KIT-CB-AXOR3344-500H',kit:true,tipo:'Kits',comps:[{id:'FIL1',qtd:1},{id:'FIL2',qtd:2},{id:'OL1',qtd:32}],kTipo:'Caminhao basculante',kModelo:'Axor 3344 K 6x4'};
const MEC=[['mec-1','Douglas Fernandes de Oliveira Junior','Mecanico soldador','101'],['mec-2','Joao Geraldo da Silva Pereira','Mecanico eletricista','102'],
 ['mec-3','Marrone Aparecido Nascimento','Mecanico','103'],['mec-4','Fernando Henrique Albuquerque','Comboista','104'],['mec-5','Ana Inativa','Mecanico','105']];
seed['config/mecanicos']={lista:MEC.map(([uid,nome,funcao,mat],i)=>({uid,nome,funcao,mat,ativo:i<4,enc:i===0}))};
const os=(num,o)=>({num,o:{por:'mec-1',porNome:MEC[0][1],ts:TS-(200-num)*36e5,data:d(num%9),fotos:[],resp:[],vinc:'',estado:'operando',pecas:[],...o}});
const pc=(id,nome,cod,qtd)=>({k:'est',id,nome,cod,un:'un',qtd:qtd||1});
for(let i=0;i<14;i++){const eq=EQ[i%EQ.length],r=MEC.slice(0,1+i%4).map(m=>m[0]),tp=['cor','prev','ar','cor'][i%4];
  seed['os/o'+(80+i)]=os(80+i,{tipo:tp,arSub:tp==='ar'?'Ar condicionado':undefined,arSv:tp==='ar'?'Limpeza':undefined,eq,hor:String(1200+i*37),resp:r,estado:i%3?'operando':'parado',concl:i%2===0,
    aconteceu:'Vazamento de oleo hidraulico na mangueira do cilindro de levante do lado esquerdo, maquina parou na frente de lavra',feito:i%2?'':'Troca da mangueira e reaperto das conexoes, teste de pressao ok',
    pecas:[pc('MAN1','MANGUEIRA HIDRAULICA 1/2 POL R2 COM TERMINAIS PRENSADOS 1,20 M','MAN-0001'),pc('OL2','OLEO HIDRAULICO AW 68 TAMBOR 200 L','LUB-0002',20),{k:'sc',nome:'Abracadeira de pressao inox 1/2 reforcada',qtd:4,foto:''}]})}
seed['os/o110']=os(110,{tipo:'cor',eq:'RE-03',hor:'5120',resp:['mec-1','mec-2','mec-3','mec-4'],concl:false,estado:'parado',aconteceu:'Nao liga',pecas:[]});
for(let i=0;i<25;i++)seed['trocas/t'+i]={equipId:EQ[i%EQ.length],data:d(5+i*3),horimetro:900+i*111,tipo:i%5===4?'filtro_ar':undefined,itens:[{pid:'p1',desc:'Filtro de oleo lubrificante do motor',estoqueId:'FIL1',qtd:1,un:'un'},{pid:'p3',desc:'Oleo Mobil Delvac MX 15W-40',estoqueId:'OL1',qtd:32,un:'L'}],ajuste:i%7===0,resp:MEC[i%4][1],obs:'Troca realizada junto com lubrificacao geral e inspecao das correias'};
for(let i=0;i<30;i++)seed['movs/m'+i]={estoqueId:ST[i%ST.length][0],tipo:i%3?'saida':'entrada',qtd:1+i%4,data:d(i),obs:'Retirada para manutencao corretiva da frota na frente de lavra',equipId:EQ[i%EQ.length],origem:'manual',saldo:5,ts:TS-i*864e5};
for(let i=0;i<30;i++)seed['comb/2026-11/abast/a'+i]={equipId:EQ[i%EQ.length],data:d(i%24),horimetro:1100+i*9,litros:120+i*3.5,comboio:'CB-COMBOIO-01',cc:'Planta'};
seed['comb/2026-11']={m:'2026-11'};
seed['config/comb']={comboios:[{id:'cbx1',nome:'Comboio 01 (tanque 4.000 L)'},{id:'cbx2',nome:'Comboio 02 Mina'}]};
for(let i=0;i<6;i++)seed['avisos/v'+i]={titulo:'Aviso importante numero '+i+' sobre a manutencao preventiva da frota',texto:'Conferir o horimetro de todos os equipamentos da frente de lavra antes do turno da noite.',ts:TS-i*36e5,de:'adm',resp:[]};
seed['config/etiquetas']={itens:[['FIL1',60,40],['FIL2',100,40],['FAR1',100,60],['OL1',150,100],['MAN1',70,40],['PEC1',190,135],['PEC2',240,40,1]].map(([id,w,h,band],i)=>({id,w,h,q:1+i,apl:1,...(band?{band:1}:{})}))};
seed['config/equivalencias']={pares:[['FIL1','PEC2']]};
module.exports={seed,EQ};
