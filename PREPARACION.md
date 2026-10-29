# Preparación editorial y verificación local

Fecha: **28 de octubre de 2026**, America/Santiago. Base: `4f5254d`.
Rama de la consolidación inicial: `refactor/arquitectura-tematica`. Las secciones
siguientes registran esa etapa local, antes de la autorización posterior de commit,
push y PR. La etapa posterior de convexidad y la integración completa se documentan en las secciones finales.

## Resultado arquitectónico

Cuatro áreas, ocho temas y 50 subsecciones conservadas. Siete páginas mantienen
`proximamente`; Fundamentos algebraicos del Simplex permanece `en-desarrollo`.
Portada y curso siguen `en-desarrollo`; las nueve páginas conservan `reviewed: false`.
No se añade contenido matemático. El cuerpo desarrollado del Simplex es idéntico al
original; en las otras siete páginas solo cambia el término «lección» del aviso pendiente.

`MIGRATION.md` contiene el árbol, la correspondencia de títulos/rutas y la justificación
para mantener los ocho archivos en `lecciones/`. La portada conserva las anclas antiguas
como alias y presenta cuatro tarjetas conceptuales. Se reutilizan los componentes
compartidos, sin CSS, JavaScript, dependencias versionadas ni workflows nuevos.

`AGENTS.md` define ubicación, metadatos, estados, bibliografía, recursos, licencias,
rutas y validaciones. `README.md` incluye el ejemplo de convexidad, instalación,
procedimiento de rama/validación y una plantilla de PR que se guarda en `artifacts/pr.md`
al preparar una contribución. Se reutiliza CI; no se crea infraestructura editorial extra.

## Diagnóstico inicial reproducido

| Control inicial | Resultado |
| --- | --- |
| `python3 tests/licensing.py --reuse` | Pasa, alcance incremental existente |
| `python3 tests/render_clean.py` | Pasa, nueve HTML con Quarto 1.10.18 |
| `python3 tests/run_course.py` | Pasa, 245 comprobaciones y 72 auditorías de navegador |
| `python3 tests/platform_validate.py --release` | Pasa, sin errores |

Las 72 auditorías iniciales tienen resultados `incomplete`, conservados para comparación;
no equivalen a infracciones ni a una revisión de accesibilidad completa. La documentación
anterior describía 49 subtítulos y una actividad interactiva inexistente; el inventario
real contiene 50 subtítulos H2 y ningún script de actividad. Se corrigen esas afirmaciones.

## Evidencia y controles finales

| Control final | Resultado |
| --- | --- |
| `python3 tests/licensing.py --reuse` | Pasa; alcance incremental, políticas y licencias sin cambios |
| `python3 tests/render_clean.py` | Pasa; nueve HTML y validación aislada correcta |
| `python3 tests/run_course.py` | Pasa; cuatro áreas, ocho temas, 50 subtítulos, 323 comprobaciones de navegador |
| Auditorías axe-core 4.14.0 | 72 auditorías, cero infracciones; 72 `incomplete` de `color-contrast` |
| `python3 tests/platform_validate.py --release` | Pasa; 498 referencias locales, nueve rutas históricas y recursos correctos |
| Prueba HTTP local bajo `/optimizacion/` | 31 URL distintas con HTTP 200, sin escape del prefijo |
| Comparación de textos y workspace | Ocho cuerpos preservados; seis repositorios de referencia intactos |
| `git diff --check` y revisión final | Sin errores de espacios ni modificaciones ajenas al alcance |

Suite inicial: 245 comprobaciones; final: 323, manteniendo las 72 auditorías y sin
reducir cobertura. Se añaden comprobaciones de agrupación temática, página activa, menú
móvil con teclado/clic, anterior/siguiente y anclas de portada. En un primer intento,
la prueba nueva de página activa no contemplaba que Quarto normaliza `index.html` a la
ruta del directorio; se corrigió la comparación de URL y la ejecución completa pasó.
Se conservan `course-attempt-1.log` y `browser-attempt-1.json` en las evidencias.

Se inspeccionaron las capturas de portada en escritorio, tablet y teléfono (incluido
320 px), en ambos temas, y fragmentos legibles de Simplex en 1440, 768 y 390 px.
Tarjetas, indicadores, página activa, tipografía, ejemplos y fórmulas conservan el diseño
compartido. Las expresiones largas usan el desplazamiento horizontal interno heredado,
sin desbordar el documento. No se acredita una auditoría completa de accesibilidad:
los incompletos de contraste de axe siguen pendientes de evaluación humana exhaustiva.
Tampoco se verifica producción ni la configuración remota de Pages en esta ejecución.

