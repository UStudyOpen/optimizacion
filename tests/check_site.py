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
    assert title == spec['title'] == page['title'], spec['path']
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
print('PASS: 5 units, 8 lesson titles, 49 subsections, pending states, TOC and sequential navigation')
