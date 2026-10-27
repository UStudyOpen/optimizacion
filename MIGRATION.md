# Activación de publicación: pendiente de autorización

Esta plantilla no tiene repositorio remoto ni sitio público creado. No activar Pages automáticamente. Crear el repositorio de la nueva asignatura posteriormente mediante el procedimiento aprobado; conservar los SHA de acciones y revisar las restricciones de la organización.

Antes de publicar: configurar branch protection en main con PR obligatorio y check `Validate course / validate` (aprobaciones según el apartado de administrador único), entorno github-pages restringido a main y con revisor obligatorio, Source GitHub Actions, variable USO_PAGES_ENABLED=true y ejecutar manualmente deploy.yml desde main con confirmación PUBLICAR. La compilación y todas las validaciones deben aprobar antes de subir artifact.tar; deploy depende de build.

Para automatizar después de merges aprobados, preparar una actualización aprobada en `ustudyopen-design/workflows/deploy.yml` y añadir `push: { branches: [main] }` y reemplazar ambas condiciones de jobs por `vars.USO_PAGES_ENABLED == 'true' && github.ref == 'refs/heads/main' && (github.event_name == 'push' || (github.event_name == 'workflow_dispatch' && inputs.confirm == 'PUBLICAR'))`. Añadir `"pages_automation_approved": true` al objeto `course` únicamente con aprobación expresa y ejecutar desde el diseño central `python3 tooling/sync_course.py ../nombre-del-curso` para actualizar el workflow y sus manifiestos. Revisar diferencias y repetir todos los checks antes de integrar. No editar copias vendor ni aplicar esta activación sin autorización. Los PR siguen sin publicar.

Un curso nuevo no tiene docs heredados. Si se aplica la arquitectura a un sitio existente, inventariar y respaldar primero la publicación y sus URL; no borrar docs hasta verificar el primer despliegue autorizado. Revertir restaurando una revisión aprobada y sus manifiestos y volviendo a validar.

## Aprobación con un único administrador

La aprobación del entorno es independiente de la revisión del PR. En `github-pages`, usar **Required reviewers** con el propietario autorizado, **Prevent self-review** desmarcado, bypass de administradores deshabilitado y ramas permitidas limitadas a `main`. Así el propietario puede iniciar y aprobar su despliegue mediante **Review deployments → Approve and deploy**; sigue siendo una acción manual registrada. GitHub documenta que impedir autoaprobación es opcional: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments.

Mantener `main` protegida: PR obligatorio, checks obligatorios exitosos, sin push directo, force push ni eliminación. Si el propietario es también el único autor, configurar temporalmente **cero aprobaciones de PR requeridas**: no puede aprobar su propio PR. Conservar la revisión humana del diff y los checks antes de integrar; al incorporar otro revisor, exigir una aprobación de PR. Esta excepción documentada no permite omitir checks ni el PR.

Conservar `workflow_dispatch`, `confirm: PUBLICAR`, `USO_PAGES_ENABLED` y `needs: build`. Esta documentación no configura el entorno, no crea la variable ni activa Pages. Comprobar en GitHub la disponibilidad de reglas según plan y visibilidad, el nombre real del check requerido, la espera y aprobación del entorno y sus restricciones de rama; no se acreditan mediante pruebas locales.
