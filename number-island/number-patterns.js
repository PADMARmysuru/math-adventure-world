/* ==============================================================
   🔁 Number Island → Number Patterns    number-island/number-patterns.js
   --------------------------------------------------------------
   🌱 Learn      spot the rule (+2, +5, +10, −1, −10), then what comes next
   🎮 Play       odd and even houses: sort the numbers
   🧩 Practise   drag the missing numbers into patterns
   🧠 Think      true or false? about patterns, odd and even
   🚀 Challenge  mystery patterns: type the missing numbers
   🏆 Master     five mixed questions → Pattern Pro badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, optionsFor, track, trueFalse, nextOrDone, PRAISE } = K;

  const MODULE_ID = 'number-island/number-patterns';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Spot the rule',        render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Odd and even houses',  render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Fix the pattern',      render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',       render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Mystery patterns',     render: renderMystery },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Pattern Pro',          render: renderMaster }
  ];

  const ruleText = step => (step > 0 ? `+${step}` : `−${-step}`);

  /** A pattern of `len` numbers that stays within 0–100. */
  function makeSeq(step, len = 5) {
    const span = Math.abs(step) * (len - 1);
    const start = step > 0 ? rnd(0, 100 - span) : rnd(span, 100);
    const begin = Math.abs(step) === 1 || Math.abs(step) === 10 ? start : Math.round(start / Math.abs(step)) * Math.abs(step);
    const safeBegin = step > 0 ? Math.min(begin, 100 - span) : Math.max(begin, span);
    return Array.from({ length: len }, (_, i) => safeBegin + step * i);
  }

  /* ------------------------------------------------------------
     🌱 LEARN — find the rule, then predict
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const steps = [2, 5, -10, 10, -1];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const step = steps[round];
      const full = makeSeq(step, 6);          // the 6th number is the one to predict
      const seq = full.slice(0, 5);
      let phase = 'rule';
      say(round === 0 ? 'Look at the jumps. What is the rule?' : pick(['What is the rule?', 'How does it change each time?']));
      const jumps = el('div', { class: 'jumps', 'aria-hidden': 'true' }, seq.slice(1).map(() => el('span', { class: 'jump' }, '?')));
      const row = el('div', { class: 'pattern-row', html: track([...seq, '?']) });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const ruleGroup = el('div', { class: 'sign-pad', role: 'group', 'aria-label': 'Rules' });
      shuffle([...new Set([step, -step, step === 2 ? 5 : 2, step === 10 || step === -10 ? 1 : 10])]).slice(0, 4).forEach(r => {
        const b = button(ruleText(r), 'sign-btn sign-btn--rule', () => {
          if (phase !== 'rule') return;
          if (r === step) {
            phase = 'next';
            b.classList.add('is-right');
            $$('button', ruleGroup).forEach(x => { x.disabled = true; });
            $$('.jump', jumps).forEach(j => { j.textContent = ruleText(step); j.classList.add('is-shown'); });
            say(`The rule is ${ruleText(step)}! So what comes next?`);
            askNext();
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say(`Not ${ruleText(r)}. Is it getting bigger or smaller? By how much?`);
          }
        });
        ruleGroup.append(b);
      });

      function askNext() {
        const ans = full[5];
        const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'What comes next?' });
        shuffle([ans, ans + 1, seq[seq.length - 1] - step].filter((v, i, a) => a.indexOf(v) === i)).forEach(v => {
          const b = button(String(v), 'fix-btn', () => {
            if (v === ans) {
              $$('button', group).forEach(x => { x.disabled = true; });
              b.classList.add('is-right');
              const gap = $('.is-gap', row);
              if (gap) { gap.textContent = ans; gap.classList.remove('is-gap'); }
              say(`${seq[seq.length - 1]} ${ruleText(step)} = ${ans}. ${pick(PRAISE)}`);
              MA.launchConfetti(25);
              nextOrDone(result, round === steps.length - 1, 'Next pattern ▶', () => { round += 1; newRound(); }, done);
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              say(`Use the rule: ${seq[seq.length - 1]} ${ruleText(step)}.`);
            }
          });
          group.append(b);
        });
        result.append(el('p', { class: 'fix-q' }, '🔮 What comes next?'), group);
      }

      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${steps.length}`), row, jumps,
        instruction('👆 Tap the rule.'), ruleGroup, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — odd and even houses
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const ROUNDS = [{ max: 20, count: 8 }, { max: 99, count: 8 }];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      const nums = [];
      while (nums.length < cfg.count) {
        const n = rnd(1, cfg.max);
        if (!nums.includes(n) && nums.filter(x => x % 2 === n % 2).length < cfg.count / 2) nums.push(n);
      }
      let selected = null;
      let sorted = 0;
      say(round === 0 ? 'Even numbers make pairs. Odd numbers have one left over. Sort them!' : 'Big numbers! Just look at the ONES digit: 0, 2, 4, 6, 8 are even.');
      const house = (cat, label, emoji) => {
        const zone = el('div', { class: `slot house house--${cat}`, role: 'button', tabindex: '0', 'data-cat': cat, 'aria-label': `${label} house` },
          el('p', { class: 'house__label' }, `${emoji} ${label}`), el('div', { class: 'house__items' }));
        const activate = () => { if (selected) place(selected, zone); else say('Pick a number first.'); };
        zone.addEventListener('click', activate);
        zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
        return zone;
      };
      const odd = house('odd', 'Odd', '🏠');
      const even = house('even', 'Even', '🏡');
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Numbers to sort' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      nums.forEach(n => {
        const tile = button(String(n), 'tile', null, { 'data-cat': n % 2 ? 'odd' : 'even', 'aria-label': `Number ${n}` });
        makeDraggable(tile, {
          onDrop: zone => place(tile, zone && (zone === odd || zone === even) ? zone : null),
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

      function place(tile, zone) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!zone || tile.disabled) return;
        if (tile.dataset.cat === zone.dataset.cat) {
          tile.disabled = true;
          tile.classList.add('is-placed');
          $('.house__items', zone).append(tile);
          sorted += 1;
          if (sorted === nums.length) {
            MA.launchConfetti(35);
            say('All sorted! Odd and even take turns: odd, even, odd, even…');
            nextOrDone(result, round === ROUNDS.length - 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🏡 Everyone is home!');
          } else say(pick(PRAISE));
        } else {
          pulse(tile, 'is-bounce');
          pulse(zone, 'is-bad');
          const n = Number(tile.textContent);
          say(`${n} ends in ${n % 10}. ${n % 2 ? 'One is left over when you make pairs, so it is odd.' : 'It makes pairs with none left, so it is even.'}`);
        }
      }

      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each number to its house. Or tap a number, then a house.'),
        bank, el('div', { class: 'houses' }, odd, even), result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — missing numbers in patterns
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const steps = shuffle([2, 5, 10, -2, -5, -10]).slice(0, 3);
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const step = steps[round];
      const seq = makeSeq(step, 6);
      const gaps = shuffle([1, 2, 3, 4, 5]).slice(0, 2).sort();
      const spare = seq[gaps[0]] + (seq[gaps[0]] < 100 ? 1 : -1);   // never part of the pattern
      let selected = null;
      let filled = 0;
      say(`This pattern goes ${step > 0 ? 'up' : 'down'}. Fill the gaps!`);
      const slots = el('ol', { class: 'slots', 'aria-label': 'Pattern' });
      seq.forEach((v, i) => {
        const given = !gaps.includes(i);
        const slot = button(given ? String(v) : '', `slot${given ? ' is-given' : ''}`, () => {
          if (selected) tryPlace(selected, slot); else say('Pick a number first.');
        }, { 'data-value': v, 'aria-label': given ? String(v) : `Gap ${i + 1}`, disabled: given });
        slots.append(el('li', {}, slot));
      });
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Numbers' });
      shuffle([...gaps.map(i => seq[i]), spare]).forEach(v => {
        const tile = button(String(v), 'tile', null, { 'data-value': v, 'aria-label': `Number ${v}` });
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
          slot.classList.add('is-filled');
          slot.disabled = true;
          tile.remove();
          filled += 1;
          if (filled === gaps.length) {
            const left = $('.tile', bank);
            if (left) { left.classList.add('is-spare'); left.disabled = true; }
            MA.launchConfetti(25);
            say(`The rule is ${ruleText(step)}. ${pick(PRAISE)}`);
            nextOrDone(result, round === steps.length - 1, 'Next pattern ▶', () => { round += 1; newRound(); }, done, '🧩 All fixed!');
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say(`Almost! Find the rule first. It goes ${step > 0 ? 'up' : 'down'} by ${Math.abs(step)}.`);
        }
      }

      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${steps.length}`),
        instruction('✋ Drag numbers into the gaps. Or tap a number, then a gap.'), slots, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => { const s = 2 * rnd(1, 20); return { text: `${s}, ${s + 2}, ${s + 4}, ${s + 6}<small>These are all even.</small>`, truth: true, explain: 'True! Counting in 2s from an even number lands on even numbers.' }; },
      () => { const k = rnd(1, 10); const seq = [k * 5, k * 5 + 5, k * 5 + 10, k * 5 + 15]; return { text: `${seq.join(', ')}, ${seq[3] + 10}<small>Milo’s next number</small>`, truth: false, explain: `The rule is +5, so next is ${seq[3] + 5}.`, fix: { question: 'What should come next?', options: [seq[3] + 5, seq[3] + 10, seq[3] + 1], answer: seq[3] + 5 } }; },
      () => { const a = 2 * rnd(1, 6) + 1; const b = 2 * rnd(1, 6) + 1; return { text: `${a} + ${b} = ${a + b}<small>odd + odd = even</small>`, truth: true, explain: 'True! Two leftover ones pair up, so odd + odd is even.' }; },
      () => { const s = rnd(1, 9); return { text: `${s}, ${s + 10}, ${s + 20}, ${s + 30}<small>The ones digit changes each time.</small>`, truth: false, explain: `Adding 10 changes only the tens. The ones digit stays ${s}.` }; }
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Pattern detective time! True or false?' : pick(['True or false?', 'Look for the rule!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — type the missing numbers with a keypad
     ------------------------------------------------------------ */
  function renderMystery(box, done) {
    const steps = [pick([2, 5]), pick([-2, -5]), pick([10, -10])];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const step = steps[round];
      const seq = makeSeq(step, 6);
      const gaps = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2);
      if (gaps.every(g => g < 2) || gaps.every(g => g > 3)) gaps[1] = 3;   // keep enough clues together
      let active = null;
      let typed = '';
      let solvedCount = 0;
      say('Mystery pattern! Tap a box, then type the number.');

      const row = el('ol', { class: 'slots', 'aria-label': 'Mystery pattern' });
      const boxes = {};
      seq.forEach((v, i) => {
        if (gaps.includes(i)) {
          const b = button('?', 'slot mystery-box', () => {
            if (b.classList.contains('is-filled')) return;
            if (active) active.classList.remove('is-active');
            active = b;
            typed = '';
            b.classList.add('is-active');
            b.textContent = '_';
          }, { 'data-value': v, 'aria-label': `Mystery box ${i + 1}` });
          boxes[i] = b;
          row.append(el('li', {}, b));
        } else row.append(el('li', {}, el('span', { class: 'slot is-given mystery-given' }, String(v))));
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const keypad = el('div', { class: 'keypad', role: 'group', 'aria-label': 'Number keypad' });
      [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].forEach(k => {
        keypad.append(button(String(k), `key${k === '✓' ? ' key--ok' : k === '⌫' ? ' key--back' : ''}`, () => press(k), {
          'aria-label': k === '✓' ? 'Check' : k === '⌫' ? 'Delete' : String(k)
        }));
      });

      function press(k) {
        if (!active) { say('Tap a ? box first.'); return; }
        if (k === '⌫') typed = typed.slice(0, -1);
        else if (k === '✓') { check(); return; }
        else if (typed.length < 3) typed += String(k);
        active.textContent = typed || '_';
      }

      function check() {
        if (!typed) return;
        if (Number(typed) === Number(active.dataset.value)) {
          active.classList.remove('is-active');
          active.classList.add('is-filled');
          active.setAttribute('aria-label', `${typed}, correct`);
          active = null;
          typed = '';
          solvedCount += 1;
          if (solvedCount === gaps.length) {
            MA.launchConfetti(35);
            say(`Solved! The rule is ${ruleText(step)}.`);
            nextOrDone(result, round === steps.length - 1, 'Next mystery ▶', () => { round += 1; newRound(); }, done, '🚀 All mysteries solved!');
          } else say(pick(PRAISE));
        } else {
          pulse(active, 'is-bad');
          say(`Not ${typed}. Find the rule from two numbers next to each other.`);
          typed = '';
          active.textContent = '_';
        }
      }

      box.append(el('p', { class: 'round-label' }, `Mystery ${round + 1} of ${steps.length}`),
        instruction('👆 Tap a ? box, type the number, then ✓.'), row, keypad, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qNext() { const step = pick([2, 5, 10]); const s = makeSeq(step, 5); const ans = s[4]; return { icon: '🔮', question: 'What comes next?', instruction: 'Find the rule.', visual: track([...s.slice(0, 4), '?']), options: optionsFor(ans, [ans + 1, s[3] + 1, ans + step]), answer: ans, hint: `Almost! The rule is ${ruleText(step)}.`, explain: `${s[3]} ${ruleText(step)} = ${ans}` }; }
  function qBack() { const step = pick([-2, -5, -10]); const s = makeSeq(step, 5); const ans = s[4]; return { icon: '⬇️', question: 'What comes next?', instruction: 'It is going down!', visual: track([...s.slice(0, 4), '?']), options: optionsFor(ans, [s[3] - step, ans - 1, ans + 1]), answer: ans, hint: `Almost! The rule is ${ruleText(step)}.`, explain: `${s[3]} ${ruleText(step)} = ${ans}` }; }
  function qRule() { const step = pick([2, 5, 10]); const s = makeSeq(step, 4); return { icon: '📏', question: 'What is the rule?', instruction: 'How much does it change each time?', visual: track(s), options: shuffle([2, 5, 10]).map(v => ({ value: `+${v}`, label: `+${v}` })), answer: `+${step}`, hint: 'Almost! Look at two numbers next to each other.', explain: `The rule is +${step}.` }; }
  function qOdd() { const odd = 2 * rnd(5, 40) + 1; const e1 = 2 * rnd(5, 40); let e2; do { e2 = 2 * rnd(5, 40); } while (e2 === e1); return { icon: '🏠', question: 'Which number is odd?', instruction: 'Look at the ones digit.', options: shuffle([odd, e1, e2]).map(v => ({ value: v, label: String(v) })), answer: odd, hint: 'Almost! Odd numbers end in 1, 3, 5, 7 or 9.', explain: `${odd} ends in ${odd % 10}, so it is odd.` }; }
  function qMissing() { const step = pick([5, 10]); const s = makeSeq(step, 5); return { icon: '❓', question: 'What is missing?', instruction: 'Find the rule.', visual: track([s[0], s[1], '?', s[3], s[4]]), options: optionsFor(s[2], [s[2] + 1, s[2] + step, s[1] + 1]), answer: s[2], hint: `Almost! ${s[1]} ${ruleText(step)} = ?`, explain: `${s[1]} ${ruleText(step)} = ${s[2]}` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qNext(), qRule(), qBack(), qOdd(), qMissing()], moduleId: MODULE_ID, badgeId: 'pattern-pro', title: 'Pattern Pro' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
