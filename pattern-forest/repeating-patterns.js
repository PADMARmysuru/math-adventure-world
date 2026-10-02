/* ==============================================================
   🔁 Pattern Forest → Repeating Patterns   pattern-forest/repeating-patterns.js
   --------------------------------------------------------------
   🌱 Learn      find the part that repeats (AB, ABB, ABC, AABB)
   🎮 Play       bead threader: carry on the necklace pattern
   🧩 Practise   drag the missing items into the gaps
   🧠 Think      spot the mistake in a pattern and fix it
   🚀 Challenge  predict the 10th item, then make your own pattern
   🏆 Master     five mixed questions → Rhythm Ranger badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, nextOrDone, PRAISE } = K;

  const MODULE_ID = 'pattern-forest/repeating-patterns';
  const SETS = [['🍎', '🍌', '🍇'], ['🐶', '🐱', '🐰'], ['🔴', '🟡', '🔵'], ['⭐', '🌙', '☀️'], ['🌸', '🍀', '🍄']];
  const NAMES = { '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🐶': 'dog', '🐱': 'cat', '🐰': 'rabbit', '🔴': 'red', '🟡': 'yellow', '🔵': 'blue', '🟢': 'green', '⭐': 'star', '🌙': 'moon', '☀️': 'sun', '🌸': 'flower', '🍀': 'clover', '🍄': 'mushroom' };
  const UNITS = { AB: [0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2], AABB: [0, 0, 1, 1] };

  const makeUnit = (type, set) => UNITS[type].map(i => set[i]);
  const repeatTo = (unit, len) => Array.from({ length: len }, (_, i) => unit[i % unit.length]);
  const said = list => list.map(x => NAMES[x] || x).join(', ');
  const row = (items, cls = '') => el('div', { class: `pat-row ${cls}`, 'aria-label': said(items) }, items.map(x => el('span', { class: 'pat-item' }, x)));

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'What repeats?',      render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Bead threader',      render: renderBeads },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Fill the gaps',      render: renderGaps },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'Spot the mistake',   render: renderMistake },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Pattern predictor',  render: renderPredict },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Rhythm Ranger',      render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — which part repeats?
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const types = ['AB', 'ABB', 'ABC', 'AABB'];
    const sets = shuffle(SETS);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const unit = makeUnit(types[round], sets[round]);
      const seq = repeatTo(unit, unit.length * 3);
      let solved = false;
      say(round === 0 ? 'A pattern has a part that repeats again and again. Which part repeats here?' : 'Say it out loud. Which part repeats?');
      const shown = row(seq);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const options = shuffle([
        { unit, right: true },
        { unit: unit.slice(0, -1).length ? unit.slice(0, -1) : [unit[0], unit[0]] },
        { unit: [...unit, unit[0]] }
      ]);
      const group = el('div', { class: 'unit-options', role: 'group', 'aria-label': 'Which part repeats?' });
      options.forEach(opt => {
        const b = button(opt.unit.join(''), 'unit-btn', () => {
          if (solved) return;
          if (opt.right) {
            solved = true;
            b.classList.add('is-right');
            // show the chunks
            shown.replaceWith(el('div', { class: 'pat-row' }, Array.from({ length: 3 }, () => el('span', { class: 'pat-chunk' }, unit.map(x => el('span', { class: 'pat-item' }, x))))));
            say(`Yes! ${said(unit)}… then again, and again!`);
            MA.launchConfetti(20);
            result.append(el('p', { class: 'round-result__text' }, `🔁 ${unit.join(' ')} repeats ×3`));
            nextOrDone(result, round === types.length - 1, 'Next pattern ▶', () => { round += 1; next(); }, done);
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say('Check: does that part repeat all the way along? Say it out loud!');
          }
        }, { 'aria-label': said(opt.unit), 'data-right': opt.right ? 'yes' : 'no' });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${types.length}`), shown,
        instruction('👆 Tap the part that repeats.'), group, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — bead threader
     ------------------------------------------------------------ */
  function renderBeads(box, done) {
    const types = ['AB', 'ABB', 'ABC'];
    const beadSet = ['🔴', '🟡', '🔵', '🟢'];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const unit = makeUnit(types[round], shuffle(beadSet));
      const given = unit.length * 2;
      const toAdd = round === 2 ? 6 : 5;
      const full = repeatTo(unit, given + toAdd);
      let added = 0;
      say('Carry on the necklace! Which bead comes next?');
      const string = el('div', { class: 'necklace', 'aria-label': 'Necklace' }, full.slice(0, given).map(b => el('span', { class: 'bead' }, b)));
      const empties = Array.from({ length: toAdd }, () => el('span', { class: 'bead bead--empty' }, '○'));
      string.append(...empties);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const pad = el('div', { class: 'bead-pad', role: 'group', 'aria-label': 'Beads' });
      [...new Set(unit)].concat(beadSet.filter(b => !unit.includes(b)).slice(0, 1)).forEach(b => {
        pad.append(button(b, 'bead-btn', () => {
          if (added >= toAdd) return;
          const want = full[given + added];
          if (b === want) {
            const slot = empties[added];
            slot.textContent = b;
            slot.classList.remove('bead--empty');
            slot.classList.add('is-new');
            added += 1;
            if (added === toAdd) {
              MA.launchConfetti(30);
              say(`A perfect necklace! ${said(unit)}, again and again.`);
              nextOrDone(result, round === types.length - 1, 'Next necklace ▶', () => { round += 1; next(); }, done, '📿 Beautiful beads!');
            }
          } else {
            pulse(empties[added], 'is-oops');
            say(`Say it out loud from the start: ${said(unit)}, ${said(unit)}… what comes next?`);
          }
        }, { 'aria-label': `${NAMES[b]} bead`, 'data-bead': b }));
      });
      box.append(el('p', { class: 'round-label' }, `Necklace ${round + 1} of ${types.length}`),
        instruction('👆 Tap the bead that comes next.'), string, pad, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — fill the gaps
     ------------------------------------------------------------ */
  function renderGaps(box, done) {
    const types = shuffle(['AB', 'ABB', 'ABC', 'AABB']).slice(0, 3);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const set = pick(SETS);
      const unit = makeUnit(types[round], set);
      const seq = repeatTo(unit, Math.max(8, unit.length * 3));
      const gaps = shuffle(seq.map((_, i) => i).filter(i => i >= unit.length)).slice(0, 3);
      const spare = set.find(x => !unit.includes(x)) || (SETS.find(s => s !== set) || set)[0];
      let selected = null;
      let filled = 0;
      say('Some items fell off! Put them back in the gaps.');
      const slots = el('ol', { class: 'slots pat-slots', 'aria-label': 'Pattern with gaps' });
      seq.forEach((x, i) => {
        const gap = gaps.includes(i);
        const slot = button(gap ? '' : x, `slot pat-slot${gap ? '' : ' is-given'}`, () => {
          if (selected) tryPlace(selected, slot); else say('Pick an item first.');
        }, { 'data-value': x, 'aria-label': gap ? `Gap ${i + 1}` : NAMES[x], disabled: !gap });
        slots.append(el('li', {}, slot));
      });
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Items' });
      shuffle([...gaps.map(i => seq[i]), spare]).forEach(x => {
        const tile = button(x, 'tile pat-tile', null, { 'data-value': x, 'aria-label': NAMES[x] });
        makeDraggable(tile, {
          onDrop: slot => tryPlace(tile, slot),
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
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      function tryPlace(tile, slot) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!slot || slot.disabled || !slots.contains(slot)) return;
        if (tile.dataset.value === slot.dataset.value) {
          slot.textContent = tile.dataset.value;
          slot.disabled = true;
          slot.classList.add('is-filled');
          tile.remove();
          filled += 1;
          if (filled === gaps.length) {
            const left = $('.tile', bank);
            if (left) { left.classList.add('is-spare'); left.disabled = true; }
            MA.launchConfetti(25);
            say(`${pick(PRAISE)} The pattern is whole again.`);
            nextOrDone(result, round === types.length - 1, 'Next pattern ▶', () => { round += 1; next(); }, done, '🧩 All fixed!');
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say(`Say the pattern from the start: ${said(unit)}…`);
        }
      }
      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${types.length}`),
        instruction('✋ Drag items into the gaps. Or tap an item, then a gap.'), slots, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — spot the mistake
     ------------------------------------------------------------ */
  function renderMistake(box, done) {
    const types = ['AB', 'ABC', 'ABB'];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const set = shuffle(SETS)[0];
      const unit = makeUnit(types[round], set);
      const seq = repeatTo(unit, unit.length * 3);
      const bad = rnd(unit.length, seq.length - 1);
      const right = seq[bad];
      const wrongItem = set.find(x => x !== right && unit.includes(x)) || set.find(x => x !== right);
      const shown = [...seq];
      shown[bad] = wrongItem;
      let phase = 'find';
      say('Milo made this pattern, but one item is wrong. Can you find it?');
      const line = el('div', { class: 'pat-row', role: 'group', 'aria-label': "Milo's pattern" });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      shown.forEach((x, i) => {
        const b = button(x, 'pat-item pat-item--btn', () => {
          if (phase !== 'find') return;
          if (i === bad) {
            phase = 'fix';
            b.classList.add('is-found');
            say('Found it! What should go there instead?');
            const group = el('div', { class: 'bead-pad', role: 'group', 'aria-label': 'Fix it' });
            [...new Set(unit)].forEach(opt => {
              const f = button(opt, 'bead-btn', () => {
                if (opt === right) {
                  b.textContent = right;
                  b.classList.remove('is-found');
                  b.classList.add('is-fixed');
                  $$('button', group).forEach(x2 => { x2.disabled = true; });
                  MA.launchConfetti(25);
                  say(`Fixed! ${said(unit)} repeats all the way now.`);
                  nextOrDone(result, round === types.length - 1, 'Next pattern ▶', () => { round += 1; next(); }, done, '🧠 Mistake hunter!');
                } else {
                  pulse(f, 'is-oops');
                  say('Read the pattern from the start to see what belongs there.');
                }
              }, { 'aria-label': NAMES[opt], 'data-bead': opt });
              group.append(f);
            });
            result.append(el('p', { class: 'fix-q' }, '🔧 What belongs there?'), group);
          } else {
            pulse(b, 'is-oops');
            say('That one fits the pattern. Keep looking!');
          }
        }, { 'aria-label': `${NAMES[x]}, position ${i + 1}`, 'data-bad': i === bad ? 'yes' : 'no' });
        line.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${types.length}`),
        instruction('👆 Tap the item that breaks the pattern.'), line, result);
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — predict far ahead, then invent a pattern
     ------------------------------------------------------------ */
  function renderPredict(box, done) {
    const tasks = [{ type: 'AB', n: 10 }, { type: 'ABC', n: 9 }, { type: 'ABB', n: 12 }];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      if (round === tasks.length) { create(); return; }
      const t = tasks[round];
      const set = pick(SETS);
      const unit = makeUnit(t.type, set);
      const answer = unit[(t.n - 1) % unit.length];
      let solved = false;
      say(`No peeking! What will the ${t.n}th item be?`);
      const line = el('ol', { class: 'pat-numbered' }, repeatTo(unit, 6).map((x, i) => el('li', {}, el('span', { class: 'pat-item' }, x), el('small', {}, String(i + 1)))));
      line.append(el('li', { class: 'is-dots' }, el('span', {}, '…')), el('li', { class: 'is-ask' }, el('span', { class: 'pat-item' }, '?'), el('small', {}, String(t.n))));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'bead-pad', role: 'group', 'aria-label': 'Choices' });
      [...new Set(unit)].forEach(x => {
        const b = button(x, 'bead-btn', () => {
          if (solved) return;
          if (x === answer) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(25);
            const tip = `The pattern repeats every ${unit.length}. Count in ${unit.length}s: ${Array.from({ length: Math.floor(t.n / unit.length) }, (_, i) => (i + 1) * unit.length).join(', ')}…`;
            say(`Yes! The ${t.n}th is ${NAMES[x]}.`);
            result.append(el('p', { class: 'round-result__text' }, `🔮 ${t.n}th: ${x}`), el('p', { class: 'round-result__tip' }, tip));
            result.append(el('div', { class: 'stage-actions' }, button(round === tasks.length - 1 ? 'Now make your own! ▶' : 'Next ▶', 'btn', () => { round += 1; next(); })));
          } else {
            pulse(b, 'is-oops');
            say(`Hint: each chunk has ${unit.length}. Which item ends a chunk, and where?`);
          }
        }, { 'aria-label': NAMES[x], 'data-bead': x });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Predict ${round + 1} of ${tasks.length + 1}`), line,
        instruction(`👆 What is item number ${t.n}?`), group, result);
    }

    function create() {
      const set = pick(SETS);
      const mine = [];
      say('Your turn! Make your own repeating pattern with 8 items. Use at least 2 different things.');
      const line = el('div', { class: 'pat-row pat-row--build', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const draw = () => { line.innerHTML = ''; for (let i = 0; i < 8; i++) line.append(el('span', { class: `pat-item${mine[i] ? '' : ' pat-item--empty'}` }, mine[i] || '○')); };
      const pad = el('div', { class: 'bead-pad', role: 'group', 'aria-label': 'Items' });
      set.forEach(x => pad.append(button(x, 'bead-btn', () => { if (mine.length < 8) { mine.push(x); draw(); result.innerHTML = ''; } }, { 'aria-label': NAMES[x], 'data-bead': x })));
      const check = () => {
        result.innerHTML = '';
        if (mine.length < 8) { say('Fill all 8 places first.'); return; }
        const unitLen = [2, 3, 4].find(u => mine.every((x, i) => x === mine[i % u]));
        if (unitLen && new Set(mine).size > 1) {
          $$('button', pad).forEach(b => { b.disabled = true; });
          MA.launchConfetti(45);
          say(`That is a real repeating pattern! ${said(mine.slice(0, unitLen))} repeats.`);
          result.append(el('p', { class: 'round-result__text' }, `🎨 Your pattern repeats every ${unitLen}!`));
          done();
        } else {
          say('Hmm, it does not repeat yet. Choose a short part, then copy it again and again.');
          result.append(el('p', { class: 'round-result__tip' }, '💡 Try: pick 2 or 3 items, then repeat them in the same order.'));
        }
      };
      draw();
      box.append(el('p', { class: 'round-label' }, `Create ${tasks.length + 1} of ${tasks.length + 1}`),
        instruction('👆 Tap items to build 8, then Check.'), line, pad,
        el('div', { class: 'stage-actions' }, button('↩ Undo', 'btn btn--ghost', () => { mine.pop(); draw(); }), button('✓ Check', 'btn', check)), result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const seqHTML = items => `<div class="pat-row">${items.map(x => `<span class="pat-item">${x}</span>`).join('')}</div>`;
  const itemOpts = (list) => shuffle([...new Set(list)]).map(x => ({ value: x, label: NAMES[x], html: x }));
  function qNext() { const unit = makeUnit(pick(['ABB', 'ABC', 'AABB']), pick(SETS)); const seq = repeatTo(unit, unit.length * 2 + 1); const ans = unit[seq.length % unit.length]; return { icon: '➡️', question: 'What comes next?', instruction: 'Say the pattern.', visual: seqHTML([...seq, '?']), options: itemOpts(unit), answer: ans, hint: 'Almost! Find the part that repeats.', explain: `${said(unit)} repeats.` }; }
  function qUnit() { const unit = makeUnit('ABB', pick(SETS)); const seq = repeatTo(unit, 9); const opts = shuffle([unit.join(''), unit.slice(0, 2).join(''), [...unit, unit[0]].join('')]); return { icon: '🔁', question: 'Which part repeats?', instruction: 'Find the chunk.', visual: seqHTML(seq), options: opts.map(o => ({ value: o, label: o, html: o })), answer: unit.join(''), hint: 'Almost! Check it repeats all the way along.', explain: `${unit.join(' ')} repeats.` }; }
  function qNth() { const unit = makeUnit('AB', pick(SETS)); const n = pick([8, 10, 11]); const ans = unit[(n - 1) % 2]; return { icon: '🔮', question: `What is item number ${n}?`, instruction: 'Odd places and even places!', visual: seqHTML(repeatTo(unit, 4)), options: itemOpts(unit), answer: ans, hint: 'Almost! Item 2, 4, 6… are all the same.', explain: `Item ${n} is ${NAMES[ans]}.` }; }
  function qBreak() { const unit = makeUnit('ABC', pick(SETS)); const seq = repeatTo(unit, 6); const pos = rnd(3, 5); const shown = [...seq]; shown[pos] = unit[(pos + 1) % 3]; return { icon: '🔍', question: 'Which place has the mistake?', instruction: 'Count from the left.', visual: seqHTML(shown), options: K.optionsFor(pos + 1, [pos, pos + 2, 1]), answer: pos + 1, hint: 'Almost! Say the pattern and find where it breaks.', explain: `Place ${pos + 1} should be ${NAMES[seq[pos]]}.` }; }
  function qBeads() { const unit = makeUnit('AABB', ['🔴', '🔵', '🟡']); const seq = repeatTo(unit, 6); return { icon: '📿', question: 'What are the next TWO beads?', instruction: 'Look at the pairs.', visual: seqHTML([...seq, '?', '?']), options: shuffle([[unit[2], unit[3]], [unit[0], unit[1]], [unit[0], unit[2]]]).map(p => ({ value: p.join(''), label: p.map(x => NAMES[x]).join(' and '), html: p.join('') })), answer: [unit[2], unit[3]].join(''), hint: 'Almost! Two of one colour, then two of the other.', explain: `Two ${NAMES[unit[0]]}, two ${NAMES[unit[2]]}, again and again.` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qNext(), qUnit(), qNth(), qBreak(), qBeads()], moduleId: MODULE_ID, badgeId: 'rhythm-ranger', title: 'Rhythm Ranger' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
