# UStudyOpen-Original-Authorized
# SPDX-FileCopyrightText: 2026 ngulloa
# SPDX-License-Identifier: MIT
"""Independent exact-arithmetic audit of the authored examples, not a theorem prover."""
from fractions import Fraction as F
from itertools import product
from pathlib import Path
import json

checks=0

def verify(condition):
    global checks
    assert condition
    checks+=1

def q(u,v,a=F(1,2)):
    return u*u+2*a*u*v+v*v

values=[F(-3),F(-1,2),F(0),F(2),F(7,3)]
weights=[F(0),F(1,4),F(1,2),F(3,4),F(1)]
for a,b,t in product(values,values,weights):
    gap=(1-t)*a*a+t*b*b-((1-t)*a+t*b)**2
    verify(gap==t*(1-t)*(a-b)**2)
    verify(gap>=0)
    if a!=b and 0<t<1:
        verify(gap>0)

x,y=(F(1),F(1)),(F(3),F(0))
z=tuple(F(1,4)*a+F(3,4)*b for a,b in zip(x,y))
verify(z==(F(5,2),F(1,4)))
verify(sum(z)==F(11,4))
points=[(F(0),F(0)),(F(1),F(1)),(F(3),F(0)),(F(0),F(5)),(F(2),F(3))]
for x,y,t in product(points,points,weights):
    z=tuple((1-t)*a+t*b for a,b in zip(x,y))
    verify(min(z)>=0 and sum(z)<=5)

# Recover the stated Hessian independently from exact centered differences.
h=F(1,3)
for u,v in product(values,values):
    verify((q(u+h,v)-2*q(u,v)+q(u-h,v))/h**2==2)
    verify((q(u,v+h)-2*q(u,v)+q(u,v-h))/h**2==2)
    mixed=(q(u+h,v+h)-q(u+h,v-h)-q(u-h,v+h)+q(u-h,v-h))/(4*h*h)
    verify(mixed==1)
    verify(q(u,v)==((u+v)**2+u*u+v*v)/2)
    verify(2*u*u+2*u*v+2*v*v==(u+v)**2+u*u+v*v)
    if (u,v)!=(0,0):
        verify(q(u,v)>0)
verify(2+2-8==-4)
verify(q(1,-1,F(2))==F(-2))

# The parameterized exercise: eigenvectors, null lines and rays of descent.
for a in [F(-2),F(-1),F(-1,2),F(0),F(1,2),F(1),F(2)]:
    for w,eigenvalue in [((F(1),F(1)),2*(1+a)),((F(1),F(-1)),2*(1-a))]:
        image=(2*w[0]+2*a*w[1],2*a*w[0]+2*w[1])
        verify(image==tuple(eigenvalue*x for x in w))
    if abs(a)<1:
        verify(all(q(u,v,a)>0 for u,v in product(values,values) if (u,v)!=(0,0)))
    if a==1:
        verify(all(q(t,-t,a)==0 for t in values))
    if a==-1:
        verify(all(q(t,t,a)==0 for t in values))
    if abs(a)>1:
        sign=1 if a>0 else -1
        for t in [F(1),F(2),F(10)]:
            verify(q(t,-sign*t,a)==2*(1-abs(a))*t*t<0)

for target,upper,value,gradient in [(F(3),F(2),F(1),F(-2)),(F(4),F(1),F(9),F(-6))]:
    verify((upper-target)**2==value)
    verify(2*(upper-target)==gradient!=0)
    for k in range(21):
        y=upper*F(k,20)
        verify((y-target)**2>=value)
        verify(gradient*(y-upper)>=0)
verify((-2)**2==4>1**2)
verify((-1)**2==1**2)
result={'exact_rational_checks':checks,'errors':[],
        'scope':'Original numeric examples, polynomial identities, Hessians and exercise results; not human academic review or proof of general theorems.'}
evidence=Path(__file__).resolve().parents[1]/'artifacts/platform/convexidad'
evidence.mkdir(parents=True,exist_ok=True)
(evidence/'revision_matematica.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
