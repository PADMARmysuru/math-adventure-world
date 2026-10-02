/* ==============================================================
   🔢 Number Island → Counting        number-island/counting.js
   --------------------------------------------------------------
   Six steps, each hands-on:
   🌱 Learn      tap to count, then pack objects into tens
   🎮 Play       Frog Hop: count on and back in 1s and 10s
   🧩 Practise   drag numbers into counting order (1s, 2s, 5s, back)
   🧠 Think      find and fix Milo's counting mistakes
   🚀 Challenge  light up patterns on a hundred square
   🏆 Master     five mixed questions → Counting Master badge

   Rewards, saving and Milo come from ../script.js (window.MathAdventure).
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  if (!MA) return;

  const MODULE_ID = 'number-island/counting';
  const STAGE_REWARD_STARS = 2;
  const MASTER_REWARD = { stars: 5, gems: 1 };

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Count and group',         render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Frog Hop',                render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Number order',            render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: "Milo's mistakes",         render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Hundred square patterns', render: renderHundred },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Counting Master',         render: renderMaster }
  ];

  /* ------------------------------------------------------------
     Helpers
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
  const PRAISE = ['Great counting!', 'Yes!', 'Spot on!', 'Fantastic!', 'Great thinking!'];

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

  /* ------------------------------------------------------------
     Page shell: stepper + stage card
     ------------------------------------------------------------ */
  let current = 0;

  function renderStepper() {
    const list = $('#stepper');
    list.innerHTML = '';
    STAGES.forEach((stage, i) => {
      const done = MA.isStageDone(MODULE_ID, stage.id);
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
    const stage = STAGES[index];
    const isLast = index === STAGES.length - 1;
    renderStepper();

    const panel = $('#stage-panel');
    panel.innerHTML = '';
    const body = el('div', { class: 'stage-body' });
    const next = button(
      isLast ? '🗺️ Back to the map' : `Next: ${STAGES[index + 1].icon} ${STAGES[index + 1].label}`,
      'btn btn--sun stage-next',
      () => { if (isLast) window.location.href = '../index.html#adventure'; else goTo(index + 1); }
    );
    next.hidden = !MA.isStageDone(MODULE_ID, stage.id);

    panel.append(
      el('header', { class: 'stage-head' },
        el('span', { class: 'stage-head__icon', 'aria-hidden': 'true' }, stage.icon),
        el('div', {},
          el('p', { class: 'stage-head__step' }, `Step ${index + 1} of ${STAGES.length} · ${stage.label}`),
          el('h2', { class: 'stage-head__title', tabindex: '-1' }, stage.title))),
      body,
      el('footer', { class: 'stage-foot' }, next)
    );

    stage.render(body, () => finishStage(stage, next));

    if (scroll) {
      panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      $('.stage-head__title', panel).focus({ preventScroll: true });
    }
  }

  function finishStage(stage, next) {
    const first = MA.completeStage(MODULE_ID, stage.id);
    if (first && stage.id !== 'master') MA.addStars(STAGE_REWARD_STARS, { message: `${stage.label} complete!` });
    next.hidden = false;
    next.classList.remove('pop-in');
    void next.offsetWidth;
    next.classList.add('pop-in');
    renderStepper();
  }

  /* ------------------------------------------------------------
     🌱 LEARN — tap to count, then pack into tens
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    tapToCount();

    // Part 1: one tap, one number
    function tapToCount() {
      box.innerHTML = '';
      const total = rnd(7, 12);
      const item = pick(['🐚', '🍓', '🐞', '🍎', '⭐']);
      let count = 0;
      say('Tap each one to count it. One tap, one number!');

      const counter = el('div', { class: 'big-count', 'aria-live': 'polite' }, '0');
      const tray = el('div', { class: 'tray', role: 'group', 'aria-label': 'Things to count' });
      const result = el('p', { class: 'learn-result', 'aria-live': 'polite' });
      const next = button('Next: count a big group ▶', 'btn', packInTens, { hidden: true });

      for (let i = 0; i < total; i++) {
        const thing = button([
          el('span', { class: 'obj__emoji', 'aria-hidden': 'true' }, item),
          el('span', { class: 'obj__num', 'aria-hidden': 'true' })
        ], 'obj', () => {
          if (thing.classList.contains('is-counted')) {
            say('Already counted! Each one gets just one number.');
            return;
          }
          count += 1;
          thing.classList.add('is-counted');
          $('.obj__num', thing).textContent = count;
          thing.setAttribute('aria-label', `Counted: ${count}`);
          counter.textContent = count;
          if (count === total) {
            result.textContent = `🎉 ${total} altogether!`;
            say('The last number you say tells you how many!');
            MA.launchConfetti(30);
            next.hidden = false;
          }
        }, { style: `--rot:${rnd(-12, 12)}deg`, 'aria-label': 'Not counted yet' });
        tray.append(thing);
      }

      box.append(instruction('👆 Tap each one to count it.'), counter, tray, result, next);
    }

    // Part 2: pack big groups into boxes of 10, then count in tens and ones
    function packInTens() {
      box.innerHTML = '';
      let total = rnd(23, 48);
      if (total % 10 === 0) total += 1;
      const item = '🐚';
      let tens = 0;
      say('So many shells! Counting one by one is slow. Pack them into boxes of 10.');

      const loose = el('div', { class: 'tray tray--loose', role: 'img', 'aria-label': `${total} loose shells` });
      for (let i = 0; i < total; i++) loose.append(el('span', { class: 'mini', 'aria-hidden': 'true' }, item));
      const boxes = el('div', { class: 'ten-boxes', 'aria-label': 'Boxes of ten' });
      const status = el('p', { class: 'pack-status', 'aria-live': 'polite' }, `📦 0 boxes  •  ${item} ${total} loose`);
      const counter = el('div', { class: 'big-count big-count--small', 'aria-live': 'polite' }, '?');
      const result = el('p', { class: 'learn-result', 'aria-live': 'polite' });
      const packBtn = button('📦 Pack 10', 'btn btn--big', pack);
      const countBtn = button('👆 Count them!', 'btn btn--sun', countUp, { hidden: true });

      function pack() {
        const minis = $$('.mini', loose);
        if (minis.length < 10) return;
        minis.slice(0, 10).forEach(m => m.remove());
        tens += 1;
        const tenBox = el('div', { class: 'ten-box', role: 'img', 'aria-label': 'A box of 10 shells' });
        for (let i = 0; i < 10; i++) tenBox.append(el('span', { 'aria-hidden': 'true' }, item));
        tenBox.append(el('span', { class: 'ten-box__tag', 'aria-hidden': 'true' }, '10'));
        boxes.append(tenBox);
        const left = minis.length - 10;
        status.textContent = `📦 ${tens} ${tens === 1 ? 'box' : 'boxes'}  •  ${item} ${left} loose`;
        loose.setAttribute('aria-label', `${left} loose shells`);
        if (left < 10) {
          packBtn.disabled = true;
          countBtn.hidden = false;
          say('Fewer than 10 left! Now count the boxes in tens, then the ones.');
        } else {
          say(pick(['Ten in the box!', 'Another ten!', 'Keep packing!']));
        }
      }

      async function countUp() {
        countBtn.disabled = true;
        let n = 0;
        for (const tenBox of $$('.ten-box', boxes)) {
          n += 10;
          tenBox.classList.add('is-counting');
          counter.textContent = n;
          await wait(650);
        }
        for (const mini of $$('.mini', loose)) {
          n += 1;
          mini.classList.add('is-counting');
          counter.textContent = n;
          await wait(420);
        }
        result.textContent = `${tens} tens and ${total % 10} ones make ${total}!`;
        say('Counting in tens is super fast! 🚀');
        MA.launchConfetti(40);
        done();
      }

      box.append(
        instruction('👆 Tap “Pack 10” until fewer than 10 are left.'),
        el('div', { class: 'pack-area' }, loose, boxes),
        status,
        el('div', { class: 'stage-actions' }, packBtn, countBtn),
        counter,
        result
      );
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — Frog Hop (count on / back in 1s and 10s)
     ------------------------------------------------------------ */
  function fewestHops(from, to) {
    let best = Infinity;
    for (let k = -10; k <= 10; k++) best = Math.min(best, Math.abs(k) + Math.abs(to - from - 10 * k));
    return best;
  }

  function renderPlay(box, done) {
    const ROUNDS = 3;
    let round = 0;
    newRound();

    function makeRound() {
      let start;
      let target;
      if (round < ROUNDS - 1) {
        start = rnd(3, 40);
        do { target = start + rnd(12, 48); } while (target > 99 || target % 10 === start % 10);
      } else { // last pond: hop backwards
        start = rnd(60, 96);
        do { target = start - rnd(14, 45); } while (target < 1 || target % 10 === start % 10);
      }
      return { start, target };
    }

    function newRound() {
      box.innerHTML = '';
      const { start, target } = makeRound();
      const best = fewestHops(start, target);
      const backwards = target < start;
      let pos = start;
      let hops = 0;
      say(backwards ? `Now hop BACK from ${start} to ${target}!` : `Help Froggy hop from ${start} to ${target}!`);

      const frogNum = el('span', { class: 'pad__num' }, String(pos));
      const frogPad = el('div', { class: 'pad pad--frog' }, el('span', { class: 'pad__icon', 'aria-hidden': 'true' }, '🐸'), frogNum);
      const goalPad = el('div', { class: 'pad pad--goal' }, el('span', { class: 'pad__icon', 'aria-hidden': 'true' }, '🏁'), el('span', { class: 'pad__num' }, String(target)));
      const trail = el('ol', { class: 'trail', 'aria-label': "Froggy's hops" }, el('li', { class: 'trail__start' }, String(start)));
      const hopsEl = el('p', { class: 'hop-count', 'aria-live': 'polite' }, 'Hops: 0');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const pad = el('div', { class: 'hop-pad', role: 'group', 'aria-label': 'Hop buttons' });

      [-10, -1, 1, 10].forEach(d => {
        const label = d > 0 ? `+${d}` : `−${-d}`;
        pad.append(button(label, `hop-btn ${Math.abs(d) === 10 ? 'hop-btn--ten' : 'hop-btn--one'}`, () => hop(d), {
          'aria-label': `Hop ${d > 0 ? 'forward' : 'back'} ${Math.abs(d)}`
        }));
      });

      function hop(d) {
        const nextPos = pos + d;
        if (nextPos < 0 || nextPos > 100 || pos === target) return;
        const before = Math.abs(target - pos);
        pos = nextPos;
        hops += 1;
        frogNum.textContent = pos;
        frogPad.classList.remove('is-hopping');
        void frogPad.offsetWidth;
        frogPad.classList.add('is-hopping');
        trail.append(el('li', {}, el('span', { class: 'trail__jump' }, d > 0 ? `+${d}` : `−${-d}`), String(pos)));
        trail.scrollLeft = trail.scrollWidth;
        hopsEl.textContent = `Hops: ${hops}`;
        if (pos === target) finish();
        else if (Math.abs(target - pos) > before) say('Oops, too far! Hop the other way.');
      }

      function finish() {
        $$('.hop-btn', pad).forEach(b => { b.disabled = true; });
        goalPad.classList.add('is-reached');
        const quickest = hops <= best;
        const isLast = round === ROUNDS - 1;
        result.append(el('p', { class: 'round-result__text' },
          quickest ? `🌟 ${hops} hops — the fewest possible!` : `🎉 You made it in ${hops} hops!`));
        if (!quickest) {
          result.append(el('p', { class: 'round-result__tip' },
            `Think: can big ${backwards ? '−10' : '+10'} hops do it in ${best}?`));
        }
        result.append(el('div', { class: 'stage-actions' },
          button('🔁 Try again', 'btn btn--ghost', newRound),
          button(isLast ? '✅ Finish' : 'Next pond ▶', 'btn', () => {
            if (isLast) {
              result.innerHTML = '';
              result.append(el('p', { class: 'round-result__text' }, '🐸 Froggy says thank you!'));
              done();
            } else {
              round += 1;
              newRound();
            }
          })));
        say(quickest ? 'Wow, the quickest way!' : 'You made it! Was there a quicker way?');
        MA.launchConfetti(25);
      }

      box.append(
        el('p', { class: 'round-label' }, `Pond ${round + 1} of ${ROUNDS}`),
        instruction('👆 Tap the hop buttons. Purple hops jump 10!'),
        el('div', { class: 'pond' }, frogPad, el('span', { class: 'pond__arrow', 'aria-hidden': 'true' }, '➜'), goalPad),
        trail, hopsEl, pad, result
      );
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag numbers into counting order
     Works with mouse, touch (drag) and tap-tap or keyboard.
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

  function renderPractise(box, done) {
    const ROUNDS = [
      { step: 1, dir: 1, label: 'Count on in 1s' },
      { step: 2, dir: 1, label: 'Count in 2s' },
      { step: 5, dir: 1, label: 'Count in 5s' },
      { step: 1, dir: -1, label: 'Count back in 1s' }
    ];
    let round = 0;
    newRound();

    function makeSequence({ step, dir }) {
      let start;
      if (step === 1 && dir === 1) start = rnd(1, 8) * 10 + rnd(6, 8);       // crosses a ten, e.g. 47 → 52
      else if (step === 1) start = rnd(3, 9) * 10 + rnd(2, 3);               // back across a ten, e.g. 62 → 57
      else if (step === 2) start = 2 * rnd(3, 45);
      else start = 5 * rnd(1, 15);
      return Array.from({ length: 6 }, (_, i) => start + dir * step * i);
    }

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      const seq = makeSequence(cfg);
      const missing = [2, 3, 4, 5];
      const spareOptions = (cfg.step === 1 ? [seq[2] + 10, seq[4] - 10] : [seq[2] + 1, seq[3] - 1])
        .filter(v => v >= 0 && v <= 100 && !seq.includes(v));
      const spare = pick(spareOptions);
      let selected = null;
      let filled = 0;
      const countWord = `${cfg.dir > 0 ? 'count on' : 'count back'} in ${cfg.step}s`;
      say(`${cfg.label}! Drag each number into its box.`);

      const slots = el('ol', { class: 'slots', 'aria-label': 'Counting boxes' });
      seq.forEach((value, i) => {
        const given = !missing.includes(i);
        const slot = button(given ? String(value) : '', `slot${given ? ' is-given' : ''}`, () => {
          if (selected) tryPlace(selected, slot);
          else say('First pick a number tile, then tap a box.');
        }, {
          'data-index': i,
          'data-value': value,
          'aria-label': given ? String(value) : `Empty box ${i + 1}`,
          disabled: given
        });
        slots.append(el('li', {}, slot));
      });

      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Number tiles' });
      shuffle([...missing.map(i => seq[i]), spare]).forEach(value => {
        const tile = button(String(value), 'tile', null, { 'data-value': value, 'aria-label': `Number ${value}` });
        makeDraggable(tile, { onDrop: slot => tryPlace(tile, slot), onTap: () => select(tile) });
        bank.append(tile);
      });

      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      function select(tile) {
        if (tile.classList.contains('is-spare')) return;
        if (selected) selected.classList.remove('is-selected');
        if (selected === tile) { selected = null; return; }
        selected = tile;
        tile.classList.add('is-selected');
        say(`Now tap the box where ${tile.dataset.value} goes.`);
      }

      function tryPlace(tile, slot) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!slot || slot.disabled || !slots.contains(slot)) return;
        if (Number(tile.dataset.value) === Number(slot.dataset.value)) {
          slot.textContent = tile.dataset.value;
          slot.classList.add('is-filled');
          slot.disabled = true;
          slot.setAttribute('aria-label', `${tile.dataset.value}, correct`);
          tile.remove();
          filled += 1;
          if (filled === missing.length) roundDone();
          else say(pick(PRAISE));
        } else {
          slot.classList.remove('is-bad');
          void slot.offsetWidth;
          slot.classList.add('is-bad');
          tile.classList.add('is-bounce');
          setTimeout(() => tile.classList.remove('is-bounce'), 500);
          const prev = $(`.slot[data-index="${Number(slot.dataset.index) - 1}"]`, slots);
          const prevText = prev ? prev.textContent : '';
          say(prevText
            ? `Almost! What comes after ${prevText} when we ${countWord}?`
            : `Almost! Remember, we ${countWord}.`);
        }
      }

      function roundDone() {
        const leftover = $('.tile', bank);
        if (leftover) {
          leftover.classList.add('is-spare');
          leftover.disabled = true;
          leftover.setAttribute('aria-label', `${leftover.dataset.value} was a trick number`);
        }
        const isLast = round === ROUNDS.length - 1;
        say(`${pick(PRAISE)} ${leftover ? `${leftover.dataset.value} was a trick number!` : ''}`);
        MA.launchConfetti(25);
        result.append(
          el('p', { class: 'round-result__text' }, `🎉 ${seq.join(', ')}`),
          el('div', { class: 'stage-actions' }, button(isLast ? '✅ Finish' : 'Next round ▶', 'btn', () => {
            if (isLast) { result.innerHTML = ''; result.append(el('p', { class: 'round-result__text' }, '🧩 All rounds done!')); done(); }
            else { round += 1; newRound(); }
          }))
        );
      }

      box.append(
        el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length} · ${cfg.label}`),
        instruction('✋ Drag a number into a box. Or tap a number, then tap a box.'),
        slots, bank, result
      );
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — find and fix Milo's mistakes
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const steps = shuffle([2, 5, 10]);
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const step = steps[round];
      const maxK = { 2: 30, 5: 10, 10: 5 }[step];
      const start = step * rnd(1, maxK);
      const seq = Array.from({ length: 6 }, (_, i) => start + step * i);
      const bad = rnd(2, 4);
      const wrongValue = seq[bad] + pick([1, -1]);
      const shown = [...seq];
      shown[bad] = wrongValue;
      let found = false;
      say(`I counted in ${step}s, but I think I made a mistake. Can you find it?`);

      const row = el('ol', { class: 'mistake-row', 'aria-label': "Milo's counting" });
      const fix = el('div', { class: 'fix-area', 'aria-live': 'polite' });
      const chips = shown.map((value, i) => {
        const chip = button(String(value), 'm-chip', () => check(chip, i));
        row.append(el('li', {}, chip));
        return chip;
      });

      function check(chip, i) {
        if (found) return;
        if (i === bad) {
          found = true;
          chip.classList.add('is-found');
          chip.setAttribute('aria-label', `${wrongValue}, this is the mistake`);
          chips.forEach(c => { c.disabled = true; });
          say(`Yes! ${wrongValue} is wrong. What should it be?`);
          showFix(chip);
        } else {
          chip.classList.add('is-ok');
          chip.disabled = true;
          chip.setAttribute('aria-label', `${shown[i]}, correct`);
          say(i === 0 ? 'That is where I started. Look further along.' : `${shown[i]} is right! Keep looking.`);
        }
      }

      function showFix(chip) {
        const right = seq[bad];
        const others = shuffle([right + step, right + (wrongValue > right ? -1 : 1), right - step]
          .filter(v => v !== right && v !== wrongValue && v >= 0)).slice(0, 2);
        const options = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Choose the right number' });
        shuffle([right, ...others]).forEach(value => {
          const opt = button(String(value), 'fix-btn', () => {
            if (value === right) {
              chip.textContent = right;
              chip.classList.remove('is-found');
              chip.classList.add('is-fixed');
              chip.setAttribute('aria-label', `${right}, fixed`);
              $$('.fix-btn', options).forEach(b => { b.disabled = true; });
              opt.classList.add('is-right');
              say(`Thank you! ${seq[bad - 1]} and ${step} more is ${right}.`);
              MA.launchConfetti(25);
              if (round === steps.length - 1) {
                fix.append(el('p', { class: 'round-result__text' }, '🧠 All mistakes fixed!'));
                done();
              } else {
                fix.append(el('div', { class: 'stage-actions' },
                  button('Next mistake ▶', 'btn', () => { round += 1; newRound(); })));
              }
            } else {
              opt.classList.add('is-wrong');
              opt.disabled = true;
              opt.textContent = `${value} ✗`;
              say(`Almost! Count on ${step} from ${seq[bad - 1]}.`);
            }
          });
          options.append(opt);
        });
        fix.append(el('p', { class: 'fix-q' }, `${wrongValue} ➜ ?`), options);
      }

      box.append(
        el('p', { class: 'round-label' }, `Mistake ${round + 1} of ${steps.length} · counting in ${step}s`),
        instruction('👆 Tap the number that is wrong.'),
        row, fix
      );
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — hundred square patterns
     ------------------------------------------------------------ */
  function renderHundred(box, done) {
    const ROUNDS = [
      () => {
        const s = rnd(1, 9);
        return {
          start: s, step: 10, taps: 5, label: `Start at ${s}. Count on in 10s.`,
          question: 'What do you notice?',
          options: ['⬇️ They make a line going down', '➡️ They make a line going across', '🔀 They are all mixed up'],
          explain: 'The ones digit stays the same. Only the tens change!'
        };
      },
      () => ({
        start: 5, step: 5, taps: 6, label: 'Start at 5. Count on in 5s.',
        question: 'Look at the last digits. What do you notice?',
        options: ['They end in 5 or 0', 'They all end in 2', 'They are all odd'],
        explain: 'Counting in 5s goes 5, 0, 5, 0 in the ones place.'
      }),
      () => {
        const s = 2 * rnd(1, 8);
        return {
          start: s, step: 2, taps: 6, label: `Start at ${s}. Count on in 2s.`,
          question: 'What do you notice?',
          options: ['They are all even', 'They all end in 5', 'They are all odd'],
          explain: 'Counting in 2s from an even number lands on even numbers.'
        };
      }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round]();
      const answer = cfg.options[0];
      let cur = cfg.start;
      let taps = 0;
      say(`${cfg.label} Tap the numbers you land on!`);

      const progress = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Found: 0 of ${cfg.taps}`);
      const grid = el('div', { class: 'hundred', role: 'group', 'aria-label': 'Hundred square' });
      const after = el('div', { class: 'fix-area', 'aria-live': 'polite' });

      for (let n = 1; n <= 100; n++) {
        const cell = button(String(n), `hsq${n === cfg.start ? ' is-start' : ''}`, () => tap(cell, n), {
          'aria-label': n === cfg.start ? `${n}, start` : String(n)
        });
        grid.append(cell);
      }

      function tap(cell, n) {
        if (taps >= cfg.taps || n === cfg.start || cell.classList.contains('is-lit')) return;
        if (n === cur + cfg.step) {
          cur = n;
          taps += 1;
          cell.classList.add('is-lit');
          cell.setAttribute('aria-label', `${n}, found`);
          progress.textContent = `Found: ${taps} of ${cfg.taps}`;
          if (taps === cfg.taps) askPattern();
          else say(pick(PRAISE));
        } else {
          cell.classList.remove('is-oops');
          void cell.offsetWidth;
          cell.classList.add('is-oops');
          setTimeout(() => cell.classList.remove('is-oops'), 700);
          say(`Almost! Count on ${cfg.step} from ${cur}.`);
        }
      }

      function askPattern() {
        say(cfg.question);
        const options = el('div', { class: 'fix-options fix-options--wide', role: 'group', 'aria-label': cfg.question });
        shuffle(cfg.options).forEach(text => {
          const opt = button(text, 'pattern-btn', () => {
            if (text === answer) {
              $$('.pattern-btn', options).forEach(b => { b.disabled = true; });
              opt.classList.add('is-right');
              say(cfg.explain);
              MA.launchConfetti(30);
              after.append(el('p', { class: 'round-result__text' }, `🌟 ${cfg.explain}`));
              if (round === ROUNDS.length - 1) done();
              else {
                after.append(el('div', { class: 'stage-actions' },
                  button('Next pattern ▶', 'btn', () => { round += 1; newRound(); })));
              }
            } else {
              opt.classList.add('is-wrong');
              opt.disabled = true;
              say('Look at the purple squares again.');
            }
          });
          options.append(opt);
        });
        after.append(el('p', { class: 'fix-q' }, `🤔 ${cfg.question}`), options);
      }

      box.append(
        el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${ROUNDS.length}`),
        instruction(`🚩 ${cfg.label}`),
        progress, grid, after
      );
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER — five mixed questions using the shared engine
     ------------------------------------------------------------ */
  function optionsFor(answer, candidates) {
    const values = [answer];
    candidates.forEach(c => {
      if (values.length < 3 && c >= 0 && c <= 100 && !values.includes(c)) values.push(c);
    });
    return shuffle(values).map(v => ({ value: v, label: String(v) }));
  }

  const track = (items) => `<ol class="track" aria-label="Number track">${items
    .map(v => (v === '?' ? '<li class="is-gap" aria-label="missing number">?</li>' : `<li>${v}</li>`)).join('')}</ol>`;

  function qTensOnes() {
    const tens = rnd(2, 6);
    const ones = rnd(1, 9);
    const n = tens * 10 + ones;
    const boxes = `<span class="m-box">${'<i></i>'.repeat(10)}</span>`.repeat(tens);
    const loose = `<span class="m-ones">${'<i></i>'.repeat(ones)}</span>`;
    return {
      icon: '📦', question: 'How many dots?', instruction: 'Each box holds 10. Count the tens, then the ones.',
      visual: `<div class="m-groups" role="img" aria-label="${tens} boxes of ten and ${ones} more dots">${boxes}${loose}</div>`,
      options: optionsFor(n, [n + 10, ones * 10 + tens, n - 10, n + 1]),
      answer: n,
      hint: 'Almost! Count the boxes in tens, then count on the ones.',
      explain: `${tens} tens and ${ones} ones make ${n}.`
    };
  }

  function qNext() {
    const step = pick([2, 5]);
    const start = step * rnd(2, 10);
    const seq = [0, 1, 2, 3].map(i => start + step * i);
    const ans = seq[3] + step;
    return {
      icon: '👣', question: 'What comes next?', instruction: `We are counting in ${step}s.`,
      visual: track([...seq, '?']),
      options: optionsFor(ans, [ans + 1, ans - 1, seq[3] + 1]),
      answer: ans,
      hint: `Almost! Count on ${step} from ${seq[3]}.`,
      explain: `${seq[3]} + ${step} = ${ans}`
    };
  }

  function qBefore() {
    const t = rnd(3, 9) * 10;
    return {
      icon: '⬅️', question: `What number comes just before ${t}?`, instruction: 'Count back one.',
      options: optionsFor(t - 1, [t - 10, t + 1, t + 9]),
      answer: t - 1,
      hint: `Almost! Count back 1 from ${t}.`,
      explain: `Just before ${t} comes ${t - 1}.`
    };
  }

  function qBackTens() {
    const start = rnd(5, 9) * 10 + rnd(1, 9);
    const seq = [start, start - 10, start - 20];
    const ans = start - 30;
    return {
      icon: '🔟', question: 'Count back in 10s. What comes next?', instruction: 'Tap the missing number.',
      visual: track([...seq, '?']),
      options: optionsFor(ans, [ans - 1, ans + 1, ans - 10]),
      answer: ans,
      hint: `Almost! Take 10 away from ${seq[2]}. Only the tens digit changes.`,
      explain: `${seq[2]} − 10 = ${ans}`
    };
  }

  function qOnTens() {
    const s = rnd(1, 9) + 10 * rnd(0, 3);
    const seq = [s, s + 10, s + 20];
    const ans = s + 30;
    return {
      icon: '🚀', question: 'Count on in 10s. What comes next?', instruction: 'Tap the missing number.',
      visual: track([...seq, '?']),
      options: optionsFor(ans, [ans + 1, s + 3, ans + 10]),
      answer: ans,
      hint: 'Almost! Look at the tens digit. It goes up by 1 each time.',
      explain: `${seq[2]} + 10 = ${ans}`
    };
  }

  function renderMaster(box, done) {
    const questions = [qTensOnes(), qNext(), qBefore(), qBackTens(), qOnTens()];
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
        if (index < questions.length) show(); else finale();
      }, { hidden: true });

      box.append(dots, area, el('div', { class: 'stage-actions' }, next));
      say(index === 0 ? 'Five questions. Show me what you know!' : pick(['Keep going!', 'You can do it!', 'Nice and steady.']));

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

    function finale() {
      box.innerHTML = '';
      const first = MA.markModuleMastered(MODULE_ID);
      if (first) {
        MA.addStars(MASTER_REWARD.stars, { message: 'Counting mastered!' });
        MA.addGems(MASTER_REWARD.gems, { silent: true });
        MA.unlockBadge('counting-master');
      } else {
        MA.launchConfetti(60);
      }
      box.append(el('div', { class: 'finale' },
        el('div', { class: 'finale__trophy', 'aria-hidden': 'true' }, '🏆'),
        el('h3', { class: 'finale__title' }, 'Counting Master!'),
        el('p', { class: 'finale__text' }, `${firstTry} of ${questions.length} right on the first try.`),
        el('p', { class: 'finale__reward' }, first
          ? `⭐ +${MASTER_REWARD.stars} stars  •  💎 +${MASTER_REWARD.gems} gem  •  🔢 New badge!`
          : 'You already mastered Counting. Great practice!'),
        el('div', { class: 'stage-actions' },
          button('🔁 Play again', 'btn btn--ghost', () => renderMaster(box, done)),
          el('a', { class: 'btn btn--sun', href: '../index.html#adventure' }, '🗺️ Back to the map'))
      ));
      say('You are a Counting Master! 🏆');
      done();
    }
  }

  /* ------------------------------------------------------------
     Start: open the first step not yet done
     ------------------------------------------------------------ */
  const firstOpen = STAGES.findIndex(stage => !MA.isStageDone(MODULE_ID, stage.id));
  goTo(firstOpen === -1 ? 0 : firstOpen, { scroll: false });
})();
