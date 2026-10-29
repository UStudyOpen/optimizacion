# UStudyOpen-Original-Authorized
# SPDX-FileCopyrightText: 2026 ngulloa
# SPDX-License-Identifier: MIT
"""Name landmarks and distinguish citations using the existing shared design."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
labels = {
    'navbar': 'Navegación principal',
    'quarto-secondary-nav': 'Navegación móvil',
    'sidebar-navigation': 'Áreas temáticas y contenidos',
    'page-navigation': 'Contenidos anterior y siguiente',
}

def name_navigation(match):
    tag = match[0]
    if 'aria-label' in tag:
        return tag
    classes = re.search(r'class="([^"]*)"', tag)
    for css_class, label in labels.items():
        if classes and css_class in classes[1].split():
            return tag[:-1] + f' aria-label="{label}">'
    return tag


def distinguish_citation(match):
    """Reuse Bootstrap's existing underline utility for bibliography links."""
    tag = match[0]
    classes = re.search(r'\bclass="([^"]*)"', tag)
    if classes:
        if 'text-decoration-underline' in classes[1].split():
            return tag
        return tag[:classes.start(1)] + classes[1] + ' text-decoration-underline' + tag[classes.end(1):]
    return tag[:-1] + ' class="text-decoration-underline">'

count = 0
for path in (root / '_site').rglob('*.html'):
    text = path.read_text()
    text = re.sub(r'<nav\b[^>]*>', name_navigation, text)
    # Shared styles may scroll wide tables; keyboard users need a focus target.
    text = re.sub(r'<table\b(?![^>]*\btabindex=)([^>]*)>', r'<table tabindex="0"\1>', text)
    text = re.sub(r'<a\b[^>]*\brole="doc-biblioref"[^>]*>', distinguish_citation, text)
    text, legal = re.subn(r'<div class="uso-legal-notice ([^"]*)">',
                         r'<div class="uso-legal-notice \1" role="region" aria-label="Licencias y avisos">', text)
    if legal != 1:
        raise SystemExit('Expected one generated legal notice: ' + str(path))
    path.write_text(text)
    count += 1
print(f'Optimización: named landmarks and distinguished citations in {count} pages')
