/* ==============================================================
   ⏱️ Measure Mountain → Time (how long?)   measure-mountain/time.js
   --------------------------------------------------------------
   🌱 Learn      which takes longer? then seconds, minutes, hours or days
   🎮 Play       stopwatch challenge: stop at exactly 5, 8 and 10 seconds
   🧩 Practise   put the day in order, then shortest to longest
   🧠 Think      true or false? (60 minutes in an hour)
   🚀 Challenge  time facts and "how long until?"
   🏆 Master     five mixed questions → Time Keeper badge
   Clocks and calendars live in Time Town.
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, nextOrDone, dragMatch, sortZones, quizRounds, optionsFor, PRAISE } = K;

  const MODULE_ID = 'measure-mountain/time';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'How long does it take?', render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Stopwatch challenge',    render: renderStopwatch },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'In order',               render: renderOrder },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',         render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Time facts',             render: renderFacts },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Time Keeper',            render: renderMaster }
  ];

  const ACTIVITIES = [
    ['😉', 'blink', 'seconds'], ['👏', 'clap your hands', 'seconds'], ['🪥', 'brush your teeth', 'minutes'], ['🥣', 'eat breakfast', 'minutes'],
    ['🏫', 'a school day', 'hours'], ['🎬', 'watch a film', 'hours'], ['🏖️', 'a holiday', 'days'], ['🌱', 'grow a sunflower', 'days']
  ];

  /* ------------------------------------------------------------
     🌱 LEARN
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const pairs = [[0, 2], [2, 4], [4, 6], [1, 7]];
    let round = 0;
    longer();

    function longer() {
      box.innerHTML = '';
      const [ia, ib] = pairs[round];
      const a = ACTIVITIES[ia];
      const b = ACTIVITIES[ib];
      let solved = false;
      say(round === 0 ? 'Some things are quick, some take ages! Which takes LONGER?' : 'Which takes longer?');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'cmp-pair', role: 'group', 'aria-label': 'Which takes longer?' });
      shuffle([a, b]).forEach(act => {
        const btn = button([el('span', { class: 'act-card__emoji', 'aria-hidden': 'true' }, act[0]), el('span', {}, act[1])], 'act-card', () => {
          if (solved) return;
          if (act === b) {
            solved = true;
            btn.classList.add('is-right');
            MA.launchConfetti(20);
            say(`Yes! To ${b[1]} takes ${b[2]}. To ${a[1]} takes ${a[2]}.`);
            result.append(el('p', { class: 'round-result__text' }, `⏳ ${b[0]} ${b[1]} takes longer`));
            result.append(el('div', { class: 'stage-actions' }, button(round === pairs.length - 1 ? 'Next: time words ▶' : 'Next ▶', 'btn', () => {
              round += 1;
              if (round < pairs.length) longer(); else units();
            })));
          } else {
            btn.classList.add('is-wrong');
            btn.disabled = true;
            say(`To ${act[1]} is quicker. It only takes ${act[2]}.`);
          }
        }, { 'data-act': act[1] });
        group.append(btn);
      });
      box.append(el('p', { class: 'round-label' }, `Pair ${round + 1} of ${pairs.length}`), instruction('👆 Tap the one that takes longer.'), group, result);
    }

    function units() {
      box.innerHTML = '';
      say('We measure time in seconds, minutes, hours and days. Sort these!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { bank, zones } = sortZones({
        zones: [{ id: 'seconds', label: '⚡ seconds' }, { id: 'minutes', label: '⏲️ minutes' }, { id: 'hours', label: '🕐 hours' }, { id: 'days', label: '📅 days' }],
        items: ACTIVITIES.map(([e, n, u]) => ({ face: e, cat: u, label: n })),
        hint: (item) => `To ${item.label} takes ${item.cat === 'seconds' ? 'just a moment' : item.cat === 'minutes' ? 'a few minutes' : item.cat === 'hours' ? 'a few hours' : 'many days'}.`,
        onComplete: () => {
          MA.launchConfetti(30);
          say('Seconds are quick, days are long!');
          result.append(el('p', { class: 'round-result__text' }, '⏱️ seconds < minutes < hours < days'));
          done();
        }
      });
      box.append(el('p', { class: 'round-label' }, 'Time words'), instruction('✋ Drag each activity to its time word.'), bank, zones, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — stopwatch challenge
     ------------------------------------------------------------ */
  function renderStopwatch(box, done) {
    const targets = [5, 8, 10];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      let start = 0;
      let timer = null;
      let tries = 0;
      let solved = false;
      say(`Can you feel ${T} seconds? Press Start, count in your head, and press Stop at ${T}!`);
      const face = el('div', { class: 'stopwatch', role: 'timer', 'aria-live': 'off' }, el('span', { class: 'stopwatch__time' }, '?.?'), el('small', {}, 'seconds'));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const go = button('▶ Start', 'btn btn--big btn--sun', () => {
        if (solved) return;
        if (!timer) {
          start = performance.now();
          result.innerHTML = '';
          $('.stopwatch__time', face).textContent = '…';
          face.classList.add('is-running');
          go.textContent = '⏹ Stop';
          timer = setInterval(() => {}, 1000);   // hidden: children estimate without seeing the time
        } else {
          clearInterval(timer);
          timer = null;
          face.classList.remove('is-running');
          go.textContent = '▶ Start';
          const secs = (performance.now() - start) / 1000;
          $('.stopwatch__time', face).textContent = secs.toFixed(1);
          tries += 1;
          const off = Math.abs(secs - T);
          if (off <= 1.5) {
            solved = true;
            go.disabled = true;
            MA.launchConfetti(off <= 0.5 ? 50 : 25);
            say(off <= 0.5 ? `Wow! ${secs.toFixed(1)} seconds. Almost perfect!` : `${secs.toFixed(1)} seconds. Very close!`);
            result.append(el('p', { class: 'round-result__text' }, `⏱️ ${secs.toFixed(1)} s — target ${T} s`));
            nextOrDone(result, round === targets.length - 1, 'Next challenge ▶', () => { round += 1; next(); }, done, '🎮 Human stopwatch!');
          } else {
            say(secs < T ? `${secs.toFixed(1)} seconds: a bit fast! Try counting “one elephant, two elephants…”` : `${secs.toFixed(1)} seconds: a bit slow! Count a little faster.`);
            result.append(el('p', { class: 'round-result__tip' }, `💡 Within 1.5 seconds of ${T} wins. Try again!`));
            if (tries >= 3) {
              result.append(el('div', { class: 'stage-actions' }, button('Skip this one ▶', 'btn btn--ghost', () => {
                if (round === targets.length - 1) { done(); result.innerHTML = '<p class="round-result__text">⏱️ Good practice!</p>'; } else { round += 1; next(); }
              })));
            }
          }
        }
      }, { 'data-target': T });
      box.append(el('p', { class: 'round-label' }, `Challenge ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Stop at'), el('strong', {}, `${T} s`)),
        instruction('👆 Start, count in your head, Stop!'), face, go, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — put things in order
     ------------------------------------------------------------ */
  function renderOrder(box, done) {
    const ROUNDS = [
      { title: 'Morning → night', items: [['⏰', 'wake up'], ['🥣', 'breakfast'], ['🏫', 'school'], ['🍱', 'lunch'], ['🍝', 'dinner'], ['🛏️', 'bedtime']], ends: ['🌅 morning', 'night 🌙'] },
      { title: 'Shortest → longest', items: [['😉', 'blink'], ['🪥', 'brush teeth'], ['🎬', 'watch a film'], ['🏖️', 'a holiday']], ends: ['⚡ shortest', 'longest 🐢'] }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      let selected = null;
      let placed = 0;
      say(round === 0 ? 'Put the day in order, from morning to night!' : 'Now order these from the shortest time to the longest!');
      const slots = el('ol', { class: 'slots order-slots time-slots', 'aria-label': cfg.title });
      cfg.items.forEach((it, i) => {
        const slot = button(String(i + 1), 'slot', () => { if (selected) tryPlace(selected, slot); else say('Pick a card first.'); }, { 'data-value': it[1], 'aria-label': `Place ${i + 1}` });
        slots.append(el('li', {}, slot));
      });
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Cards' });
      shuffle(cfg.items).forEach(([e, n]) => {
        const tile = button([el('span', { 'aria-hidden': 'true' }, e), el('small', {}, n)], 'tile time-tile', null, { 'data-value': n, 'aria-label': n });
        tile._emoji = e;
        makeDraggable(tile, {
          onDrop: slot => tryPlace(tile, slot),
          onTap: () => {
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
          slot.textContent = tile._emoji;
          slot.disabled = true;
          slot.classList.add('is-filled');
          slot.setAttribute('aria-label', tile.dataset.value);
          tile.remove();
          placed += 1;
          if (placed === cfg.items.length) {
            MA.launchConfetti(30);
            say(pick(PRAISE));
            nextOrDone(result, round === ROUNDS.length - 1, 'Next ▶', () => { round += 1; next(); }, done, '🧩 All in order!');
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say(round === 0 ? 'Think about your day. What happens before that?' : 'Which is quicker? Quick things go first.');
        }
      }
      box.append(el('p', { class: 'round-label' }, `${cfg.title}`),
        el('div', { class: 'order-ends', 'aria-hidden': 'true' }, el('span', {}, cfg.ends[0]), el('span', {}, cfg.ends[1])),
        slots, instruction('✋ Drag each card into its place. Or tap a card, then a place.'), bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => ({ text: '🕐<small>There are 60 minutes in an hour.</small>', truth: true, explain: 'True! 60 minutes make 1 hour.' }),
      () => ({ text: '⏲️ vs 🕐<small>A minute is longer than an hour.</small>', truth: false, explain: 'An hour is much longer: it is 60 minutes!' }),
      () => ({ text: '📅<small>There are 7 days in a week.</small>', truth: true, explain: 'True! Monday to Sunday: 7 days.' }),
      () => ({ text: '🪥<small>Brushing your teeth takes about 2 hours.</small>', truth: false, explain: 'It takes about 2 MINUTES. 2 hours would be very long!', fix: { question: 'Which is right?', options: ['about 2 minutes', 'about 2 hours', 'about 2 days'], answer: 'about 2 minutes' } })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Tick tock! True or false?' : pick(['True or false?', 'Think about time!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — time facts, then "how long?"
     ------------------------------------------------------------ */
  function renderFacts(box, done) {
    facts();
    function facts() {
      box.innerHTML = '';
      say('Match each time fact to its number!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: [['minutes in an hour', 60], ['hours in a day', 24], ['days in a week', 7], ['months in a year', 12]].map(([t, v]) => ({ face: el('span', { class: 'fact-face' }, t), value: v, label: t })),
        tiles: [60, 24, 7, 12, 100],
        hint: 'Almost! Think about a clock, a calendar and your week.',
        onComplete: () => {
          MA.launchConfetti(30);
          say('Time facts expert! Now some “how long” puzzles.');
          result.append(el('div', { class: 'stage-actions' }, button('Next: how long? ▶', 'btn', howLong)));
        }
      });
      box.append(el('p', { class: 'round-label' }, 'Part 1 of 2'), instruction('✋ Drag each number onto its fact.'), cards, bank, result);
    }
    function howLong() {
      const s = rnd(1, 6); const d = rnd(2, 4);
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const di = rnd(0, 2); const dd = rnd(2, 3);
      quizRounds(box, done, [
        { icon: '🎬', question: `A film starts at ${s} o'clock. It lasts ${d} hours. When does it end?`, instruction: 'Count on the hours.', options: shuffle([s + d, s + d + 1, s]).map(v => ({ value: v, label: `${v} o'clock` })), answer: s + d, hint: `Almost! Count on ${d} from ${s}.`, explain: `${s} + ${d} = ${s + d} o'clock` },
        { icon: '🎂', question: `Today is ${days[di]}. The party is in ${dd} days. Which day is the party?`, instruction: 'Count on the days.', options: shuffle([days[di + dd], days[di + dd + 1], days[di + 1]]).map(v => ({ value: v, label: v })), answer: days[di + dd], hint: `Almost! Say the days after ${days[di]}.`, explain: `${dd} days after ${days[di]} is ${days[di + dd]}.` }
      ], { label: 'Part 2 · puzzle', finalText: '🚀 Time master!' });
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qUnit() { const [e, n, u] = pick(ACTIVITIES); return { icon: e, question: `How long does it take to ${n}?`, instruction: 'Pick the best unit.', options: ['seconds', 'minutes', 'hours', 'days'].map(v => ({ value: v, label: v })), answer: u, hint: 'Almost! Is it quick or slow?', explain: `It takes ${u}.` }; }
  function qHour() { return { icon: '🕐', question: 'How many minutes are in one hour?', instruction: 'Think of the clock.', options: optionsFor(60, [100, 24, 30]), answer: 60, hint: 'Almost! The minute hand goes round once.', explain: '60 minutes = 1 hour' }; }
  function qWeek() { return { icon: '📅', question: 'How many days are in one week?', instruction: 'Monday to Sunday.', options: optionsFor(7, [5, 10, 12]), answer: 7, hint: 'Almost! Count the days of the week.', explain: '7 days = 1 week' }; }
  function qLonger() { return { icon: '⏳', question: 'Which is the longest time?', instruction: 'Compare them.', options: shuffle(['1 day', '1 hour', '1 minute']).map(v => ({ value: v, label: v })), answer: '1 day', hint: 'Almost! A day has 24 hours.', explain: '1 day is longer than 1 hour or 1 minute.' }; }
  function qEnd() { const s = rnd(1, 7); const d = rnd(1, 3); return { icon: '⏰', question: `Swimming starts at ${s} o'clock and lasts ${d} hour${d === 1 ? '' : 's'}. When does it end?`, instruction: 'Count on.', options: shuffle([s + d, s + d + 1, s + d - 1]).map(v => ({ value: v, label: `${v} o'clock` })), answer: s + d, hint: `Almost! ${s} + ${d} = ?`, explain: `${s + d} o'clock` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qUnit(), qHour(), qWeek(), qLonger(), qEnd()], moduleId: MODULE_ID, badgeId: 'time-keeper', title: 'Time Keeper' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
