# Integración y segunda auditoría ICS1113

29 de octubre de 2026, America/Santiago. Rama `contenido/ics1113-integracion-completa`.
Base remota `bda80f59a5c5bcbf986b149fdaf667f7197dc247`.

## Procedencia, preservación y alcance

Se comprobó el remoto `https://github.com/UStudyOpen/optimizacion.git`, la identidad
ICS1113 de `course.yml` y el permiso ADMIN del usuario autenticado. Se leyeron AGENTS,
MIGRATION, README, PREPARACION, configuración, contratos y los dos workflows existentes.
Tras `fetch`, la refactorización del PR #6 ya estaba integrada en `main`; no hay otra
refactorización abierta que deba publicarse por separado.

El archivo disponible se llama `ICS1113_Optimizacion_Contenido_QMD.zip`, sin `(1)`.
`PROCEDENCIA.json` registra su SHA-256. Se extrajo fuera del repositorio después de
comprobar CRC y seguridad de rutas. Los 20 hashes de `SHA256SUMS.txt` coinciden.
Se revisaron los ocho QMD, tres recursos, matriz, instrucciones, informe, licencia
y pruebas. Los ocho diffs contra el checkout original están en la carpeta externa
`/tmp/ics1113-integracion-npyqOP/`.

El checkout original `contenido/convexidad` tenía cambios sin confirmar en contenido,
documentación y pruebas, además de `.gitignore` y la carpeta del paquete. Se guardó
su diff binario y se trabajó en un worktree separado. El diff original permanece
idéntico. Se incorporaron sus mejoras pertinentes, sin incluir `.gitignore` ni la
carpeta de extracción. **Cada línea no vacía del QMD local de convexidad se conserva**,
incluidos ejemplos, cuatro ejercicios, referencias Boyd y destinos de sus pruebas.
Los desarrollos distintos del paquete se insertaron bajo los H2 correspondientes.

La página 05 es idéntica byte a byte al paquete y al checkout original; no se modifica.
Se conservan los manifiestos de integridad académica, rutas y outline, los 50 H2,
las 67 anclas históricas, las nueve rutas y las cuatro áreas. Las ocho páginas
permanecen `en-desarrollo`, `ustudy-reviewed: false`. No se acredita revisión humana.

## Archivos de la integración

33 archivos seleccionados explícitamente. `A` indica incorporado y `M`, modificado.

```text
M	LICENSING.md
M	PREPARACION.md
M	README.md
M	REUSE.toml
M	_quarto.yml
A	assets/optimizacion/exploradores.css
A	assets/optimizacion/exploradores.js
A	assets/optimizacion/matematica.js
M	course.yml
M	index.qmd
M	lecciones/01-problemas-optimizacion.qmd
M	lecciones/02-convexidad.qmd
M	lecciones/03-modelos-equivalentes.qmd
M	lecciones/04-poliedros.qmd
M	lecciones/06-simplex-fase-i.qmd
M	lecciones/07-simplex-fase-ii.qmd
M	lecciones/08-casos-especiales.qmd
M	licensing.json
M	platform-vendor.json
A	review/ics1113/AUDITORIA_COBERTURA.csv
A	review/ics1113/COBERTURA_ACADEMICA.csv
A	review/ics1113/INFORME.md
A	review/ics1113/LICENCIAS_GENERADAS.json
A	review/ics1113/PROCEDENCIA.json
A	review/ics1113/RESULTADOS.json
M	tests/accessibility_output.py
A	tests/auditoria_matematica.py
M	tests/browser-course.mjs
M	tests/check_site.py
A	tests/convexidad_examples.py
A	tests/exploradores.test.cjs
A	tests/paquete_matematica.py
M	tests/run_course.py
```

## Correcciones respecto del paquete

- En 01, se separa el valor óptimo de la coordenada auxiliar `v` del ejemplo coercivo.
- En 03, `P` y `Q` ya denotan ínfimos: se reemplaza la notación `inf P/inf Q` por
  comparaciones entre esos valores. Se explicitan los multiplicadores con unidades
  en la cota del ejemplo de cargas; la identidad se interpreta en las unidades
  numéricas declaradas, sin sumar toneladas con volumen o dinero.
- En 08, se precisa que es una **recta de nivel**, no una función escalar, la que es
  paralela a una arista. No se cambian coeficientes ni resultados del ciclo.
- Convexidad combina ambos desarrollos, conserva las anclas locales y añade las del
  paquete como destinos explícitos. Incluye la definición de concavidad y enlaces a
  prerrequisitos. Se conservan todos los identificadores bibliográficos y se añaden
  enlaces oficiales verificados a Nemirovski y a la página del libro de Vanderbei.
