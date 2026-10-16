(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const body = document.body;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- confetti ---------- */
  const cv = $('#confetti');
  const ctx = cv.getContext('2d');
  const COLORS = ['#e0c288', '#c68a4b', '#c4908f', '#fbf3e4', '#a96b32', '#f0d9a0'];
  let pieces = [];
  let running = false;

  function sizeCanvas() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 90) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 4 + Math.random() * 8;
      pieces.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 5,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 6,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        max: 90 + Math.random() * 60
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    pieces = pieces.filter(p => p.life < p.max);
    for (const p of pieces) {
      p.life++;
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (pieces.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
  }

  function burstAtElement(el, count = 40) {
    const r = el.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, count);
  }

  function celebrate() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => confetti(rand(0.15, 0.85) * window.innerWidth, rand(0.2, 0.6) * window.innerHeight, 70), i * 250);
    }
  }
  $$('.js-celebrate').forEach(b => b.addEventListener('click', celebrate));

  /* ---------- floating particles + stars ---------- */
  const pc = $('#particles');
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    const size = 6 + Math.random() * 14;
    s.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${10 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s`;
    pc.appendChild(s);
  }
  const starsBox = $('#stars');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 62}%;animation-delay:${-Math.random() * 3}s;animation-duration:${2 + Math.random() * 3}s`;
    starsBox.appendChild(s);
  }

  /* ---------- photos with graceful fallback ---------- */
  const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];

  function photoFallback(img, name) {
    if (!img.parentNode) return;
    const d = document.createElement('div');
    d.className = 'photo-fallback';
    d.innerHTML = '<span class="pf-ico">📷</span><small>Add <b>images/' + name + '.jpg</b><br>to show this photo</small>';
    img.replaceWith(d);
  }

  function loadPhoto(img, i = 0) {
    const name = img.dataset.photo;
    img.loading = 'eager';
    if (i >= EXTS.length) {
      photoFallback(img, name);
      return;
    }
    img.onerror = () => loadPhoto(img, i + 1);
    img.src = 'images/' + name + '.' + EXTS[i];
  }
  $$('img[data-photo]').forEach(img => loadPhoto(img));

  /* ---------- hero title letters ---------- */
  const heroTitle = $('#heroTitle');
  (function splitTitle() {
    const txt = heroTitle.textContent.trim();
    heroTitle.setAttribute('aria-label', txt);
    heroTitle.textContent = '';
    let n = 0;
    txt.split(' ').forEach(w => {
      const ws = document.createElement('span');
      ws.className = 'word';
      ws.setAttribute('aria-hidden', 'true');
      Array.from(w).forEach(ch => {
        const c = document.createElement('span');
        c.className = 'ch';
        c.style.setProperty('--d', n++);
        c.textContent = ch;
        ws.appendChild(c);
      });
      heroTitle.appendChild(ws);
    });
  })();

  /* ---------- intro ---------- */
  const intro = $('#intro');
  const hero = $('#hero');

  function startIntro() {
    intro.classList.remove('hide', 'gone', 'play');
    void intro.offsetWidth;
    intro.classList.add('play');
    body.classList.add('locked');
  }

  $('#openBtn').addEventListener('click', () => {
    intro.classList.add('hide');
    body.classList.remove('locked');
    setTimeout(() => {
      hero.classList.add('go');
      confetti(window.innerWidth / 2, window.innerHeight * 0.45, 120);
    }, 500);
    setTimeout(() => intro.classList.add('gone'), 1300);
  });

  /* ---------- countdown ---------- */
  const cdEl = $('#countdown');
  function updateCountdown() {
    const now = new Date();
    const y = now.getFullYear();
    const start = new Date(y, 9, 18);
    const end = new Date(y, 9, 19);
    if (now >= start && now < end) {
      cdEl.innerHTML = '<span class="today">🎂 It is today! Happy Birthday!</span>';
      return;
    }
    const upcoming = now < start;
    const target = upcoming ? start : new Date(y + 1, 9, 18);
    let diff = Math.floor((target - now) / 1000);
    const d = Math.floor(diff / 86400); diff %= 86400;
    const h = Math.floor(diff / 3600); diff %= 3600;
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    const label = upcoming ? 'until the big day' : 'until the next birthday';
    cdEl.innerHTML =
      '<div class="cd">' +
      '<div><b>' + d + '</b><small>days</small></div>' +
      '<div><b>' + h + '</b><small>hours</small></div>' +
      '<div><b>' + m + '</b><small>mins</small></div>' +
      '<div><b>' + s + '</b><small>secs</small></div>' +
      '</div><p class="cd-label">' + label + '</p>';
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- scroll reveal + progress ---------- */
  let io = null;
  function initReveal() {
    if (io) io.disconnect();
    io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(el => {
      el.classList.remove('in');
      io.observe(el);
    });
  }
  initReveal();

  const progress = $('#progress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    progress.style.width = (h.scrollTop / max * 100) + '%';
  }, { passive: true });

  /* ---------- nickname flip cards ---------- */
  const flipCards = $$('.flip-card');
  flipCards.forEach(c => {
    c.addEventListener('click', () => {
      const flipped = c.classList.toggle('flipped');
      c.setAttribute('aria-pressed', String(flipped));
      if (flipped) burstAtElement(c, 25);
    });
  });

  /* ---------- coffee ---------- */
  const liquid = $('#liquid');
  const foam = $('#foam');
  const steam = $('#steam');
  const chipsBox = $('#chips');
  const coffeeResult = $('#coffeeResult');
  const COFFEE_INTRO = 'Start with espresso, then add whatever she would order.';
  const coffee = new Set();
  const BASE = {
    espresso: [59, 35, 20],
    milk: [232, 205, 170],
    caramel: [198, 138, 75],
    rose: [196, 144, 143],
    sugar: [245, 230, 200]
  };
  const COFFEE_WISHES = [
    'May your coffee always be hot and your deadlines always be late.',
    'May every sip bring a brilliant idea and a better sketch.',
    'May your next cup be strong enough to survive your busiest week.',
    'May your mornings be slow, your coffee be perfect, and your future be huge.',
    'May the only thing you ever run out of be sugar, never dreams.'
  ];
  const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

  function coffeeName() {
    const base = coffee.has('milk')
      ? (coffee.has('foam') ? 'Cappuccino' : 'Latte')
      : (coffee.has('foam') ? 'Macchiato' : 'Espresso');
    const pre = [];
    if (coffee.has('caramel')) pre.push('Caramel');
    if (coffee.has('rose')) pre.push('Rose');
    if (coffee.has('sugar')) pre.push('Extra-Sweet');
    return (pre.join(' ') + ' ' + base).trim();
  }

  function renderCoffee() {
    let rgb = BASE.espresso.slice();
    let level = 0;
    if (coffee.has('espresso')) {
      level = 28;
      if (coffee.has('milk')) { rgb = lerp(rgb, BASE.milk, 0.55); level += 30; }
      if (coffee.has('caramel')) { rgb = lerp(rgb, BASE.caramel, 0.4); level += 8; }
      if (coffee.has('rose')) { rgb = lerp(rgb, BASE.rose, 0.3); level += 6; }
      if (coffee.has('sugar')) { rgb = lerp(rgb, BASE.sugar, 0.15); level += 4; }
      if (coffee.has('foam')) { level += 12; }
    }
    liquid.style.height = level + '%';
    liquid.style.background = 'rgb(' + rgb.join(',') + ')';
    foam.style.opacity = (coffee.has('foam') && level) ? '1' : '0';
    steam.classList.toggle('on', level > 0);
    $$('.chip', chipsBox).forEach(c => {
      const on = coffee.has(c.dataset.ing);
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', String(on));
    });
  }

  chipsBox.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const ing = chip.dataset.ing;
    if (ing !== 'espresso' && !coffee.has('espresso')) {
      coffeeResult.textContent = 'Every great coffee starts with espresso. Add that first ☕';
      return;
    }
    if (coffee.has(ing)) {
      if (ing === 'espresso') coffee.clear();
      else coffee.delete(ing);
    } else {
      coffee.add(ing);
    }
    renderCoffee();
    coffeeResult.innerHTML = coffee.has('espresso')
      ? 'Brewing: <strong>' + coffeeName() + '</strong>'
      : COFFEE_INTRO;
  });

  $('#serveBtn').addEventListener('click', () => {
    if (!coffee.has('espresso')) {
      coffeeResult.textContent = 'Every great coffee starts with espresso. Add that first ☕';
      return;
    }
    const w = COFFEE_WISHES[Math.floor(Math.random() * COFFEE_WISHES.length)];
    coffeeResult.innerHTML = '<strong>' + coffeeName() + '</strong>, served for Dhole Madam. ☕<em>' + w + '</em>';
    burstAtElement($('#serveBtn'), 50);
  });

  function coffeeReset() {
    coffee.clear();
    renderCoffee();
    coffeeResult.textContent = COFFEE_INTRO;
  }
  $('#coffeeReset').addEventListener('click', coffeeReset);
  renderCoffee();

  /* ---------- blueprint → building ---------- */
  const bpStage = $('#bpStage');
  const bpBtn = $('#bpBtn');
  const bpCap = $('#bpCap');
  const svgNS = 'http://www.w3.org/2000/svg';
  const winGroup = $('#windows');
  let bpTimers = [];
  let bpRunning = false;
  let bpAutoDone = false;

  (function buildWindows() {
    const list = [];
    [240, 290, 340].forEach(x => [95, 145, 195].forEach(y => list.push([x, y, 28, 34])));
    [106, 162].forEach(x => [205, 265].forEach(y => list.push([x, y, 36, 40])));
    [396, 452].forEach(x => [165, 225, 285].forEach(y => list.push([x, y, 36, 40])));
    list.forEach(([x, y, w, h], i) => {
      const r = document.createElementNS(svgNS, 'rect');
      r.setAttribute('class', 'win');
      r.setAttribute('x', x); r.setAttribute('y', y);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.style.setProperty('--i', i);
      winGroup.appendChild(r);
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('class', 'bp');
      p.setAttribute('pathLength', '1');
      p.setAttribute('d', 'M' + x + ' ' + y + 'h' + w + 'v' + h + 'h-' + w + 'z');
      $('#lines').appendChild(p);
    });
    $$('.bp', bpStage).forEach((el, i) => el.style.setProperty('--i', i));
  })();

  function bpReset() {
    bpTimers.forEach(clearTimeout);
    bpTimers = [];
    bpStage.classList.remove('drawing', 'built');
    bpRunning = false;
    bpBtn.disabled = false;
    bpBtn.textContent = '✏️ Draw the blueprint';
    bpCap.textContent = 'A blank sheet… every great building starts here.';
  }

  function bpPlay() {
    if (bpRunning) return;
    bpReset();
    bpRunning = true;
    bpBtn.disabled = true;
    bpBtn.textContent = 'Drawing…';
    void bpStage.offsetWidth;
    bpStage.classList.add('drawing');
    bpCap.textContent = 'Sketching the plan, line by line…';
    bpTimers.push(setTimeout(() => { bpCap.textContent = 'Walls, windows, and one very ambitious door…'; }, 1800));
    bpTimers.push(setTimeout(() => {
      bpStage.classList.add('built');
      bpCap.textContent = 'Shruti Gavali & Associates. Visits by appointment only. 📅';
    }, 4300));
    bpTimers.push(setTimeout(() => {
      bpRunning = false;
      bpBtn.disabled = false;
      bpBtn.textContent = '↺ Redraw';
      burstAtElement(bpStage, 70);
    }, 6200));
  }
  bpBtn.addEventListener('click', bpPlay);

  const bpObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !bpAutoDone) {
        bpAutoDone = true;
        setTimeout(bpPlay, 600);
      }
    });
  }, { threshold: 0.6 });
  bpObserver.observe(bpStage);

  /* ---------- letter ---------- */
  const env = $('#envelope');
  const letter = $('#letter');
  const envHint = $('#envHint');

  function openLetter() {
    env.classList.add('open');
    env.setAttribute('aria-expanded', 'true');
    letter.classList.add('show');
    letter.setAttribute('aria-hidden', 'false');
    envHint.classList.add('gone');
    setTimeout(() => letter.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
  }
  function closeLetter() {
    env.classList.remove('open');
    env.setAttribute('aria-expanded', 'false');
    letter.classList.remove('show');
    letter.setAttribute('aria-hidden', 'true');
    envHint.classList.remove('gone');
  }
  env.addEventListener('click', () => {
    if (env.classList.contains('open')) closeLetter();
    else openLetter();
  });
  $('#foldBtn').addEventListener('click', () => {
    closeLetter();
    env.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- gallery + lightbox ---------- */
  const items = $$('.g-item');
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbPh = $('#lbPh');
  const lbPhTxt = $('#lbPhTxt');
  const lbCap = $('#lbCap');
  const lbCount = $('#lbCount');
  let cur = 0;

  items.forEach((it, i) => {
    const cap = document.createElement('span');
    cap.className = 'g-cap';
    cap.textContent = it.dataset.caption;
    it.appendChild(cap);
    it.setAttribute('aria-label', 'Open photo ' + (i + 1) + ': ' + it.dataset.caption);
    it.addEventListener('click', () => openLB(i));
  });

  function showLB(i) {
    cur = (i + items.length) % items.length;
    const it = items[cur];
    const img = $('img', it);
    lbCap.textContent = it.dataset.caption;
    lbCount.textContent = (cur + 1) + ' / ' + items.length;
    if (img && img.complete && img.naturalWidth > 0) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbImg.hidden = false;
      lbPh.hidden = true;
    } else {
      lbImg.hidden = true;
      lbPh.hidden = false;
      lbPhTxt.innerHTML = 'Add <b>images/' + it.dataset.photo + '.jpg</b><br>to show this photo';
    }
  }
  function openLB(i) {
    showLB(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    body.classList.add('noscroll');
    $('#lbClose').focus();
  }
  function closeLB() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    body.classList.remove('noscroll');
  }
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', () => showLB(cur - 1));
  $('#lbNext').addEventListener('click', () => showLB(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') showLB(cur - 1);
    if (e.key === 'ArrowRight') showLB(cur + 1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLB(dx < 0 ? cur + 1 : cur - 1);
    touchX = null;
  }, { passive: true });

  /* ---------- six wishes ---------- */
  const wishes = $$('.wish');
  const wishCount = $('#wishCount');
  const wishBar = $('#wishBar');
  const wishDone = $('#wishDone');

  function updateWishes() {
    const n = $$('.wish.open').length;
    wishCount.textContent = n + ' / 6 wishes opened';
    wishBar.style.width = (n / 6 * 100) + '%';
    wishDone.classList.toggle('show', n === 6);
    if (n === 6) wishCount.textContent = 'All six wishes opened! 🎉';
  }
  wishes.forEach(w => {
    w.addEventListener('click', () => {
      if (w.classList.contains('open')) return;
      w.classList.add('open');
      w.setAttribute('aria-pressed', 'true');
      burstAtElement(w, 35);
      updateWishes();
    });
  });
  wishDone.addEventListener('click', () => {
    $('#finale').scrollIntoView({ behavior: 'smooth' });
    setTimeout(playFinale, 1100);
  });

  /* ---------- sunrise finale ---------- */
  const finale = $('#finale');
  const fLine = $('#finaleLine');
  const fTitle = $('#finaleTitle');
  const fBtns = $('#finaleBtns');
  const fStart = $('#finaleStart');
  const F_INTRO = 'The best part is still to come…';
  const F_LINES = [
    'Every great building begins as a dream on paper…',
    'Every dream needs someone who believes in it…',
    'And every sunrise needs a reason to shine.',
    'Today, that reason is you.'
  ];
  let fToken = 0;
  let fStarted = false;

  async function playFinale() {
    if (fStarted) return;
    fStarted = true;
    const t = ++fToken;
    const alive = () => t === fToken;

    fStart.classList.add('hidden-btn');
    finale.classList.add('rising');
    await sleep(1500);
    if (!alive()) return;

    fLine.classList.remove('show');
    await sleep(900);
    if (!alive()) return;

    for (const line of F_LINES) {
      fLine.textContent = line;
      fLine.classList.add('show');
      await sleep(3200);
      if (!alive()) return;
      fLine.classList.remove('show');
      await sleep(900);
      if (!alive()) return;
    }

    fTitle.classList.add('show');
    for (let i = 0; i < 3; i++) {
      confetti(rand(0.2, 0.8) * window.innerWidth, rand(0.2, 0.5) * window.innerHeight, 90);
      await sleep(500);
      if (!alive()) return;
    }
    fBtns.classList.add('show');
  }
  fStart.addEventListener('click', playFinale);

  function resetFinale() {
    fToken++;
    fStarted = false;
    finale.classList.remove('rising');
    fTitle.classList.remove('show');
    fBtns.classList.remove('show');
    fStart.classList.remove('hidden-btn');
    fLine.textContent = F_INTRO;
    fLine.classList.add('show');
  }

  /* ---------- replay everything ---------- */
  function replayAll() {
    resetFinale();
    coffeeReset();
    bpReset();
    bpAutoDone = false;
    closeLetter();
    closeLB();
    wishes.forEach(w => {
      w.classList.remove('open');
      w.setAttribute('aria-pressed', 'false');
    });
    updateWishes();
    wishCount.textContent = '0 / 6 wishes opened';
    flipCards.forEach(c => {
      c.classList.remove('flipped');
      c.setAttribute('aria-pressed', 'false');
    });
    hero.classList.remove('go');

    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = '';

    initReveal();
    startIntro();
  }
  $$('.js-replay').forEach(b => b.addEventListener('click', replayAll));
})();
