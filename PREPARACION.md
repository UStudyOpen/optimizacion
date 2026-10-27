# Preparación técnica de Optimización

## Publicación autorizada — 27 de octubre de 2026

El propietario autorizó commits, PR, merge y publicación del curso y, tras verificarlo públicamente, su incorporación al catálogo. La Sección 05 contiene el primer desarrollo académico y mantiene `en-desarrollo`, revisión `false`; las otras siete lecciones siguen `proximamente`. La portada y README reflejan esta situación. No se cambian algoritmos, demostraciones ni licencias.

Pages usa origen GitHub Actions y `_site/`, con `main` protegido y el entorno `github-pages` limitado explícitamente a `main`, conservando su revisor requerido y sin bypass administrativo. El workflow ya preparado comprueba el SHA, autorización, licencias, render, regresiones y recursos antes de publicar. La variable `USO_PAGES_ENABLED=true` se activa antes del merge aprobado para permitir el primer despliegue por push; sigue disponible `workflow_dispatch` con `PUBLICAR`. No se usa `docs/` ni `gh-pages`.

Las secciones siguientes conservan el registro histórico de la preparación inicial; sus estados pendientes describen aquel momento.

## Alcance

Cinco unidades, ocho QMD y 49 encabezados de subsecciones tomados exclusivamente del índice autorizado. La portada presenta el curso y su estado; las lecciones solo contienen metadatos, aviso pendiente y encabezados. No se ha redactado material académico. Todas las páginas tienen revisión académica `false`.

La creación se realizó con `gh repo create --public --template UStudyOpen/ustudyopen-template --clone`, copiando únicamente `main`. El commit inicial independiente es `753099a`; la plantilla inspeccionada es `ff83f27`. La configuración legal se obtuvo con `tooling/create_course.py` en un directorio temporal, se aplicó al clon preservando `.git` y se sincronizó desde Diseño `107202007aa37a19814ce20992724157e45914fe`. No se modificó el sistema central ni los cursos existentes.

## Publicación pendiente

1. Revisar el PR y sus evidencias; autorizar por separado su integración. Este PR no se integra automáticamente.
2. Antes de publicar, verificar nuevamente la portada, ocho lecciones, estados pendientes, licencias y sitio compilado. No hace falta declarar revisión académica para publicar estructura pendiente.
3. Obtener autorización explícita del propietario para publicar y comprobar que la organización permita GitHub Pages. Pages no fue creado ni habilitado durante la preparación.
4. Con autorización, configurar Pages con origen GitHub Actions. Mantener la protección de `main`, el entorno `github-pages` restringido a ramas protegidas y su revisor requerido. `pages_automation_approved: true` solo prepara el trigger futuro; `USO_PAGES_ENABLED=false` sigue bloqueando todos los despliegues.
5. Establecer `USO_PAGES_ENABLED=true` únicamente tras la autorización. Al estar el PR ya integrado, ejecutar `deploy.yml` manualmente sobre `main`, con `confirm=PUBLICAR`, y aprobar el entorno. Los siguientes merges aprobados a `main` desplegarán automáticamente mientras esté habilitada la variable. El workflow verifica el SHA exacto y rechaza commits superados.
6. Verificar respuesta HTTP satisfactoria, rutas de las ocho lecciones y recursos en `https://ustudyopen.github.io/optimizacion/` antes de incorporar el catálogo. Para suspender publicación futura, volver a poner `USO_PAGES_ENABLED=false`.

## Incorporación posterior al portal

El formato real de `ustudyopen.github.io/data/catalog.json` usa `schema: 1` y una lista `courses`. Su validador **solo admite `publication: publicado`** y exige una instantánea de `course.yml` fijada a un commit público y SHA-256. El estado académico es independiente: Optimización debe conservar **`academic_status: en-desarrollo`**, con ocho lecciones `proximamente` y ninguna revisada mientras no cambie su contenido. No existe una tarjeta enlazable segura antes de publicar.

