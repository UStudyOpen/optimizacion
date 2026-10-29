"""Course-owned checks; shared infrastructure never modifies domain algorithms."""
from pathlib import Path
import shutil, subprocess
root=Path(__file__).resolve().parents[1]
node=shutil.which('node')
if not node: raise SystemExit('Node 24.21.0 is required; add its bin directory to PATH')
for directory in ['assets/js', 'assets/optimizacion', 'scripts']:
 for path in (root/directory).rglob('*.js'):
  subprocess.run([node, '--check', str(path)], check=True)
unit=list((root/'tests').glob('*.test.js'))
if unit: subprocess.run([node, '--test', *map(str,unit)], cwd=root, check=True)
for name in ['sql_examples.py', 'convexidad_examples.py', 'paquete_matematica.py', 'auditoria_matematica.py', 'check_site.py']:
 if (root/'tests'/name).is_file(): subprocess.run(['python3', 'tests/'+name], cwd=root, check=True)
subprocess.run([node, 'tests/exploradores.test.cjs'], cwd=root, check=True)
if (root/'tests/browser-course.mjs').is_file():
 subprocess.run(['python3', '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_browser_startup.py'], cwd=root, check=True)
 try:
  subprocess.run(['python3', 'tests/browser_course.py'], cwd=root, check=True)
 except subprocess.CalledProcessError:
  # These files contain bounded, redacted browser diagnostics, never the profile/environment.
  for name in ['browser-startup.json', 'browser.log']:
   log=root/'artifacts/platform'/name
   if log.is_file(): print(name+':\n'+log.read_text(errors='replace')[-16000:], flush=True)
  raise
print('PASS: course syntax and available academic regressions')
