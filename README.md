# Optimización · UStudyOpen

Fundamentos de optimización matemática y programación lineal. Referencia académica:
**ICS1113**. Proyecto educativo independiente, sin afiliación ni respaldo universitario.

Ocho capítulos desarrollados en cuatro áreas: **fundamentos de optimización**,
**modelación y reformulación**, **geometría de la programación lineal** y **algoritmo
Simplex**. Todos permanecen **en desarrollo**, con `ustudy-reviewed: false`.
Incluyen explicaciones, ejemplos resueltos y ejercicios con soluciones. Convexidad,
poliedros y Fase II incorporan actividades originales; simplex usa fracciones exactas.
Las comprobaciones automatizadas y esta auditoría asistida no acreditan revisión humana.

Repositorio: https://github.com/UStudyOpen/optimizacion.
Sitio: https://ustudyopen.github.io/optimizacion/.

## Comenzar a escribir

Editar cada capítulo bajo sus encabezados existentes y conservar los estados
`en-desarrollo` y `reviewed: false` hasta una revisión académica humana documentada.
Sincronizar QMD, `course.yml` e indicadores de `index.qmd` cuando cambie un estado.
Las ocho rutas, las anclas históricas y los 50 H2 son contratos públicos; no se requiere
cambiar rutas ni CI para ampliar contenido. Los recursos propios viven en
`assets/optimizacion/`, se declaran en `project.resources` y en `licensing.json`.

`AGENTS.md` define las convenciones de páginas, fuentes, figuras, actividades y licencias.
`MIGRATION.md` explica el inventario y la conservación de URL. La clave `course.units`
se mantiene por compatibilidad de plataforma y ahora contiene áreas conceptuales.

## Entorno y validación

Quarto **1.10.18**, Python **3.14.8**, Node **24.21.0**; sin dependencias npm.
Chromium/Chrome/Brave con sandbox activo para pruebas visuales.

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r tests/requirements-licensing.txt
# Si Quarto no está instalado: python3 tests/install_quarto.py
# Añadir el bin de Node 24.21.0 al PATH si no está disponible.
# BROWSER_EXECUTABLE=/ruta/a/chromium si no se detecta automáticamente.
python3 tests/licensing.py --reuse
python3 tests/render_clean.py
python3 tests/run_course.py
python3 tests/platform_validate.py --release
git diff --check
quarto preview --host 127.0.0.1
```

El render aislado preserva `docs/` si existe y reemplaza solo `_site/` después de validar.
`tests/check_site.py` comprueba títulos, áreas, subtítulos, estados, navegación, fórmulas y
citas existentes. La referencia de integridad protege el cuerpo desarrollado del Simplex;
no afirma revisión académica. La referencia de rutas comprueba también anclas históricas.

`tests/browser-course.mjs` revisa las nueve páginas en 1440, 768, 390 y 320 px, en claro y
oscuro: tema, teclado, búsqueda, menú temático, página activa y anterior/siguiente. Audita
WCAG A/AA y buenas prácticas con axe-core 4.14.0 fijado por SHA-256, solo para pruebas,
sin incorporar su código MPL-2.0 al sitio. Sus resultados `incomplete` requieren revisión;
cero infracciones automáticas no acredita accesibilidad completa. Capturas y resultados:
`artifacts/platform/`, con capturas de las nueve páginas y de las tres actividades. El workflow
existente conserva evidencias durante siete días.

## Preparar un pull request

1. Revisar `git status --short` e identificar cambios previos. Crear una rama de trabajo:
   `git switch -c contenido/ics1113-integracion-completa` (si no se está ya en la rama de la tarea).
2. Editar el contenido y sincronizar los registros indicados arriba.
3. Ejecutar las cuatro validaciones; revisar el diff y las capturas en ambos temas.
4. Preparar el texto con la plantilla siguiente en `artifacts/pr.md`.
5. **Solo tras autorización expresa**, seleccionar archivos propios con `git add <rutas>`,
   revisar `git diff --cached`, crear el commit, subir la rama y abrir el PR hacia `main`.
   Evitar `git add .` cuando haya cambios locales ajenos. No integrar ni desplegar sin
   autorización; no habilitar auto-merge.

Plantilla para `artifacts/pr.md` (el directorio ya está ignorado):

```markdown
## Cambio

Problema o contenido desarrollado y comportamiento resultante.

## Verificación

- Licencias, render aislado, suite del curso y validación release: resultados reales.
- Revisión visual: tamaños, ambos temas y evidencias; limitaciones pendientes.
- Integridad académica: fórmulas, ejemplos, fuentes, rutas y estados comprobados.

## Revisión pendiente

Estado académico y decisiones que requieren revisión humana. Cambios intencionales
al contrato o a referencias de integridad, con su justificación, si corresponde.
```

Comandos posteriores a la autorización (sustituir título y mensaje):

```sh
gh auth status
# Si falta autenticación: gh auth login --hostname github.com --git-protocol https --web
git diff --cached --check
git commit -m 'docs: desarrollar convexidad'
git push -u origin HEAD
gh pr create --repo UStudyOpen/optimizacion --base main \
  --title 'Desarrollar convexidad' --body-file artifacts/pr.md
```

El propietario debe autenticar `gh` y disponer de acceso de escritura al repositorio para
subir la rama y abrir el PR. Si GitHub deniega el acceso, debe resolver ese permiso; no
crear tokens nuevos, cambiar protecciones ni omitir checks como solución alternativa.
Comprobar la autenticación y los permisos con `gh auth status` antes de operar.

## Diseño, licencias y publicación

No editar `_extensions/`, `REUSE.toml` ni archivos de `platform-vendor.json`. El diseño y
los workflows se distribuyen mediante la herramienta de sincronización de UStudyOpen
Design desde una versión revisada, fuera de los cambios editoriales rutinarios.
`tests/accessibility_output.py` completa nombres de regiones y subraya las citas del HTML generado sin
modificar el diseño. `styles/README.md` documenta la reserva para actividades futuras.

Autoría pública **ngulloa**. Contenido académico en `lecciones/`: **CC BY-NC 4.0**;
plataforma y software compartido: **MIT**, con excepciones de terceros. Véanse `LICENSE`,
`LICENSING.md`, `THIRD-PARTY-NOTICES.md`, `licensing.json` y `REUSE.toml`.

La salida `_site/` no se versiona. La configuración existente publica mediante GitHub
Actions tras integrar cambios autorizados en `main`, condicionada por
`USO_PAGES_ENABLED`, la aprobación de automatización ya registrada y el entorno
`github-pages`; conserva ejecución manual con `PUBLICAR`. No se modifican esas reglas.
Una preparación local o una autorización histórica no autoriza nuevos commits, push, PR,
merges ni despliegues. Véase `PREPARACION.md` para resultados y límites de esta ejecución.

## Auditoría ICS1113

El informe y la matriz de 41 subtemas están en `review/ics1113/` (documentación de
revisión, excluida del sitio). Las pruebas del paquete se conservaron como
`tests/paquete_matematica.py` y `tests/exploradores.test.cjs`; la comparación independiente
con Cramer se ejecuta con `tests/auditoria_matematica.py`. Todas forman parte de
`tests/run_course.py`, junto con las 703 comprobaciones previas de convexidad.
Las evidencias visuales y los resultados se guardan en `artifacts/platform/`.
