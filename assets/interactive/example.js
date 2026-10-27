// Minimal original demonstration; no academic material or simulator copied.
for (const root of document.querySelectorAll('[data-example-activity]')) {
  const control = root.querySelector('input');
  const output = root.querySelector('output');
  control.addEventListener('input', () => { output.textContent = `Nivel ${control.value} de 5`; });
}
