/* ==============================================================
   📅 Time Town → Calendar                   time-town/calendar.js
   🌱 Learn: find dates · 🎮 Play: count on in days · 🧩 Practise: read the calendar
   🧠 Think · 🚀 Challenge: mystery dates · 🏆 Master
   Uses this month's real calendar.
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const C = window.Clock;
  if (!MA || !K || !C) return;
  const { rnd, pick, shuffle, el, instruction, say, pulse, nextOrDone, quizRounds, optionsFor, PRAISE } = K;
  const MODULE_ID = 'time-town/calendar';
  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth();
  const ord = n => `${n}${[11, 12, 13].includes(n % 100) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Find the date', render: renderFind },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Count on in days', render: renderCountOn },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Read the calendar', render: renderRead },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Mystery dates', render: renderMystery },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Calendar Captain', render: renderMaster }
  ];

  /** One "tap the right date" round. */
  function tapRound(box, { label, prompt, answer, explain, wrong, onRight }) {
    box.innerHTML = '';
    let solved = false;
    say(prompt);
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const cal = C.calendar(Y, M, (d, weekday, cell) => {
      if (solved) return;
      if (d === answer) {
        solved = true;
        cell.classList.add('is-right');
        MA.launchConfetti(20);
        say(explain);
        result.append(el('p', { class: 'round-result__text' }, `📅 ${explain}`));
        onRight(result);
      } else {
        pulse(cell, 'is-oops');
        say(wrong(d, weekday));
      }
    });
    cal.days.forEach(d => { d.cell.dataset.correct = d.date === answer ? 'yes' : 'no'; });
    box.append(el('p', { class: 'round-label' }, label), el('p', { class: 'pos-question' }, prompt), cal.node, result);
  }

  const info = (() => { const cal = C.calendar(Y, M); return cal; })();
  const firstOf = name => info.days.find(d => d.weekday === name).date;

  function renderFind(box, done) {
    const tasks = [
      { prompt: `Tap the ${ord(14)}.`, answer: 14, explain: `That is the ${ord(14)}.` },
      { prompt: 'Tap the first Monday of the month.', answer: firstOf('Monday'), explain: `The first Monday is the ${ord(firstOf('Monday'))}.` },
      { prompt: 'Tap the LAST day of the month.', answer: info.count, explain: `${C.MONTHS[M]} has ${info.count} days.` }
    ];
    let r = 0;
    next();
    function next() {
      const t = tasks[r];
      tapRound(box, { label: `Find ${r + 1} of ${tasks.length}`, ...t, wrong: (d, w) => `That is ${w} the ${ord(d)}. Try again!`,
        onRight: res => nextOrDone(res, r === tasks.length - 1, 'Next ▶', () => { r += 1; next(); }, done) });
    }
  }

  function renderCountOn(box, done) {
    const tasks = [0, 1, 2].map(() => { const s = rnd(2, 15); const n = rnd(3, 9); return { s, n }; });
    let r = 0;
    next();
    function next() {
      const { s, n } = tasks[r];
      tapRound(box, { label: `Plan ${r + 1} of ${tasks.length}`, prompt: `Today is the ${ord(s)}. The party is in ${n} days. Tap the party day!`, answer: s + n, explain: `${s} + ${n} = ${s + n}. The party is on the ${ord(s + n)}! 🎉`,
        wrong: d => `Start on the ${ord(s)} and count on ${n} days.`,
        onRight: res => nextOrDone(res, r === tasks.length - 1, 'Next plan ▶', () => { r += 1; next(); }, done, '🎮 Party planner!') });
    }
  }

  function renderRead(box, done) {
    const d10 = info.days[9].weekday;
    const sats = info.days.filter(d => d.weekday === 'Saturday').length;
    const firstDay = info.days[0].weekday;
    const cal = () => C.calendar(Y, M).node.outerHTML;
    say('Read the calendar to answer.');
    quizRounds(box, done, [
      { icon: '📅', question: `What day of the week is the ${ord(10)}?`, instruction: 'Look at the top of its column.', visual: cal(), options: shuffle([d10, ...shuffle(C.DAYS.filter(x => x !== d10)).slice(0, 2)]).map(v => ({ value: v, label: v })), answer: d10, hint: 'Almost! Find 10, then go up to the day name.', explain: `The ${ord(10)} is a ${d10}.` },
      { icon: '🗓️', question: 'How many Saturdays are in this month?', instruction: 'Count down the Sat column.', visual: cal(), options: optionsFor(sats, [sats - 1, sats + 1, 7]), answer: sats, hint: 'Almost! Count the numbers under Sat.', explain: `${sats} Saturdays.` },
      { icon: '1️⃣', question: 'What day does this month start on?', instruction: 'Find the 1st.', visual: cal(), options: shuffle([firstDay, ...shuffle(C.DAYS.filter(x => x !== firstDay)).slice(0, 2)]).map(v => ({ value: v, label: v })), answer: firstDay, hint: 'Almost! Find number 1.', explain: `It starts on a ${firstDay}.` }
    ], { label: 'Question', finalText: '🧩 Calendar reader!' });
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '📅<small>A week has 7 days.</small>', truth: true, explain: 'True! Monday to Sunday.' }),
      () => ({ text: '🗓️<small>Every month has 30 days.</small>', truth: false, explain: 'No! Some have 31, some have 30, and February has 28 or 29.' }),
      () => ({ text: `📅<small>The day after the ${ord(9)} is the ${ord(10)}.</small>`, truth: true, explain: '9 + 1 = 10' }),
      () => ({ text: '📆<small>A calendar shows the days and dates of a month.</small>', truth: true, explain: 'True! It helps us plan.' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('True or false about calendars?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderMystery(box, done) {
    const fri = info.days.filter(d => d.weekday === 'Friday');
    const tasks = [
      { prompt: 'Mystery date: I am the second Friday of the month. Tap me!', answer: fri[1].date, explain: `The second Friday is the ${ord(fri[1].date)}.` },
      (() => { const d = rnd(5, 20); return { prompt: `Mystery date: I am one week after the ${ord(d)}. Tap me!`, answer: d + 7, explain: `One week = 7 days. ${d} + 7 = ${d + 7}.` }; })()
    ];
    let r = 0;
    next();
    function next() {
      const t = tasks[r];
      tapRound(box, { label: `Mystery ${r + 1} of ${tasks.length}`, ...t, wrong: () => 'Read the clue again. Use the columns and rows!',
        onRight: res => nextOrDone(res, r === tasks.length - 1, 'Next mystery ▶', () => { r += 1; next(); }, done, '🚀 Date detective!') });
    }
  }

  function qWeek() { return { icon: '📅', question: 'How many days are in a week?', instruction: 'Count them.', options: optionsFor(7, [5, 10, 12]), answer: 7, hint: 'Almost! Monday to Sunday.', explain: '7 days' }; }
  function qAfter() { const d = rnd(3, 20); return { icon: '➡️', question: `What date is 2 days after the ${ord(d)}?`, instruction: 'Count on.', options: shuffle([d + 2, d + 1, d + 3]).map(v => ({ value: v, label: `the ${ord(v)}` })), answer: d + 2, hint: `Almost! ${d} + 2`, explain: `the ${ord(d + 2)}` }; }
  function qWeekLater() { const d = rnd(2, 15); return { icon: '🗓️', question: `What date is one week after the ${ord(d)}?`, instruction: 'One week = 7 days.', options: shuffle([d + 7, d + 1, d + 10]).map(v => ({ value: v, label: `the ${ord(v)}` })), answer: d + 7, hint: `Almost! ${d} + 7`, explain: `the ${ord(d + 7)}` }; }
  function qMonth() { return { icon: '📆', question: 'What does a calendar help us do?', instruction: 'Think.', options: shuffle(['plan days and dates', 'measure length', 'weigh things']).map(v => ({ value: v, label: v })), answer: 'plan days and dates', hint: 'Almost! It shows days and dates.', explain: 'Calendars help us plan.' }; }
  function qBefore() { const d = rnd(5, 25); return { icon: '⬅️', question: `What date comes just before the ${ord(d)}?`, instruction: 'Count back one.', options: shuffle([d - 1, d + 1, d - 2]).map(v => ({ value: v, label: `the ${ord(v)}` })), answer: d - 1, hint: 'Almost! One less.', explain: `the ${ord(d - 1)}` }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qWeek(), qAfter(), qWeekLater(), qMonth(), qBefore()], moduleId: MODULE_ID, badgeId: 'calendar-captain', title: 'Calendar Captain' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
