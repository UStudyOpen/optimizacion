# Alcance de las licencias

Copyright (c) 2026 ngulloa para los aportes originales autorizados. La atribución
pública fue elegida expresamente por el titular el 25 de octubre de 2026; no se
atribuye titularidad a la organización GitHub UStudyOpen ni a los asistentes.
El año 2026 está acreditado por los avisos originales de BD/IA y por el registro
de creación del prototipo, la consolidación y la plantilla (CHANGELOG 0.1–0.3,
25 de octubre de 2026). No se deducen años adicionales de fechas de commits.

El encargo del titular del 25 de octubre de 2026 confirma sus facultades sobre
los componentes originales de Precálculo, Bases de Datos, Inteligencia Artificial
y UStudyOpen Design, incluidos los desarrollados con ChatGPT/Codex. Autoriza MIT
para el software propio o autorizado del sistema y la plantilla, y MIT adicional
para los componentes propios extraídos de los tres cursos. La autorización no
abarca obras de terceros. Los permisos previos de los cursos se conservan.

MIT (`LICENSE`) cubre el scaffolding, código, herramientas, documentación
técnica y textos de muestra originales autorizados de esta plantilla. Incluye
el patrón de curso derivado de BD/IA con permiso del titular. No aplica
a contenido académico que incorporen posteriormente otros autores.

Al crear una asignatura: declarar su licencia académica en `course.yml` campo
`course.license`, identificar la atribución en `course.authorship`, y añadir
su LICENSE y alcance en LICENSING.md. Se puede elegir una licencia diferente
de MIT sin cambiar la licencia del sistema. El valor pendiente de la plantilla
obliga a tomar una decisión; no concede por anticipado derechos sobre obras
futuras. Conservar las licencias de extensión y herramientas copiadas.

La extensión `_extensions/ustudyopen-design/` utiliza MIT para los aportes
propios/autorizados y conserva sus avisos. Las rutas enumeradas en
`platform-vendor.json` son herramientas/workflows comunes MIT; sus textos
acompañan las copias en `tests/LICENSE-platform.txt` y
`.github/workflows/LICENSE-platform.txt`. Los manifiestos identifican el alcance,
no conceden licencias sobre otros archivos independientes del usuario.

`THIRD-PARTY-NOTICES.md` y `LICENSES/` identifican los recursos ajenos que
conservan sus licencias originales, incluidos Apache-2.0 y Unlicense donde
corresponde. Los CSS compilados tienen alcance mixto: contenido/presentación
propia según este mapa y componentes de terceros según sus propios permisos.
El post-render copia estos avisos al nuevo `_site/legal/`; `docs/` permanece
intacto y su actualización pública requiere una operación posterior autorizada.

## Configuración de esta asignatura

Optimización: contenido académico original nuevo en `lecciones/` por ngulloa, bajo CC-BY-NC-4.0.
Los ejemplos heredados conservan MIT de ngulloa. Las importaciones se registran separadamente.
En este curso, el texto MIT citado por la plantilla se conserva en `LICENSES/MIT.txt`; el `LICENSE` raíz documenta CC-BY-NC-4.0 para las lecciones nuevas autorizadas.
