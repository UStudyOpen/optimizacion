// SPDX-FileCopyrightText: 2026 ngulloa
// SPDX-License-Identifier: MIT
const assert=require('node:assert/strict');
const {q,dot,matvec,analyze,nextBasis,combinations,cases}=require('../assets/optimizacion/matematica.js');
const strings=a=>a.map(String);
let checks=0;
function equal(a,b){assert.deepEqual(a,b);checks++;}
function state(c,B=c.B,rule){return analyze(c.A,c.b,c.c,B,rule);}
function invariant(c,s){equal(strings(matvec(c.A,s.x)),strings(c.b));equal(String(dot(c.c,s.x)),String(s.z));for(const j of s.N){const k=s.N.indexOf(j);const d=c.c.map(()=>q(0));d[j]=q(1);s.B.forEach((idx,i)=>d[idx]=s.cols[k][i].neg());equal(strings(matvec(c.A,d)),c.b.map(()=> '0'));equal(String(dot(c.c,d)),String(s.r[k]));}}
const t=cases.transversal;let s=state(t);equal(s.status,'pivot');equal(s.enter,0);equal(s.leave,3);equal(String(s.theta),'3');
for(let i=0;i<3;i++){invariant(t,s);if(i<2)s=state(t,nextBasis(s));}
equal(s.status,'optimal');equal(strings(s.x),['2','2','0','0']);equal(String(s.z),'-8');equal(strings(s.r),['2/3','2/3']);
const bases=combinations(4,2).map(B=>state(t,B));equal(bases.filter(s=>s.status==='infeasible').length,2);equal(bases.length,6);bases.forEach(s=>invariant(t,s));
s=state(cases.noacotado);equal(s.status,'unbounded');equal(strings(s.direction),['1','1']);invariant(cases.noacotado,s);
s=state(cases.empate);equal(String(s.theta),'1');equal(s.ties,[1,2]);equal(s.leave,1);
s=state(cases.degenerado);equal(s.status,'degenerate');equal(String(s.theta),'0');let p=state(cases.degenerado,nextBasis(s));equal(strings(s.x),strings(p.x));equal(p.status,'pivot');p=state(cases.degenerado,nextBasis(p));equal(p.status,'optimal');equal(String(p.z),'-2');
s=state(cases.cerobloqueado);equal(s.status,'optimal');equal(strings(s.r),['0']);equal(strings(s.x),['0','0']);
const phase={A:[[2,3,-1,0,1],[1,5,0,1,0]],b:[6,15],c:[0,0,0,0,1],B:[4,3]};
s=state(phase,phase.B,'dantzig');equal(s.enter,1);equal(s.leave,4);equal(String(s.theta),'2');s=state(phase,nextBasis(s));equal(s.status,'optimal');equal(String(s.z),'0');equal(strings(s.x),['0','2','0','5','0']);invariant(phase,s);
const infeasible={A:[[1,-1,0,1],[1,0,1,0]],b:[2,1],c:[0,0,0,1],B:[3,2]};s=state(infeasible);s=state(infeasible,nextBasis(s));equal(s.status,'optimal');equal(String(s.z),'1');
const cycle={A:[['1/2','-11/2','-5/2',9,1,0,0],['1/2','-3/2','-1/2',1,0,1,0],[1,0,0,0,0,0,1]],b:[0,0,1],c:[-10,57,9,24,0,0,0],B:[4,5,6]};
s=state(cycle,cycle.B,'dantzig');const sequence=[];for(let i=0;i<6;i++){invariant(cycle,s);equal(String(s.theta),'0');sequence.push([s.enter+1,s.leave+1]);s=state(cycle,nextBasis(s),'dantzig');}
equal([...s.B].sort(),[4,5,6]);equal(sequence,[[1,5],[2,6],[3,1],[4,2],[5,3],[6,4]]);
s=state(cycle);const seen=new Set();let i=0;while(s.status!=='optimal' && s.status!=='unbounded' && i<100){const key=[...s.B].sort().join(',');assert(!seen.has(key),'Bland repitió base');seen.add(key);s=state(cycle,nextBasis(s));i++;}equal(s.status,'optimal');equal(String(s.z),'-1');
for(const a of [-1,0,1,2,4,6]){const vals=[0,3*a,2*a+4,6];const cs={...t,c:[-a,-2,0,0]};let u=state(cs);for(let k=0;u.status!=='optimal' && k<10;k++)u=state(cs,nextBasis(u));equal(String(u.z),String(-Math.max(...vals)));}
console.log(`PASS: ${checks} aserciones racionales; bases, fases I/II, signos, empates, paso cero, no acotamiento, parámetros, ciclo de seis pasos y terminación de Bland (${i} pivotes).`);
