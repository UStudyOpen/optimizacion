# Consolidación temática · 28 de octubre de 2026

## Diagnóstico y decisión de arquitectura

Referencia inicial: checkout `4f5254d`, rama de origen `docs/publicar-simplex-05`.
El inventario contiene ocho temas, siete con índice pendiente y uno desarrollado:
Fundamentos algebraicos del Simplex (166 líneas, ocho fórmulas de bloque y dos ejemplos).
La portada, README y documentación de preparación anunciaban ejercicios y un explorador
de bases que no están implementados en este checkout. No se eliminaron actividades.

Bases de Datos aporta el patrón de agrupación por conceptos, directorios semánticos,
portada `uso-hero` y tarjetas `topic-grid`. Precálculo usa grupos conceptuales sobre un
directorio común `temas/` y confirma que no hace falta una página índice por área.
Se reutilizan esos patrones y el estado explícito de desarrollo, sin copiar contenidos
ni los recursos particulares de SQL, geometría interactiva o ejercicios de otros cursos.
La plantilla y las referencias complementarias confirman Quarto, registro JSON/YAML,
diseño compartido y publicación por workflows administrados.

Se sustituyen cinco unidades por cuatro áreas: fundamentos, modelación, geometría y
algoritmo Simplex. Casos especiales pertenece al mismo algoritmo, manteniendo su página
independiente. No se añade, elimina ni fusiona ningún tema. `course.units` conserva su
nombre como contrato compartido; sus valores son áreas temáticas.

**Las ocho rutas se conservan.** `lecciones/` es ahora el contenedor histórico de páginas,
sin expresar jerarquía ni orden de lectura en la interfaz. El prefijo numérico solo
permanece en las URL. Mover ocho archivos exigiría redirecciones y ampliar los validadores
compartidos, que esperan una salida HTML por QMD registrado. Esa complejidad no aporta
mantenibilidad suficiente en esta consolidación. Los futuros temas autorizados pueden
usar directorios conceptuales sin migrar las rutas publicadas actuales.

## Correspondencia completa

Todas las rutas de la tabla son relativas a `/optimizacion/`, mantienen su `.qmd` fuente
en `lecciones/` y no requieren redirección HTTP.

| Ruta HTML conservada | Título anterior en navegación | Título actual | Área |
| --- | --- | --- | --- |
| `lecciones/01-problemas-optimizacion.html` | Lección 1: Problemas de optimización y existencia de soluciones | Problemas de optimización y existencia de soluciones | Fundamentos de optimización |
| `lecciones/02-convexidad.html` | Lección 2: Convexidad, optimalidad global y unicidad | Convexidad, optimalidad global y unicidad | Fundamentos de optimización |
| `lecciones/03-modelos-equivalentes.html` | Lección 3: Modelos equivalentes y variables auxiliares | Modelos equivalentes y variables auxiliares | Modelación y reformulación |
| `lecciones/04-poliedros.html` | Lección 4: Poliedros, vértices y soluciones óptimas | Poliedros, vértices y soluciones óptimas | Geometría de la programación lineal |
| `lecciones/05-fundamentos-simplex.html` | Lección 5: Fundamentos algebraicos del Simplex | Fundamentos algebraicos del Simplex | Algoritmo Simplex |
| `lecciones/06-simplex-fase-i.html` | Lección 6: Simplex — Fase I | Simplex — Fase I | Algoritmo Simplex |
| `lecciones/07-simplex-fase-ii.html` | Lección 7: Simplex — Fase II | Simplex — Fase II | Algoritmo Simplex |
| `lecciones/08-casos-especiales.html` | Lección 8: Soluciones múltiples, degeneración y ciclos | Soluciones múltiples, degeneración y ciclos | Algoritmo Simplex |

El título frontal de Fundamentos era `Simplex: Fundamentos`, distinto del registro y del
menú; ahora coincide con ambos, conservando su significado algebraico. Ninguna subsección
académica se renombra. En las siete páginas pendientes, solo se sustituye «Esta lección»
por «Esta página» dentro del aviso. El cuerpo de Fundamentos se conserva byte a byte.

