/* ==============================================================
   🧰 Math Adventure World — module.js  (shared module toolkit)
   --------------------------------------------------------------
   Every learning module page loads, in this order:
     ../script.js   rewards, saving, Milo, challenge engine
     ../module.js   this file: helpers, step bar, drag-and-drop
     its own .js    only the activities for that topic

   A module only needs to describe its six steps:

     ModuleKit.startModule({
       moduleId: 'number-island/place-value',
       stages: [
         { id: 'learn', icon: '🌱', label: 'Learn', title: '…', render: (box, done) => { … } },
         …
       ]
     });

   Each render(box, done) draws its activity into `box` and calls
   done() when the child has finished that step.
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  if (!MA) return;

  /* ------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const shuffle = list => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(resolve => setTimeout(resolve, reducedMotion() ? Math.min(ms, 120) : ms));
  const say = text => MA.miloSay(text, 'module');
  const PRAISE = ['Great thinking!', 'Yes!', 'Spot on!', 'Fantastic!', 'Super explorer!'];

  /** Tiny element builder: el('button', { class: 'x', onclick: fn }, 'text', child) */
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach(child => {
      if (child === undefined || child === null || child === false) return;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  const button = (label, cls, onclick, extra = {}) => el('button', { type: 'button', class: cls, onclick, ...extra }, label);
  const instruction = text => el('p', { class: 'stage-instruction' }, text);
  /** Replay a short effect class (shake, bounce, pop). It clears itself so no "wrong" colour is left behind. */
  const pulse = (node, cls) => {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    clearTimeout(node._pulseTimer);
    node._pulseTimer = setTimeout(() => node.classList.remove(cls), 650);
  };

  /** Three answer options (answer + 2 different, 0–100), shuffled, for MA.renderChallenge. */
  function optionsFor(answer, candidates) {
    const values = [answer];
    candidates.forEach(c => {
      if (values.length < 3 && c >= 0 && c <= 100 && !values.includes(c)) values.push(c);
    });
    return shuffle(values).map(v => ({ value: v, label: String(v) }));
  }

  /** Number track HTML; '?' marks the gap. */
  const track = items => `<ol class="track" aria-label="Number track">${items
    .map(v => (v === '?' ? '<li class="is-gap" aria-label="missing number">?</li>' : `<li>${v}</li>`)).join('')}</ol>`;

  /** Number with a blue tens digit and an orange ones digit. */
  const digitsHTML = n => (n >= 10 && n <= 99
    ? `<span class="d-tens">${Math.floor(n / 10)}</span><span class="d-ones">${n % 10}</span>`
    : String(n));

  /** Small rods-and-cubes picture of a number (uses .b10 from style.css). */
  const blocksHTML = n => `<span class="b10" aria-hidden="true">
      <span class="b10__tens">${'<i class="rod"></i>'.repeat(Math.floor(n / 10))}</span>
      <span class="b10__ones">${'<i class="cube"></i>'.repeat(n % 10)}</span></span>`;

  /** Choice buttons (strings or numbers) for MA.renderChallenge, shuffled. */
  const choices = list => shuffle(list).map(v => ({ value: v, label: String(v) }));

  /** True/False round used by Think steps. statement: { text, truth, explain, fix?: { question, options, answer } } */
  function trueFalse(box, statement, onSolved) {
    const area = el('div', { class: 'tf' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const buttons = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'True or false' });
    ['✅ True', '❌ False'].forEach((label, i) => {
      const b = button(label, 'tf-btn', () => {
        if ((i === 0) === statement.truth) {
          b.classList.add('is-right');
          $$('.tf-btn', buttons).forEach(x => { x.disabled = true; });
          if (!statement.truth && statement.fix) askFix(); else finish();
        } else {
          b.classList.add('is-wrong');
          b.disabled = true;
          say(statement.truth ? 'Look again. Is it really wrong?' : 'Hmm, check it carefully. Something is not right!');
        }
      });
      buttons.append(b);
    });
    function askFix() {
      say(statement.fix.question);
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': statement.fix.question });
      shuffle(statement.fix.options).forEach(opt => {
        const b = button(String(opt), String(opt).length > 4 ? 'pattern-btn' : 'fix-btn', () => {
          if (opt === statement.fix.answer) {
            $$('button', group).forEach(x => { x.disabled = true; });
            b.classList.add('is-right');
            finish();
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say('Almost! Try another one.');
          }
        });
        group.append(b);
      });
      result.append(el('p', { class: 'fix-q' }, `🔧 ${statement.fix.question}`), group);
    }
    function finish() {
      say(statement.explain);
      MA.launchConfetti(25);
      result.append(el('p', { class: 'round-result__text' }, `🌟 ${statement.explain}`));
      onSolved(result);
    }
    area.append(el('p', { class: 'tf-statement', html: statement.text }), buttons, result);
    box.append(area);
  }

  /* ------------------------------------------------------------
     Drag and drop that works with mouse, touch, tap-tap and keyboard.
     Drop targets are any element with class "slot".
     ------------------------------------------------------------ */
  function makeDraggable(tile, { onDrop, onTap }) {
    let suppressClick = false;

    tile.addEventListener('pointerdown', event => {
      if (tile.disabled || event.button > 0) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const rect = tile.getBoundingClientRect();
      const offsetX = startX - rect.left;
      const offsetY = startY - rect.top;
      let ghost = null;
      let overSlot = null;
      tile.setPointerCapture(event.pointerId);

      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) {
          ghost = tile.cloneNode(true);
          ghost.classList.add('tile--ghost');
          ghost.classList.remove('is-selected');
          ghost.style.width = `${rect.width}px`;
          ghost.style.height = `${rect.height}px`;
          document.body.append(ghost);
          tile.classList.add('is-lifted');
        }
        if (!ghost) return;
        ghost.style.left = `${ev.clientX - offsetX}px`;
        ghost.style.top = `${ev.clientY - offsetY}px`;
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const slot = under && under.closest('.slot');
        if (slot !== overSlot) {
          if (overSlot) overSlot.classList.remove('is-over');
          if (slot && !slot.disabled) slot.classList.add('is-over');
          overSlot = slot;
        }
      };

      const end = ev => {
        tile.removeEventListener('pointermove', move);
        tile.removeEventListener('pointerup', end);
        tile.removeEventListener('pointercancel', end);
        if (overSlot) overSlot.classList.remove('is-over');
        tile.classList.remove('is-lifted');
        if (ghost) {
          ghost.remove();
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 0);
          if (ev.type === 'pointerup') {
            const under = document.elementFromPoint(ev.clientX, ev.clientY);
            onDrop(under && under.closest('.slot'));
          }
        }
      };

      tile.addEventListener('pointermove', move);
      tile.addEventListener('pointerup', end);
      tile.addEventListener('pointercancel', end);
    });

    // A tap (or Enter/Space) selects the tile instead
    tile.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      onTap();
    });
  }

  /* ------------------------------------------------------------
     Round helpers used by most activities
     ------------------------------------------------------------ */

  /** After a round: on the last round call done(), otherwise add a "Next" button. */
  function nextOrDone(result, isLast, label, next, done, finalText) {
    if (isLast) {
      if (finalText) result.append(el('p', { class: 'round-result__text' }, finalText));
      done();
    } else {
      result.append(el('div', { class: 'stage-actions' }, button(label, 'btn', next)));
    }
  }

  /**
   * Drag-to-match: cards with an answer box, plus a bank of tiles (one or more are tricks).
   * items: [{ face: Node, value, label }]   tiles: values   onComplete(spareTile)
   * Values may be numbers or strings. Works with drag, tap-tap and keyboard.
   */
  function dragMatch({ items, tiles, onComplete, hint = 'Almost! Try another box.', cardClass = '' }) {
    let selected = null;
    let filled = 0;
    const cards = el('div', { class: `match-grid ${cardClass}` });
    const slots = items.map(item => {
      const slot = el('div', {
        class: 'slot match-box', role: 'button', tabindex: '0',
        'data-value': item.value, 'aria-label': `${item.label || 'Answer box'}, empty`
      }, '?');
      const activate = () => { if (selected) tryPlace(selected, slot); else say('Pick an answer first, then tap a box.'); };
      slot.addEventListener('click', activate);
      slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
      cards.append(el('div', { class: 'match-item' }, item.face, slot));
      return slot;
    });
    const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Answers' });
    shuffle(tiles).forEach(v => {
      const tile = button(String(v), `tile${String(v).length > 3 ? ' tile--wide' : ''}`, null, { 'data-value': v, 'aria-label': `Answer ${v}` });
      makeDraggable(tile, {
        onDrop: slot => tryPlace(tile, slot && slots.includes(slot) ? slot : null),
        onTap: () => {
          if (tile.disabled) return;
          if (selected) selected.classList.remove('is-selected');
          if (selected === tile) { selected = null; return; }
          selected = tile;
          tile.classList.add('is-selected');
        }
      });
      bank.append(tile);
    });

    function tryPlace(tile, slot) {
      if (selected) selected.classList.remove('is-selected');
      selected = null;
      if (!slot || slot.classList.contains('is-filled')) return;
      if (String(tile.dataset.value) === String(slot.dataset.value)) {
        slot.textContent = tile.dataset.value;
        slot.classList.add('is-filled');
        slot.setAttribute('aria-label', `${tile.dataset.value}, correct`);
        tile.remove();
        filled += 1;
        if (filled === items.length) {
          const spare = $('.tile', bank);
          if (spare) { spare.classList.add('is-spare'); spare.disabled = true; }
          onComplete(spare);
        } else say(pick(PRAISE));
      } else {
        pulse(slot, 'is-bad');
        pulse(tile, 'is-bounce');
        say(typeof hint === 'function' ? hint(tile.dataset.value, slot.dataset.value) : hint);
      }
    }
    return { cards, bank };
  }

  /**
   * Sort items into labelled groups (drag or tap-tap).
   * zones: [{ id, label }]   items: [{ face: Node|string, cat, label }]   onComplete()
   * hint(item, zoneId) → text for a wrong drop
   */
  function sortZones({ zones, items, onComplete, hint }) {
    let selected = null;
    let sorted = 0;
    const zoneEls = zones.map(z => {
      const zone = el('div', { class: 'slot sort-zone', role: 'button', tabindex: '0', 'data-cat': z.id, 'aria-label': `${z.label} group` },
        el('p', { class: 'sort-zone__label' }, z.label), el('div', { class: 'sort-zone__items' }));
      const activate = () => { if (selected) place(selected, zone); else say('Pick something first, then tap a group.'); };
      zone.addEventListener('click', activate);
      zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
      return zone;
    });
    const bank = el('div', { class: 'tile-bank sort-bank', role: 'group', 'aria-label': 'Things to sort' });
    shuffle(items).forEach(item => {
      const card = button(typeof item.face === 'string' ? item.face : '', 'tile sort-card', null, { 'data-cat': item.cat, 'aria-label': item.label });
      if (typeof item.face !== 'string') card.append(item.face);
      card._item = item;
      makeDraggable(card, {
        onDrop: zone => place(card, zone && zoneEls.includes(zone) ? zone : null),
        onTap: () => {
          if (card.disabled) return;
          if (selected) selected.classList.remove('is-selected');
          if (selected === card) { selected = null; return; }
          selected = card;
          card.classList.add('is-selected');
        }
      });
      bank.append(card);
    });

    function place(card, zone) {
      if (selected) selected.classList.remove('is-selected');
      selected = null;
      if (!zone || card.disabled) return;
      if (card.dataset.cat === zone.dataset.cat) {
        card.disabled = true;
        card.classList.add('is-placed');
        $('.sort-zone__items', zone).append(card);
        sorted += 1;
        if (sorted === items.length) onComplete();
        else say(pick(PRAISE));
      } else {
        pulse(card, 'is-bounce');
        pulse(zone, 'is-bad');
        say(hint ? hint(card._item, zone.dataset.cat) : 'Almost! Look again.');
      }
    }
    return { bank, zones: el('div', { class: 'sort-zones' }, zoneEls) };
  }

  /** Simple SVG shapes split into equal (or unequal) parts; shaded = indexes to colour. */
  function fractionSVG({ shape = 'circle', parts = 4, shaded = [], unequal = false, size = 120, interactive = false }) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('class', `frac-svg${interactive ? ' is-interactive' : ''}`);
    const paths = [];
    if (shape === 'circle') {
      for (let i = 0; i < parts; i++) {
        const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2;
        const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
        const x0 = 50 + 46 * Math.cos(a0); const y0 = 50 + 46 * Math.sin(a0);
        const x1 = 50 + 46 * Math.cos(a1); const y1 = 50 + 46 * Math.sin(a1);
        const large = a1 - a0 > Math.PI ? 1 : 0;
        paths.push(parts === 1 ? 'M50 4 A46 46 0 1 1 49.9 4 Z' : `M50 50 L${x0.toFixed(2)} ${y0.toFixed(2)} A46 46 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`);
      }
    } else {
      // rectangle bars; unequal: first part is bigger
      const widths = [];
      if (unequal && parts === 2) widths.push(64, 28);
      else for (let i = 0; i < parts; i++) widths.push(92 / parts);
      let x = 4;
      const h = shape === 'square' ? 92 : 56;
      const y = shape === 'square' ? 4 : 22;
      widths.forEach(w => { paths.push(`M${x} ${y} h${w} v${h} h${-w} Z`); x += w; });
    }
    if (unequal && shape === 'circle') paths.splice(0, paths.length, 'M50 50 L50 4 A46 46 0 0 1 89.8 73 Z', 'M50 50 L89.8 73 A46 46 0 1 1 50 4 Z');
    paths.forEach((d, i) => {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', `frac-part${shaded.includes(i) ? ' is-shaded' : ''}`);
      path.setAttribute('data-index', i);
      svg.append(path);
    });
    return svg;
  }

  /**
   * A short run of one-question rounds using the shared challenge engine.
   * questions: challenge objects (or functions that return one).
   */
  function quizRounds(box, done, questions, { label = 'Question', nextLabel = 'Next ▶', finalText } = {}) {
    let i = 0;
    show();
    function show() {
      box.innerHTML = '';
      const area = el('div', { class: 'challenge' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `${label} ${i + 1} of ${questions.length}`), area, result);
      const q = typeof questions[i] === 'function' ? questions[i]() : questions[i];
      say(q.say || q.question);
      MA.renderChallenge(area, q, {
        onCorrect: ({ feedbackEl, challenge }) => {
          feedbackEl.className = 'challenge__feedback is-success';
          feedbackEl.innerHTML = '';
          feedbackEl.append(el('span', {}, `🎉 ${pick(PRAISE)}`), el('small', {}, challenge.explain || ''));
          MA.launchConfetti(20);
          say(challenge.explain || pick(PRAISE));
          nextOrDone(result, i === questions.length - 1, nextLabel, () => { i += 1; show(); }, done, finalText);
        }
      });
    }
  }

  /** The modules before and after this one in the same place on the map. */
  function findNeighbours(moduleId) {
    for (const loc of MA.LOCATIONS || []) {
      const built = loc.modules.filter(m => m.url && !m.progressId);
      const i = built.findIndex(m => `${loc.id}/${m.id}` === moduleId);
      if (i >= 0) return { place: loc, prev: built[i - 1] || null, next: built[i + 1] || null };
    }
    return { place: null, prev: null, next: null };
  }

  /* ------------------------------------------------------------
     Module page shell: step bar + stage card
     Needs #stepper and #stage-panel in the page.
     ------------------------------------------------------------ */
  function startModule({ moduleId, stages, stageStars = 2, backUrl = '../index.html#adventure' }) {
    let current = 0;
    const neighbours = findNeighbours(moduleId);

    /** "◀ Previous adventure | 🗺️ Map | Next adventure ▶" bar under the activity. */
    function renderAdventureNav() {
      const panel = $('#stage-panel');
      if (!panel || $('.adventure-nav')) return;
      const link = (m, dir) => el('a', { class: `adventure-nav__link adventure-nav__link--${dir}`, href: `../${m.url}` },
        el('small', {}, dir === 'prev' ? '◀ Previous adventure' : 'Next adventure ▶'),
        el('strong', {}, `${m.icon} ${m.title}`));
      panel.after(el('nav', { class: 'adventure-nav', 'aria-label': 'Other adventures here' },
        neighbours.prev ? link(neighbours.prev, 'prev') : el('span', { class: 'adventure-nav__spacer' }),
        el('a', { class: 'adventure-nav__map', href: backUrl }, el('span', { 'aria-hidden': 'true' }, '🗺️'), ' Map'),
        neighbours.next ? link(neighbours.next, 'next') : el('span', { class: 'adventure-nav__spacer' })));
    }

    function renderStepper() {
      const list = $('#stepper');
      list.innerHTML = '';
      stages.forEach((stage, i) => {
        const done = MA.isStageDone(moduleId, stage.id);
        const step = button([
          el('span', { class: 'step__icon', 'aria-hidden': 'true' }, done ? '✓' : stage.icon),
          el('span', { class: 'step__label' }, stage.label)
        ], `step${i === current ? ' is-current' : ''}${done ? ' is-done' : ''}`, () => goTo(i), {
          'aria-current': i === current ? 'step' : null,
          'aria-label': `${stage.label}${done ? ', done' : ''}`
        });
        list.append(el('li', {}, step));
      });
    }

    function goTo(index, { scroll = true } = {}) {
      current = index;
      const stage = stages[index];
      const isLast = index === stages.length - 1;
      renderStepper();

      const panel = $('#stage-panel');
      panel.innerHTML = '';
      const body = el('div', { class: 'stage-body' });
      const done = MA.isStageDone(moduleId, stage.id);
      const after = neighbours.next;
      // ◀ Back: previous step (or the map from the first step)
      const back = index > 0
        ? button(`◀ Back: ${stages[index - 1].label}`, 'btn btn--ghost stage-back', () => goTo(index - 1))
        : el('a', { class: 'btn btn--ghost stage-back', href: backUrl }, '◀ Map');
      // Next ▶: always available; turns yellow once this step is done
      const nextLabel = !isLast
        ? `Next: ${stages[index + 1].icon} ${stages[index + 1].label} ▶`
        : after ? `Next adventure: ${after.icon} ${after.title} ▶` : '🗺️ Back to the map ▶';
      const next = button(nextLabel, `btn ${done ? 'btn--sun is-ready' : 'btn--ghost'} stage-next`, () => {
        if (!isLast) goTo(index + 1);
        else window.location.href = after ? `../${after.url}` : backUrl;
      });

      panel.append(
        el('header', { class: 'stage-head' },
          el('span', { class: 'stage-head__icon', 'aria-hidden': 'true' }, stage.icon),
          el('div', {},
            el('p', { class: 'stage-head__step' }, `Step ${index + 1} of ${stages.length} · ${stage.label}`),
            el('h2', { class: 'stage-head__title', tabindex: '-1' }, stage.title))),
        body,
        el('footer', { class: 'stage-foot' }, back, next)
      );

      stage.render(body, () => finishStage(stage, next));

      if (scroll) {
        panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
        $('.stage-head__title', panel).focus({ preventScroll: true });
      }
    }

    function finishStage(stage, next) {
      const first = MA.completeStage(moduleId, stage.id);
      if (first && stage.id !== 'master') MA.addStars(stageStars, { message: `${stage.label} complete!` });
      next.classList.remove('btn--ghost');
      next.classList.add('btn--sun', 'is-ready');
      pulse(next, 'pop-in');
      renderStepper();
    }

    renderAdventureNav();

    // Open the first step not yet done
    const firstOpen = stages.findIndex(stage => !MA.isStageDone(moduleId, stage.id));
    goTo(firstOpen === -1 ? 0 : firstOpen, { scroll: false });
    return { goTo };
  }

  /** Standard "mastered" finale used by every module's Master step. */
  function masterFinale(box, { moduleId, badgeId, title, firstTry, total, reward = { stars: 5, gems: 1 }, onReplay, backUrl = '../index.html#adventure' }) {
    box.innerHTML = '';
    const first = MA.markModuleMastered(moduleId);
    if (first) {
      MA.addStars(reward.stars, { message: `${title}!` });
      MA.addGems(reward.gems, { silent: true });
      MA.unlockBadge(badgeId);
    } else {
      MA.launchConfetti(60);
    }
    box.append(el('div', { class: 'finale' },
      el('div', { class: 'finale__trophy', 'aria-hidden': 'true' }, '🏆'),
      el('h3', { class: 'finale__title' }, `${title}!`),
      el('p', { class: 'finale__text' }, `${firstTry} of ${total} right on the first try.`),
      el('p', { class: 'finale__reward' }, first
        ? `⭐ +${reward.stars} stars  •  💎 +${reward.gems} gem  •  🏅 New badge!`
        : 'You already mastered this. Great practice!'),
      el('div', { class: 'stage-actions' },
        button('🔁 Play again', 'btn btn--ghost', onReplay),
        el('a', { class: 'btn btn--sun', href: backUrl }, '🗺️ Back to the map'))
    ));
    say(`You are a ${title}! 🏆`);
  }

  /** Master quiz built on MA.renderChallenge. makeQuestions() returns fresh challenge objects. */
  function runMaster(box, done, options) {
    const { makeQuestions, moduleId, badgeId, title } = options;
    const questions = makeQuestions();
    let index = 0;
    let firstTry = 0;
    show();

    function show() {
      box.innerHTML = '';
      const dots = el('ol', { class: 'q-dots', 'aria-label': `Question ${index + 1} of ${questions.length}` });
      questions.forEach((_, k) => dots.append(el('li', {
        class: k < index ? 'is-done' : (k === index ? 'is-now' : '')
      }, k < index ? '✓' : String(k + 1))));

      const area = el('div', { class: 'challenge' });
      const isLast = index === questions.length - 1;
      const next = button(isLast ? '🏆 Finish' : 'Next question ▶', 'btn', () => {
        index += 1;
        if (index < questions.length) show();
        else {
          masterFinale(box, {
            moduleId, badgeId, title, firstTry, total: questions.length,
            onReplay: () => runMaster(box, done, options)
          });
          done();
        }
      }, { hidden: true });

      box.append(dots, area, el('div', { class: 'stage-actions' }, next));
      say(index === 0 ? `${questions.length} questions. Show me what you know!` : pick(['Keep going!', 'You can do it!', 'Nice and steady.']));

      MA.renderChallenge(area, questions[index], {
        onCorrect: ({ feedbackEl, attempts, challenge }) => {
          if (attempts === 1) firstTry += 1;
          feedbackEl.className = 'challenge__feedback is-success';
          feedbackEl.innerHTML = '';
          feedbackEl.append(el('span', {}, `🎉 ${pick(PRAISE)}`), el('small', {}, challenge.explain));
          next.hidden = false;
          say(pick(PRAISE));
        }
      });
    }
  }

  window.ModuleKit = {
    MA, $, $$, rnd, pick, shuffle, wait, reducedMotion, say, PRAISE,
    el, button, instruction, pulse, optionsFor, track, choices, digitsHTML, blocksHTML, trueFalse,
    nextOrDone, dragMatch, fractionSVG, sortZones, quizRounds,
    makeDraggable, startModule, masterFinale, runMaster
  };
})();
