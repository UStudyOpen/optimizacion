# Preparación editorial y verificación local

Fecha: **28 de octubre de 2026**, America/Santiago. Base: `4f5254d`.
Rama de trabajo: `refactor/arquitectura-tematica`. Cambios sin commit.

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
