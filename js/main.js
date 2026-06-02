/* ════════════════════════════════════════════════
   CURSOR PERSONALIZADO
════════════════════════════════════════════════ */
// Limpiar --px inmediatamente si es mobile — antes de cualquier render
if (window.innerWidth <= 960) {
  document.documentElement.style.removeProperty('--px');
  document.documentElement.style.removeProperty('--margin');
}

const cur = document.getElementById('cur');
let mouseX = -100, mouseY = -100;
let isCursorUpdating = false;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!isCursorUpdating) {
    requestAnimationFrame(updateCursor);
    isCursorUpdating = true;
  }
});

function updateCursor() {
  cur.style.left = mouseX + 'px';
  cur.style.top  = mouseY + 'px';
  isCursorUpdating = false;
}

document.querySelectorAll('a').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('xl'));
  el.addEventListener('mouseleave', () => cur.classList.remove('xl'));
});

document.addEventListener('mouseover', e => {
  if (e.target.closest('.dark-section')) cur.classList.add('light');
  else cur.classList.remove('light');
});


/* ════════════════════════════════════════════════
   HELPER: intervalo pausable por visibilidad
   Devuelve una función stop() para cancelarlo.
   El intervalo solo corre cuando el elemento
   observado está en pantalla → ahorra CPU.
════════════════════════════════════════════════ */
function visibleInterval(targetEl, fn, ms) {
  let timer = null;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!timer) timer = setInterval(fn, ms);
    } else {
      clearInterval(timer);
      timer = null;
    }
  }, { threshold: 0 });
  io.observe(targetEl);
  return () => { clearInterval(timer); io.disconnect(); };
}


/* ════════════════════════════════════════════════
   HERO DESKTOP — PÍXELES QUE PARPADEAN
   Solo píxeles blancos que se prenden y apagan
   sobre las fotos. Sin glass, sin hover.
════════════════════════════════════════════════ */
function initInteractivePixelHero() {
  const overlay = document.getElementById('pixel-overlay');
  if (!overlay) return;
  if (window.innerWidth <= 960 || ('ontouchstart' in window)) return;
  overlay.innerHTML = '';

  const cols = 60, rows = 30;
  const bounds = [
    { c1: 48, c2: 59, r1: 1,  r2: 15 },
    { c1: 38, c2: 47, r1: 4,  r2: 15 },
    { c1: 43, c2: 52, r1: 12, r2: 22 },
    { c1: 52, c2: 62, r1: 13, r2: 24 }
  ];

  overlay.style.gridTemplateColumns = `repeat(${cols}, var(--px))`;

  const fragment   = document.createDocumentFragment();
  const edgePixels = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pixel = document.createElement('div');
      pixel.className = 'interactive-pixel';

      let minDist = 999;
      for (let b of bounds) {
        let dC = Math.max(b.c1 - c, 0, c - b.c2);
        let dR = Math.max(b.r1 - r, 0, r - b.r2);
        minDist = Math.min(minDist, Math.max(dC, dR));
      }

      let isRevealed = false, isEdge = false;
      if (minDist === 0) {
        let edgeDist = 999;
        for (let b of bounds) {
          if (c >= b.c1 && c <= b.c2 && r >= b.r1 && r <= b.r2)
            edgeDist = Math.min(edgeDist, c - b.c1, b.c2 - c, r - b.r1, b.r2 - r);
        }
        if (edgeDist <= 1)       { isRevealed = Math.random() > 0.5;  isEdge = true; }
        else if (edgeDist === 2) { isRevealed = Math.random() > 0.15; isEdge = Math.random() > 0.5; }
        else                     { isRevealed = Math.random() > 0.05; }
      } else if (minDist === 1) { isRevealed = Math.random() > 0.75; isEdge = true; }
        else if (minDist === 2) { isRevealed = Math.random() > 0.88; isEdge = true; }
        else if (minDist === 3) { isRevealed = Math.random() > 0.96; isEdge = true; }

      pixel.dataset.initialState = isRevealed ? 'revealed' : 'hidden';
      if (isRevealed) pixel.classList.add('revealed');
      if (isEdge) edgePixels.push(pixel);
      fragment.appendChild(pixel);
    }
  }
  overlay.appendChild(fragment);

  // Solo parpadeo automático — sin hover ni glass
  if (edgePixels.length > 0) {
    visibleInterval(overlay, () => {
      for (let i = 0; i < 15; i++) {
        const p = edgePixels[Math.floor(Math.random() * edgePixels.length)];
        if (!p) continue;
        p.classList.toggle('revealed');
        setTimeout(() => {
          if (p.dataset.initialState === 'revealed') p.classList.add('revealed');
          else p.classList.remove('revealed');
        }, Math.random() * 700 + 300);
      }
    }, 600);
  }
}


/* ════════════════════════════════════════════════
   LÍNEAS DE CONEXIÓN DEL HERO
════════════════════════════════════════════════ */
function drawConnectionLines() {
  const svg = document.getElementById('connection-lines');
  if (!svg) return;
  svg.innerHTML = '';

  function createLine(startX, startY, endX, endY) {
    const line  = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const midX  = startX + (endX - startX) * 0.5;
    line.setAttribute('points', `${startX},${startY} ${midX},${startY} ${endX},${endY}`);
    line.setAttribute('class', 'connect-line');
    svg.appendChild(line);
  }

  const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--px')) || 38;
  createLine(px * 55, px * 6,  px * 61, px * 5);
  createLine(px * 58, px * 18, px * 63, px * 17);
  createLine(px * 46, px * 16, px * 37, px * 18);
}


