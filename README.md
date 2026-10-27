# Plantilla UStudyOpen

Arquitectura local lista para iniciar una asignatura: Quarto 1.10.18, UStudyOpen Design 0.3.0 identificado por SHA-256, temas nativos, estados y workflows preparados sin activación. Python 3.14.8 y Node 24.21.0 en CI; no se necesitan paquetes npm; la validación legal usa el entorno Python fijado en `tests/requirements-licensing.txt`. La portada, la unidad y la pequeña actividad son ejemplos originales de estructura, sin copiar material académico ni simuladores de los cursos.

## Crear una asignatura desde GitHub

1. Abrir https://github.com/UStudyOpen/ustudyopen-template y seleccionar **Use this template → Create a new repository**. Elegir organización, nombre y visibilidad; copiar solo la rama predeterminada. GitHub creará un repositorio independiente.
2. Clonar el nuevo repositorio y completar la personalización descrita abajo. No copiar ni reutilizar el historial Git de los cursos.
3. Ejecutar validación en un Pull Request. Configurar protección de `main` con el check `validate`, conversaciones resueltas y PR obligatorio, con cero aprobaciones requeridas para un único mantenedor. No activar Pages hasta revisar y autorizar la publicación de la nueva asignatura.

Esta plantilla no tiene GitHub Pages habilitado. Su workflow de despliegue permanece bloqueado mediante `USO_PAGES_ENABLED`; activar la plantilla no publica sus ejemplos.

## Personalizar una asignatura

1. Copiar este directorio a una carpeta nueva **sin** `.git`, `.quarto`, `_site` ni `artifacts`, manteniendo cada repositorio independiente. No inicializar Git en la carpeta principal del workspace.
2. Editar el objeto `course` en `course.yml` (JSON válido como YAML): nombre, slug, autoría, licencia verificada, objetivos, unidades y páginas. Un código de referencia solo se añade tras verificarlo.
3. Ajustar nombre, navegación y lista render en `_quarto.yml`; editar `index.qmd`, sustituir la lección de ejemplo y agregar contenido/bibliografía propios. Los estilos de portada ya pertenecen a la extensión. Registrar cada recurso local en `project.resources` para evitar publicar carpetas internas accidentalmente.
4. Declarar estados de páginas y registro de manera concordante. `lista` exige revisión académica y funcional humana. Los temas aún sin página se registran en `course.planned` con estado `proximamente` y obligatoriedad explícita.
5. Elegir la licencia académica y atribuciones del nuevo curso en `course.yml`, LICENSE y LICENSING.md. El scaffolding autorizado y la extensión usan MIT; los contenidos futuros conservan la licencia que declaren sus autores y los terceros sus propios términos. Conservar `_extensions/ustudyopen-design/PROVENANCE.md`.
6. Ejecutar los checks siguientes y revisar ambos temas, teclado y móvil. Agregar pruebas académicas propias en tests y conservarlas separadas del sistema compartido. Los nuevos cursos deben establecer sus registros de integridad y rutas cuando exista una referencia académica revisada.

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r tests/requirements-licensing.txt
python3 tests/render_clean.py
python3 tests/run_course.py
python3 tests/platform_validate.py
quarto preview --host 127.0.0.1
```

Para servir el artefacto exacto: `python3 -m http.server 8764 --bind 127.0.0.1 --directory _site`, abrir `http://127.0.0.1:8764/`. La salida no se versiona. No crear un sitio global de UStudyOpen desde esta plantilla.

## Actualización y publicación

Desde el repositorio central: `python3 tooling/sync_course.py ../nombre-del-curso`. Revisar manifiestos, cambios, compatibilidad y capturas y repetir pruebas. Las copias gestionadas no se editan a mano; los cambios locales se detectan y bloquean antes de sobrescribir. Para revertir, restaurar únicamente el paquete y los manifiestos anteriores desde una copia revisada, sin sobrescribir contenido.

`validate.yml` valida PR sin permisos de publicación. `deploy.yml` solo admite ejecución manual desde main, variable USO_PAGES_ENABLED y confirmación PUBLICAR, y requiere configurar revisión humana del entorno antes de activarlo. Ver [MIGRATION.md](MIGRATION.md). El repositorio público conserva el historial local original; los ejemplos no se publican como sitio.

## Licencias

Véanse [alcance](LICENSING.md) y [avisos de terceros](THIRD-PARTY-NOTICES.md).

## Crear otra asignatura con licencias reproducibles

Usar `tooling/create_course.py` desde UStudyOpen Design con `--author`, `--name`
y `--authorize-original-content`. La autorización explícita habilita CC-BY-NC-4.0
para lecciones originales nuevas; `--license` permite otra elección revisada.
Los ejemplos heredados conservan MIT de ngulloa. El generador configura el curso
localmente, valida sus avisos y no crea repositorios ni publica.

Las nuevas lecciones originales de la asignatura pueden agregarse en `lecciones/`
sin editar LICENSE. Los recursos externos requieren registrar origen, versión,
SPDX, texto y revisión de NOTICE en `licensing.json`. Ejecutar
`python3 tests/licensing.py --reuse` en el entorno fijado por
`tests/requirements-licensing.txt`. El workflow de validación ya instala ese entorno.
La guía completa está en `ustudyopen-design/docs/AUTOMATIZACION-LICENCIAS.md`.
