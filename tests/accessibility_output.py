# UStudyOpen-Original-Authorized
# SPDX-FileCopyrightText: 2026 ngulloa
# SPDX-License-Identifier: MIT
"""Name generated landmarks without modifying the shared design or its tools."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
labels = {
    'navbar': 'Navegación principal',
    'quarto-secondary-nav': 'Navegación móvil',
    'sidebar-navigation': 'Unidades y lecciones',
    'page-navigation': 'Lecciones anterior y siguiente',
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

count = 0
for path in (root / '_site').rglob('*.html'):
    text = path.read_text()
    text = re.sub(r'<nav\b[^>]*>', name_navigation, text)
    text, legal = re.subn(r'<div class="uso-legal-notice ([^"]*)">',
                         r'<div class="uso-legal-notice \1" role="region" aria-label="Licencias y avisos">', text)
    if legal != 1:
        raise SystemExit('Expected one generated legal notice: ' + str(path))
    path.write_text(text)
    count += 1
print(f'Optimización: named navigation and legal landmarks in {count} pages')
