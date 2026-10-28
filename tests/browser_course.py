"""Run course checks with Node's native WebSocket and sandboxed Chromium.

Only loopback debugging, an isolated profile and bounded startup diagnostics.
"""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
import os
import platform
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request

from safe_paths import checked_path, project_files

ROOT = Path(__file__).resolve().parents[1]
STARTUP_TIMEOUT = 60


def redact(text):
    """Keep credentials out of retained logs; never dump the environment/profile."""
    for key, value in os.environ.items():
        if value and re.search(r'token|secret|password|credential|authorization|cookie', key, re.I):
            text = text.replace(value, '[REDACTED]')
    text = re.sub(r'(\b[a-z][a-z0-9+.-]*://)[^\s/@]+@', r'\1[REDACTED]@', text, flags=re.I)
    return re.sub(r'([?&](?:access_token|token|key|password|secret)=)[^&\s]+',
                  r'\1[REDACTED]', text, flags=re.I)


def process_state(browser):
    return {'pid': browser.pid, 'returncode': browser.poll()} if browser else {'pid': None, 'returncode': None}


def redacted_report(value):
    if isinstance(value, str):
        return redact(value)
    if isinstance(value, dict):
        return {key: redacted_report(item) for key, item in value.items()}
    if isinstance(value, list):
        return [redacted_report(item) for item in value]
    return value


def wait_for_browser(browser, profile, report, timeout=STARTUP_TIMEOUT):
    """Wait for Chromium's own ephemeral port and a valid DevTools response."""
    started = time.monotonic()
    deadline = started + timeout
    # A corporate/runner proxy must never receive this loopback readiness probe.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    report.update(status='starting', startup_timeout_seconds=timeout, attempts=0,
                  last_probe='DevToolsActivePort has not been created')
    while True:
        report.update(elapsed_seconds=round(time.monotonic() - started, 3), **process_state(browser))
        if report['returncode'] is not None:
            report['status'] = 'exited'
            raise RuntimeError(f"Chromium exited before readiness (returncode={report['returncode']}); "
                               f"last probe: {report['last_probe']}")
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            report['status'] = 'timeout'
            raise RuntimeError(f"Chromium startup timed out after {report['elapsed_seconds']}s "
                               f"(budget={timeout}s, pid={browser.pid}, process still running); "
                               f"last probe: {report['last_probe']}")
        report['attempts'] += 1
        try:
            port = int((profile / 'DevToolsActivePort').read_text().splitlines()[0])
            if not 1 <= port <= 65535:
                raise ValueError('Invalid port in DevToolsActivePort')
            endpoint = f'http://127.0.0.1:{port}'
            report['endpoint'] = endpoint
            with opener.open(endpoint + '/json/version', timeout=min(1, remaining)) as response:
                version = json.load(response)
            if not isinstance(version, dict) or not version.get('Browser') or not version.get('webSocketDebuggerUrl'):
                raise ValueError('DevTools response lacks Browser or webSocketDebuggerUrl')
            report.update(status='ready', elapsed_seconds=round(time.monotonic() - started, 3),
                          browser_version=version['Browser'], last_probe='DevTools /json/version ready')
            return endpoint
        except (OSError, ValueError, IndexError) as error:
            report['last_probe'] = f'{type(error).__name__}: {error}'
        time.sleep(min(.1, max(0, deadline - time.monotonic())))


def failure_details(binary, browser):
    """Collect only relevant, bounded runner facts, without environment values."""
    details = {}
    for name in ['kernel/unprivileged_userns_clone', 'kernel/apparmor_restrict_unprivileged_userns',
                 'user/max_user_namespaces']:
        path = Path('/proc/sys') / name
        if path.is_file():
            details[name] = path.read_text().strip()
    if browser:
        try:
            details['process_status'] = [line for line in Path(f'/proc/{browser.pid}/status').read_text().splitlines()
                                         if line.split(':')[0] in {'State', 'PPid', 'Threads', 'NoNewPrivs', 'Seccomp'}]
        except OSError:
            pass  # The process may already have exited.
    try:
        version = subprocess.run([binary, '--version'], capture_output=True, text=True, timeout=5)
        details['executable_version'] = {'returncode': version.returncode,
                                         'output': (version.stdout + version.stderr)[-4000:]}
    except (OSError, subprocess.TimeoutExpired) as error:
        details['executable_version'] = f'{type(error).__name__}: {error}'
    return details


