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
const base=process.env.COURSE_TEST_BASE;
const b=await connect(process.env.COURSE_DEBUG_URL);
const report={axe:{url:axeURL,sha256:axeHash,version:'4.14.0'},checks:[],audits:[],errors:[]};
function check(name,pass,details){report.checks.push({name,pass:!!pass,details});if(!pass)throw Error(name+': '+JSON.stringify(details));}
async function go(route){
  await b.cdp('Page.navigate',{url:new URL(route,base).href});
  await b.waitFor("document.readyState==='complete' && !!document.querySelector('.uso-page-status')");
  await b.evaluate('document.fonts.ready');
}
try {
  for(const width of [1440,768,390,320]) {
    await b.cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    for(const page of course.pages) {
      const route=page.path.replace(/\.qmd$/,'.html');
      await go(route);
      if(page.path==='lecciones/05-fundamentos-simplex.qmd') {
        await b.waitFor("!!window.MathJax?.startup?.promise");
        await b.evaluate('MathJax.startup.promise');
        check(`Section 05 equations ${width}`,await b.evaluate('document.querySelectorAll("mjx-container").length>100 && !document.querySelector("mjx-merror, [data-mjx-error]")'));
        check(`Section 05 bibliography ${width}`,await b.evaluate('[...document.querySelectorAll("a[role=doc-biblioref]")].length>10 && document.querySelectorAll("#refs .csl-entry").length===3'));
      }
      for(const mode of ['light','dark']) {
        await b.theme(mode);
        await b.evaluate('Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))');
        check(`no horizontal overflow ${width} ${route} ${mode}`,await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
        check(`one main and title ${width} ${route} ${mode}`,await b.evaluate('document.querySelectorAll("main").length===1 && document.querySelectorAll("h1").length===1'));
        await b.evaluate(axe);
        const audit=await b.evaluate(`axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}).then(r=>({violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),passes:r.passes.length}))`);
        report.audits.push({width,route,mode,...audit});
        check(`axe ${width} ${route} ${mode}`,audit.violations.length===0,audit.violations);
        if(page.path==='index.qmd' && [1440,390].includes(width)) {
          const screenshot=await b.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
          writeFileSync(`${artifact}/portada-${mode}-${width}.png`,Buffer.from(screenshot.data,'base64'));
        }
      }
    }
  }
  await b.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await go('lecciones/05-fundamentos-simplex.html');
  for(const mode of ['light','dark']) {
    await b.theme(mode);
    for(const [value,point,feasible] of [['5','(0, 0)',true],['1','(3, 0)',true],['0','(2, 2)',true],['4','(0, 4)',true],['2','(4, 0)',false],['3','(0, 6)',false]]) {
      await b.evaluate(`(()=>{const el=document.querySelector('#s05-base');el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      check(`Section 05 explorer ${mode} base ${value}`,await b.evaluate(`document.querySelector('#s05-point-label').textContent===${JSON.stringify(point)} && document.querySelector('#s05-point').dataset.feasible===${JSON.stringify(String(feasible))}`));
    }
    await b.click('details.uso-solution summary');
    check(`Section 05 solution opens ${mode}`,await b.evaluate('document.querySelector("details.uso-solution").open'));
    await b.click('details.uso-solution summary');
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
  check('search finds pending lesson headings',true);
  await b.key('Escape');
  await go(course.pages[1].path.replace(/\.qmd$/,'.html'));
  await b.click('.nav-page-next');
  await b.waitFor("location.pathname.endsWith('02-convexidad.html')");
  check('next lesson navigation',true);
  check('no browser/resource errors',b.errors.length===0,b.errors);
} catch(error) {
  report.errors.push(error.stack||String(error));
  process.exitCode=1;
} finally {
  writeFileSync(`${artifact}/browser.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checks:report.checks.length,audits:report.audits.length,errors:report.errors},null,2));
  b.close();
}
