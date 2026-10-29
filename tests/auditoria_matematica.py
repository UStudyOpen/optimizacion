# SPDX-FileCopyrightText: 2026 ngulloa
# SPDX-License-Identifier: MIT
"""Independent rational oracle: Cramer's rule versus the shipped JS engine.

Checks supplied models and every nonsingular ordered basis, including degenerate
and infeasible ones. Numerical checks do not certify general theorems or human review.
"""
from fractions import Fraction as F
from itertools import combinations, permutations, product
from pathlib import Path
import subprocess, json, math
ROOT=Path(__file__).resolve().parents[1]
checks=0

def equal(a,b):
    global checks
    assert a==b,(a,b)
    checks+=1

def det(a):
    if len(a)==1: return a[0][0]
    return sum((-1)**j*a[0][j]*det([r[:j]+r[j+1:] for r in a[1:]]) for j in range(len(a)))

def solve(a,b):
    denominator=det(a)
    if not denominator: raise ValueError('singular')
    return [det([r[:j]+[b[i]]+r[j+1:] for i,r in enumerate(a)])/denominator for j in range(len(a))]

def dot(a,b): return sum(x*y for x,y in zip(a,b))

# The JSON bridge executes the actual resource, without reusing its arithmetic in Python.
bridge="""
const M=require('./assets/optimizacion/matematica.js');
const cases={...M.cases,
 fase1:{A:[[2,3,-1,0,1],[1,5,0,1,0]],b:[6,15],c:[0,0,0,0,1]},
 infactible:{A:[[1,-1,0,1],[1,0,1,0]],b:[2,1],c:[0,0,0,1]},
 ciclo:{A:[['1/2','-11/2','-5/2',9,1,0,0],['1/2','-3/2','-1/2',1,0,1,0],[1,0,0,0,0,0,1]],b:[0,0,1],c:[-10,57,9,24,0,0,0]}};
function perm(a){return a.length?a.flatMap((v,i)=>perm(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]]}
const rows=[];
for(const [name,c] of Object.entries(cases)) for(const C of M.combinations(c.c.length,c.b.length)) for(const B of perm(C)){
 let s;try{s=M.analyze(c.A,c.b,c.c,B)}catch(e){rows.push({name,B,singular:true});continue}
 rows.push({name,B,bar:s.bar.map(String),r:s.r.map(String),x:s.x.map(String),z:String(s.z),status:s.status,enter:s.enter,leave:s.leave,theta:s.theta===null?null:String(s.theta),ratios:s.ratios.map(v=>v===null?null:String(v)),direction:s.direction?.map(String)});
}
console.log(JSON.stringify({cases,rows}));
"""
data=json.loads(subprocess.check_output(['node','-e',bridge],cwd=ROOT,text=True))
for row in data['rows']:
    model=data['cases'][row['name']]
    a=[[F(v) for v in r] for r in model['A']]; b=list(map(F,model['b'])); c=list(map(F,model['c'])); B=row['B']; N=[j for j in range(len(c)) if j not in B]
    matrix=[[r[j] for j in B] for r in a]
    equal(row.get('singular',False),det(matrix)==0)
    if not det(matrix): continue
    bar=solve(matrix,b); x=[F(0)]*len(c)
    for i,j in enumerate(B): x[j]=bar[i]
    cols=[solve(matrix,[r[j] for r in a]) for j in N]
    reduced=[c[j]-dot([c[k] for k in B],u) for j,u in zip(N,cols)]
    equal(list(map(F,row['bar'])),bar); equal(list(map(F,row['x'])),x)
    equal(list(map(F,row['r'])),reduced); equal(F(row['z']),dot(c,x))
    equal([dot(r,x) for r in a],b)
    if min(bar)<0: equal(row['status'],'infeasible'); continue
    entering=[j for j,r in zip(N,reduced) if r<0]
    if not entering: equal(row['status'],'optimal'); continue
    j=min(entering); u=cols[N.index(j)]; equal(row['enter'],j)
    ratios=[bar[i]/v if v>0 else None for i,v in enumerate(u)]
    equal([F(v) if v is not None else None for v in row['ratios']],ratios)
    d=[F(0)]*len(c); d[j]=F(1)
    for i,k in enumerate(B): d[k]=-u[i]
    equal(list(map(F,row['direction'])),d);equal([dot(r,d) for r in a],[F(0)]*len(b));equal(dot(c,d),reduced[N.index(j)])
    candidates=[v for v in ratios if v is not None]
    if not candidates:
        equal(row['status'],'unbounded'); equal(all(v>=0 for v in d),True); continue
    theta=min(candidates); leave=min(B[i] for i,v in enumerate(ratios) if v==theta)
    equal(F(row['theta']),theta);equal(row['leave'],leave)
    equal(row['status'],'degenerate' if theta==0 else 'pivot')
    equal(all(v+theta*w>=0 for v,w in zip(x,d)),True)

# Exact equivalence over breakpoints and both logical branches, including boundary cases.
for q in [F(i,4) for i in range(33)]:
    cheap=min(q,F(3)); excess=q-cheap
    equal(2*cheap+5*excess,max(2*q,5*q-9))
    representations=[]
    for y in [0,1]:
        u=q if y==0 else F(3); v=q-u
        if 0<=u<=3 and 0<=v<=5*y and u>=3*y: representations.append(5*u+2*v)
    equal(set(representations),{5*min(q,F(3))+2*max(q-3,F(0))})
for x in [F(i,4) for i in range(-16,29)]:
    feasible=any(x>=2-6*(1-y) and x<=-2+9*y for y in [0,1])
    equal(feasible,abs(x)>=2)
# Carga: dual bound in numerical units, not an addition of physical quantities.
for x in product([F(0),F(1,3),F(2000)],repeat=3):
    equal(3*x[0]+2*x[1]+5*x[2],4*x[0]+8*x[1]+5*x[2]-(x[0]+x[1])-5*x[1])
# Coercive projection and every point on a rational slice of the feasible boundary.
for u in [F(i,7) for i in range(-21,36)]:
    v=2-u
    equal(u*u+v*v-2,(u-v)**2/2)
# Face counts: choose fixed coordinates and their binary values.
for n in range(1,8): equal(sum(math.comb(n,k)*2**k for k in range(n+1)),3**n)
report={'checks':checks,'ordered_bases':len(data['rows']),'models':len(data['cases']),
        'method':'Python Fraction and determinant/Cramer oracle independent of JS Gauss-Jordan',
        'scope':'Examples, directions, signs, Bland ties, infeasible/singular bases, piecewise and disjunctive reformulations; not human academic review'}
p=ROOT/'artifacts/platform/ics1113';p.mkdir(parents=True,exist_ok=True)
(p/'matematica-independiente.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
