# Convenciones UStudyOpen · Optimización

## Alcance y estructura

Modificar solo este repositorio y preservar cambios locales previos. No crear commits,
push, tags, releases, PR, merges, cambios remotos ni despliegues sin autorización expresa.
Trabajar en una rama específica; no habilitar auto-merge ni alterar protecciones.

El registro es `course.yml` (JSON válido como YAML, sin parser adicional). Su clave
`course.units` es el contrato de plataforma para **áreas temáticas**, no unidades
numeradas. `tests/outline.json` conserva el área, título, ruta y subtítulos de cada tema:

- Fundamentos de optimización: problemas y existencia; convexidad.
- Modelación y reformulación: modelos equivalentes y variables auxiliares.
- Geometría de la programación lineal: poliedros, vértices y soluciones óptimas.
- Algoritmo Simplex: fundamentos algebraicos, Fase I, Fase II y casos especiales.

Los ocho QMD actuales están en `lecciones/`: sus nombres numerados son rutas públicas
compatibles, no una secuencia pedagógica. No renombrarlos por estética. Para una página
nueva autorizada, preferir un slug conceptual en el directorio temático correspondiente
(`fundamentos/`, `modelacion/`, `geometria/` o `simplex/`), sin crear índices vacíos.
Clasificar por concepto principal; enlazar los prerrequisitos en lugar de duplicarlos.
No añadir temas fuera del encargo. Véase `MIGRATION.md` para las rutas conservadas.

## Edición académica

Metadatos mínimos: `title` conceptual sin «Unidad/Lección N», `toc: true`,
`ustudy-status` y `ustudy-reviewed`. Usar títulos entre comillas. Al comenzar una
redacción, pasar de `proximamente` a `en-desarrollo`, retirar el aviso pendiente y
mantener `ustudy-reviewed: false`. `lista` y `reviewed: true` requieren revisión
académica humana documentada; una compilación nunca la acredita.

Mantener juntos: QMD, `course.pages` (título, ruta, estado, revisión),
`course.units` (área y enlace), `course.first_page`, `_quarto.yml` (render y sidebar),
`index.qmd` (enlaces, indicadores y resumen) y `tests/outline.json` (subtítulos).
No cambiar estados de otras páginas. Al añadir una ruta, registrar su licencia en
`licensing.json` y generar las anotaciones mediante la herramienta central aprobada;
no editar a mano `REUSE.toml` ni hashes vendor. No ejecutar sincronizaciones globales
para resolver un cambio editorial local.

Desarrollar debajo de los encabezados existentes; si la estructura cambia con motivo
académico, revisar y actualizar explícitamente el contrato de subtítulos. Para material
nuevo: objetivos, definiciones con hipótesis y notación, ejemplos, ejercicios, síntesis,
enlaces relacionados y referencias según correspondan. No convertir material existente
en placeholders ni copiar otros cursos. Usar `$…$` y `$$…$$` para matemáticas; conservar
anclas estables y fijar identificadores explícitos en encabezados nuevos enlazables.

La bibliografía actual está en `references` de `course.yml`; citar con `[@clave]`,
localizaciones verificables y `::: {#refs}`. No inventar fuentes ni importar libros.
Contenido original: ngulloa, CC BY-NC 4.0. Mantener atribuciones y avisos de terceros;
no alterar políticas legales. Usar componentes UStudyOpen Design (`uso-hero`,
`topic-grid`, `topic-card`, `uso-example`, `uso-summary`, callouts). Figuras con texto
alternativo, fuente y licencia. Actividades autorizadas: geometría y lógica en el curso,
recursos en `assets/`, declarados en `project.resources`, teclado, ambos temas y móvil;
probar su comportamiento matemático sin añadir dependencias innecesarias.

## Integridad y herramientas compartidas

Preservar rutas, anclas, fórmulas y bibliografía. `tests/route-baseline.json` protege las
nueve rutas y anclas anteriores, incluidas las anclas de portada conservadas como alias.
`tests/academic-integrity.json` protege el cuerpo original del Simplex de `4f5254d`:
es una referencia técnica, **no** una revisión humana. No recalcularlo para silenciar
fallos. Si un encargo modifica deliberadamente ese cuerpo, revisar el diff matemático,
justificar el cambio y actualizar la referencia de manera explícita y revisable.

No editar `_extensions/`, los archivos enumerados en `platform-vendor.json` ni
`REUSE.toml`: se administran desde UStudyOpen Design. No modificar otros repositorios.
Los tests locales son `check_site.py`, `browser-course.mjs` y
`accessibility_output.py`; los workflows compartidos ya ejecutan la suite del curso.
No duplicar CI ni agregar CSS/JS cuando exista un componente compartido.

Quarto 1.10.18, Python 3.14.8, Node 24.21.0 y Chromium con sandbox activo. Salida
`_site/`; evidencias `artifacts/platform/`, ambas ignoradas. No generar ni eliminar
`docs/` si aparece: puede contener publicación histórica. No borrar residuos locales
sin comprobar su procedencia. La instalación reproducible está en `README.md`.

## Antes de proponer cambios

```sh
python3 tests/licensing.py --reuse
python3 tests/render_clean.py
python3 tests/run_course.py
python3 tests/platform_validate.py --release
git diff --check
```

Revisar diff, `git status`, los estados y las capturas de escritorio/tablet/móvil en
ambos temas. Informar fallos, controles no ejecutados e incompletos de axe; no desactivar
controles para pasar. Revisar el cuerpo y los tests al añadir fórmulas o interactividad.
`README.md` contiene el procedimiento y la plantilla de PR; `PREPARACION.md`, la evidencia
local de la consolidación. La autorización histórica de Pages no autoriza las operaciones
remotas de una tarea nueva.