`index.html` permanece. Su enlace principal es ahora `#areas`; se conservan `#unidades`
y las cinco anclas `#unidad-…` anteriores como alias invisibles junto al área equivalente.
Las dos anclas antiguas del Simplex apuntan a la misma tarjeta. No se añaden páginas puente,
CSS ni JavaScript de compatibilidad. `tests/route-baseline.json` registra las nueve rutas
y las anclas anteriores; es una captura del render inicial, no una lista regenerada
para aceptar errores.

## Estructura física y mapa editorial

```text
optimizacion/
├── index.qmd                         # cuatro tarjetas temáticas, ocho enlaces y estados
├── lecciones/                        # URL públicas preservadas
│   ├── 01-problemas-optimizacion.qmd  # Fundamentos de optimización
│   ├── 02-convexidad.qmd              # Fundamentos de optimización
│   ├── 03-modelos-equivalentes.qmd    # Modelación y reformulación
│   ├── 04-poliedros.qmd               # Geometría de la programación lineal
│   ├── 05-fundamentos-simplex.qmd     # Algoritmo Simplex · en desarrollo
│   ├── 06-simplex-fase-i.qmd          # Algoritmo Simplex
│   ├── 07-simplex-fase-ii.qmd         # Algoritmo Simplex
│   └── 08-casos-especiales.qmd        # Algoritmo Simplex
├── course.yml                        # registro, áreas, estados y bibliografía
├── _quarto.yml                       # render, sidebar y diseño compartido
├── _extensions/ustudyopen-design/     # administrado, intacto
├── .github/workflows/                # validación y despliegue existentes, intactos
├── tests/                            # contratos locales y validadores compartidos
├── styles/README.md                  # reserva documentada para geometría de actividades
├── LICENSES/                         # textos y avisos, intactos
├── AGENTS.md                         # instrucciones editoriales operativas
├── README.md                         # instalación, validación, flujo y plantilla de PR
├── MIGRATION.md                      # decisiones y correspondencias
└── PREPARACION.md                    # resultados, evidencias y límites
```

## Limpieza y preservación

- Sin archivos versionados eliminados, movidos ni duplicados nuevos. La deuda detectada
  está en documentación y contratos obsoletos; se corrige en sus archivos existentes.
- Se reemplazan las instrucciones de plantilla que presentaban este curso como un sitio
  aún no creado, los árboles antiguos y las expectativas de cinco unidades y títulos
  numerados. El test deja de prohibir la existencia de `docs/`: si aparece, debe preservarse.
- Se conservan `styles/README.md`, `.nojekyll`, textos legales, manifiestos, scripts y
  workflows tras verificar sus funciones y referencias. No hay `docs/` en este checkout.
- `.quarto/`, `_site/` y `artifacts/` ya existían como salidas locales ignoradas. No se borran
  residuos preexistentes del propietario. El render aislado renueva únicamente su salida.
- `.gitignore` tenía antes de comenzar la regla `**/*.quarto_ipynb`; se conserva sin editar.
  No se modifica `.quartoignore`: las nuevas instrucciones están en documentos ya excluidos.
- No se alteran el diseño vendor, `platform-vendor.json`, `design-vendor.json`, `REUSE.toml`,
  políticas legales, dependencias versionadas ni permisos de publicación.
- Se inicializa la referencia técnica del cuerpo desarrollado desde el contenido original
  de `4f5254d`; el manifiesto anterior estaba vacío. No se declara revisión académica ni se
  cambia un hash previo para ocultar fallos. Los índices restantes siguen protegidos por
  `tests/outline.json`; la comparación completa de los ocho cuerpos está en las evidencias.

## Publicación y reversibilidad

Este cambio es local. No crea commits, push, PR, merges, tags, releases ni despliegues.
Los workflows existentes ya validan PR y contemplan publicación aprobada desde `main`.
La autorización histórica documentada no se extiende a esta ejecución. No se consultan ni
modifican protecciones, entornos, variables ni configuración remota.

Para evaluar o revertir, revisar el diff en `refactor/arquitectura-tematica` respecto de
`4f5254d` y preservar el cambio preexistente de `.gitignore`. Las rutas públicas no cambian;
no hace falta un despliegue de redirecciones ni modificar el portal. No restaurar archivos
a ciegas sobre trabajo posterior del propietario.
