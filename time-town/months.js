/* ==============================================================
   🗓️ Time Town → Months                      time-town/months.js
   🌱 Learn: order the months · 🎮 Play: month wheel · 🧩 Practise: missing months
   🧠 Think · 🚀 Challenge: months from now · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const C = window.Clock;
  if (!MA || !K || !C) return;
  const { rnd, shuffle, el, button, instruction, say, nextOrDone, quizRounds, optionsFor } = K;
  const { MONTHS } = C;
  const MODULE_ID = 'time-town/months';
  const at = i => MONTHS[((i % 12) + 12) % 12];
  const opts = right => shuffle([right, ...shuffle(MONTHS.filter(m => m !== right)).slice(0, 2)]).map(v => ({ value: v, label: v }));

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Months in order', render: renderOrder },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Month wheel', render: renderWheel },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Missing months', render: renderMissing },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Months from now', render: renderFromNow },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Month Master', render: renderMaster }
  ];

  function renderOrder(box, done) {
    let half = 0;
    next();
    function next() {
      const items = MONTHS.slice(half * 6, half * 6 + 6);
      C.orderRound(box, {
        items, label: half === 0 ? 'January → June' : 'July → December',
        prompt: half === 0 ? 'There are 12 months in a year. Put the first 6 in order, starting with January!' : 'Now the last 6 months, starting with July!',
        onDone: res => nextOrDone(res, half === 1, 'Next 6 months ▶', () => { half = 1; next(); }, done, '🗓️ All 12 months in order!')
      });
    }
  }

  const wheel = (i, ask) => `<div class="month-wheel">${MONTHS.map((m, k) => `<span class="month-wheel__m${k === i ? ' is-now' : ''}" style="--k:${k}">${k === ask ? '?' : m.slice(0, 3)}</span>`).join('')}</div>`;

  function renderWheel(box, done) {
    say('The months go round and round, like a wheel. After December, January comes again!');
    quizRounds(box, done, [
      () => { const i = rnd(0, 10); return { icon: '🎡', question: `Which month comes after ${at(i)}?`, instruction: 'Go round the wheel.', visual: wheel(i, i + 1), options: opts(at(i + 1)), answer: at(i + 1), hint: 'Almost! Say the months in order.', explain: `After ${at(i)} comes ${at(i + 1)}.` }; },
      () => { const i = rnd(1, 11); return { icon: '🎡', question: `Which month comes before ${at(i)}?`, instruction: 'Go back one.', visual: wheel(i, i - 1), options: opts(at(i - 1)), answer: at(i - 1), hint: 'Almost! Go back one month.', explain: `Before ${at(i)} comes ${at(i - 1)}.` }; },
      () => ({ icon: '🎡', question: 'Which month comes after December?', instruction: 'The wheel goes round!', visual: wheel(11, 0), options: opts('January'), answer: 'January', hint: 'Almost! A new year starts.', explain: 'January starts a new year.' }),
      () => { const i = rnd(0, 9); return { icon: '🎡', question: `What month is 2 months after ${at(i)}?`, instruction: 'Count on 2.', visual: wheel(i, -1), options: opts(at(i + 2)), answer: at(i + 2), hint: 'Almost! One month at a time.', explain: at(i + 2) }; }
    ], { label: 'Spin', finalText: '🎮 Wheel master!' });
  }

  function renderMissing(box, done) {
    say('Some months fell off the calendar! Which are missing?');
    quizRounds(box, done, [0, 1, 2].map(() => () => {
      const i = rnd(0, 8);
      const row = [at(i), at(i + 1), '?', at(i + 3)];
      return { icon: '🧩', question: 'Which month is missing?', instruction: 'Say them in order.', visual: `<div class="day-train">${row.map(m => `<span class="day-car${m === '?' ? ' is-gap' : ''}">${m === '?' ? '?' : m.slice(0, 3)}</span>`).join('')}</div>`, options: opts(at(i + 2)), answer: at(i + 2), hint: 'Almost! Count on from the start.', explain: at(i + 2) };
    }), { label: 'Gap', finalText: '🧩 Gap filler!' });
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🗓️<small>There are 12 months in a year.</small>', truth: true, explain: 'True! January to December.' }),
      () => ({ text: '1️⃣<small>The first month of the year is March.</small>', truth: false, explain: 'January is the first month.', fix: { question: 'Which is first?', options: ['January', 'March', 'December'], answer: 'January' } }),
      () => ({ text: '🎡<small>After December comes January.</small>', truth: true, explain: 'True! A new year begins.' }),
      () => ({ text: '📅<small>A month is shorter than a week.</small>', truth: false, explain: 'A month is about 4 weeks long, so it is longer.' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('True or false about months?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderFromNow(box, done) {
    const now = new Date().getMonth();
    say(`This month is ${at(now)}. Let’s count months forward and back!`);
    quizRounds(box, done, [
      () => { const n = rnd(2, 4); return { icon: '⏩', question: `It is ${at(now)}. What month will it be in ${n} months?`, instruction: 'Count on.', options: opts(at(now + n)), answer: at(now + n), hint: 'Almost! One month at a time.', explain: at(now + n) }; },
      () => { const n = rnd(1, 3); return { icon: '⏪', question: `It is ${at(now)}. What month was it ${n} month${n > 1 ? 's' : ''} ago?`, instruction: 'Count back.', options: opts(at(now - n)), answer: at(now - n), hint: 'Almost! Go backwards.', explain: at(now - n) }; },
      () => { const a = rnd(0, 5); const b = a + rnd(2, 5); return { icon: '🎂', question: `How many months from ${at(a)} to ${at(b)}?`, instruction: 'Count the jumps.', options: optionsFor(b - a, [b - a + 1, b - a - 1, 12]), answer: b - a, hint: 'Almost! Count each jump to the next month.', explain: `${b - a} months` }; }
    ], { label: 'Puzzle', finalText: '🚀 Time traveller!' });
  }

  function qAfter() { const i = rnd(0, 10); return { icon: '➡️', question: `Which month comes after ${at(i)}?`, instruction: 'Say them in order.', options: opts(at(i + 1)), answer: at(i + 1), hint: 'Almost!', explain: at(i + 1) }; }
  function qCount() { return { icon: '🔢', question: 'How many months are in a year?', instruction: 'Count them.', options: optionsFor(12, [7, 10, 52]), answer: 12, hint: 'Almost!', explain: '12 months' }; }
  function qFirst() { return { icon: '1️⃣', question: 'Which is the first month of the year?', instruction: 'Think.', options: opts('January'), answer: 'January', hint: 'Almost!', explain: 'January' }; }
  function qLast() { return { icon: '🔚', question: 'Which is the last month of the year?', instruction: 'Think.', options: opts('December'), answer: 'December', hint: 'Almost!', explain: 'December' }; }
  function qBefore() { const i = rnd(1, 11); return { icon: '⬅️', question: `Which month comes before ${at(i)}?`, instruction: 'Go back one.', options: opts(at(i - 1)), answer: at(i - 1), hint: 'Almost!', explain: at(i - 1) }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qAfter(), qCount(), qFirst(), qLast(), qBefore()], moduleId: MODULE_ID, badgeId: 'month-master', title: 'Month Master' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
