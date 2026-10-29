# SPDX-FileCopyrightText: 2026 ngulloa
# SPDX-License-Identifier: MIT
"""Verificación independiente de los ejemplos con Fraction, sin dependencias."""
from fractions import Fraction as F
from itertools import combinations
from pathlib import Path
import json
checks=0
def eq(a,b):
 global checks
 assert a==b,(a,b)
 checks+=1
def solve2(A,b):
 d=A[0][0]*A[1][1]-A[0][1]*A[1][0]
 if not d:return None
 return ((b[0]*A[1][1]-A[0][1]*b[1])/d,(A[0][0]*b[1]-b[0]*A[1][0])/d)
def vertices(rows,rhs):
 out=set()
 for i,j in combinations(range(len(rows)),2):
  x=solve2([rows[i],rows[j]],[rhs[i],rhs[j]])
  if x is not None and all(sum(a*b for a,b in zip(r,x))<=h for r,h in zip(rows,rhs)):out.add(x)
 return out
rows=[(F(1),F(2)),(F(2),F(1)),(F(-1),F(0)),(F(0),F(-1))]
v=vertices(rows,list(map(F,[6,6,0,0])))
eq(v,{(F(0),F(0)),(F(0),F(3)),(F(2),F(2)),(F(3),F(0))})
for a in [F(-1),F(0),F(1),F(2),F(4),F(6)]:
 values={x:a*x[0]+2*x[1] for x in v};best=max(values.values())
 expected=(F(0),F(3)) if a<1 else (F(3),F(0)) if a>4 else (F(2),F(2))
 eq(values[expected],best)
 eq(F(4-a,3)>=0 and F(2*a-2,3)>=0,1<=a<=4)
# Todas las bases del ejemplo, comprobadas por Cramer y no por el motor JS.
A=[[F(1),F(2),F(1),F(0)],[F(2),F(1),F(0),F(1)]]
expected={(0,1):(F(2),F(2)),(0,2):(F(3),F(3)),(0,3):(F(6),F(-6)),(1,2):(F(6),F(-6)),(1,3):(F(3),F(3)),(2,3):(F(6),F(6))}
for B,sol in expected.items():eq(solve2([[A[i][j] for j in B] for i in range(2)],list(map(F,[6,6]))),sol)
# Fase I adaptada y objetivo original.
x1,x2,x3,x4,a=map(F,[0,2,0,5,0])
eq(2*x1+3*x2-x3+a,F(6));eq(x1+5*x2+x4,F(15));eq(8*x1+3*x2,F(6))
# Limpieza de filas, y contraejemplos de semidefinitud.
for t in [F(0),F(1,3),F(1)]:
 x1=1-t;eq(2*x1+2*t,F(2))
eq(F(0)*F(-1),0);eq(F(-1)<0,True)
# Identidad cuadrática de convexidad: prueba algebraica con muestras racionales.
for x in [F(-2),F(0),F(3,2)]:
 for y in [F(-1),F(1),F(4)]:
  for t in [F(0),F(1,3),F(1,2),F(1)]:eq((1-t)*x*x+t*y*y-((1-t)*x+t*y)**2,t*(1-t)*(x-y)**2)
# Modelación: carga, mezcla, inventario y minmax.
eq(4*2000+5*3400,25000);eq(3*2000+5*3400,23000)
eq(F(1,5)*5+F(4,5)*5,F(5));eq(2*5+5*5,35)
eq(0+4-3,1);eq(1+4-5,0);eq(2*4+3*4+F(1,2),F(41,2))
eq(max(abs(2),2*abs(2-3)),2)
# Punto que escapa del ciclo con costo menor.
eq(F(1,2)-F(5,2)+2,F(0));eq(F(1,2)-F(1,2),F(0));eq(-10+9,-1)
# Las tres bases del vértice degenerado tienen determinantes no nulos.
cols=[(1,2,1),(2,1,1),(1,0,0),(0,1,0),(0,0,1)]
def det3(c):
 a,b,d=c
 return a[0]*(b[1]*d[2]-b[2]*d[1])-b[0]*(a[1]*d[2]-a[2]*d[1])+d[0]*(a[1]*b[2]-a[2]*b[1])
for k in [2,3,4]:eq(det3([cols[0],cols[1],cols[k]])!=0,True)
print(f'PASS: {checks} comprobaciones independientes de ejemplos y fórmulas con aritmética racional.')
