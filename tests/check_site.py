"""Course-owned editorial and rendered regressions; no academic review claims."""
from pathlib import Path
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'course.yml').read_text())
course = data['course']
outline = json.loads((ROOT / 'tests/outline.json').read_text())
expected = [p['path'] for p in outline]
areas = list(dict.fromkeys(p['area'] for p in outline))
assert len(expected) == len(set(expected)), 'Duplicate outline page'
assert (course['slug'], course['name'], course['reference_code']) == ('optimizacion', 'Optimización', 'ICS1113')
assert [p['path'] for p in course['pages']] == ['index.qmd', *expected]
assert course['first_page'] == expected[0]
assert [p['href'] for area in course['units'] for p in area['contents']] == expected
assert [a['section'] for a in course['units']] == areas
for area in course['units']:
    assert area['contents'], 'Empty thematic area'
    for entry in area['contents']:
        spec = next(p for p in outline if p['path'] == entry['href'])
        assert (area['section'], entry['text']) == (spec['area'], spec['title'])
config = (ROOT / '_quarto.yml').read_text()
render = config.split('  render:\n', 1)[1].split('  resources:', 1)[0]
assert re.findall(r'^  - (.+\.qmd)$', render, re.M) == ['index.qmd', *expected]
sidebar = config.split('  sidebar:\n', 1)[1].split('  page-navigation:', 1)[0]
assert re.findall(r'^    - section: (.+)$', sidebar, re.M) == areas
assert re.findall(r'^      - href: (.+)$', sidebar, re.M) == expected
assert [json.loads(t) for t in re.findall(r'^        text: (.+)$', sidebar, re.M)] == [p['title'] for p in outline]
assert not re.search(r'Unidad [IVX]+|Lección \d+', sidebar)
assert 'page-navigation: true' in config and 'toc: true' in config
assert 'site-url: https://ustudyopen.github.io/optimizacion/' in config
# Historical docs, if introduced by the owner, must be preserved, not rejected.

class Home(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.headings, self.cards, self.current = [], 0, None
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'topic-card' in attrs.get('class', '').split():
            self.cards += 1
        if tag == 'h3':
            self.current = ''
    def handle_data(self, text):
        if self.current is not None:
            self.current += text
    def handle_endtag(self, tag):
        if tag == 'h3' and self.current is not None:
            self.headings.append(self.current.strip())
            self.current = None

home_source = (ROOT / 'index.qmd').read_text()
home = (ROOT / '_site/index.html').read_text()
parsed_home = Home(home)
assert parsed_home.cards == len(areas) and parsed_home.headings == areas
assert 'ICS1113' in home and 'sin afiliación ni respaldo oficial' in home
states = {'proximamente': 'Próximamente', 'en-desarrollo': 'En desarrollo', 'lista': 'Revisión declarada'}
for spec, page in zip(outline, course['pages'][1:]):
    source = (ROOT / spec['path']).read_text()
    front, body = source.split('---', 2)[1:]
    title = json.loads(re.search(r'^title: (.+)$', front, re.M)[1])
    assert title == spec['title'] == page['title'], spec['path']
    assert not re.search(r'Unidad [IVX]+|Lección \d+', title)
    assert re.findall(r'^## (.+)$', body, re.M) == spec['subsections'], spec['path']
    assert page['status'] in states
    if page['status'] == 'proximamente':
        assert 'Contenido pendiente' in source and 'pendiente de redacción' in body
    if page['status'] == 'lista':
        assert page['reviewed'] is True, 'Ready requires documented human review'
    # Status changes remain possible without rewriting tests; homepage must follow.
    assert f"]({spec['path']}) — {states[page['status']]}" in home_source, spec['path']
    output = (ROOT / '_site' / Path(spec['path']).with_suffix('.html')).read_text()
    assert 'id="TOC"' in output and 'uso-page-status' in output and 'sidebar' in output
    if not page['reviewed']:
        assert 'Revisión declarada' not in output
    index = course['pages'].index(page)
    for adjacent in ['index.qmd', *expected][max(0, index-1):index+2]:
        assert Path(adjacent).with_suffix('.html').name in output, (spec['path'], adjacent)
    assert Path(spec['path']).with_suffix('.html').name in home

# Existing developed material: protect its equations, bibliography and crosslinks.
lesson = (ROOT / '_site/lecciones/05-fundamentos-simplex.html').read_text()
source = (ROOT / 'lecciones/05-fundamentos-simplex.qmd').read_text()
cited = set(re.findall(r'@([A-Za-z][A-Za-z0-9_-]*)', source))
assert {'ferrer2006', 'vanderbei2020'} <= cited
assert cited <= {ref['id'] for ref in data['references']}
assert set(re.findall(r'id="ref-([^"]+)"', lesson)) == cited
for key in cited:
    assert f'id="ref-{key}"' in lesson and f'href="#ref-{key}"' in lesson, key
assert 'citation-not-found' not in lesson and 'mathjax@' in lesson
assert lesson.count('class="math display"') == 8
assert lesson.count(r'\begin{aligned}') == 3
assert r'\textbf{no básicas}' not in lesson
for route in ['06-simplex-fase-i.html', '07-simplex-fase-ii.html']:
    assert f'href="../lecciones/{route}"' in lesson
assert 'uso-example' in lesson and 'uso-summary' in lesson
print(f"PASS: {len(areas)} thematic areas, {len(outline)} topics, "
      f"{sum(len(p['subsections']) for p in outline)} subsections, titles, states, navigation, equations and citations")