def retain_evidence(raw_log, report):
    # Chromium runs only against public course content, never a personal profile.
    # Keep a bounded, redacted tail, including launch/shutdown errors.
    with raw_log.open('rb') as stream:
        size = stream.seek(0, 2)
        stream.seek(max(0, size - 65536))
        log = stream.read().decode(errors='replace')
    report['chromium_log_bytes'] = size
    report['chromium_log_truncated'] = size > 65536
    log_path = checked_path(ROOT, 'artifacts/platform/browser.log')
    log_path.write_text(redact(log))
    summary = json.dumps(redacted_report(report), indent=2)
    checked_path(ROOT, 'artifacts/platform/browser-startup.json').write_text(summary + '\n')
    if report.get('status') != 'ready':
        print(summary, file=sys.stderr, flush=True)
        print('Chromium log tail:\n' + (redact(log[-16000:]) or '(empty)'), file=sys.stderr, flush=True)


def main():
    project_files(checked_path(ROOT, '_site'))
    checked_path(ROOT, 'artifacts/platform').mkdir(parents=True, exist_ok=True)
    binary = os.environ.get('BROWSER_EXECUTABLE') or shutil.which('google-chrome') or shutil.which('chromium')
    if not binary and Path('/opt/brave.com/brave/brave').is_file():
        binary = '/opt/brave.com/brave/brave'
    report = {'status': 'launch-error', 'selected_executable': binary,
              'resolved_executable': str(Path(shutil.which(binary) or binary).resolve()) if binary else None,
              'platform': {'system': platform.system(), 'release': platform.release(), 'machine': platform.machine()},
              'runner': {key: os.environ[key] for key in ['ImageOS', 'ImageVersion', 'RUNNER_OS', 'RUNNER_ARCH']
                         if key in os.environ},
              'proxy_variables_present': sorted(key for key in os.environ
                                                if key.lower() in {'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy'})}
    with tempfile.TemporaryDirectory(prefix='ustudyopen-browser-') as temp:
        work = Path(temp)
        public = work / 'public'
        public.mkdir()
        (public / 'course').symlink_to(ROOT / '_site', target_is_directory=True)
        handler = partial(SimpleHTTPRequestHandler, directory=str(public))
        server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        browser = None
        returncode = 1
        raw_log = work / 'chromium.log'
        with raw_log.open('w') as log:
            try:
                if not binary:
                    raise RuntimeError('Sandboxed Chrome/Chromium required; set BROWSER_EXECUTABLE')
                browser = subprocess.Popen([
                    binary, '--headless', '--disable-gpu', '--disable-dev-shm-usage',
                    '--disable-background-networking', '--no-first-run', '--no-default-browser-check',
                    '--password-store=basic', '--user-data-dir=' + str(work / 'profile'),
                    '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', 'about:blank',
                ], stdout=log, stderr=subprocess.STDOUT)
                endpoint = wait_for_browser(browser, work / 'profile', report)
                retain_evidence(raw_log, report)
                print(f"PASS: sandboxed Chromium ready in {report['elapsed_seconds']}s "
                      f"({report['browser_version']})", flush=True)
                env = dict(os.environ, COURSE_DEBUG_URL=endpoint,
                           COURSE_TEST_BASE=f'http://127.0.0.1:{server.server_port}/course/')
                result = subprocess.run(['node', 'tests/browser-course.mjs'], cwd=ROOT, env=env)
                returncode = report['checks_returncode'] = result.returncode
            except (OSError, RuntimeError) as error:
                report['error'] = f'{type(error).__name__}: {error}'
            finally:
                report['process_before_cleanup'] = process_state(browser)
                if report['status'] != 'ready' and binary:
                    report['failure_details'] = failure_details(binary, browser)
                if browser and browser.poll() is None:
                    browser.terminate()
                    try:
                        browser.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        report['cleanup_required_kill'] = True
                        browser.kill()
                        browser.wait()
                report['process_after_cleanup'] = process_state(browser)
                server.shutdown()
                server.server_close()
                thread.join()
                retain_evidence(raw_log, report)
        return returncode


if __name__ == '__main__':
    raise SystemExit(main())
