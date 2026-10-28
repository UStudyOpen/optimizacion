# UStudyOpen-Original-Authorized
# SPDX-FileCopyrightText: 2026 ngulloa
# SPDX-License-Identifier: MIT
"""Exercise slow startup, real failures and diagnostic privacy without Chromium."""
from contextlib import redirect_stderr
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
import io
import json
import os
import tempfile
import threading
import unittest

import browser_course as runner

VERSION = {'Browser': 'Chromium/test', 'webSocketDebuggerUrl': 'ws://127.0.0.1/devtools/browser/test'}


class Clock:
    def __init__(self, on_sleep=lambda now: None):
        self.now = 0
        self.on_sleep = on_sleep

    def monotonic(self):
        return self.now

    def sleep(self, duration):
        self.now += duration
        self.on_sleep(self.now)


class BrowserStartupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.profile = self.root / 'profile'
        self.profile.mkdir()
        self.port_file = self.profile / 'DevToolsActivePort'
        self.browser = SimpleNamespace(pid=123, poll=lambda: None)
        self.report = {}

    def test_startup_can_take_longer_than_old_ten_second_budget(self):
        def publish_port(now):
            if now >= 12:
                self.port_file.write_text('49123\n/devtools/browser/test\n')
        clock = Clock(publish_port)
        opener = Mock()
        opener.open.return_value = io.BytesIO(json.dumps(VERSION).encode())
        with patch.object(runner, 'time', clock), patch.object(runner.urllib.request, 'build_opener', return_value=opener):
            endpoint = runner.wait_for_browser(self.browser, self.profile, self.report)
        self.assertEqual(endpoint, 'http://127.0.0.1:49123')
        self.assertEqual(self.report['status'], 'ready')
        self.assertGreaterEqual(self.report['elapsed_seconds'], 12)
        self.assertLess(self.report['elapsed_seconds'], runner.STARTUP_TIMEOUT)

    def test_process_exit_fails_immediately_with_exit_status(self):
        self.browser.poll = lambda: 42
        clock = Clock()
        with patch.object(runner, 'time', clock), self.assertRaisesRegex(RuntimeError, 'returncode=42'):
            runner.wait_for_browser(self.browser, self.profile, self.report)
        self.assertEqual(clock.now, 0)
        self.assertEqual(self.report['status'], 'exited')

    def test_missing_port_file_times_out_with_process_and_last_error(self):
        clock = Clock()
        with patch.object(runner, 'time', clock), self.assertRaisesRegex(RuntimeError, 'process still running.*FileNotFoundError'):
            runner.wait_for_browser(self.browser, self.profile, self.report)
        self.assertEqual(self.report['status'], 'timeout')
        self.assertAlmostEqual(clock.now, runner.STARTUP_TIMEOUT)
        self.assertIsNone(self.report['returncode'])

    def test_http_timeouts_count_towards_total_deadline(self):
        self.port_file.write_text('49123\n')
        clock = Clock()
        def stalled_probe(url, timeout):
            clock.now += timeout
            raise TimeoutError('test DevTools response timeout')
        opener = Mock()
        opener.open.side_effect = stalled_probe
        with patch.object(runner, 'time', clock), patch.object(runner.urllib.request, 'build_opener', return_value=opener):
            with self.assertRaisesRegex(RuntimeError, 'TimeoutError: test DevTools response timeout'):
                runner.wait_for_browser(self.browser, self.profile, self.report, timeout=3.2)
        self.assertAlmostEqual(clock.now, 3.2)
        self.assertEqual(self.report['endpoint'], 'http://127.0.0.1:49123')

    def test_partial_or_invalid_port_file_never_counts_as_ready(self):
        for content in ['', 'not-a-port\n', '65536\n']:
            with self.subTest(content=content):
                self.port_file.write_text(content)
                with patch.object(runner, 'time', Clock()), self.assertRaises(RuntimeError):
                    runner.wait_for_browser(self.browser, self.profile, self.report, timeout=.3)
                self.assertEqual(self.report['status'], 'timeout')

    def test_malformed_devtools_response_preserves_probe_error(self):
        self.port_file.write_text('49123\n')
        for content in [b'not-json', b'{}', b'[]']:
            with self.subTest(content=content):
                opener = Mock()
                opener.open.side_effect = lambda *args, **kwargs: io.BytesIO(content)
                with patch.object(runner, 'time', Clock()), patch.object(runner.urllib.request, 'build_opener', return_value=opener):
                    with self.assertRaises(RuntimeError):
                        runner.wait_for_browser(self.browser, self.profile, self.report, timeout=.3)
                self.assertEqual(self.report['status'], 'timeout')
                self.assertRegex(self.report['last_probe'], 'JSONDecodeError|ValueError')

    def test_loopback_probe_ignores_environment_proxy(self):
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(VERSION).encode())

            def log_message(self, *args):
                pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever)
        thread.start()
        try:
            self.port_file.write_text(str(server.server_port) + '\n')
            proxy = {'http_proxy': 'http://127.0.0.1:1', 'HTTP_PROXY': 'http://127.0.0.1:1',
                     'no_proxy': '', 'NO_PROXY': ''}
            with patch.dict(os.environ, proxy):
                runner.wait_for_browser(self.browser, self.profile, self.report, timeout=2)
            self.assertEqual(self.report['status'], 'ready')
        finally:
            server.shutdown()
            server.server_close()
            thread.join()

    def run_main(self, binary):
        (self.root / '_site').mkdir()
        stderr = io.StringIO()
        with patch.object(runner, 'ROOT', self.root), patch.dict(os.environ, {'BROWSER_EXECUTABLE': str(binary)}):
            with redirect_stderr(stderr):
                self.assertEqual(runner.main(), 1)
        evidence = self.root / 'artifacts/platform'
        report = json.loads((evidence / 'browser-startup.json').read_text())
        return report, (evidence / 'browser.log').read_text(), stderr.getvalue()

    def test_missing_executable_retains_launch_error_and_empty_log(self):
        report, log, stderr = self.run_main(self.root / 'missing-browser')
        self.assertEqual(report['status'], 'launch-error')
        self.assertIn('FileNotFoundError', report['error'])
        self.assertIsNone(report['process_before_cleanup']['pid'])
        self.assertEqual(log, '')
        self.assertIn('(empty)', stderr)

    def test_actual_process_failure_retains_stderr_and_redacts_credentials(self):
        binary = self.root / 'failing-browser'
        binary.write_text('#!/usr/bin/env python3\nimport os, sys\n'
                          'if "--version" in sys.argv: print("Chromium/test"); sys.exit(0)\n'
                          'print("sandbox test failure " + os.environ["TEST_TOKEN"], file=sys.stderr)\n'
                          'sys.exit(42)\n')
        binary.chmod(0o700)
        with patch.dict(os.environ, {'TEST_TOKEN': 'private-test-credential'}):
            report, log, stderr = self.run_main(binary)
        self.assertEqual(report['status'], 'exited')
        self.assertEqual(report['process_before_cleanup']['returncode'], 42)
        self.assertIn('sandbox test failure [REDACTED]', log)
        self.assertNotIn('private-test-credential', json.dumps(report) + log + stderr)

    def test_retained_log_is_bounded_and_url_credentials_are_redacted(self):
        raw_log = self.root / 'raw.log'
        raw_log.write_text('x' * 70000 + '\nhttp://user:password@example.test/?token=private\n')
        (self.root / 'artifacts/platform').mkdir(parents=True)
        with patch.object(runner, 'ROOT', self.root):
            runner.retain_evidence(raw_log, {'status': 'ready', 'detail': 'http://user:password@example.test/?token=private'})
        log = (self.root / 'artifacts/platform/browser.log').read_text()
        report = json.loads((self.root / 'artifacts/platform/browser-startup.json').read_text())
        self.assertTrue(report['chromium_log_truncated'])
        self.assertLessEqual(len(log), 65536)
        self.assertNotIn('user:password', log)
        self.assertNotIn('token=private', log)
        self.assertNotIn('token=private', report['detail'])
        self.assertIn('[REDACTED]', report['detail'])


if __name__ == '__main__':
    unittest.main()
