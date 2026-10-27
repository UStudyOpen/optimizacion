# Optimización · UStudyOpen

Fundamentos de optimización matemática y programación lineal. Referencia académica: **ICS1113**. Proyecto educativo independiente, sin afiliación ni respaldo oficial de una universidad.

Estado: **en desarrollo**. Cinco unidades y ocho lecciones; todas las lecciones están **próximamente**, pendientes de redacción por el propietario. Ninguna página tiene revisión académica declarada. Este repositorio contiene estructura editorial, sin teoría, demostraciones, ejercicios ni simuladores.

Repositorio: https://github.com/UStudyOpen/optimizacion. URL prevista, aún sin publicar: `https://ustudyopen.github.io/optimizacion/`.

## Comenzar a escribir

1. Abrir `lecciones/01-problemas-optimizacion.qmd` y redactar debajo de los cinco encabezados existentes, conservando títulos y rutas.
2. Al iniciar la redacción, cambiar `ustudy-status: proximamente` por `ustudy-status: en-desarrollo` y actualizar el mismo estado de esa página en `course.yml`. Mantener `ustudy-reviewed: false` y `reviewed: false`.
3. Sustituir el aviso de contenido pendiente por un aviso de redacción en desarrollo. Actualizar los indicadores de portada cuando haya contenido disponible; el estado general sigue en desarrollo.
4. Usar contenido original autorizado; las importaciones requieren registro legal y revisión de procedencia. La revisión técnica nunca implica revisión académica.
5. Validar y proponer los cambios mediante un PR a `main`.

## Herramientas

Quarto **1.10.18**, Python **3.14.8**, Node **24.21.0**. No hay dependencias npm para construir el curso.

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r tests/requirements-licensing.txt
python3 tests/licensing.py --reuse
python3 tests/render_clean.py
python3 tests/run_course.py
python3 tests/platform_validate.py --release
quarto preview --host 127.0.0.1
```

`tests/outline.json` conserva el índice solicitado y `tests/check_site.py` comprueba estructura, estados y navegación; no valida matemáticas. `tests/browser-course.mjs` revisa ambas apariencias, búsqueda, teclado y navegación en 1440, 768, 390 y 320 px. Descarga axe-core 4.14.0 con SHA-256 fijado exclusivamente en memoria para auditar WCAG A/AA y buenas prácticas; su código MPL-2.0 no se incorpora al repositorio ni al sitio. Las comprobaciones automáticas no equivalen a una auditoría humana completa. Los manifiestos académicos y de rutas heredados están vacíos porque todavía no existe una referencia académica revisada. Los manifiestos vendor sí acreditan la integridad del sistema compartido.

## Sincronización

Desde un checkout limpio de la versión central revisada (preparación inicial: `UStudyOpen/ustudyopen-design@107202007aa37a19814ce20992724157e45914fe`):

```sh
python3 tooling/sync_course.py /ruta/a/optimizacion --dry-run
python3 tooling/sync_course.py /ruta/a/optimizacion
python3 tooling/sync_course.py /ruta/a/optimizacion --check
```

No editar `_extensions/`, archivos administrados en `platform-vendor.json` ni `REUSE.toml`. Los workflows son administrados por el sincronizador. `tests/accessibility_output.py` añade nombres de navegación y una región legal al HTML generado; es una adaptación local, sin cambios de estilos ni del paquete compartido. La inicialización utilizó GitHub Template y `tooling/create_course.py`, sin reutilizar el historial de la plantilla.

## Licencias y publicación

Atribución pública: **ngulloa**. Contenido académico original en `lecciones/`: **CC BY-NC 4.0**. Plataforma, presentación y software compartido: **MIT**, con excepciones de terceros. Véanse `LICENSE`, `LICENSING.md`, `THIRD-PARTY-NOTICES.md`, `licensing.json` y `REUSE.toml`.

La salida `_site/` no se versiona; no se utiliza `docs/`. Pages permanece sin habilitar y `USO_PAGES_ENABLED=false` bloquea la publicación. La automatización futura sobre `main` está preparada, pero su activación y cualquier merge requieren autorización del propietario. Véase [PREPARACION.md](PREPARACION.md) para la entrega y la incorporación posterior al portal.