Una vez publicado y verificado el curso, preparar un PR independiente en el portal, usando su herramienta existente desde una rama nueva:

```sh
python3 tools/catalog.py \
  --import-course ../optimizacion \
  --area Matemáticas \
  --summary 'Fundamentos de optimización matemática y programación lineal.' \
  --generate
python3 tools/catalog.py --verify-sources
python3 tests/render_clean.py
python3 tests/validate.py
python3 tests/licensing.py --reuse
```

El checkout de Optimización debe estar limpio y situado en el commit de `main` efectivamente publicado. `tools/catalog.py` incorporará `slug: optimizacion`, nombre, URL, `publication: publicado`, `academic_status: en-desarrollo`, repositorio, commit, SHA-256 y proyección de metadatos. La propia herramienta verifica origen público y disponibilidad antes de escribir. Revisar el diff para confirmar que las tres entradas existentes mantienen sus datos y estados. No integrar ese PR sin autorización.

No se modifica ahora el catálogo ni se agrega un enlace al curso todavía inexistente. El PR posterior está documentado y depende de una publicación autorizada y verificada.

## Estructura definitiva

```text
optimizacion/
├── .github/workflows/{validate,deploy}.yml
├── _extensions/ustudyopen-design/    # copia administrada
├── lecciones/                       # ocho QMD pendientes
├── styles/README.md                 # convención heredada; sin tema local
├── tests/                           # validadores y contrato editorial
│   ├── outline.json
│   ├── check_site.py
│   ├── browser-course.mjs
│   ├── academic-integrity.json       # vacío: sin referencia académica
│   └── route-baseline.json           # vacío: sin rutas históricas
├── LICENSES/                        # textos y avisos completos
├── _quarto.yml
├── course.yml
├── index.qmd
├── licensing.json
├── REUSE.toml
├── design-vendor.json
├── platform-vendor.json
├── LICENSE
├── LICENSING.md
├── THIRD-PARTY-NOTICES.md
├── README.md
├── PREPARACION.md
├── AGENTS.md
└── MIGRATION.md
```

`_site/` y `artifacts/platform/` son salidas locales ignoradas por Git. No hay carpeta `docs/`, bibliografía ni actividades heredadas de ejemplo.

## Índice editorial autorizado

### Unidad I — Fundamentos de optimización

**Lección 1: Problemas de optimización y existencia de soluciones** — `lecciones/01-problemas-optimizacion.qmd`

1. Formulación general: variables, función objetivo y restricciones.
2. Factibilidad, valor óptimo y conjunto de soluciones.
3. Óptimos locales y globales.
4. Existencia: continuidad, compacidad y coercividad.
5. Infactibilidad, no acotamiento e ínfimos no alcanzados.

**Lección 2: Convexidad, optimalidad global y unicidad** — `lecciones/02-convexidad.qmd`

1. Conjuntos convexos y combinaciones convexas.
2. Funciones convexas y estrictamente convexas.
3. Criterios de convexidad: definición, gradiente y Hessiano.
4. Óptimos locales y globales.
5. Condiciones de unicidad y contraejemplos.

### Unidad II — Reformulación de modelos

**Lección 3: Modelos equivalentes y variables auxiliares** — `lecciones/03-modelos-equivalentes.qmd`

1. Definición de equivalencia.
2. Preservación de valores y soluciones óptimas.
3. Reformulaciones mediante epígrafos.
4. Valores absolutos y máximos de funciones.
5. Variables auxiliares.
6. Demostración y verificación de equivalencias.

### Unidad III — Geometría de la programación lineal

**Lección 4: Poliedros, vértices y soluciones óptimas** — `lecciones/04-poliedros.qmd`

1. Programación lineal y representación geométrica.
2. Semiespacios y poliedros.
3. Vértices y restricciones activas.
4. Independencia lineal y puntos extremos.
5. Direcciones y conos de recesión.
6. Existencia y geometría del conjunto óptimo.

