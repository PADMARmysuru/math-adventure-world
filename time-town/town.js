/* ==============================================================
   ⏰ Time Town — town.js  (shared clock, words and calendar helpers)
   Times are stored as minutes after 12 o'clock (0 – 719).
   ============================================================== */
'use strict';

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const hourOf = t => (Math.floor(t / 60) % 12) || 12;
  /** "3 o'clock", "half past 3", "quarter past 3", "quarter to 4" */
  function words(t) {
    const h = hourOf(t); const m = t % 60;
    if (m === 0) return `${h} o'clock`;
    if (m === 30) return `half past ${h}`;
    if (m === 15) return `quarter past ${h}`;
    if (m === 45) return `quarter to ${hourOf(t + 15)}`;
    return `${h}:${String(m).padStart(2, '0')}`;
  }
  const digital = t => `${hourOf(t)}:${String(t % 60).padStart(2, '0')}`;

  /** Analogue clock face. Returns an svg with .setTime(t). */
  function face(t = 0, size = 200) {
    const svg = svgEl('svg', { viewBox: '0 0 200 200', width: size, height: size, class: 'clock-svg', role: 'img' });
    svg.append(svgEl('circle', { cx: 100, cy: 100, r: 92, fill: '#fff', stroke: '#2B2D42', 'stroke-width': 6 }));
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180; const big = i % 5 === 0;
      svg.append(svgEl('line', { x1: 100 + (big ? 74 : 80) * Math.cos(a), y1: 100 + (big ? 74 : 80) * Math.sin(a), x2: 100 + 86 * Math.cos(a), y2: 100 + 86 * Math.sin(a), stroke: '#2B2D42', 'stroke-width': big ? 3 : 1 }));
    }
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 - 90) * Math.PI / 180;
      const txt = svgEl('text', { x: 100 + 60 * Math.cos(a), y: 100 + 60 * Math.sin(a) + 7, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 900, fill: '#2B2D42' });
      txt.textContent = n;
      svg.append(txt);
    }
    const hour = svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 52, stroke: '#2F6FD6', 'stroke-width': 9, 'stroke-linecap': 'round', class: 'clock-hand clock-hand--hour' });
    const minute = svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 26, stroke: '#E04F4F', 'stroke-width': 6, 'stroke-linecap': 'round', class: 'clock-hand clock-hand--minute' });
    svg.append(hour, minute, svgEl('circle', { cx: 100, cy: 100, r: 7, fill: '#2B2D42' }));
    svg.setTime = v => {
      const m = v % 60; const h = (v / 60) % 12;
      hour.style.transform = `rotate(${h * 30}deg)`;
      minute.style.transform = `rotate(${m * 6}deg)`;
      svg.setAttribute('aria-label', `Clock showing ${words(v)}`);
    };
    svg.setTime(t);
    svg.hour = hour;
    svg.minute = minute;
    return svg;
  }
  const faceHTML = (t, size = 150) => face(t, size).outerHTML;

  /** Calendar grid for a month. Returns { node, days: [{ date, weekday, cell }] }. Monday first. */
  function calendar(year, month, onTap) {
    const first = new Date(year, month, 1);
    const count = new Date(year, month + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const node = document.createElement('div');
    node.className = 'calendar';
    node.setAttribute('role', 'grid');
    node.setAttribute('aria-label', `${MONTHS[month]} ${year}`);
    const title = document.createElement('p');
    title.className = 'calendar__title';
    title.textContent = `${MONTHS[month]} ${year}`;
    node.append(title);
    DAYS.forEach(d => { const h = document.createElement('span'); h.className = 'calendar__head'; h.textContent = d.slice(0, 3); node.append(h); });
    for (let i = 0; i < lead; i++) node.append(Object.assign(document.createElement('span'), { className: 'calendar__blank' }));
    const days = [];
    for (let d = 1; d <= count; d++) {
      const weekday = DAYS[(lead + d - 1) % 7];
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `calendar__day${(lead + d - 1) % 7 >= 5 ? ' is-weekend' : ''}`;
      cell.textContent = d;
      cell.setAttribute('aria-label', `${weekday} ${d} ${MONTHS[month]}`);
      cell.dataset.date = d;
      if (onTap) cell.addEventListener('click', () => onTap(d, weekday, cell));
      node.append(cell);
      days.push({ date: d, weekday, cell });
    }
    return { node, days, count, lead };
  }

  /** Generic "put these in order" with slot buttons and draggable tiles. */
  function orderRound(box, { items, label, prompt, onDone }) {
    const { el, button, instruction, say, pulse, shuffle, pick, makeDraggable, PRAISE } = window.ModuleKit;
    const MA = window.MathAdventure;
    box.innerHTML = '';
    let selected = null;
    let placed = 0;
    say(prompt);
    const slots = el('ol', { class: 'slots word-slots', 'aria-label': label });
    items.forEach((it, i) => slots.append(el('li', {}, button(String(i + 1), 'slot word-slot', function () { if (selected) tryPlace(selected, this); else say('Pick a card first.'); }, { 'data-value': it, 'aria-label': `Place ${i + 1}` }))));
    const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Cards' });
    shuffle(items).forEach(it => {
      const tile = button(it, 'tile tile--wide word-tile', null, { 'data-value': it });
      makeDraggable(tile, { onDrop: s => tryPlace(tile, s), onTap: () => { if (selected) selected.classList.remove('is-selected'); if (selected === tile) { selected = null; return; } selected = tile; tile.classList.add('is-selected'); } });
      bank.append(tile);
    });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    function tryPlace(tile, slot) {
      if (selected) selected.classList.remove('is-selected');
      selected = null;
      if (!slot || slot.disabled || !slots.contains(slot)) return;
      if (tile.dataset.value === slot.dataset.value) {
        slot.textContent = tile.dataset.value; slot.disabled = true; slot.classList.add('is-filled'); tile.remove(); placed += 1;
        if (placed === items.length) { MA.launchConfetti(30); say(pick(PRAISE)); onDone(result); } else say(pick(PRAISE));
      } else { pulse(slot, 'is-bad'); pulse(tile, 'is-bounce'); say('Almost! Say them in order from the start.'); }
    }
    box.append(el('p', { class: 'round-label' }, label), instruction('✋ Drag each card into its place. Or tap a card, then a place.'), slots, bank, result);
  }

  window.Clock = { DAYS, MONTHS, words, digital, face, faceHTML, calendar, hourOf, orderRound };
})();
