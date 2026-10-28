"""Editorial structure and rendered navigation; no mathematical correctness claims."""
from pathlib import Path
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parents[1]
course = json.loads((ROOT / 'course.yml').read_text())['course']
outline = json.loads((ROOT / 'tests/outline.json').read_text())
assert len(outline) == 8 and len(course['units']) == 5
assert (course['slug'], course['name'], course['reference_code']) == ('optimizacion', 'Optimización', 'ICS1113')
expected = [p['path'] for p in outline]
assert [p['path'] for p in course['pages']] == ['index.qmd', *expected]
assert [p['href'] for unit in course['units'] for p in unit['contents']] == expected
assert [u['section'] for u in course['units']] == list(dict.fromkeys(p['unit'] for p in outline))
config = (ROOT / '_quarto.yml').read_text()
render = config.split('  render:\n', 1)[1].split('  resources:', 1)[0]
assert re.findall(r'^  - (.+\.qmd)$', render, re.M) == ['index.qmd', *expected]
sidebar = config.split('  sidebar:\n', 1)[1].split('  page-navigation:', 1)[0]
assert re.findall(r'^    - section: (.+)$', sidebar, re.M) == [u['section'] for u in course['units']]
assert re.findall(r'^      - href: (.+)$', sidebar, re.M) == expected
assert 'page-navigation: true' in config and 'toc: true' in config
assert not (ROOT / 'docs').exists()
for spec, page in zip(outline, course['pages'][1:]):
    source = (ROOT / spec['path']).read_text()
    front, body = source.split('---', 2)[1:]
    title = json.loads(re.search(r'^title: (.+)$', front, re.M)[1])
    assert title == spec.get('page_title', spec['title']), spec['path']
    assert spec['title'] == page['title'], spec['path']
    assert re.findall(r'^## (.+)$', body, re.M) == spec['subsections'], spec['path']
    assert page['status'] in {'proximamente', 'en-desarrollo'} and page['reviewed'] is False
    if page['status'] == 'proximamente':
        assert 'Contenido pendiente' in source and 'pendiente de redacción' in body
    output = (ROOT / '_site' / Path(spec['path']).with_suffix('.html')).read_text()
    assert 'id="TOC"' in output and 'uso-page-status' in output and 'sidebar' in output
    assert 'Revisión declarada' not in output
    for adjacent in ['index.qmd', *expected][max(0, course['pages'].index(page)-1):course['pages'].index(page)+2]:
        assert Path(adjacent).with_suffix('.html').name in output, (spec['path'], adjacent)
home = (ROOT / '_site/index.html').read_text()
assert 'ICS1113' in home and 'sin afiliación ni respaldo oficial' in home
assert all(Path(p).with_suffix('.html').name in home for p in expected)
assert all(p['reviewed'] is False for p in course['pages'])
lesson = (ROOT / '_site/lecciones/05-fundamentos-simplex.html').read_text()
assert course['pages'][5]['status'] == 'en-desarrollo'
assert all(p['status'] == 'proximamente' for p in course['pages'][1:] if p['path'] != 'lecciones/05-fundamentos-simplex.qmd')
source = (ROOT / 'lecciones/05-fundamentos-simplex.qmd').read_text()
cited = set(re.findall(r'@([A-Za-z][A-Za-z0-9_-]*)', source))
assert cited == {'ferrer2006', 'vanderbei2020'}
assert cited <= {ref['id'] for ref in json.loads((ROOT / 'course.yml').read_text())['references']}
assert set(re.findall(r'id="ref-([^"]+)"', lesson)) == cited
for key in cited:
    assert f'id="ref-{key}"' in lesson and f'href="#ref-{key}"' in lesson, key
assert 'citation-not-found' not in lesson
assert 'mathjax@' in lesson
assert lesson.count('class="math display"') == 8
assert lesson.count(r'\begin{aligned}') == 3
assert r'\textbf{no básicas}' not in lesson
for route in ['06-simplex-fase-i.html', '07-simplex-fase-ii.html']:
    assert f'href="../lecciones/{route}"' in lesson
assert 'uso-example' in lesson and 'uso-summary' in lesson
assert 'Sección 05' in home and 'Las ocho lecciones están' not in home
print(f"PASS: 5 units, 8 lessons, {sum(len(p['subsections']) for p in outline)} subsections, navigation, Section 05 mathematics, citations and academic states")
