/* UFV FORGE — minimal interactions */

/* mobile nav */
const toggle = document.querySelector('.menu-toggle');
const links  = document.querySelector('.nav-links');
if (toggle && links){
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    })
  );
}

/* scroll reveal */
const revealIO = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (e.isIntersecting){
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    }
  });
}, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

/* count up */
function countUp(el){
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = Math.floor(eased * target);
    el.firstChild.textContent = el.dataset.plain ? String(v) : v.toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else if (suffix) el.insertAdjacentHTML('beforeend', `<span class="suffix">${suffix}</span>`);
  }
  requestAnimationFrame(tick);
}
const statIO = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (e.isIntersecting){ countUp(e.target); statIO.unobserve(e.target); }
  });
}, {threshold:.6});
document.querySelectorAll('[data-count]').forEach(el => statIO.observe(el));

/* budget bars */
const bars = document.querySelectorAll('.bar-fill[data-val]');
if (bars.length){
  document.querySelectorAll('.budget-layout').forEach(g => {
    const fs = [...g.querySelectorAll('.bar-fill[data-val]')];
    const max = Math.max(...fs.map(f => +f.dataset.val));
    fs.forEach(f => f.dataset.val = (+f.dataset.val / max * 100).toFixed(1));
  });
  const barIO = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (e.isIntersecting){
        e.target.style.width = e.target.dataset.val + '%';
        barIO.unobserve(e.target);
      }
    });
  }, {threshold:.3});
  bars.forEach(b => barIO.observe(b));
}

/* tabs */
document.querySelectorAll('[role="tablist"]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const activate = (tab) => tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    if (panel) panel.classList.toggle('active', on);
  });
  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft')  next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End')  next = tabs[tabs.length - 1];
      if (next){ e.preventDefault(); next.focus(); activate(next); }
    });
  });
});

/* graceful image handling — hide block if image missing */
document.querySelectorAll('.hero-visual, .img-block, .img-wide').forEach(block => {
  const img = block.querySelector('img');
  if (!img) return;
  if (img.complete && img.naturalWidth === 0){
    block.classList.add('no-img');
  }
  img.addEventListener('error', () => block.classList.add('no-img'));
});

/* presenter mode: press P, arrows/space to move, Esc to exit */
(() => {
  const pages = ['index','vision','hub','budget','timeline','delivery','impact','why'];
  const cur = (location.pathname.split('/').pop().replace('.html','') || 'index');
  const idx = Math.max(pages.indexOf(cur), 0);
  const secs = [...document.querySelectorAll('main > section')];
  const hud = document.createElement('div');
  hud.className = 'present-hud';
  hud.innerHTML = '<span id="ph-n"></span><span class="bar"><i></i></span><span>\u2190 \u2192 move \u00b7 Esc exit</span><button type="button" id="ph-x">Exit</button>';
  document.body.appendChild(hud);
  const bar = hud.querySelector('i'), num = hud.querySelector('#ph-n');
  let s = 0;
  const on = () => document.body.classList.contains('present');
  const show = (n) => {
    s = Math.max(0, Math.min(n, secs.length - 1));
    secs[s].scrollIntoView({ behavior: 'smooth', block: 'start' });
    num.textContent = (idx + 1) + '/' + pages.length + ' \u00b7 ' + (s + 1) + '/' + secs.length;
    bar.style.width = ((idx + (s + 1) / secs.length) / pages.length * 100) + '%';
  };
  const go = (d) => {
    const t = s + d;
    if (t >= secs.length && idx < pages.length - 1) location.href = pages[idx + 1] + '.html';
    else if (t < 0 && idx > 0) { sessionStorage.setItem('pres-end', '1'); location.href = pages[idx - 1] + '.html'; }
    else show(t);
  };
  const set = (v) => {
    document.body.classList.toggle('present', v);
    try { v ? sessionStorage.setItem('pres', '1') : sessionStorage.removeItem('pres'); } catch (e) {}
    if (v) show(0); else window.scrollTo(0, 0);
  };
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'p' || e.key === 'P') set(!on());
    else if (!on()) return;
    else if (['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); go(1); }
    else if (['ArrowLeft','ArrowUp','PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
    else if (e.key === 'Escape') set(false);
  });
  hud.querySelector('#ph-x').addEventListener('click', () => set(false));
  const nav = document.querySelector('.nav-links');
  if (nav) { const b = document.createElement('button'); b.type = 'button'; b.className = 'present-btn'; b.textContent = 'Present \u25B6'; b.title = 'Presenter mode (P)'; b.addEventListener('click', () => set(true)); nav.appendChild(b); }
  try { if (sessionStorage.getItem('pres')) { document.body.classList.add('present'); show(sessionStorage.getItem('pres-end') ? secs.length - 1 : 0); sessionStorage.removeItem('pres-end'); } } catch (e) {}
})();