- Se reemplazan las alusiones internas a `INC…` y al ZIP por explicaciones
  autosuficientes para estudiantes; la matriz original conserva su trazabilidad.
- Los `details/summary` nuevos se convierten en callouts desplegables de Quarto:
  el primer intento detectó contraste 3.24:1 en sus títulos en oscuro. Los textos,
  ejercicios y soluciones se conservan completos.
- Los selectores y rangos usan `form-select` y `form-range` del diseño existente.
  Los controles nativos sin esas clases fallaron el contraste en oscuro (1.18:1).
- Las tablas interactivas tienen foco de teclado; el posprocesado local hace lo
  mismo con las tablas del HTML. La revisión a 320 px detectó una tabla desplazable
  sin foco. Se prueba también el desplazamiento horizontal con flechas.

No se modifican algoritmos matemáticos del motor racional: la segunda comprobación
independiente coincide con sus resultados. El CSS del paquete se conserva sin cambios.
No se reducen contenidos ni se cambia el diseño compartido. Las erratas gramaticales
menores heredadas de 05 quedan conservadas por su protección; no se detectó un error
matemático que justificara alterar ese cuerpo.

## Auditoría matemática y pedagógica

Se revisaron las hipótesis y los argumentos de existencia compacta/coerciva,
convexidad y unicidad, equivalencias en ambos sentidos, unidades y balances,
rango de activas, SBF↔vértice, recesión y representación, identidades matriciales,
Fase I, limpieza de artificiales, signos y pivotes de Fase II, degeneración y ciclaje.
Los ejemplos contienen cotas y puntos que las alcanzan, o certificados de
infactibilidad/no acotamiento, y los ejercicios incluyen soluciones verificables.

`AUDITORIA_COBERTURA.csv` evalúa **41/41 subtemas** contra la exposición incorporada,
con una justificación individual. `COBERTURA_ACADEMICA.csv` conserva la matriz original
sin convertir su declaración en certificación. Solo se normalizan sus finales de línea
a LF; todas las celdas originales se conservan. Los 41 destinos se comprueban en HTML.
La cobertura es satisfactoria para el nivel introductorio descrito, con dos límites
expresos: la prueba estructural general de representación poliedral (fila 20) y la
prueba completa de Bland (fila 36) se remiten a los libros; el sitio proporciona sus
hipótesis, interpretación, aplicaciones y argumentos parciales, no pruebas completas
falsamente anunciadas. La justificación lexicográfica sí se desarrolla.

Se contrastaron fuentes primarias accesibles:

- [Boyd y Vandenberghe](https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf),
  §§3.1.3–3.1.4 y 4.2.2–4.2.3: criterios diferenciales y optimalidad convexa.
