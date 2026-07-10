// ===================== SCROLL REVEAL =====================
(function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;

  items.forEach(el => {
    const delay = el.getAttribute('data-delay') || 0;
    el.style.setProperty('--reveal-delay', delay);
  });

  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

// Theme toggle (dark/light) with persistence
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const root = document.documentElement;

function applyTheme(theme){
  root.setAttribute('data-theme', theme);
  if(themeIcon){
    themeIcon.className = theme === 'light' ? 'ri-sun-line' : 'ri-moon-line';
  }
  localStorage.setItem('portfolio-theme', theme);
}

const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
applyTheme(savedTheme);

if(themeToggle){
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

// ===================== ANIMATED BACKGROUND =====================
(function initBackground(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  function getVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Network graph nodes ----
  const NODE_COUNT = Math.round((window.innerWidth * window.innerHeight) / 55000);
  const nodes = Array.from({ length: Math.max(30, Math.min(NODE_COUNT, 50)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.6 + 1
  }));
  const LINK_DIST = 150;

  // ---- Floating code / data tokens ----
  const TOKENS = [
    '{ }', '</>', 'def', 'import pandas as pd', 'SELECT * FROM data',
    'R\u00B2', 'ROC-AUC', '[ ]', '\u03BB', 'while True:', 'GET /api/v1',
    'model.fit(X, y)', 'accuracy: 0.92', 'df.head()', '=> null',
    'CREATE TABLE', 'try / except', '0.761', 'np.array([...])'
  ];
  const colorVars = ['--fn', '--str', '--kw', '--num'];

  const tokens = Array.from({ length: 16 }, () => spawnToken());

  function spawnToken(recycle){
    return {
      text: TOKENS[Math.floor(Math.random() * TOKENS.length)],
      x: Math.random() * w,
      y: recycle ? h + 20 : Math.random() * h,
      speed: Math.random() * 0.12 + 0.05,
      size: Math.random() * 5 + 11,
      color: colorVars[Math.floor(Math.random() * colorVars.length)],
      opacity: Math.random() * 0.5 + 0.05,
      drift: (Math.random() - 0.5) * 0.06
    };
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);

    // -- links --
    const lineColor = getVar('--border') || '#232b38';
    for(let i = 0; i < nodes.length; i++){
      for(let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < LINK_DIST){
          ctx.strokeStyle = lineColor;
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // -- nodes --
    const nodeColor = getVar('--fn') || '#82aaff';
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = nodeColor;
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      n.x += n.vx;
      n.y += n.vy;
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
    });

    // -- floating tokens --
    ctx.textBaseline = 'middle';
    tokens.forEach((t, idx) => {
      ctx.globalAlpha = t.opacity;
      ctx.fillStyle = getVar(t.color) || '#82aaff';
      ctx.font = `${t.size}px 'JetBrains Mono', monospace`;
      ctx.fillText(t.text, t.x, t.y);
      t.y -= t.speed;
      t.x += t.drift;
      if(t.y < -20){
        tokens[idx] = spawnToken(true);
      }
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// Live clock in topbar
function updateClock(){
  const el = document.getElementById('clock');
  if(!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  el.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000 * 30);

// Typed output effect in hero code block
const typedText = "Hiren Keraliya | let's build something with your data.";
const outputEl = document.getElementById('typed-output');
let idx = 0;
function typeChar(){
  if(!outputEl) return;
  if(idx <= typedText.length){
    outputEl.textContent = typedText.slice(0, idx);
    idx++;
    setTimeout(typeChar, 45);
  }
}
setTimeout(typeChar, 600);

// Contact form -> opens mail client with prefilled content
const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    const targetEmail = document.getElementById('contact-email')?.textContent.trim();

    if(!targetEmail || targetEmail.includes('PUT_E')){
      formNote.textContent = '// add your real email in index.html to enable this form';
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    formNote.textContent = '>>> opening your email client...';
  });
}

// Mobile nav burger toggle
const navBurger = document.getElementById("nav-burger");
const navTabs = document.getElementById("nav-tabs");

if (navBurger && navTabs) {

  function openMenu() {
    navTabs.classList.add("open");
    navBurger.classList.add("open");
    navBurger.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open"); // Lock body scroll
  }

  function closeMenu() {
    navTabs.classList.remove("open");
    navBurger.classList.remove("open");
    navBurger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open"); // Unlock body scroll
  }

  navBurger.addEventListener("click", (e) => {
    e.stopPropagation();

    if (navTabs.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when nav link clicked
  navTabs.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navTabs.classList.contains("open") &&
      !navTabs.contains(e.target) &&
      !navBurger.contains(e.target)
    ) {
      closeMenu();
    }
  });
}


// Active section highlight
const sections = document.querySelectorAll("section[id]");
const tabs = document.querySelectorAll(".tab");

function onScroll() {
  let current = sections[0]?.id;

  sections.forEach((sec) => {
    const rect = sec.getBoundingClientRect();

    if (rect.top <= 120) {
      current = sec.id;
    }
  });

  tabs.forEach((tab) => {
    tab.classList.toggle(
      "active",
      tab.getAttribute("href") === `#${current}`
    );
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();


// Contact form submission with AJAX (if backend is set up)
const Form = document.getElementById('contact-form');
const fNote = document.getElementById('form-note');

if (Form) {
  Form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = Form.querySelector('.form-submit');
    submitBtn.disabled = true;
    showNote('sending...', 'info');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: Form.name.value,
          email: Form.email.value,
          message: Form.message.value,
        })
      });
      const data = await res.json();

      if (data.success) {
        showNote("message sent — I'll get back to you soon!", 'success');
        showToast("Message sent successfully!", 'success');
        Form.reset();
      } else {
        const errText = data.error || 'something went wrong';
        showNote(errText, 'error');
        showToast(errText, 'error');
      }
    } catch (err) {
      showNote('network error — please try again', 'error');
      showToast('network error — please try again', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function showNote(text, type) {
  fNote.textContent = '>>> ' + text;
  fNote.classList.remove('note-success', 'note-error', 'note-visible');
  void fNote.offsetWidth; // restart animation
  if (type === 'success') fNote.classList.add('note-success');
  if (type === 'error') fNote.classList.add('note-error');
  fNote.classList.add('note-visible');
}

// ===================== TOAST NOTIFICATIONS =====================
function showToast(text, type = 'success', duration = 4000){
  const container = document.getElementById('toast-container');
  if(!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="toast-icon ${type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i>
    <span class="toast-text">${text}</span>
    <button class="toast-close" aria-label="Dismiss">✕</button>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  function dismiss(){
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  const timer = setTimeout(dismiss, duration);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
}