Evidencias locales, ignoradas por Git, en `artifacts/platform/` y
`artifacts/platform/refactor/`:

- `refactor/baseline-{licensing,render,release,course}.log`, `baseline-browser.json` y
  `baseline-validation.json`: referencia previa a modificar las fuentes.
- `refactor/academic-before.json`, `anchors-before.json` y `preservation.json`:
  comparación de los ocho textos, estados, rutas y anclas.
- `source.json`, `validation.json`, `render.log` y `isolated-validation.log`:
  integridad, dependencias, salida y enlaces verificados por la plataforma compartida.
- `browser.json`, `browser.log` y `refactor/final-course.log`: suite de navegador actual.
- `portada-{light,dark}-{1440,768,390,320}.png` y
  `simplex-{light,dark}-{1440,768,390,320}.png`: inspección visual de portada y matemáticas.
- `refactor/prefix-http.json`: prueba HTTP de los HTML y recursos bajo `/optimizacion/`.
- `refactor/workspace-before.json` y `workspace-comparison.json`: estado previo de los repositorios
  y comprobación de que no se alteraron archivos ajenos a Optimización.

El entorno local utiliza Quarto 1.10.18 y Python 3.14.8 instalados; Node 24.21.0 se utiliza
por su ruta existente en `review/automatizacion-2026-10-26/tools/`, sin modificarla.
Las dependencias legales fijadas se instalan en `.venv/` de este repositorio, ignorada.
El navegador integrado no está conectado; la suite propia sí puede usar Brave/Chromium
headless con perfil efímero y sandbox activo. No se desactivan controles.

## Integridad y limpieza

Los archivos de diseño, plataforma, licencias, REUSE y workflows permanecen intactos.
Los manifiestos académico y de rutas antes vacíos se inicializan desde el contenido y
render **anteriores** a los cambios; no se recalculan valores previos para ocultar fallos.
La referencia académica es técnica y no acredita revisión humana.

No se eliminan ni mueven archivos: no se identificó ningún archivo versionado cuya
eliminación fuera necesaria. Se actualiza documentación desfasada dentro de sus archivos.
Las salidas ignoradas preexistentes se conservan; el render renueva solo `_site/`.
No existe `docs/` en el checkout y no se crea. El cambio previo de `.gitignore`
(`**/*.quarto_ipynb`) permanece intacto y no pertenece a esta refactorización.

## Operaciones que requieren autorización

No se crean commits, push, PR, merges ni despliegues; tampoco se cambian secretos,
variables, protecciones, entornos ni el portal. La rama local tiene el mismo HEAD que la
base. Preparar las instrucciones de PR no autoriza ejecutarlas. La autenticación de `gh`
y los permisos remotos no se comprueban; el propietario puede verificar `gh auth status`
y autenticar su cuenta con el procedimiento de `README.md` al autorizar la publicación
de una contribución. Mantener revisión humana del diff y controles obligatorios.

## Registro histórico conservado

La preparación inicial utilizó GitHub Template (`753099a`, plantilla `ff83f27`) y la
herramienta central desde Diseño `107202007aa37a19814ce20992724157e45914fe`, sin copiar
contenido de otros cursos. El registro anterior documentó autorización del propietario
el 27 de octubre para publicar el curso e incorporarlo al catálogo, y publicación desde
GitHub Actions hacia `_site/`. Es antecedente histórico, no una comprobación remota actual
ni autorización para esta tarea. Se retiran las instrucciones de activación pendientes
y las recomendaciones de cambiar protecciones heredadas de la plantilla.

Para iniciar el desarrollo académico siguiente, aplicar el ejemplo de convexidad de
`README.md`: editar su QMD, sincronizar estado/portada, validar y preparar el diff revisable.


## Desarrollo de convexidad · etapa posterior autorizada

