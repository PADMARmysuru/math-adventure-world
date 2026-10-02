/* ==============================================================
   ⏱️ Challenge Arena → Timed Games        challenge-arena/timed-games.js
   Beat the clock! Reach the target before time runs out.
   🌱 How it works · 🎮 Bond sprint · 🧩 Times-table sprint
   🧠 Slow and steady · 🚀 Mixed sprint · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const A = window.Arena;
  if (!MA || !K || !A) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, quizRounds, PRAISE } = K;
  const MODULE_ID = 'challenge-arena/timed-games';

  /** A quick question: { text, answer, options } */
  const bond = () => { const t = pick([10, 10, 20]); const a = rnd(1, t - 1); return { text: `${a} + ? = ${t}`, answer: t - a, options: shuffle([t - a, t - a + 1, Math.max(0, t - a - 2)].filter((v, i, x) => x.indexOf(v) === i)) }; };
  const times = () => { const f = pick([2, 5, 10]); const n = rnd(1, 10); return { text: `${n} × ${f}`, answer: n * f, options: shuffle([n * f, n * f + f, Math.max(0, n * f - f)].filter((v, i, x) => x.indexOf(v) === i)) }; };
  const mixedQ = () => { const q = A.ask(undefined, 2); return { text: q.question, answer: q.answer, options: q.options.map(o => o.value), labels: Object.fromEntries(q.options.map(o => [o.value, o.label])) }; };

  /** Sprint engine: answer as many as you can; reach `goal` before `seconds` run out. */
  function sprint(box, done, { seconds, goal, make, name }) {
    let score = 0;
    let timeLeft = seconds;
    let timer = null;
    let over = false;
    box.innerHTML = '';
    say(`${name}: get ${goal} right in ${seconds} seconds! Press Start when you are ready.`);
    const bar = el('div', { class: 'sprint-bar' }, el('span', { class: 'sprint-bar__fill' }));
    const clock = el('span', { class: 'sprint-clock' }, `⏱️ ${seconds}s`);
    const scoreEl = el('span', { class: 'sprint-score' }, `⭐ 0 / ${goal}`);
    const qEl = el('p', { class: 'sprint-q', 'aria-live': 'polite' }, 'Ready?');
    const opts = el('div', { class: 'sprint-opts', role: 'group', 'aria-label': 'Answers' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const start = button('▶ Start', 'btn btn--big btn--sun', begin);

    function begin() {
      start.hidden = true;
      score = 0; timeLeft = seconds; over = false;
      result.innerHTML = '';
      scoreEl.textContent = `⭐ 0 / ${goal}`;
      ask();
      timer = setInterval(() => {
        timeLeft -= 1;
        clock.textContent = `⏱️ ${timeLeft}s`;
        $('.sprint-bar__fill', bar).style.width = `${(timeLeft / seconds) * 100}%`;
        if (timeLeft <= 0) end(false);
      }, 1000);
    }
    function ask() {
      const q = make();
      qEl.textContent = q.text;
      opts.innerHTML = '';
      q.options.forEach(v => {
        const b = button(q.labels ? q.labels[v] : String(v), 'sprint-opt', () => {
          if (over) return;
          if (v === q.answer) {
            score += 1;
            scoreEl.textContent = `⭐ ${score} / ${goal}`;
            if (score >= goal) { end(true); return; }
            ask();
          } else {
            pulse(b, 'is-oops');
            b.disabled = true;
          }
        }, { 'data-correct': v === q.answer ? 'yes' : 'no' });
        opts.append(b);
      });
    }
    function end(win) {
      over = true;
      clearInterval(timer);
      $$('button', opts).forEach(b => { b.disabled = true; });
      if (win) {
        MA.launchConfetti(50);
        say(`${goal} in time! ${pick(PRAISE)}`);
        result.append(el('p', { class: 'round-result__text' }, `🏁 ${goal} correct with ${timeLeft} seconds to spare!`));
        done();
      } else {
        say(`Time is up! You got ${score}. Great practice! Try again: you are getting faster!`);
        result.append(el('p', { class: 'round-result__tip' }, `⏱️ You got ${score}. Target: ${goal}.`));
        start.hidden = false;
        start.textContent = '🔁 Try again';
      }
    }
    const $ = (s, r) => r.querySelector(s);
    box.append(el('div', { class: 'sprint-top' }, clock, scoreEl), bar, qEl, opts, start, result);
  }

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'How sprints work', render: (box, done) => { say('In a sprint you answer quickly. First, three practice questions with no timer!'); quizRounds(box, done, [0, 1, 2].map(() => () => { const q = bond(); return { icon: '⏱️', question: q.text, instruction: 'No rush yet!', options: q.options.map(v => ({ value: v, label: String(v) })), answer: q.answer, hint: 'Almost! What makes the total?', explain: String(q.answer) }; }), { label: 'Practice' }); } },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Number bond sprint', render: (box, done) => sprint(box, done, { seconds: 60, goal: 8, make: bond, name: 'Number bond sprint' }) },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Times-table sprint', render: (box, done) => sprint(box, done, { seconds: 60, goal: 8, make: times, name: 'Times-table sprint' }) },
    { id: 'think', icon: '🧠', label: 'Think', title: 'Slow and steady', render: (box, done) => { say('Speed is fun, but thinking carefully matters more. These need slow thinking!'); quizRounds(box, done, [
      { icon: '🐢', question: 'Which is quicker to work out: 9 + 6 or 10 + 5?', instruction: 'Same answer!', options: [{ value: 'b', label: '10 + 5' }, { value: 'a', label: '9 + 6' }], answer: 'b', hint: 'Almost! Tens are easy to add.', explain: 'Both are 15, but 10 + 5 is quicker. Make tens!' },
      { icon: '🐢', question: 'To work out 5 × 6, which is a good strategy?', instruction: 'Think.', options: shuffle(['count in 5s six times', 'guess', 'count in 1s']).map(v => ({ value: v, label: v })), answer: 'count in 5s six times', hint: 'Almost!', explain: '5, 10, 15, 20, 25, 30' },
      { icon: '🐢', question: '38 + 10 = ?', instruction: 'Only the tens change!', options: K.optionsFor(48, [39, 58, 138]), answer: 48, hint: 'Almost! Add 1 ten.', explain: '48' }
    ], { label: 'Think' }); } },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Mixed sprint', render: (box, done) => sprint(box, done, { seconds: 90, goal: 10, make: mixedQ, name: 'Mixed sprint' }) },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Speed Star', render: (box, done) => K.runMaster(box, done, { makeQuestions: () => A.mixed(5, 2).map(f => f()), moduleId: MODULE_ID, badgeId: 'speed-star', title: 'Speed Star' }) }
  ];

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