### Unidad IV — Método Simplex

**Lección 5: Fundamentos algebraicos del Simplex** — `lecciones/05-fundamentos-simplex.qmd`

1. Forma estándar.
2. Variables de holgura y exceso.
3. Bases, variables básicas y no básicas.
4. Soluciones básicas factibles.
5. Diccionario, matrices y costos reducidos.
6. Pivoteo y funcionamiento general del método.

**Lección 6: Simplex — Fase I** — `lecciones/06-simplex-fase-i.qmd`

1. Necesidad de una base inicial factible.
2. Variables artificiales.
3. Construcción del problema auxiliar.
4. Iteraciones de Fase I.
5. Criterio de infactibilidad.
6. Eliminación de variables artificiales.
7. Transición a Fase II.

**Lección 7: Simplex — Fase II** — `lecciones/07-simplex-fase-ii.qmd`

1. Recuperación del problema original.
2. Costos reducidos y optimalidad.
3. Selección de variable entrante.
4. Variable saliente y prueba de razón mínima.
5. Actualización de la base.
6. Terminación y detección de no acotamiento.
7. Ejecución completa del algoritmo.

### Unidad V — Casos especiales del Simplex

**Lección 8: Soluciones múltiples, degeneración y ciclos** — `lecciones/08-casos-especiales.qmd`

1. Soluciones óptimas múltiples.
2. Costos reducidos nulos.
3. Degeneración geométrica y algebraica.
4. Pivotes degenerados.
5. Posibilidad de ciclos.
6. Reglas anticiclaje y regla de Bland.
7. Diagnóstico de casos especiales.

## Verificaciones de preparación

- Render aislado completo: Quarto 1.10.18, nueve HTML en `_site/` (portada y ocho lecciones).
- Contrato editorial: cinco unidades, ocho títulos, 49 subsecciones y navegación concordantes. Todos los registros tienen `reviewed: false`; lecciones `proximamente`, portada y curso `en-desarrollo`.
- Validación de salida: 479 referencias locales, recursos CSS, índice de búsqueda, enlaces legales e integridad de manifiestos, sin errores.
- Licencias: `tests/licensing.py --reuse` pasa dentro del alcance incremental definido centralmente; no se afirma REUSE completo de la deuda histórica. El código legal completo permanece en `LICENSES/`; el `LICENSE` raíz conserva el texto CC con un único salto de línea final.
- `actionlint` y `git diff --check`: sin errores.
- Navegador Chromium aislado: 221 comprobaciones y 72 auditorías axe-core 4.14.0 (nueve páginas × dos temas × cuatro anchos: 1440, 768, 390 y 320 px), sin infracciones detectadas. Búsqueda por «coercividad», selector de tema por teclado, persistencia y siguiente lección comprobados.
- Axe deja comprobaciones de contraste como `incomplete` en cada auditoría, por ejemplo sobre el elemento activo de navegación. Se conservan sus nodos para revisión humana en `artifacts/platform/browser.json`; cero infracciones automáticas no acredita accesibilidad completa. Capturas de portada revisadas visualmente en escritorio y móvil.
- Los nombres de las regiones de navegación y del aviso legal se completan mediante posprocesado local. La prueba espera que terminen las transiciones de tema antes de medir contraste. No se modificó ninguna copia administrada del diseño.
- Publicación: Pages sin configurar, `USO_PAGES_ENABLED=false`; pruebas de autorización rechazan push y ejecución manual con la variable deshabilitada, PR, ramas distintas de `main` y confirmaciones ausentes. El único modo automático preparado es push a `main` protegido, habilitado posteriormente por autorización.

Evidencias locales: `artifacts/platform/{source.json,validation.json,render.log,browser.json,portada-light-1440.png,portada-dark-1440.png,portada-light-390.png,portada-dark-390.png}`. El workflow conserva esas evidencias en el artefacto `validation-evidence` por siete días. Su ejecución valida aspectos técnicos y nunca acredita revisión académica.
