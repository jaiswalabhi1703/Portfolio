/* ---------- year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

const finePointer = window.matchMedia('(pointer:fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- custom cursor ---------- */
const cursor = document.getElementById('cursor');
const dot = document.getElementById('cursor-dot');
if (finePointer) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
  });
  (function loop() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,[data-tilt],.pill-row li').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

/* ---------- nav: scrolled state + progress ---------- */
const nav = document.getElementById('nav');
const progress = document.getElementById('scroll-progress');
const arrow = document.getElementById('hero-arrow');
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 30);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (y / h * 100) + '%';
  if (arrow) arrow.classList.toggle('go', y > 60);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- mobile menu ---------- */
const toggle = document.getElementById('nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.classList.remove('open'); links.classList.remove('open');
}));

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- animated counters ---------- */
const counters = document.querySelectorAll('.num');
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.target.split('.')[1] || '').length;
    const dur = 1600; const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach(c => cio.observe(c));

/* ---------- floating hero cards parallax ---------- */
const cards = document.querySelectorAll('.tcard');
const heroCards = document.getElementById('hero-cards');
if (heroCards && finePointer) {
  window.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth - 0.5);
    const cy = (e.clientY / window.innerHeight - 0.5);
    cards.forEach(card => {
      const d = parseFloat(card.dataset.depth);
      card.style.transform =
        `translate3d(${cx * d * 60}px,${cy * d * 60}px,0) rotateX(${-cy * d * 14}deg) rotateY(${cx * d * 14}deg)`;
    });
  });
}

/* ---------- 3D tilt + glare on project cards ---------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  const glare = document.createElement('div');
  glare.className = 'glare';
  card.appendChild(glare);
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 7}deg) translateY(-6px) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ---------- spotlight glow follows the cursor ---------- */
if (finePointer) {
  document.querySelectorAll('.project,.skill-card,.stat,.edu-card').forEach(el => {
    el.classList.add('spotlight');
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

/* ---------- magnetic buttons ---------- */
if (finePointer && !reducedMotion) {
  document.querySelectorAll('.btn,.nav-cta,.brand-mark').forEach(btn => {
    const strength = btn.classList.contains('brand-mark') ? 0.35 : 0.28;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * strength}px,${dy * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      btn.style.transform = '';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

/* ============================================================
   3D SCENE — particle starfield + wireframe icosahedron
   Hand-rolled perspective projection on a 2D canvas, no libs.
   ============================================================ */
const canvas = document.getElementById('bg3d');
if (canvas && !reducedMotion) {
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const FOV = 620;
  let W = 0, H = 0, mouseX = 0, mouseY = 0, smX = 0, smY = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX / W - 0.5;
    mouseY = e.clientY / H - 0.5;
  });

  /* ----- particles with real z-depth ----- */
  const COUNT = Math.min(150, Math.floor(W * H / 11000));
  const DEPTH = 900;
  const particles = [];
  const PALETTE = ['139,124,255', '56,225,255', '255,122,198'];
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: (Math.random() - 0.5) * W * 1.4,
      y: (Math.random() - 0.5) * H * 1.4,
      z: Math.random() * DEPTH,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      vz: (Math.random() - 0.5) * 0.35,
      c: PALETTE[(Math.random() * PALETTE.length) | 0],
      r: 0.8 + Math.random() * 1.6
    });
  }

  function project(x, y, z, camX, camY) {
    const s = FOV / (FOV + z);
    return { sx: W / 2 + (x + camX) * s, sy: H / 2 + (y + camY) * s, s };
  }

  /* ----- icosahedron wireframe ----- */
  const PHI = (1 + Math.sqrt(5)) / 2;
  const V = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
  ];
  // edges = vertex pairs at minimal distance (2 for this construction)
  const EDGES = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
    const d = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]);
    if (Math.abs(d - 2) < 1e-6) EDGES.push([i, j]);
  }

  function drawIcosahedron(t, heroFade) {
    if (W < 1000 || heroFade <= 0) return;
    const cx = W * 0.72, cy = H * 0.44;
    const R = Math.min(W, H) * 0.21;
    const ry = t * 0.00035 + smX * 1.4;
    const rx = 0.35 + Math.sin(t * 0.00022) * 0.25 + smY * 1.1;

    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const pts = V.map(([x, y, z]) => {
      // rotate Y then X
      let px = x * cosY + z * sinY;
      let pz = -x * sinY + z * cosY;
      let py = y * cosX - pz * sinX;
      pz = y * sinX + pz * cosX;
      const s = FOV / (FOV + pz * R * 0.9 + 200);
      return { x: cx + px * R * s, y: cy + py * R * s, z: pz, s };
    });

    ctx.lineWidth = 1;
    EDGES.forEach(([a, b]) => {
      const A = pts[a], B = pts[b];
      const depth = (A.z + B.z) / 2;               // -~1.9 .. 1.9
      const near = 1 - (depth + 2) / 4;            // 0(front)..1 flipped below
      const alpha = (0.08 + near * 0.30) * heroFade;
      const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
      g.addColorStop(0, `rgba(139,124,255,${alpha})`);
      g.addColorStop(1, `rgba(56,225,255,${alpha})`);
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    });
    pts.forEach(p => {
      const near = 1 - (p.z + 2) / 4;
      const alpha = (0.25 + near * 0.55) * heroFade;
      ctx.fillStyle = `rgba(196,188,255,${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.1 * p.s, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* ----- render loop ----- */
  const LINK_DIST = 130;
  function render(t) {
    requestAnimationFrame(render);
    if (document.hidden) return;
    ctx.clearRect(0, 0, W, H);

    smX += (mouseX - smX) * 0.04;
    smY += (mouseY - smY) * 0.04;
    const camX = -smX * 70, camY = -smY * 70;

    const proj = [];
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (p.z < 0) p.z += DEPTH; if (p.z > DEPTH) p.z -= DEPTH;
      if (p.x < -W * 0.7) p.x += W * 1.4; if (p.x > W * 0.7) p.x -= W * 1.4;
      if (p.y < -H * 0.7) p.y += H * 1.4; if (p.y > H * 0.7) p.y -= H * 1.4;
      const q = project(p.x, p.y, p.z, camX, camY);
      q.c = p.c; q.r = p.r;
      proj.push(q);
    }

    // connective tissue
    for (let i = 0; i < proj.length; i++) {
      for (let j = i + 1; j < proj.length; j++) {
        const a = proj[i], b = proj[j];
        const dx = a.sx - b.sx, dy = a.sy - b.sy;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.14 * Math.min(a.s, b.s);
          ctx.strokeStyle = `rgba(139,124,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        }
      }
    }
    // stars
    for (const q of proj) {
      const alpha = 0.25 + q.s * 0.55;
      ctx.fillStyle = `rgba(${q.c},${alpha})`;
      ctx.beginPath(); ctx.arc(q.sx, q.sy, q.r * q.s, 0, Math.PI * 2); ctx.fill();
    }

    // wireframe fades out as you scroll past the hero
    const heroFade = Math.max(0, 1 - window.scrollY / (H * 0.75));
    drawIcosahedron(t, heroFade);
  }
  requestAnimationFrame(render);
}

/* ============ COPY EMAIL ============ */
const copyBtn = document.getElementById('copy-email');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // clipboard API needs https/localhost — fall back to a hidden textarea
      const ta = document.createElement('textarea');
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    copyBtn.textContent = 'Copied ✓';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy email';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
}
