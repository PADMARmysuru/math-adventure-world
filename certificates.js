/* ==============================================================
   🎓 Math Adventure World — certificates.js
   --------------------------------------------------------------
   One certificate per place (earned when every module there is
   mastered) plus the Grand Explorer certificate for all places.
   Certificates print on one A4 landscape page (or "Save as PDF").
   Grown-ups can switch on previews, stamped PREVIEW.
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  if (!MA) return;
  const $ = (s, r = document) => r.querySelector(s);
  const make = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const say = text => MA.miloSay(text, 'certs');
  let preview = false;
  let current = null;

  const PLACES = MA.LOCATIONS.map(loc => ({
    id: loc.id, name: loc.name, emoji: loc.emoji, color: loc.color, tint: loc.tint,
    modules: loc.modules.filter(m => m.url).map(m => `${m.icon} ${m.title}`),
    progress: () => MA.placeProgress(loc)
  }));
  const GRAND = { id: 'grand', name: 'Grand Explorer', emoji: '🌈', color: '#7B61FF', tint: '#F3F1FF', grand: true };
  const placeEmoji = { 'number-island': '🏝️', 'shape-castle': '🏰', 'measure-mountain': '🏔️', 'money-market': '💰', 'time-town': '⏰', 'data-park': '📊', 'pattern-forest': '🌳', 'challenge-arena': '🎯' };
  const grandProgress = () => { const done = PLACES.filter(p => p.progress().complete).length; return { done, total: PLACES.length, complete: done === PLACES.length }; };
  const progressOf = c => (c.grand ? grandProgress() : c.progress());
  const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ------------------------------------------------------------
     Certificate cards
     ------------------------------------------------------------ */
  function renderGrid() {
    const grid = $('#cert-grid');
    grid.innerHTML = '';
    const all = [...PLACES, GRAND];
    const earned = all.filter(c => progressOf(c).complete).length;
    $('#cert-summary').textContent = `🎓 You have earned ${earned} of ${all.length} certificates.`;
    all.forEach(c => {
      const p = progressOf(c);
      const open = p.complete || preview;
      const li = make('li', `cert-card${p.complete ? ' is-earned' : ''}${c.grand ? ' cert-card--grand' : ''}`);
      li.style.setProperty('--c', c.color);
      li.style.setProperty('--t', c.tint);
      li.append(make('span', 'cert-card__emoji', placeEmoji[c.id] || c.emoji));
      li.append(make('strong', 'cert-card__name', c.grand ? '🌈 Grand Explorer' : c.name));
      const bar = make('span', 'cert-card__bar');
      const fill = make('span', 'cert-card__fill');
      fill.style.width = `${(p.done / p.total) * 100}%`;
      bar.append(fill);
      li.append(bar, make('small', 'cert-card__count', c.grand ? `${p.done} of ${p.total} places complete` : `${p.done} of ${p.total} adventures mastered`));
      const btn = make('button', `btn ${p.complete ? 'btn--sun' : 'btn--ghost'} cert-card__btn`, p.complete ? '🎓 View & print' : preview ? '👀 Preview' : '🔒 Keep going!');
      btn.type = 'button';
      btn.disabled = !open;
      btn.dataset.cert = c.id;
      btn.addEventListener('click', () => show(c));
      li.append(btn);
      grid.append(li);
    });
  }

  /* ------------------------------------------------------------
     The certificate itself
     ------------------------------------------------------------ */
  function buildCertificate(c) {
    const p = progressOf(c);
    const name = MA.getPlayerName();
    const cert = make('article', `certificate${c.grand ? ' certificate--grand' : ''}`);
    cert.style.setProperty('--c', c.color);
    cert.style.setProperty('--t', c.tint);
    cert.setAttribute('aria-label', `${c.grand ? 'Grand Explorer' : c.name} certificate`);
    const frame = make('div', 'certificate__frame');
    frame.append(make('p', 'certificate__brand', '🌈 Math Adventure World'));
    frame.append(make('p', 'certificate__kicker', c.grand ? 'Grand Explorer Certificate' : 'Certificate of Achievement'));
    frame.append(make('div', 'certificate__emoji', c.grand ? '🌈🏆🌈' : (placeEmoji[c.id] || c.emoji)));
    frame.append(make('p', 'certificate__this', 'This certificate is proudly presented to'));
    frame.append(make('p', `certificate__name${name ? '' : ' is-empty'}`, name || 'Your name here'));
    const forLine = make('p', 'certificate__for');
    if (c.grand) forLine.append('for becoming the hero of ', make('strong', '', 'every place in Math Adventure World'), '!');
    else forLine.append('for mastering every adventure in ', make('strong', '', `${c.emoji} ${c.name}`), '!');
    frame.append(forLine);
    const list = make('ul', 'certificate__list');
    (c.grand ? PLACES.map(pl => `${placeEmoji[pl.id] || pl.emoji} ${pl.name}`) : c.modules).forEach(t => list.append(make('li', '', `✓ ${t}`)));
    frame.append(list);

    const foot = make('div', 'certificate__foot');
    const sig = label => { const d = make('div', 'certificate__sig'); d.append(make('span', 'certificate__line'), make('small', '', label)); return d; };
    const milo = make('div', 'certificate__milo');
    milo.innerHTML = '<svg class="milo" viewBox="0 0 200 200" aria-hidden="true"><use href="#milo"/></svg><small>Milo the Maths Explorer</small>';
    const date = make('div', 'certificate__sig');
    date.append(make('span', 'certificate__date', today()), make('small', '', 'Date'));
    foot.append(sig('Teacher / Parent'), milo, date);
    frame.append(foot);
    frame.append(make('p', 'certificate__credit', `Math Adventure World · topics organised around Cambridge Primary Mathematics Stage 2 · ${MA.SITE_CREDIT || ''}`));
    cert.append(frame);
    if (!p.complete) cert.append(make('div', 'certificate__stamp', 'PREVIEW'));
    return cert;
  }

  function show(c) {
    current = c;
    const sheet = $('#cert-sheet');
    sheet.innerHTML = '';
    sheet.append(buildCertificate(c));
    $('#cert-grid').hidden = true;
    $('#cert-summary').hidden = true;
    $('#cert-viewer').hidden = false;
    fit();
    const done = progressOf(c).complete;
    say(done ? `Well done${MA.getPlayerName() ? `, ${MA.getPlayerName()}` : ''}! Press Print to print your certificate.` : 'This is a preview. Earn it by mastering every adventure!');
    if (done) MA.launchConfetti(60);
    $('#cert-viewer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeViewer() {
    $('#cert-viewer').hidden = true;
    $('#cert-grid').hidden = false;
    $('#cert-summary').hidden = false;
    current = null;
    renderGrid();
  }

  /** Scale the 1000 × 700 certificate down to fit small screens. */
  function fit() {
    const wrap = $('.cert-scroll');
    const cert = $('.certificate', wrap);
    if (!cert) return;
    const scale = Math.min(1, (wrap.clientWidth - 4) / 1000);
    cert.style.transform = `scale(${scale})`;
    wrap.style.height = `${700 * scale + 8}px`;
  }

  /* ------------------------------------------------------------
     Start-up
     ------------------------------------------------------------ */
  const input = $('#player-name');
  input.value = MA.getPlayerName();
  $('#name-form').addEventListener('submit', e => {
    e.preventDefault();
    const saved = MA.setPlayerName(input.value);
    input.value = saved;
    say(saved ? `Hello, ${saved}! Your name will be on every certificate.` : 'Type your name first!');
    if (current) show(current);
  });
  $('#cert-close').addEventListener('click', closeViewer);
  $('#cert-print').addEventListener('click', () => {
    if (!MA.getPlayerName()) { say('Type your name and press Save first, so it goes on the certificate!'); input.focus(); return; }
    window.print();
  });
  $('#preview-toggle').addEventListener('change', e => { preview = e.target.checked; if (!current) renderGrid(); });
  window.addEventListener('resize', fit);
  renderGrid();
  say(MA.getPlayerName() ? `Hi ${MA.getPlayerName()}! Choose a certificate.` : 'Type your name, then choose a certificate!');
})();
