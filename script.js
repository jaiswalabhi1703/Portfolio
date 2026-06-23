/* ---------- year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- custom cursor ---------- */
const cursor = document.getElementById('cursor');
const dot = document.getElementById('cursor-dot');
if (window.matchMedia('(pointer:fine)').matches) {
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
if (heroCards && window.matchMedia('(pointer:fine)').matches) {
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

/* ---------- 3D tilt on project cards ---------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
