// tap or click anywhere: a glass ripple, then frosted bubbles carrying music notes float up ♪
(() => {
  const glyphs = ['♪', '♫', '♬', '♩', '♡'];
  const colours = ['#2f4f9e', '#4a6fc4', '#e48aa6', '#d9a92e', '#1b3263'];
  const tints = ['rgba(169,196,236,.35)', 'rgba(245,184,203,.35)', 'rgba(247,226,161,.4)', 'rgba(255,255,255,.4)'];
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  const style = document.createElement('style');
  style.textContent = `
    .glass-bubble, .glass-ripple {
      position: fixed; left: 0; top: 0; z-index: 9999;
      pointer-events: none; user-select: none;
      will-change: transform, opacity;
      border-radius: 50%;
      -webkit-backdrop-filter: blur(6px) saturate(160%);
      backdrop-filter: blur(6px) saturate(160%);
      border: 1px solid rgba(255,255,255,.75);
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,.9),
        inset 0 -6px 10px rgba(255,255,255,.25),
        0 6px 18px -6px rgba(20,37,74,.35);
    }
    .glass-bubble {
      display: grid; place-items: center;
      font-family: "DM Sans", system-ui, sans-serif; font-weight: 700; line-height: 1;
    }
    .glass-bubble::before { /* the little shine on the glass */
      content: ""; position: absolute; left: 22%; top: 14%;
      width: 34%; height: 22%; border-radius: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,0));
      transform: rotate(-25deg);
    }
    .glass-ripple { background: rgba(255,255,255,.18); }`;
  document.head.appendChild(style);

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const smooth = 'cubic-bezier(.22, 1, .36, 1)'; // ease-out-quint: fast start, silky landing

  function ripple(x, y) {
    const el = document.createElement('span');
    el.className = 'glass-ripple';
    const size = 70;
    Object.assign(el.style, { width: size + 'px', height: size + 'px' });
    document.body.appendChild(el);
    const at = (s) => `translate(${x - size / 2}px, ${y - size / 2}px) scale(${s})`;
    el.animate(
      [{ transform: at(0.2), opacity: 0.9 }, { transform: at(1.4), opacity: 0 }],
      { duration: 650, easing: smooth, fill: 'forwards' }
    ).finished.then(() => el.remove(), () => el.remove());
  }

  function bubble(x, y, i, count) {
    const el = document.createElement('span');
    el.className = 'glass-bubble';
    const size = rand(30, 42);
    el.textContent = pick(glyphs);
    Object.assign(el.style, {
      width: size + 'px', height: size + 'px',
      fontSize: size * 0.48 + 'px',
      color: pick(colours),
      background: pick(tints),
    });
    document.body.appendChild(el);

    // spread the bubbles evenly in an upward fan, with a little randomness
    const spread = count > 1 ? (i / (count - 1)) - 0.5 : 0;
    const dx = spread * 120 + rand(-12, 12);
    const rise = rand(90, 140);
    const sway = rand(10, 18) * (Math.random() < 0.5 ? -1 : 1);
    const ox = x - size / 2, oy = y - size / 2;
    const t = (px, py, s, r) => `translate(${ox + px}px, ${oy + py}px) scale(${s}) rotate(${r}deg)`;

    el.animate(
      [
        { transform: t(0, 0, 0.3, 0), opacity: 0, offset: 0 },
        { transform: t(dx * 0.45, -rise * 0.4, 1.05, sway * 0.4), opacity: 1, offset: 0.3 },
        { transform: t(dx * 0.8 + sway, -rise * 0.78, 1, -sway * 0.3), opacity: 0.9, offset: 0.7 },
        { transform: t(dx + sway * 0.4, -rise, 0.92, sway * 0.2), opacity: 0, offset: 1 },
      ],
      { duration: rand(1500, 1900), delay: i * 45, easing: 'cubic-bezier(.33, 1, .68, 1)', fill: 'both' }
    ).finished.then(() => el.remove(), () => el.remove());
  }

  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // left click / touch only
    ripple(e.clientX, e.clientY);
    const count = calm.matches ? 0 : 4; // reduced motion: just the soft ripple
    for (let i = 0; i < count; i++) bubble(e.clientX, e.clientY, i, count);
  }, { passive: true });
})();

// glassy hover: let the shine follow the cursor inside cards, rows and buttons
(() => {
  const sel = '.card, .tracklist a, .contact a, .art-item, .ghost, .btn-ghost, .p-nav a';
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest && e.target.closest(sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();
