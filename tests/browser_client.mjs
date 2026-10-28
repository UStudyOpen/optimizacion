// Disposable, loopback-only Chromium integration client. No third-party packages.
export async function connect(debug = 'http://127.0.0.1:9228') {
  const endpoint = new URL(debug);
  if (endpoint.hostname !== '127.0.0.1' || endpoint.protocol !== 'http:') throw Error('CDP must use http://127.0.0.1');
  const tabs = await (await fetch(`${debug}/json/list`)).json();
  const target = tabs.find(t => t.type === 'page');
  if (!target) throw Error('Launch an isolated browser with about:blank.');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let seq = 0;
  const pending = new Map();
  const errors = [];
  const citationClicks = [];
  socket.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id) {
      const task = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(task?.timer);
      if (msg.error) task?.reject(Error(JSON.stringify(msg.error)));
      else task?.resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
    if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) errors.push(`${msg.params.response.status} ${msg.params.response.url}`);
    if (msg.method === 'Network.loadingFailed' && !msg.params.canceled) errors.push(msg.params.errorText);
  };
  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++seq;
      const timer = setTimeout(() => {pending.delete(id); reject(Error(`CDP timeout: ${method}`));}, 30000);
      pending.set(id, {resolve, reject, timer});
      socket.send(JSON.stringify({id, method, params}));
    });
  }
  async function evaluate(expression) {
    const r = await cdp('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }
  async function waitFor(expression, ms=15000) {
    const start = Date.now();
    while (Date.now()-start < ms) {
      try {if (await evaluate(expression)) return;} catch { /* document may be navigating */ }
      await new Promise(r=>setTimeout(r,100));
    }
    throw Error(`Timed out: ${expression}`);
  }
  async function click(selector) {
    const trace = selector === 'a[role=doc-biblioref]';
    const p = await evaluate(`(async()=>{
      const el=document.querySelector(${JSON.stringify(selector)});
      if (!el) throw Error('Click target missing: '+${JSON.stringify(selector)});
      el.scrollIntoView({block:'center',behavior:'instant'});
      // Hash navigation can queue Quarto's header scroll adjustment. Wait for
      // consecutive stable frames before measuring the actual mouse target.
      const started=performance.now();
      let last,hit,r,p,stable=0;
      while(performance.now()-started<2000) {
        await new Promise(requestAnimationFrame);
        r=el.getBoundingClientRect();
        const point={x:r.x+r.width/2,y:r.y+r.height/2};
        hit=document.elementFromPoint(point.x,point.y);
        const unchanged=last&&['x','y','width','height'].every(key=>Math.abs(r[key]-last[key])<.25);
        stable=unchanged&&r.width>0&&r.height>0&&el.contains(hit)?stable+1:0;
        last=r.toJSON();
        if(stable>=2) {p=point;break;}
      }
      if(!p) throw Error('Click target did not settle or is obscured: '+${JSON.stringify(selector)}+
        ' '+JSON.stringify({rect:last,hit:hit?{tag:hit.tagName,id:hit.id}:null}));
      if (${trace}) {
        const describe=node=>node?{tag:node.tagName,id:node.id,href:node.getAttribute('href')}:null;
        const math=()=>({total:document.querySelectorAll('.math').length,rendered:document.querySelectorAll('.math mjx-container').length});
        const info={point:p,rect:r.toJSON(),rects:[...el.getClientRects()].map(r=>r.toJSON()),
          stableFrames:stable,settledAfterMs:Math.round(performance.now()-started),
          hit:describe(document.elementFromPoint(p.x,p.y)),math:math(),events:[]};
        window.__usoCitationClick=info;
        for(const type of ['mousedown','mouseup','click']) document.addEventListener(type,event=>{
          info.events.push({type,target:describe(event.target),hitsLink:el.contains(event.target),
            rect:el.getBoundingClientRect().toJSON(),math:math()});
        },{once:true,capture:true});
      }
      return p;
    })()`);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});
    if (trace) citationClicks.push(await evaluate('({...window.__usoCitationClick,hash:location.hash})'));
  }
  async function key(key) {
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code:key===' '?'Space':key,text:key==='Enter'?'\r':undefined,windowsVirtualKeyCode:key==='Enter'?13:key===' '?32:undefined});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key});
  }
  async function theme(mode) {
    if (!await evaluate(`document.body.classList.contains('quarto-${mode}')`)) await click('.quarto-color-scheme-toggle');
    await waitFor(`document.body.classList.contains('quarto-${mode}') && getComputedStyle(document.documentElement).getPropertyValue('--uso-bg').trim()==='${mode==='dark'?'#111827':'#f4f6fa'}'`);
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  }
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
  return {cdp,evaluate,waitFor,click,key,theme,errors,citationClicks,close:()=>socket.close()};
}
