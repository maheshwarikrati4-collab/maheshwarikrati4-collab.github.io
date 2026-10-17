// krati.fm — a portfolio that plays like a playlist

const tracks = [...document.querySelectorAll('.track')];
const rows = [...document.querySelectorAll('.tracklist a')];
const nbTitle = document.getElementById('nbTitle');
const nbBar = document.getElementById('nbBar');
const playButtons = [document.getElementById('playBig'), document.getElementById('playSmall')];
const nowbar = document.querySelector('.nowbar');

// ---- "now playing" follows the section you're reading ----
function updateNowPlaying() {
  let current = null;
  tracks.forEach((t) => { if (t.getBoundingClientRect().top < innerHeight * 0.45) current = t; });
  nbTitle.textContent = current ? current.dataset.title : 'on repeat';
  rows.forEach((r) => r.classList.toggle('active', !!current && r.getAttribute('href') === '#' + current.id));
}

// ---- progress bar = how far through the playlist you've scrolled ----
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  nbBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  updateNowPlaying();
}
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

// ---- shuffle: jump to a random track ----
document.getElementById('shuffle').addEventListener('click', () => {
  const pick = tracks[Math.floor(Math.random() * tracks.length)];
  pick.scrollIntoView({ behavior: 'smooth' });
});

// ---- play: a tiny sargam (sa re ga ma pa dha ni sa) on a soft synth ----
let ctx = null;
let loopTimer = null;
const sargam = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
const pattern = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 7, 4, 2, 0];

function pluck(freq, when) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.18, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.9);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 1);
}

function playPhrase() {
  const step = 0.32;
  const t0 = ctx.currentTime + 0.05;
  pattern.forEach((note, i) => pluck(sargam[note], t0 + i * step));
  loopTimer = setTimeout(playPhrase, pattern.length * step * 1000 + 600);
}

function setPlaying(on) {
  nowbar.classList.toggle('is-playing', on);
  playButtons.forEach((b) => {
    b.classList.toggle('is-playing', on);
    b.setAttribute('aria-label', on ? 'Pause' : 'Play a little sargam');
  });
}

function toggle() {
  const playing = nowbar.classList.contains('is-playing');
  if (playing) {
    clearTimeout(loopTimer);
    if (ctx) ctx.suspend();
    setPlaying(false);
    return;
  }
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume();
    playPhrase();
    setPlaying(true);
  } catch (e) {
    document.getElementById('hint').textContent = 'your browser kept the music to itself — scroll on anyway ✦';
  }
}
playButtons.forEach((b) => b.addEventListener('click', toggle));

// ---- art: tap a drawing to see it bigger ----
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
document.querySelectorAll('.art-item').forEach((item) => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lbImg.src = item.dataset.full;
    lbImg.alt = img.alt;
    lbCap.textContent = item.querySelector('span').textContent;
    lightbox.showModal();
  });
});
lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
