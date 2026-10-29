// SPDX-FileCopyrightText: 2026 ngulloa
// SPDX-License-Identifier: MIT
(function(){
'use strict';
let count=0;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function control(host,label,node){const id=`opti-control-${++count}`;node.id=id;const l=el('label',label);l.htmlFor=id;const box=el('div',undefined,'opti-control');box.append(l,node);host.append(box);return node;}
function svgNode(tag,attrs){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs||{})) n.setAttribute(k,v);return n;}
function plot(label){const s=svgNode('svg',{viewBox:'0 0 420 300',role:'img','aria-label':label,class:'opti-plot'});return s;}
function line(s,x1,y1,x2,y2,cls){s.append(svgNode('line',{x1,y1,x2,y2,class:cls||'opti-axis'}));}
function label(s,x,y,t){const n=svgNode('text',{x,y,class:'opti-label'});n.textContent=t;s.append(n);}
function table(headers,rows){const wrap=el('div',undefined,'opti-table');const t=el('table',undefined,'table');t.tabIndex=0;const cap=el('caption','Cálculos del estado actual');const head=el('thead');const tr=el('tr');headers.forEach(h=>{const th=el('th',h);th.scope='col';tr.append(th);});head.append(tr);const body=el('tbody');rows.forEach(row=>{const tr=el('tr');row.forEach(v=>tr.append(el('td',String(v))));body.append(tr);});t.append(cap,head,body);wrap.append(t);return wrap;}
function secant(host){
 host.classList.add('opti-widget');host.append(el('h4','Secante y combinación convexa'));
 const sel=control(host,'Función',el('select',undefined,'form-select'));for(const [v,t] of [['convexa','f(x)=x²'],['concava','f(x)=−x²']]){const o=el('option',t);o.value=v;sel.append(o);}
 const range=el('input',undefined,'form-range');range.type='range';range.min='0';range.max='100';range.value='50';range.step='1';control(host,'Peso θ (entre 0 y 1)',range);
 const out=el('p');out.setAttribute('aria-live','polite');const graph=plot('Función, secante y punto de combinación entre −1 y 2');host.append(out,graph);
 function draw(){const t=Number(range.value)/100,sign=sel.value==='convexa'?1:-1;const f=x=>sign*x*x;const x=-1+3*t,sec=(1-t)*f(-1)+t*f(2),val=f(x);out.textContent=`θ=${t.toFixed(2)}; x=${x.toFixed(2)}; función=${val.toFixed(4)}; secante=${sec.toFixed(4)}; diferencia=${(sec-val).toFixed(4)}.`;
 range.setAttribute('aria-valuetext',`${t.toFixed(2)} de peso`);graph.replaceChildren();const X=x=>45+(x+1.4)/3.8*340,Y=y=>150-y*25;
 line(graph,30,Y(0),400,Y(0));line(graph,X(0),20,X(0),280);
 let path='';for(let i=0;i<=100;i++){const z=-1.3+3.6*i/100;path+=`${i?'L':'M'}${X(z)} ${Y(f(z))} `;}
 graph.append(svgNode('path',{d:path,class:'opti-curve'}));line(graph,X(-1),Y(f(-1)),X(2),Y(f(2)),'opti-secant');line(graph,X(x),Y(val),X(x),Y(sec),'opti-gap');
 for(const y of [val,sec])graph.append(svgNode('circle',{cx:X(x),cy:Y(y),r:4,class:'opti-dot'}));label(graph,X(-1),292,'−1');label(graph,X(2),292,'2');label(graph,390,Y(0)-6,'x');label(graph,50,18,sign===1?'Convexa: secante ≥ función':'Cóncava: secante ≤ función');}
 range.addEventListener('input',draw);sel.addEventListener('change',draw);draw();
}
function polyhedron(host){
 host.classList.add('opti-widget');host.append(el('h4','Objetivo y cara óptima'));
 const range=el('input',undefined,'form-range');Object.assign(range,{type:'range',min:'-1',max:'6',step:'0.1',value:'2'});control(host,'Parámetro a de maximización a·x₁+2x₂',range);
 const out=el('p');out.setAttribute('aria-live','polite');const graph=plot('Poliedro con vértices (0,0), (3,0), (2,2), (0,3)');const numbers=el('div');host.append(out,graph,numbers);
 const vertices=[[0,0],[3,0],[2,2],[0,3]],names=['O','A','B','C'];
 function draw(){const ai=Math.round(Number(range.value)*10),vals=vertices.map(([x,y])=>ai*x+20*y),best=Math.max(...vals),ids=vals.map((v,i)=>v===best?i:-1).filter(i=>i>=0);out.textContent=`a=${(ai/10).toFixed(1)}. Máximo=${best/10}; ${ids.length>1?'segmento óptimo entre':'vértice óptimo'} ${ids.map(i=>`${names[i]}=(${vertices[i]})`).join(' y ')}. El mínimo del objetivo negativo es ${-best/10}.`;
 range.setAttribute('aria-valuetext',String(ai/10));graph.replaceChildren();const X=x=>55+x*90,Y=y=>255-y*72;
 line(graph,30,255,400,255);line(graph,55,280,55,12);label(graph,390,276,'x₁');label(graph,23,19,'x₂');
 graph.append(svgNode('polygon',{points:vertices.map(([x,y])=>`${X(x)},${Y(y)}`).join(' '),class:'opti-region'}));
 // La recta objetivo se recorta al rectángulo visible del gráfico.
 const pts=[];const a=ai/10,v=best/10;for(const x of [0,3.7]){const y=(v-a*x)/2;if(y>=0 && y<=3.3)pts.push([x,y]);}if(a!==0)for(const y of [0,3.3]){const x=(v-2*y)/a;if(x>=0&&x<=3.7)pts.push([x,y]);}if(pts.length>=2)line(graph,X(pts[0][0]),Y(pts[0][1]),X(pts[1][0]),Y(pts[1][1]),'opti-secant');
 if(ids.length===2){const u=vertices[ids[0]],w=vertices[ids[1]];line(graph,X(u[0]),Y(u[1]),X(w[0]),Y(w[1]),'opti-optimal');}
 vertices.forEach(([x,y],i)=>{graph.append(svgNode('circle',{cx:X(x),cy:Y(y),r:ids.includes(i)?6:3,class:'opti-dot'}));label(graph,X(x)+(x===0?8:-10),Y(y)+(y===0?20:-12),`${names[i]} (${x},${y})`);});
 numbers.replaceChildren(table(['Vértice','Valor a·x₁+2x₂','¿Óptimo?'],vertices.map((p,i)=>[`${names[i]} (${p})`,vals[i]/10,ids.includes(i)?'Sí':'No'])));}
 range.addEventListener('input',draw);draw();
}
function simplex(host){
 const M=globalThis.UStudyOpti;if(!M){host.append(el('p','No se cargó el motor. Consulta la ejecución algebraica de esta página.'));return;}
 host.classList.add('opti-widget');host.append(el('h4','Bases, factibilidad y un paso de Bland'));
 const casesel=control(host,'Problema',el('select',undefined,'form-select'));Object.entries(M.cases).forEach(([key,c])=>{const o=el('option',c.name);o.value=key;casesel.append(o);});
 const basesel=control(host,'Base (índices de variables)',el('select',undefined,'form-select'));const p=el('p');const result=el('div');result.setAttribute('aria-live','polite');
 const step=el('button','Aplicar un pivote de Bland','btn btn-primary');step.type='button';const reset=el('button','Reiniciar este problema','btn btn-outline-primary');reset.type='button';host.append(p,result,step,reset);
 let B,scenario,s;
 const show=v=>String(v),vec=a=>`(${a.map(show).join(', ')})`;
 function load(){scenario=M.cases[casesel.value];B=[...scenario.B];basesel.replaceChildren();M.combinations(scenario.c.length,scenario.b.length).forEach(c=>{try{M.analyze(scenario.A,scenario.b,scenario.c,c);}catch{return;}const o=el('option',`{${c.map(j=>j+1).join(', ')}}`);o.value=c.join(',');basesel.append(o);});p.textContent=scenario.description;draw();}
 function draw(){s=M.analyze(scenario.A,scenario.b,scenario.c,B);basesel.value=[...B].sort((a,b)=>a-b).join(',');result.replaceChildren();result.append(el('p',`Base ordenada {${B.map(j=>j+1)}}; solución completa x=${vec(s.x)}; z=${s.z}.`));
 const rows=s.N.map((j,k)=>[`x${j+1}`,s.r[k],vec(s.cols[k])]);result.append(table(['No básica','Costo reducido','Columna transformada'],rows));
 let message='';step.disabled=true;
 if(s.status==='infeasible')message='Base infactible: hay un básico negativo. No aplicar Fase II primal desde esta base.';
 else if(s.status==='optimal'){message='Criterio de optimalidad satisfecho: todos los costos reducidos son no negativos.';if(s.r.some(v=>v.cmp(0)===0))message+=' Hay costos nulos; comprueba un desplazamiento factible no nulo antes de afirmar multiplicidad.';}
 else if(s.status==='unbounded')message=`Sin variable saliente. Entra x${s.enter+1} con costo ${s.r[s.N.indexOf(s.enter)]}; dirección d=${vec(s.direction)}. Objetivo no acotado inferiormente.`;
 else{message=`Entra x${s.enter+1}; sale x${s.leave+1}; θ=${s.theta}. ${s.status==='degenerate'?'Paso cero: cambia la base y se conserva el punto.':'Paso positivo: el costo disminuye.'} ${s.ties.length>1?'Empate: Bland usa el menor índice básico.':''}`;step.disabled=false;}
 result.append(el('p',message));if(s.ratios.length)result.append(table(['Variable básica','Razón admisible'],s.B.map((j,i)=>[`x${j+1}`,s.ratios[i]===null?'No limita (u≤0)':s.ratios[i]])));
 }
 casesel.addEventListener('change',load);basesel.addEventListener('change',()=>{B=basesel.value.split(',').map(Number);draw();});step.addEventListener('click',()=>{B=M.nextBasis(s);draw();});reset.addEventListener('click',()=>{B=[...scenario.B];draw();});load();
}
for(const host of document.querySelectorAll('[data-opti]')){const kind=host.dataset.opti;if(kind==='secante')secant(host);if(kind==='poliedro')polyhedron(host);if(kind==='simplex')simplex(host);}
})();