- [Nemirovski](https://www2.isye.gatech.edu/~nemirovs/OPTI_LectureNotes.pdf),
  §2.4 y apéndice B.2: representación y resultados de continuidad/compacidad.
- [Cornell OR630](https://people.orie.cornell.edu/miketodd/or630/SimplexCyclingExample.pdf):
  coeficientes y retorno de seis pivotes del ejemplo de ciclaje.
- [Vanderbei, página del autor](https://vanderbei.princeton.edu/LPbook/index.html):
  identificación de la quinta edición y recursos complementarios.

Las localizaciones físicas de los compilados, clases y evaluaciones de la matriz
se conservan como trazabilidad heredada. Esta etapa no vuelve a certificar página
por página todos esos PDF ni redistribuye los libros o escaneos. Tampoco se presenta
el conjunto finito de comprobaciones numéricas como prueba de teoremas generales.

Las comprobaciones ejecutadas incluyen:

- 77 controles racionales del paquete en Python y 174 aserciones del motor en Node;
  ciclo de seis pasos y terminación de Bland en siete pivotes, valor −1.
- 703 controles previos de convexidad conservados.
- 2.768 controles nuevos: Python `Fraction` y determinantes/Cramer comparados con
  Gauss–Jordan del recurso JavaScript, sobre **276 bases ordenadas de ocho modelos**.
  Incluyen bases singulares, infactibles y degeneradas, signos, dirección, costos,
  razones, desempate por índice, reformulaciones binarias y costos por tramos.

## Interacciones y accesibilidad

Se prueban la secante convexa/cóncava, el poliedro parametrizado (vértices y segmentos
óptimos en `a=1` y `a=4`) y los cinco problemas de simplex: transversal, ilimitado,
empate positivo, paso cero y costo nulo bloqueado. Se comprueban las dos bases
infactibles del transversal, recorrido hasta −8, reinicio, cambio de problema y base,
razones y mensajes de terminación. Los controles se prueban con teclado, incluidos
rangos, selectores, botones y tablas desplazables. Se mantienen etiquetas nativas,
tablas con encabezados y SVG con nombres accesibles, y alternativas textuales.

La herramienta Browser se intentó conectar y no encontró navegadores disponibles.
Se utilizó la suite existente del curso con Chromium y sandbox activo, sin modificar
sus herramientas vendor. Se generan capturas de las nueve páginas y de las tres
actividades en 1440, 768, 390 y 320 px, claro y oscuro. El informe de navegador conserva
resultados axe, problemas incompletos y comprobación de consola/red; las capturas se
inspeccionan además visualmente. Una ejecución de Quarto por sí sola no se considera
revisión visual.

Los resultados `incomplete` de axe sobre glifos MathJax requieren interpretación:
no se eliminan ni se contabilizan como aprobaciones automáticas de contraste.
La inspección visual de fórmulas y colores heredados es asistida; no se certifica
accesibilidad completa ni una prueba con lector de pantalla humano.

## Licencias y registros administrados

Los QMD y la matriz/documentación académica usan CC BY-NC 4.0, ngulloa; los recursos
y pruebas originales usan MIT. `licensing.json` registra explícitamente esos recursos.
Se generaron las anotaciones con `licensing.annotations` y el preflight `inspect` de
la herramienta central conservada en `review/optimizacion-2026-10-26/design-source`.
Se inspeccionó el plan completo: proponía también cambiar dos herramientas de navegador
y el workflow de despliegue; **esos cambios se descartaron**. Solo se aplicaron las
anotaciones generadas y la entrada generada `files.REUSE.toml` de `platform-vendor.json`.
Ningún otro hash vendor cambia. No se editan anotaciones ni hashes manualmente.
`artifacts/platform/ics1113/licencias-generacion.json` conserva procedencia y digest
exacto del generador. No se ejecuta una sincronización global.

## Resultados finales y publicación

| Control | Resultado |
| --- | --- |
| CRC, SHA-256 y tres pruebas originales del paquete | Aprobados |
| `python3 tests/licensing.py --reuse` | Aprobado; alcance incremental, sin errores |
| `python3 tests/render_clean.py` | Aprobado; Quarto 1.10.18, nueve HTML |
| `python3 tests/run_course.py` | Aprobado; 3.722 controles matemáticos, diez tests de arranque y 699 comprobaciones de navegador |
| axe-core 4.14.0 | 72 auditorías, cero infracciones; 72 incompletos de contraste conservados |
| `python3 tests/platform_validate.py --release` | Aprobado; nueve rutas y 716 referencias locales |
| `git diff --check` | Aprobado |
| HTTP bajo `/optimizacion/` | Nueve páginas y 31 URL locales distintas: HTTP 200; ver `prefijo-http.json` |
| Enlaces externos de contenido/bibliografía | Cinco destinos con HTTP 200; el DOI redirige al editor, que puede requerir cookies/acceso institucional |
| Preservación | 05, manifiestos académico/rutas/H2 y diff original intactos |

Se emplearon Python 3.14.8, Node 24.21.0, Quarto 1.10.18 y Chromium 156.0.8078.48
con sandbox, más las dependencias legales fijadas. Tras el último ajuste exclusivamente
de prosa se repitieron render, contratos HTML, licencias y release; GitHub valida el
árbol final completo antes de declarar el PR listo.

Se conservan **96 capturas**: 72 de páginas y 24 de actividades. Se inspeccionaron
composiciones de las nueve páginas en los cuatro anchos y ambos temas, con muestras
adicionales de fórmulas, ejemplos y actividades. Menús, tema, búsqueda, navegación,
desplegables, controles, SVG y desplazamiento de tablas se probaron en navegador real.
No hay desbordamiento horizontal del documento; expresiones y tablas largas usan
su desplazamiento interno accesible. Las hojas de contacto y los resultados están en
`artifacts/platform/ics1113/`; las capturas originales, `browser.json` y los resultados
compartidos están en `artifacts/platform/`. Se conservan tres intentos fallidos para
trazar las correcciones de contraste y foco. GitHub Actions conserva su evidencia
mediante el workflow existente durante siete días.

Se prepara un único PR hacia `main`, primero como borrador y después listo para
revisión únicamente si sus checks remotos pasan. No hay publicación nueva ni fusión:
se requiere aprobación explícita del propietario al final. Pages está configurado
para el workflow existente y `main` está protegida; ninguna protección se modifica.
Después de la aprobación habrá que comprobar el despliegue, el commit publicado y
las nueve páginas y actividades de producción. La revisión académica humana sigue
pendiente; los incompletos axe y la ausencia de una prueba humana con lector de
pantalla permanecen documentados. No se conocen errores matemáticos o técnicos
bloqueantes tras esta auditoría asistida.