El propietario autorizó tramitar la refactorización y desarrollar convexidad. Se creó
el commit de refactorización `180e94b`, actualizado sobre `main` (`d77103d`) para conservar
las correcciones de arranque de Chromium y clics en citas. La suite posterior pasó con
324 comprobaciones de navegador y 72 auditorías; GitHub aprobó `Validate course` en el
[PR #6](https://github.com/UStudyOpen/optimizacion/pull/6). No se integra ni se despliega.
El cambio preexistente de `.gitignore` permanece fuera de los commits.

Convexidad se desarrolla en `contenido/convexidad`, derivada de la rama del PR #6 para
mantener un diff independiente de contenido. Su PR se prepara con esa base y depende
de la integración de #6; después debe cambiarse la base a `main`, conservando la revisión
y sin activar auto-merge. La autorización no modifica las protecciones del repositorio.

`lecciones/02-convexidad.qmd` conserva sus cinco H2 y sus anclas. Añade definiciones,
demostraciones breves, ejemplos originales, criterios diferenciales con sus hipótesis,
contraejemplos y cuatro ejercicios con orientaciones desplegables. La bibliografía añade
Boyd y Vandenberghe (2004), *Convex Optimization*, con enlace a la página oficial de los
autores y localizaciones en las secciones 2.1, 3.1 y 4.2. No se incorporan figuras,
ejercicios ni archivos del libro. El contenido y las licencias de las demás páginas se
preservan; el cuerpo del Simplex conserva su referencia de integridad.

QMD, registro, portada y README reflejan dos temas `en-desarrollo` y seis `proximamente`.
Todas las páginas mantienen `reviewed: false`. Los encabezados principales no cambian,
por lo que el contrato de `tests/outline.json` y las anclas históricas no se regeneran.
Los nuevos encabezados secundarios tienen identificadores explícitos.

Las identidades cuadráticas, Hessianos, combinaciones convexas, criterios de frontera y
resultados de los ejercicios pasan 703 comprobaciones con fracciones exactas. La revisión
se reproduce con `python3 tests/convexidad_examples.py`, integrado en la suite
existente del curso. La evidencia se guarda en
`artifacts/platform/convexidad/revision_matematica.json`. Su alcance son los
ejemplos y sus cálculos; no constituye revisión académica humana ni demostración
computacional de los teoremas generales. Las hipótesis y demostraciones se revisaron
matemáticamente durante la redacción; la página sigue pendiente de revisión humana.

Se amplían las pruebas existentes para verificar todas las fórmulas de convexidad
con MathJax, bibliografía, anclas, búsqueda del ejemplo nuevo, orientaciones por teclado
y capturas en 1440, 768, 390 y 320 px con ambos temas. Se conserva la infraestructura
existente, sin CSS, JavaScript de producto, dependencias ni workflows nuevos.
Las evidencias de esta etapa están en `artifacts/platform/convexidad/` y las capturas
`convexidad-{light,dark}-{1440,768,390,320}.png` en `artifacts/platform/`.


La primera auditoría de esta página detectó citas que se distinguían solo por color
(`link-in-text-block`). El posprocesado local `tests/accessibility_output.py` aplica
ahora la clase compartida `text-decoration-underline` a los enlaces bibliográficos.
Se reutiliza Bootstrap sin añadir hojas de estilo ni editar el diseño vendorizado.
La suite comprueba también el subrayado y el destino de las citas en ambos temas.
La evidencia del primer intento se conserva como `browser-attempt-1.json` y
`course-attempt-1.log` dentro de `artifacts/platform/convexidad/`.


## Integración completa ICS1113 · 29 de octubre de 2026

Rama `contenido/ics1113-integracion-completa`, worktree separado de `contenido/convexidad`,
base `bda80f5` de `main` tras integrar #6. El checkout original y su diff permanecen
intactos. Se conserva cada línea no vacía del QMD local de convexidad y el cuerpo
completo protegido de 05. Los ocho capítulos están `en-desarrollo`, sin revisión humana.

El informe de segunda auditoría, cambios respecto del paquete y límites está en
`review/ics1113/INFORME.md`; la matriz original y la evaluación individual de los
41 subtemas se conservan a su lado. No se modifican los manifiestos académico, rutas
y outline. Se registran tres recursos originales MIT y se generan REUSE y su entrada
dependiente del lock con la herramienta central, sin sincronización global de vendor.

Licencias, render aislado, suite del curso, release y diff pasan. La suite suma
3.722 controles matemáticos (276 bases ordenadas en la comprobación independiente),
diez pruebas de arranque, 699 comprobaciones de navegador y 72 auditorías axe sin
infracciones. Se conservan 72 incompletos de contraste de glifos; no son una revisión
humana aprobada. Las 96 capturas cubren las nueve páginas y las tres actividades en
1440, 768, 390 y 320 px, claro y oscuro. Se corrigieron contraste de desplegables y
selectores, y foco de tablas desplazables, utilizando componentes existentes.

Evidencias y los tres intentos de auditoría que motivaron correcciones:
`artifacts/platform/ics1113/`, más `artifacts/platform/browser.json` y las capturas.
La prueba bajo `/optimizacion/` obtiene HTTP 200 para las nueve páginas y sus URL locales.
Se repiten render, contratos, licencias y release tras el cierre de prosa. El PR único
se tramita con la autorización de este encargo; fusión y publicación requieren la
aprobación final del propietario. No se declara una comprobación de producción nueva.
