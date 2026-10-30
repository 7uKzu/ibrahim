/* =========================================================
   EDIT ME: birthday date, your name and the cake message
   ========================================================= */
const CONFIG = {
  BIRTHDAY_MONTH: 10, // 1 = January … 12 = December
  BIRTHDAY_DAY: 30,
  FROM_NAME: 'Ahmad Arsalan',
  CAKE_TITLE: 'Happy birthday, Ibbi.',
  CAKE_MESSAGE: [
    'Wishing you a year full of health, happiness and success.',
    'May all your plans work out, and may Allah bless you with everything you’re hoping for.',
    'Have an amazing day.',
  ],
  CAKE_SIGNOFF: '— Ahmad Arsalan',
};

(function () {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Starfield ---------- */
  (function stars() {
    const c = $('#stars');
    const ctx = c.getContext('2d');
    let w = 0, h = 0, pts = [], frame = 0;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(260, Math.round((w * h) / 2600));
      pts = Array.from({ length: n }, () => {
        const t = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(0.2, 1.4),
          p: Math.random() * Math.PI * 2,
          s: rand(0.4, 1.8),
          c: t < 0.07 ? '#9dffc8' : t < 0.13 ? '#ffe29a' : '#ffffff',
        };
      });
      draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of pts) {
        ctx.globalAlpha = reduced ? 0.8 : 0.35 + 0.65 * Math.abs(Math.sin(s.p + (t / 1000) * s.s));
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      if (!document.hidden && frame++ % 2 === 0) draw(t);
      requestAnimationFrame(loop);
    }

    let lastW = 0;
    window.addEventListener('resize', () => {
      // Mobile URL bars change the height on scroll; only rebuild on real width changes
      if (c.clientWidth !== lastW) { lastW = c.clientWidth; build(); }
    });
    lastW = c.clientWidth;
    build();
    if (!reduced) requestAnimationFrame(loop);
  })();

  /* ---------- Confetti ---------- */
  const confetti = (function () {
    const c = $('#confetti');
    const ctx = c.getContext('2d');
    const colors = ['#39ff88', '#f5c451', '#ffe29a', '#ffffff', '#7c5cff', '#ff5fa2'];
    let parts = [], running = false, w = 0, h = 0;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst({ x = 0.5, y = 0.4, count = 120, spread = 80, power = 12, angle = -90 } = {}) {
      if (reduced) return;
      if (!running) size();
      for (let i = 0; i < count && parts.length < 700; i++) {
        const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const v = power * rand(0.45, 1.15);
        parts.push({
          x: x * w, y: y * h,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          rot: Math.random() * Math.PI * 2, vr: rand(-0.25, 0.25),
          tilt: Math.random() * Math.PI * 2,
          sw: rand(6, 11), sh: rand(8, 15),
          color: colors[(Math.random() * colors.length) | 0],
          round: Math.random() < 0.3,
          life: 0, max: rand(150, 230),
        });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      parts = parts.filter((p) => p.life < p.max && p.y < h + 40);
      for (const p of parts) {
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.26;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.tilt += 0.12;
        p.life++;
        ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.tilt));
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.sw / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.sw / 2, -p.sh / 2, p.sw, p.sh);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(tick);
      else { running = false; ctx.clearRect(0, 0, w, h); }
    }

    function cannons() {
      burst({ x: 0, y: 0.75, angle: -55, spread: 40, count: 90, power: 17 });
      burst({ x: 1, y: 0.75, angle: -125, spread: 40, count: 90, power: 17 });
    }

    return { burst, cannons };
  })();

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- Countdown / "It's today" ---------- */
  (function countdown() {
    // ?now=2026-10-25T12:00 pretends it's that moment (handy for testing)
    const param = new URLSearchParams(location.search).get('now');
    const fake = param ? new Date(param) : null;
    const offset = fake && !isNaN(fake) ? fake.getTime() - Date.now() : 0;
    const now = () => new Date(Date.now() + offset);

    const M = CONFIG.BIRTHDAY_MONTH - 1, D = CONFIG.BIRTHDAY_DAY;
    const todayEl = $('#today'), cdEl = $('#countdown');
    const out = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
    const pad = (n) => String(n).padStart(2, '0');
    let mode = null;

    function next(d) {
      let t = new Date(d.getFullYear(), M, D);
      if (t <= d) t = new Date(d.getFullYear() + 1, M, D);
      return t;
    }

    function update() {
      const d = now();
      if (d.getMonth() === M && d.getDate() === D) {
        if (mode !== 'today') {
          mode = 'today';
          todayEl.hidden = false;
          cdEl.hidden = true;
          celebrate();
        }
        return;
      }
      if (mode !== 'countdown') { mode = 'countdown'; todayEl.hidden = true; cdEl.hidden = false; }
      const left = Math.max(0, Math.floor((next(d) - d) / 1000));
      out.d.textContent = Math.floor(left / 86400);
      out.h.textContent = pad(Math.floor((left % 86400) / 3600));
      out.m.textContent = pad(Math.floor((left % 3600) / 60));
      out.s.textContent = pad(left % 60);
    }

    function celebrate() {
      confetti.cannons();
      setTimeout(() => confetti.burst({ y: 0.3, count: 160, spread: 110, power: 14 }), 700);
      setTimeout(confetti.cannons, 1500);
    }

    update();
    setInterval(update, 1000);
    // Load burst for everyone
    setTimeout(() => confetti.burst({ y: 0.38, count: 140, spread: 90, power: 13 }), 250);
  })();

  /* ---------- Easter egg: tap title 5 times ---------- */
  (function easterEgg() {
    const title = $('#hero-title');
    const rain = $('#alien-rain');
    let taps = [];

    title.addEventListener('click', () => {
      const t = performance.now();
      taps = taps.filter((x) => t - x < 2000);
      taps.push(t);
      title.classList.remove('wobble');
      void title.offsetWidth;
      title.classList.add('wobble');
      if (taps.length >= 5) { taps = []; alienRain(); }
    });

    function alienRain() {
      toast('👽 Abduction mode activated');
      const n = reduced ? 14 : 44;
      for (let i = 0; i < n; i++) {
        const el = document.createElement('span');
        el.className = reduced ? 'rain-drop calm' : 'rain-drop';
        el.textContent = Math.random() < 0.85 ? '👽' : '🛸';
        el.style.setProperty('--x', rand(-2, 96).toFixed(1) + 'vw');
        el.style.setProperty('--y', rand(5, 90).toFixed(1) + 'vh');
        el.style.setProperty('--s', rand(22, 46).toFixed(0) + 'px');
        el.style.setProperty('--d', rand(2.4, 4.6).toFixed(2) + 's');
        el.style.setProperty('--delay', rand(0, 1.6).toFixed(2) + 's');
        el.style.setProperty('--rot', rand(-360, 360).toFixed(0) + 'deg');
        el.addEventListener('animationend', () => el.remove());
        rain.appendChild(el);
      }
    }
  })();

  /* ---------- Lightbox ---------- */
  (function lightbox() {
    const lb = $('#lightbox');
    if (!lb || typeof lb.showModal !== 'function') return;
    const src = $('#lb-src'), img = $('#lb-img'), cap = $('#lb-cap');

    $$('.polaroid-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        src.srcset = btn.dataset.full + '.webp';
        img.src = btn.dataset.full + '.jpg';
        img.alt = btn.querySelector('img').alt;
        cap.textContent = btn.dataset.caption;
        lb.showModal();
      });
    });
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target === img) lb.close(); });
  })();

  /* ---------- Duo parallax ---------- */
  (function parallax() {
    if (reduced || !('IntersectionObserver' in window)) return;
    const frame = $('.duo-frame'), img = $('.duo-img');
    let active = false, raf = 0;

    function onScroll() {
      if (!active || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = frame.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        img.style.setProperty('--z', (1.16 - 0.1 * p).toFixed(4));
        img.style.setProperty('--py', ((0.5 - p) * 20).toFixed(1) + 'px');
      });
    }
    new IntersectionObserver(([e]) => { active = e.isIntersecting; onScroll(); }).observe(frame);
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ---------- Music (only if assets/song.mp3 exists) ---------- */
  const music = (function () {
    const btn = $('#music');
    let audio = null;

    function set(on) {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    }
    function pause() { if (audio && !audio.paused) { audio.pause(); set(false); } }

    btn.addEventListener('click', () => {
      if (!audio) { audio = new Audio('assets/song.mp3'); audio.loop = true; }
      if (audio.paused) {
        audio.play().then(() => { set(true); video.mute(); }).catch(() => toast('Couldn’t play the song'));
      } else pause();
    });

    fetch('assets/song.mp3', { method: 'HEAD' })
      .then((r) => { if (r.ok) btn.hidden = false; })
      .catch(() => {});

    return { pause };
  })();

  /* ---------- Alien video ---------- */
  const video = (function () {
    const v = $('#alien-video'), btn = $('#unmute');

    function label() {
      if (v.paused && v.muted) btn.textContent = '▶ Play';
      else btn.textContent = v.muted ? '🔊 Tap to unmute' : '🔇 Mute';
      btn.setAttribute('aria-pressed', String(!v.muted));
    }
    function mute() { if (!v.muted) { v.muted = true; label(); } }

    if (reduced) { v.removeAttribute('autoplay'); v.pause(); }

    btn.addEventListener('click', () => {
      v.muted = !v.muted;
      if (!v.muted) { music.pause(); v.play().catch(() => {}); }
      label();
    });
    v.addEventListener('play', label);
    v.addEventListener('pause', label);

    // Save battery: pause when scrolled away, resume when back (unless reduced motion)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) v.pause();
        else if (!reduced || !v.muted) v.play().catch(() => {});
      }, { threshold: 0.25 }).observe(v);
    }
    label();
    return { mute };
  })();

  /* ---------- Drifting aliens ---------- */
  (function drifters() {
    if (reduced) return;
    const box = $('.drifters');
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('span');
      el.className = 'drifter';
      el.textContent = i % 4 === 3 ? '🛸' : '👽';
      el.style.setProperty('--x', rand(2, 90).toFixed(1) + '%');
      el.style.setProperty('--s', rand(20, 40).toFixed(0) + 'px');
      el.style.setProperty('--d', rand(12, 22).toFixed(1) + 's');
      el.style.setProperty('--delay', (-rand(0, 20)).toFixed(1) + 's');
      el.style.setProperty('--sway', rand(-60, 60).toFixed(0) + 'px');
      box.appendChild(el);
    }
  })();

  /* ---------- Messages ---------- */
  (function messages() {
    const list = $('#messages');
    (window.MESSAGES || []).forEach((m, i) => {
      const card = document.createElement('article');
      card.className = 'msg reveal';
      card.style.setProperty('--r', ((i % 2 ? 1 : -1) * rand(0.5, 1.6)).toFixed(2) + 'deg');
      card.style.setProperty('--accent', i % 2 ? 'var(--gold)' : 'var(--green)');
      const text = document.createElement('p');
      text.className = 'text';
      text.textContent = m.text;
      const from = document.createElement('p');
      from.className = 'from';
      from.textContent = '— ' + m.from;
      card.append(text, from);
      list.appendChild(card);
    });
  })();

  /* ---------- Cake ---------- */
  (function cake() {
    const candles = $$('.candle');
    const count = $('#candle-count');
    const card = $('#wish-card');
    let left = candles.length;

    $('#wish-title').textContent = CONFIG.CAKE_TITLE;
    CONFIG.CAKE_MESSAGE.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      $('#wish-body').appendChild(p);
    });
    $('#wish-sign').textContent = CONFIG.CAKE_SIGNOFF;

    function update() {
      count.textContent = left
        ? `${left} candle${left > 1 ? 's' : ''} left${left < candles.length ? '…' : ''}`
        : 'Wish made ✨';
    }

    candles.forEach((c, i) => {
      c.addEventListener('click', () => {
        if (c.classList.contains('out')) return;
        c.classList.add('out');
        c.setAttribute('aria-pressed', 'true');
        c.setAttribute('aria-label', `Candle ${i + 1} blown out`);
        left--;
        update();
        if (!left) finish();
      });
    });

    function finish() {
      const r = $('#cake-el').getBoundingClientRect();
      confetti.burst({ y: Math.max(0.15, r.top / window.innerHeight), count: 180, spread: 110, power: 14 });
      confetti.cannons();
      setTimeout(() => {
        card.hidden = false;
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }, 600);
    }

    $('#relight').addEventListener('click', () => {
      candles.forEach((c, i) => {
        c.classList.remove('out');
        c.setAttribute('aria-pressed', 'false');
        c.setAttribute('aria-label', `Blow out candle ${i + 1}`);
      });
      left = candles.length;
      card.hidden = true;
      update();
      $('#cake-el').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
    update();
  })();

  /* ---------- Names from CONFIG ---------- */
  $$('[data-from-name]').forEach((el) => { el.textContent = CONFIG.FROM_NAME; });

  /* ---------- Scroll reveal ---------- */
  (function reveal() {
    const els = $$('.reveal');
    if (reduced || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    els.forEach((el) => io.observe(el));
  })();
})();
