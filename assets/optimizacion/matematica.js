// SPDX-FileCopyrightText: 2026 ngulloa
// SPDX-License-Identifier: MIT
// Álgebra racional exacta para ejemplos pequeños; sin tolerancias flotantes.
(function (root) {
  'use strict';
  const abs = n => n < 0n ? -n : n;
  const gcd = (a, b) => { a=abs(a); b=abs(b); while(b) [a,b]=[b,a%b]; return a || 1n; };
  class Q {
    constructor(n, d=1n) {
      if(n instanceof Q) { this.n=n.n; this.d=n.d; return; }
      if(typeof n==='string' && n.includes('/')) { const a=n.split('/'); if(a.length!==2) throw Error('Fracción inválida'); d=BigInt(a[1]); n=BigInt(a[0]); }
      else if(String(n).includes('.')) { const s=String(n); const k=s.length-s.indexOf('.')-1; d=10n**BigInt(k); n=BigInt(s.replace('.','')); }
      else n=BigInt(n);
      d=BigInt(d); if(d===0n) throw Error('División por cero');
      if(d<0n){n=-n;d=-d;} const g=gcd(n,d); this.n=n/g;this.d=d/g;
    }
    add(v){v=q(v);return new Q(this.n*v.d+v.n*this.d,this.d*v.d);}
    neg(){return new Q(-this.n,this.d);}
    sub(v){return this.add(q(v).neg());}
    mul(v){v=q(v);return new Q(this.n*v.n,this.d*v.d);}
    div(v){v=q(v);return new Q(this.n*v.d,this.d*v.n);}
    cmp(v){v=q(v);const d=this.n*v.d-v.n*this.d;return d<0n?-1:d>0n?1:0;}
    toString(){return this.d===1n?String(this.n):`${this.n}/${this.d}`;}
    number(){return Number(this.n)/Number(this.d);}
  }
  const q=v=>v instanceof Q?v:new Q(v);
  const dot=(a,b)=>a.reduce((s,v,i)=>s.add(q(v).mul(b[i])),q(0));
  function inverse(M) {
    const n=M.length;
    if(!n || M.some(r=>r.length!==n)) throw Error('Matriz no cuadrada');
    const a=M.map((r,i)=>[...r.map(q),...Array.from({length:n},(_,j)=>q(i===j?1:0))]);
    for(let k=0;k<n;k++) {
      const p=a.findIndex((r,i)=>i>=k && r[k].cmp(0)!==0);
      if(p<0) throw Error('Base singular');
      [a[k],a[p]]=[a[p],a[k]];
      const pivot=a[k][k]; a[k]=a[k].map(v=>v.div(pivot));
      for(let i=0;i<n;i++) if(i!==k){const f=a[i][k];a[i]=a[i].map((v,j)=>v.sub(f.mul(a[k][j])));}
    }
    return a.map(r=>r.slice(n));
  }
  const matvec=(M,v)=>M.map(r=>dot(r,v));
  function analyze(A0,b0,c0,B0,rule='bland') {
    const A=A0.map(r=>r.map(q)),b=b0.map(q),c=c0.map(q),B=[...B0];
    if(A.length!==b.length || B.length!==b.length || new Set(B).size!==B.length || A.some(r=>r.length!==c.length) || B.some(j=>j<0 || j>=c.length)) throw Error('Dimensiones o base inválidas');
    const N=c.map((_,j)=>j).filter(j=>!B.includes(j));
    const inv=inverse(A.map(row=>B.map(j=>row[j])));
    const bar=matvec(inv,b),cols=N.map(j=>matvec(inv,A.map(r=>r[j])));
    const r=N.map((j,k)=>c[j].sub(dot(B.map(i=>c[i]),cols[k])));
    const x=c.map(()=>q(0));B.forEach((j,i)=>x[j]=bar[i]);
    const result={B,N,inv,bar,cols,r,x,z:dot(c,x),status:'infeasible',enter:null,leave:null,theta:null,ratios:[],ties:[],direction:null};
    if(bar.some(v=>v.cmp(0)<0)) return result;
    const improve=N.filter((j,k)=>r[k].cmp(0)<0);
    if(!improve.length){result.status='optimal';return result;}
    let enter=improve[0];
    if(rule==='dantzig') for(const j of improve) if(r[N.indexOf(j)].cmp(r[N.indexOf(enter)])<0) enter=j;
    const u=cols[N.indexOf(enter)];
    const ratios=u.map((v,i)=>v.cmp(0)>0?bar[i].div(v):null);
    const direction=c.map(()=>q(0));direction[enter]=q(1);B.forEach((j,i)=>direction[j]=u[i].neg());
    Object.assign(result,{enter,ratios,direction});
    const finite=ratios.filter(v=>v!==null);
    if(!finite.length){result.status='unbounded';return result;}
    const theta=finite.reduce((m,v)=>v.cmp(m)<0?v:m);
    const ties=B.filter((_,i)=>ratios[i]!==null && ratios[i].cmp(theta)===0);
    Object.assign(result,{status:theta.cmp(0)===0?'degenerate':'pivot',theta,ties,leave:Math.min(...ties)});
    return result;
  }
  function nextBasis(s){ if(s.leave===null) return [...s.B]; return s.B.map(j=>j===s.leave?s.enter:j); }
  function combinations(n,m){const out=[];function rec(a,k){if(a.length===m){out.push(a);return;}for(let j=k;j<n;j++) rec([...a,j],j+1);}rec([],0);return out;}
  const cases={
    transversal:{name:'Problema transversal',A:[[1,2,1,0],[2,1,0,1]],b:[6,6],c:[-2,-2,0,0],B:[2,3],description:'min −2x₁−2x₂; x₁+2x₂+x₃=6; 2x₁+x₂+x₄=6; x≥0.'},
    noacotado:{name:'Dirección ilimitada',A:[[1,-1]],b:[1],c:[-1,0],B:[0],description:'min −x₁; x₁−x₂=1; x≥0.'},
    empate:{name:'Empate positivo',A:[[1,1,0],[1,0,1]],b:[1,1],c:[-1,0,0],B:[1,2],description:'min −x₁; x₁+x₂=1; x₁+x₃=1; x≥0.'},
    degenerado:{name:'Paso cero y mejora posterior',A:[[1,-1,1,0],[0,1,0,1]],b:[0,1],c:[-1,-1,0,0],B:[2,3],description:'min −x₁−x₂; x₁−x₂+x₃=0; x₂+x₄=1; x≥0.'},
    cerobloqueado:{name:'Costo nulo con óptimo único',A:[[1,1]],b:[0],c:[0,0],B:[0],description:'min 0; x₁+x₂=0; x≥0. Solo existe el origen; el costo nulo no prueba otro punto.'}
  };
  root.UStudyOpti={Q,q,dot,inverse,matvec,analyze,nextBasis,combinations,cases};
  if(typeof module!=='undefined' && module.exports) module.exports=root.UStudyOpti;
})(globalThis);
