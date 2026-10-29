// UStudyOpen-Original-Authorized
// SPDX-FileCopyrightText: 2026 ngulloa
// SPDX-License-Identifier: MIT
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {connect} from './browser_client.mjs';
const artifact = 'artifacts/platform';
mkdirSync(artifact,{recursive:true});
// Test-only MPL-2.0 dependency; never copied into source or the published site.
const axeURL = 'https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js';
const axeHash = '20c09fe157a8a34a30e241aaa1fcdade657734f08ab379ecfbeb7d45cc46e878';
const axe = process.env.AXE_PATH ? readFileSync(process.env.AXE_PATH,'utf8') : await (async()=>{
  const response=await fetch(axeURL);
  if(!response.ok) throw Error('Cannot download pinned test-only axe-core: '+response.status);
  return response.text();
})();
if(createHash('sha256').update(axe).digest('hex')!==axeHash) throw Error('axe-core integrity mismatch');
const course=JSON.parse(readFileSync('course.yml','utf8')).course;
const outline=JSON.parse(readFileSync('tests/outline.json','utf8'));
const lessonSpec=outline.find(p=>p.path==='lecciones/05-fundamentos-simplex.qmd');
const convexPath='lecciones/02-convexidad.qmd';
const convexSource=readFileSync(convexPath,'utf8');
const convexEquations=(convexSource.match(/\$\$[\s\S]*?\$\$/g)||[]).length;
const base=process.env.COURSE_TEST_BASE;
const b=await connect(process.env.COURSE_DEBUG_URL);
const report={axe:{url:axeURL,sha256:axeHash,version:'4.14.0'},checks:[],audits:[],errors:[],citationClicks:b.citationClicks};
function check(name,pass,details){report.checks.push({name,pass:!!pass,details});if(!pass)throw Error(name+': '+JSON.stringify(details));}
async function go(route){
  await b.cdp('Page.navigate',{url:new URL(route,base).href});
  await b.waitFor("document.readyState==='complete' && !!document.querySelector('.uso-page-status')");
  await b.evaluate('document.fonts.ready');
}
try {
  // Reproduce the recorded 61px shift between a coordinate read and mouse input.
  await b.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await b.evaluate(`(()=>{
    document.body.innerHTML='<div style="position:fixed;inset:0;background:white"><a id="uso-moving-link" href="#uso-moving-target" style="position:absolute;left:40px;top:200px;display:block;padding:10px">Moving link</a><div id="uso-moving-target">Target</div></div>';
    const link=document.getElementById('uso-moving-link');
    window.__usoMovingHits=0;
    link.addEventListener('click',()=>window.__usoMovingHits++);
    let shifted=false;
    link.getBoundingClientRect=function(){
      const rect=Element.prototype.getBoundingClientRect.call(this);
      if(!shifted){shifted=true;queueMicrotask(()=>{this.style.top='261px'})}
      return rect;
    };
  })()`);
  await b.click('#uso-moving-link');
  check('mouse click follows a delayed layout shift',await b.evaluate("window.__usoMovingHits===1 && location.hash==='#uso-moving-target'"));
  for(const width of [1440,768,390,320]) {
    await b.cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const page of course.pages) {
      const route=page.path.replace(/\.qmd$/,'.html');
      await go(route);
      check(`thematic sidebar ${width} ${route}`,await b.evaluate(`JSON.stringify([...document.querySelectorAll('#quarto-sidebar .sidebar-item-section > .sidebar-item-container > a.sidebar-item-text')].map(a=>a.textContent.trim()))===${JSON.stringify(JSON.stringify(course.units.map(a=>a.section)))}`));
      check(`current page ${width} ${route}`,await b.evaluate(`(()=>{const active=document.querySelectorAll('#quarto-sidebar a.active');const normalize=p=>p.replace(/index\\.html$/,'');return active.length===1 && normalize(new URL(active[0].href).pathname)===normalize(location.pathname)})()`));
      if(page.path==='lecciones/05-fundamentos-simplex.qmd') {
        await b.waitFor("!!window.MathJax?.startup?.promise");
        await b.evaluate('MathJax.startup.promise');
        check(`Section 05 equations ${width}`,await b.evaluate('document.querySelectorAll(".math.display").length===8 && [...document.querySelectorAll(".math")].every(el=>el.querySelector("mjx-container")) && !document.querySelector("mjx-merror, [data-mjx-error]")'));
        check(`Section 05 bibliography ${width}`,await b.evaluate('[...document.querySelectorAll("a[role=doc-biblioref]")].length===3 && document.querySelectorAll("#refs .csl-entry").length===2 && ["ferrer2006","vanderbei2020"].every(id=>document.getElementById("ref-"+id))'));
      }
      if(page.path===convexPath) {
        await b.waitFor("!!window.MathJax?.startup?.promise");
        await b.evaluate('MathJax.startup.promise');
        check(`convexity equations ${width}`,await b.evaluate(`document.querySelectorAll('.math.display').length===${convexEquations} && [...document.querySelectorAll('.math')].every(el=>el.querySelector('mjx-container')) && !document.querySelector('mjx-merror, [data-mjx-error]')`));
        check(`convexity bibliography ${width}`,await b.evaluate("!!document.querySelector('#ref-boyd2004') && document.querySelectorAll('a[role=doc-biblioref]').length>=3"));
      }
      if(page.path!=='index.qmd') {
        await b.waitFor("!!window.MathJax?.startup?.promise");
        await b.evaluate('MathJax.startup.promise');
        check(`all mathematical expressions ${width} ${route}`,await b.evaluate("[...document.querySelectorAll('.math')].every(e=>e.querySelector('mjx-container')) && !document.querySelector('mjx-merror, [data-mjx-error]')"));
      }
      for(const mode of ['light','dark']) {
        await b.theme(mode);
        await b.evaluate('Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))');
        if(page.path==='lecciones/05-fundamentos-simplex.qmd') {
          check(`Section 05 citation affordance ${width} ${mode}`,await b.evaluate('[...document.querySelectorAll("a[role=doc-biblioref]")].every(a=>getComputedStyle(a).textDecorationLine.includes("underline") && (!a.target || a.target==="_self"))'));
        }
        if(page.path===convexPath) {
          check(`convexity citation affordance ${width} ${mode}`,await b.evaluate('[...document.querySelectorAll("a[role=doc-biblioref]")].every(a=>getComputedStyle(a).textDecorationLine.includes("underline") && (!a.target || a.target==="_self"))'));
          await b.evaluate("document.querySelector('.callout-header[data-bs-toggle=collapse]').focus()");
          await b.key('Enter');
          await b.waitFor("document.querySelector('.callout-header[data-bs-toggle=collapse]').getAttribute('aria-expanded')==='true' && !!document.querySelector('.callout-collapse.show')");
          check(`convexity exercise hints by keyboard ${width} ${mode}`,true);
        }
        const kind=page.path===convexPath?'secante':page.path.includes('04-poliedros')?'poliedro':page.path.includes('07-simplex-fase-ii')?'simplex':null;
        if(kind) {
          const host=`[data-opti="${kind}"]`;
          await b.waitFor(`!!document.querySelector('${host}.opti-widget input, ${host}.opti-widget select')`);
          check(`interactive controls labelled ${kind} ${width} ${mode}`,await b.evaluate(`(()=>{const h=document.querySelector('${host}');return [...h.querySelectorAll('input,select')].every(c=>!!h.querySelector('label[for="'+c.id+'"]'))})()`));
          const key=async(key,code)=>{
            await b.cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code,nativeVirtualKeyCode:code});
            await b.cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:code,nativeVirtualKeyCode:code});
          };
          if(kind==='secante' || kind==='poliedro') {
            await b.evaluate(`(()=>{const c=document.querySelector('${host} input');c.value='${kind==='secante'?'50':'2'}';c.dispatchEvent(new Event('input',{bubbles:true}));c.focus()})()`);
            await key('ArrowRight',39);
            check(`range keyboard ${kind} ${width} ${mode}`,await b.evaluate(`document.querySelector('${host} input').value==='${kind==='secante'?'51':'2.1'}'`));
          }
          if(kind==='secante') {
            for(const [fn,expected] of [['convexa','2.2500'],['concava','-2.2500']]) {
              await b.evaluate(`(()=>{const h=document.querySelector('${host}'),c=h.querySelector('select'),r=h.querySelector('input');r.value='50';c.value='${fn}';c.dispatchEvent(new Event('change',{bubbles:true}))})()`);
              check(`secant ${fn} ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('diferencia=${expected}')`));
            }
            await b.evaluate(`(()=>{const c=document.querySelector('${host} select');c.value='convexa';c.dispatchEvent(new Event('change'))})()`);
          }
          if(kind==='poliedro') {
            for(const a of ['-1','1','2','4','6']) {
              await b.evaluate(`(()=>{const c=document.querySelector('${host} input');c.value='${a}';c.dispatchEvent(new Event('input',{bubbles:true}))})()`);
              check(`optimal face a=${a} ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('${a==='1'||a==='4'?'segmento óptimo':'vértice óptimo'}') && document.querySelectorAll('${host} .opti-optimal').length===${a==='1'||a==='4'?1:0}`));
            }
          }
          if(kind==='simplex') {
            const choose=async(value)=>b.evaluate(`(()=>{const c=document.querySelector('${host} select');c.value='${value}';c.dispatchEvent(new Event('change',{bubbles:true}))})()`);
            await choose('transversal');
            for(const expected of ['θ=3','θ=2','z=-8']) {
              check(`simplex path ${expected} ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('${expected}')`));
              if(expected!=='z=-8') {await b.evaluate(`document.querySelector('${host} button').focus()`);await b.key('Enter');}
            }
            for(const [value,expected,disabled] of [['noacotado','Sin variable saliente',true],['empate','Empate:',false],['degenerado','Paso cero',false],['cerobloqueado','Hay costos nulos',true]]) {
              await choose(value);
              check(`simplex ${value} ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('${expected}') && document.querySelector('${host} button').disabled===${disabled}`));
              if(value==='degenerado') {
                await b.evaluate(`document.querySelector('${host} button').focus()`);await b.key('Enter');
                check(`degenerate pivot preserves point ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('x=(0, 0, 0, 1)') && document.querySelector('${host}').textContent.includes('θ=1')`));
                await b.key('Enter');
                check(`degenerate case terminates ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('z=-2') && document.querySelector('${host} button').disabled`));
              }
              if(value==='empate') {
                await b.evaluate(`document.querySelector('${host} button').focus()`);await b.key('Enter');
                check(`positive tie pivot ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('z=-1') && document.querySelector('${host} button').disabled`));
              }

            }
            await choose('transversal');
            for(const base of ['0,3','1,2']) {
              await b.evaluate(`(()=>{const c=document.querySelectorAll('${host} select')[1];c.value='${base}';c.dispatchEvent(new Event('change'))})()`);
              check(`infeasible base ${base} ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('Base infactible') && document.querySelector('${host} button').disabled`));
            }
            await b.evaluate(`document.querySelectorAll('${host} button')[1].focus()`);await b.key('Enter');
            check(`simplex reset keyboard ${width} ${mode}`,await b.evaluate(`document.querySelector('${host}').textContent.includes('θ=3')`));
            await b.evaluate(`document.querySelector('${host} select').focus()`);await key('ArrowDown',40);
            check(`simplex scenario select keyboard ${width} ${mode}`,await b.evaluate(`document.querySelector('${host} select').value==='noacotado'`));
            await choose('transversal');
            await b.evaluate(`document.querySelectorAll('${host} select')[1].focus()`);await key('ArrowUp',38);
            check(`simplex basis select keyboard ${width} ${mode}`,await b.evaluate(`document.querySelectorAll('${host} select')[1].value==='1,3'`));
            await choose('transversal');
          }
          check(`tables keyboard focus ${kind} ${width} ${mode}`,await b.evaluate(`(()=>{const tables=[...document.querySelectorAll('${host} table')];return tables.every(t=>t.tabIndex===0)})()`));
          const scrollable=await b.evaluate(`(()=>{const t=[...document.querySelectorAll('${host} table')].find(t=>t.scrollWidth>t.clientWidth+1);if(!t)return false;t.focus();t.scrollLeft=0;return true})()`);
          if(scrollable) {
            await key('ArrowRight',39);
            await b.waitFor(`document.activeElement.scrollLeft>0`);
            check(`table keyboard scrolling ${kind} ${width} ${mode}`,true);
          }
          await b.evaluate(`document.querySelector('${host}').scrollIntoView({block:'start',behavior:'instant'})`);
          await b.evaluate("scrollBy(0,-Math.max(85,(document.querySelector('.quarto-secondary-nav')?.getBoundingClientRect().bottom||0)+20))");
          const snap=await b.cdp('Page.captureScreenshot',{format:'png'});
          writeFileSync(`${artifact}/actividad-${kind}-${mode}-${width}.png`,Buffer.from(snap.data,'base64'));
        }
        check(`no horizontal overflow ${width} ${route} ${mode}`,await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
        check(`static tables focusable ${width} ${route} ${mode}`,await b.evaluate("[...document.querySelectorAll('main table')].every(t=>t.tabIndex===0)"));
        check(`one main and title ${width} ${route} ${mode}`,await b.evaluate('document.querySelectorAll("main").length===1 && document.querySelectorAll("h1").length===1'));
        await b.evaluate(axe);
        const audit=await b.evaluate(`axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}).then(r=>({violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),passes:r.passes.length}))`);
        report.audits.push({width,route,mode,...audit});
        check(`axe ${width} ${route} ${mode}`,audit.violations.length===0,audit.violations);
        { // Evidence for all nine pages, all viewports and both themes.
          await b.evaluate('scrollTo(0,0)');
          const screenshot=await b.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
          const name=page.path==='index.qmd'?'portada':page.path===convexPath?'convexidad':page.path===lessonSpec.path?'simplex':page.path.split('/').pop().replace('.qmd','');
          writeFileSync(`${artifact}/${name}-${mode}-${width}.png`,Buffer.from(screenshot.data,'base64'));
        }
        if(page.path===convexPath) {
          await b.evaluate("document.querySelector('.callout-header[data-bs-toggle=collapse]').focus()");
          await b.key('Enter');
          await b.waitFor("document.querySelector('.callout-header[data-bs-toggle=collapse]').getAttribute('aria-expanded')==='false'");
        }
      }
    }
    if(width<=768) {
      await go('index.html');
      await b.evaluate("document.querySelector('.quarto-secondary-nav button').focus()");
      await b.key('Enter');
      await b.waitFor("document.querySelector('.quarto-secondary-nav button').getAttribute('aria-expanded')==='true' && document.querySelector('#quarto-sidebar').classList.contains('show')");
      await b.click('[data-bs-target="#quarto-sidebar-section-4"]');
      await b.waitFor("document.querySelector('#quarto-sidebar-section-4').classList.contains('show')");
      await b.click('#quarto-sidebar a[href$="08-casos-especiales.html"]');
      await b.waitFor("location.pathname.endsWith('08-casos-especiales.html') && !!document.querySelector('#quarto-sidebar a.active[href$=\"08-casos-especiales.html\"]')");
      check(`mobile thematic navigation by keyboard and click ${width}`,true);
    }
  }
  await b.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await go('lecciones/05-fundamentos-simplex.html');
  for(const mode of ['light','dark']) {
    await b.theme(mode);
    check(`Section 05 headings ${mode}`,await b.evaluate(`JSON.stringify([...document.querySelectorAll('main h2.anchored')].map(el=>el.textContent.trim()))===${JSON.stringify(JSON.stringify(lessonSpec.subsections))}`));
    check(`Section 05 subsection links ${mode}`,await b.evaluate("[...document.querySelectorAll('#TOC a[data-scroll-target]')].length>0 && [...document.querySelectorAll('#TOC a[data-scroll-target]')].every(a=>document.getElementById(a.getAttribute('data-scroll-target').slice(1)))"));
    await b.click('#TOC a[data-scroll-target]');
    await b.waitFor("decodeURIComponent(location.hash)===document.querySelector('#TOC a[data-scroll-target]').getAttribute('data-scroll-target')");
    check(`Section 05 subsection navigation ${mode}`,true);
    await b.click('a[role=doc-biblioref]');
    await b.waitFor("!!document.getElementById(decodeURIComponent(location.hash.slice(1)))?.classList.contains('csl-entry')");
    check(`Section 05 citation navigation ${mode}`,true);
  }
  await go('lecciones/02-convexidad.html');
  for(const mode of ['light','dark']) {
    await b.theme(mode);
    await b.click('a[role=doc-biblioref]');
    await b.waitFor("location.hash==='#ref-boyd2004'");
    check(`convexity citation navigation ${mode}`,true);
  }
  await go('index.html');
  check('theme persists between pages',await b.evaluate("document.body.classList.contains('quarto-dark')"));
  await b.theme('light');
  // Use the real theme control through keyboard activation.
  await b.evaluate("document.querySelector('.quarto-color-scheme-toggle').focus()");
  await b.key('Enter');
  await b.waitFor("document.body.classList.contains('quarto-dark')");
  check('theme keyboard activation',true);
  await b.click('#quarto-search button');
  await b.waitFor("!!document.querySelector('.aa-Input')");
  await b.cdp('Input.insertText',{text:'coercividad'});
  await b.waitFor("[...document.querySelectorAll('.aa-Item')].some(e=>e.textContent.includes('Problemas de optimización'))");
  check('search finds existence and coercivity content',true);
  await b.key('Escape');
  await b.click('#quarto-search button');
  await b.waitFor("!!document.querySelector('.aa-Input')");
  await b.evaluate("const input=document.querySelector('.aa-Input');input.focus();input.select()");
  await b.cdp('Input.insertText',{text:'anillo'});
  await b.waitFor("[...document.querySelectorAll('.aa-Item')].some(e=>e.textContent.includes('Convexidad'))");
  check('search indexes the developed convexity example',true);
  await b.key('Escape');
  await go(course.pages[1].path.replace(/\.qmd$/,'.html'));
  await b.click('.nav-page-next');
  await b.waitFor("location.pathname.endsWith('02-convexidad.html')");
  check('next lesson navigation',true);
  await b.click('.nav-page-previous');
  await b.waitFor("location.pathname.endsWith('01-problemas-optimizacion.html')");
  check('previous content navigation',true);
  await go('index.html#unidad-v-casos-especiales-del-simplex');
  check('historical home anchor',await b.evaluate("!!document.getElementById(decodeURIComponent(location.hash.slice(1)))"));
  await go('index.html#areas');
  check('home conceptual map',await b.evaluate(`document.querySelectorAll('.topic-card').length===${course.units.length} && !/Unidad [IVX]+|Lección [0-9]+/.test(document.querySelector('main').textContent)`));
  check('no browser/resource errors',b.errors.length===0,b.errors);
} catch(error) {
  report.errors.push(error.stack||String(error));
  process.exitCode=1;
} finally {
  writeFileSync(`${artifact}/browser.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checks:report.checks.length,audits:report.audits.length,errors:report.errors},null,2));
  b.close();
}