/* ════════════════════════════════════════════════
   ESCALA DEL HERO — --px GLOBAL RESPONSIVO
════════════════════════════════════════════════ */
function scaleArtboard() {
  const wrapper = document.getElementById('interactive-hero-wrapper');
  const root    = document.documentElement;
  if (!root) return;

  const vw = window.innerWidth;

  if (vw <= 960) {
    root.style.removeProperty('--px');
    root.style.removeProperty('--margin');
    if (wrapper) wrapper.style.removeProperty('height');
    return;
  }

  let px = vw / 52;
  if (px > 38) px = 38;
  if (px < 24) px = 24;

  root.style.setProperty('--px', px + 'px');
  if (wrapper) wrapper.style.height = `${px * 25}px`;
  drawConnectionLines();
}

let resizeTimeout;
window.addEventListener('resize', () => {
  if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
  resizeTimeout = requestAnimationFrame(scaleArtboard);
});


/* ════════════════════════════════════════════════
   INIT AL CARGAR
════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  document.getElementById('hn1').classList.add('go');
  document.getElementById('hn2').classList.add('go');

  scaleArtboard();
  initInteractivePixelHero();
  initMobileHeroPixels();
  drawConnectionLines();
});


/* ════════════════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('go'); obs.unobserve(e.target); }
  });
}, { threshold: .06, rootMargin: '0px 0px -35px 0px' });
document.querySelectorAll('.sr').forEach(el => obs.observe(el));


/* ════════════════════════════════════════════════
   SCROLL INDICATOR — ocultar en awards/contact/footer
════════════════════════════════════════════════ */
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  const hideZones = document.querySelectorAll('#awards, #contact, footer');
  const hideObs   = new IntersectionObserver(entries => {
    scrollIndicator.classList.toggle('hidden', entries.some(e => e.isIntersecting));
  }, { threshold: 0.05 });
  hideZones.forEach(el => hideObs.observe(el));
}


/* ════════════════════════════════════════════════
   HERO MOBILE — PÍXELES AUTOMÁTICOS
════════════════════════════════════════════════ */
function initMobileHeroPixels() {
  if (window.innerWidth > 960) return;
  const overlay = document.getElementById('hm-pixel-overlay');
  if (!overlay) return;

  const img = overlay.previousElementSibling;
  if (!img) return;

  function build() {
    const px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--px')) || 28;
    const rect     = overlay.getBoundingClientRect();
    const scrollY  = window.scrollY || 0;
    const absTop   = rect.top  + scrollY;
    const absLeft  = rect.left;
    const offsetCols = Math.round(absLeft % px);
    const offsetRows = Math.round(absTop  % px);

    overlay.style.marginLeft  = `-${offsetCols}px`;
    overlay.style.paddingLeft = `${offsetCols}px`;
    overlay.style.marginTop   = `-${offsetRows}px`;
    overlay.style.paddingTop  = `${offsetRows}px`;

    const cols = Math.ceil((rect.width  + offsetCols) / px);
    const rows = Math.ceil((rect.height + offsetRows) / px);
    overlay.style.gridTemplateColumns = `repeat(${cols}, ${px}px)`;
    overlay.style.gridTemplateRows    = `repeat(${rows}, ${px}px)`;

    overlay.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const pixels   = [];

    for (let i = 0; i < cols * rows; i++) {
      const p = document.createElement('div');
      p.className = 'hm-pixel';
      pixels.push(p);
      fragment.appendChild(p);
    }
    overlay.appendChild(fragment);

    visibleInterval(overlay, () => {
      for (let i = 0; i < 5; i++) {
        const p = pixels[Math.floor(Math.random() * pixels.length)];
        if (!p || p.classList.contains('lit')) continue;
        p.classList.add('lit');
        setTimeout(() => p.classList.remove('lit'), Math.random() * 800 + 400);
      }
    }, 800);
  }

  if (img.complete && img.naturalWidth > 0) build();
  else img.addEventListener('load', build, { once: true });
}


/* ════════════════════════════════════════════════
   MENÚ HAMBURGUESA
════════════════════════════════════════════════ */
(function () {
  const nav      = document.getElementById('nav');
  const navLinks = document.getElementById('nav-links');
  if (!nav || !navLinks) return;

  const burger = document.createElement('button');
  burger.id    = 'burger';
  burger.setAttribute('aria-label', 'Toggle menu');
  burger.innerHTML = `<span></span><span></span><span></span>`;
  nav.appendChild(burger);

  const overlay  = document.createElement('div');
  overlay.id     = 'nav-overlay';

  const closeBtn = document.createElement('button');
  closeBtn.id    = 'nav-overlay-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '<span></span><span></span>';
  closeBtn.addEventListener('click', closeMenu);
  overlay.appendChild(closeBtn);

  navLinks.querySelectorAll('a').forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.textContent;
    a.addEventListener('click', closeMenu);
    overlay.appendChild(a);
  });

  document.body.appendChild(overlay);
  let isOpen = false;

  function openMenu()  { isOpen = true;  burger.classList.add('open');    overlay.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeMenu() { isOpen = false; burger.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

  burger.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  function checkBreakpoint() {
    burger.style.display = window.innerWidth <= 960 ? 'flex' : 'none';
    if (window.innerWidth > 960) closeMenu();
  }
  window.addEventListener('resize', checkBreakpoint);
  checkBreakpoint();
})();