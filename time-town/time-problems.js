/* ==============================================================
   ⏳ Time Town → Time Problems              time-town/time-problems.js
   🌱 Learn: start and end times · 🎮 Play: set the end time · 🧩 Practise: timetables
   🧠 Think · 🚀 Challenge: two-step problems · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const C = window.Clock;
  if (!MA || !K || !C) return;
  const { rnd, pick, shuffle, el, instruction, say, nextOrDone, quizRounds, makeSetter, optionsFor, PRAISE } = K;
  const { words, face, faceHTML } = C;
  const MODULE_ID = 'time-town/time-problems';
  const H = h => (h % 12) * 60;
  const tOpts = (t, others) => shuffle([t, ...others.filter(o => o !== t)].slice(0, 3)).map(v => ({ value: v, label: words(v) }));

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Start and finish', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'When does it end?', render: renderSetEnd },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Bus timetable', render: renderTimetable },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Two-step problems', render: renderTwoStep },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Time Solver', render: renderMaster }
  ];

  function renderLearn(box, done) {
    say('Time problems ask: when does it start, how long does it last, and when does it end?');
    quizRounds(box, done, [
      () => { const s = rnd(1, 9); return { icon: '🎨', question: `Art starts at ${s} o'clock and lasts 1 hour. When does it end?`, instruction: 'Move on 1 hour.', visual: `<div class="clock-pair"><span>Start ${faceHTML(H(s), 110)}</span><span>End ?</span></div>`, options: tOpts(H(s + 1), [H(s + 2), H(s)]), answer: H(s + 1), hint: 'Almost! The short hand moves to the next number.', explain: words(H(s + 1)) }; },
      () => { const s = rnd(1, 9); return { icon: '⚽', question: `Football starts at ${s} o'clock and ends at half past ${s}. How long?`, instruction: 'Look at the long hand.', visual: `<div class="clock-pair"><span>Start ${faceHTML(H(s), 110)}</span><span>End ${faceHTML(H(s) + 30, 110)}</span></div>`, options: ['half an hour', '1 hour', '2 hours'].map(v => ({ value: v, label: v })), answer: 'half an hour', hint: 'Almost! The long hand went half way round.', explain: 'Half an hour (30 minutes).' }; },
      () => { const s = rnd(1, 8); return { icon: '🎬', question: `A film starts at ${s} o'clock and lasts 2 hours. When does it end?`, instruction: 'Count on 2 hours.', options: tOpts(H(s + 2), [H(s + 1), H(s + 3)]), answer: H(s + 2), hint: `Almost! ${s} + 2 = ?`, explain: words(H(s + 2)) }; }
    ], { label: 'Problem' });
  }

  function renderSetEnd(box, done) {
    const tasks = [0, 1, 2].map(i => { const s = rnd(1, 8); const d = [60, 120, 30][i]; return { s: H(s), d, name: pick(['Swimming', 'Reading club', 'The party', 'Music class']) }; });
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      const t = tasks[r];
      const T = t.s + t.d;
      let solved = false;
      const dur = t.d === 30 ? 'half an hour' : `${t.d / 60} hour${t.d > 60 ? 's' : ''}`;
      say(`${t.name} starts at ${words(t.s)} and lasts ${dur}. Set the clock to when it ENDS.`);
      const f = face(t.s, 210);
      const read = el('p', { class: 'hop-count', 'aria-live': 'polite' }, words(t.s));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const setter = makeSetter({
        value: t.s, min: 0, max: 705, target: T,
        steps: [{ d: -60, label: '− 1 hour' }, { d: 60, label: '+ 1 hour' }, { d: -30, label: '− 30 min' }, { d: 30, label: '+ 30 min' }],
        onChange: v => {
          f.setTime(v); read.textContent = words(v);
          if (v === T && !solved) { solved = true; setter.lock(); MA.launchConfetti(30); say(`It ends at ${words(T)}! ${pick(PRAISE)}`); nextOrDone(result, r === tasks.length - 1, 'Next ▶', () => { r += 1; next(); }, done, '🎮 Timekeeper!'); }
        }
      });
      box.append(el('p', { class: 'round-label' }, `Problem ${r + 1} of ${tasks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, `Starts ${words(t.s)}`), el('strong', {}, `+ ${dur}`)),
        el('div', { class: 'frac-stage' }, f), read, setter.root, result);
    }
  }

  function renderTimetable(box, done) {
    const stops = ['🏠 Home', '🏫 School', '🏞️ Park', '🏪 Shops'];
    const start = rnd(1, 6);
    const times = stops.map((_, i) => H(start) + i * 30);
    const table = `<table class="timetable"><thead><tr><th>Stop</th><th>Bus time</th></tr></thead><tbody>${stops.map((s, i) => `<tr><td>${s}</td><td>${words(times[i])}</td></tr>`).join('')}</tbody></table>`;
    say('A timetable tells you when the bus arrives at each stop. Read it!');
    quizRounds(box, done, [
      { icon: '🚌', question: 'When does the bus get to the park?', instruction: 'Find the park row.', visual: table, options: tOpts(times[2], [times[1], times[3]]), answer: times[2], hint: 'Almost! Look along the Park row.', explain: words(times[2]) },
      { icon: '🚌', question: 'Which stop is at ' + words(times[3]) + '?', instruction: 'Find that time.', visual: table, options: stops.slice(1).map(s => ({ value: s, label: s })), answer: stops[3], hint: 'Almost! Find the time, then read across.', explain: stops[3] },
      { icon: '⏱️', question: 'How long from Home to School?', instruction: 'Compare the two times.', visual: table, options: ['half an hour', '1 hour', '2 hours'].map(v => ({ value: v, label: v })), answer: 'half an hour', hint: 'Almost! From o’clock to half past is…', explain: 'Half an hour.' }
    ], { label: 'Question', finalText: '🧩 Timetable reader!' });
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🕐 → 🕑<small>From 1 o’clock to 2 o’clock is 1 hour.</small>', truth: true, explain: 'True! The short hand moves on one number.' }),
      () => ({ text: '⏰<small>Half an hour is 50 minutes.</small>', truth: false, explain: 'Half an hour is 30 minutes. An hour is 60 minutes.', fix: { question: 'Half an hour is…', options: ['30 minutes', '50 minutes', '15 minutes'], answer: '30 minutes' } }),
      () => ({ text: `${faceHTML(H(3), 100)} → +2 hours<small>ends at 5 o'clock</small>`, truth: true, explain: '3 + 2 = 5' }),
      () => ({ text: "🎬<small>A film from 2 o'clock to 4 o'clock lasts 6 hours.</small>", truth: false, explain: '2 to 4 is 2 hours. We find the difference, not add!' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Think about how time passes. True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderTwoStep(box, done) {
    say('Two steps! Do one part at a time.');
    quizRounds(box, done, [
      () => { const s = rnd(1, 6); return { icon: '🏊', question: `Swimming starts at ${s} o'clock. It lasts 1 hour. Then lunch lasts 1 hour. When does lunch end?`, instruction: '1 hour + 1 hour.', options: tOpts(H(s + 2), [H(s + 1), H(s + 3)]), answer: H(s + 2), hint: `Almost! ${s} + 1 + 1 = ?`, explain: words(H(s + 2)) }; },
      () => { const s = rnd(1, 7); return { icon: '🎒', question: `School starts at ${s} o'clock. Milo arrives half an hour early. When does he arrive?`, instruction: 'Go back half an hour.', options: tOpts(H(s) - 30 < 0 ? H(s) + 690 : H(s) - 30, [H(s) + 30, H(s)]), answer: H(s) - 30 < 0 ? H(s) + 690 : H(s) - 30, hint: 'Almost! Early means before.', explain: words(H(s) - 30 < 0 ? H(s) + 690 : H(s) - 30) }; },
      () => { const s = rnd(2, 6); return { icon: '🎂', question: `A party goes from ${s} o'clock to ${s + 3} o'clock. Games take 1 hour. How long is left for cake?`, instruction: 'Find the total, then take away.', options: ['2 hours', '1 hour', '3 hours'].map(v => ({ value: v, label: v })), answer: '2 hours', hint: 'Almost! 3 hours − 1 hour.', explain: '3 − 1 = 2 hours' }; }
    ], { label: 'Problem', finalText: '🚀 Time solver!' });
  }

  function qEnd() { const s = rnd(1, 8); const d = rnd(1, 3); return { icon: '⏳', question: `Starts at ${s} o'clock, lasts ${d} hour${d > 1 ? 's' : ''}. When does it end?`, instruction: 'Count on.', options: tOpts(H(s + d), [H(s + d + 1), H(s + d - 1)]), answer: H(s + d), hint: 'Almost!', explain: words(H(s + d)) }; }
  function qHow() { const s = rnd(1, 8); const d = rnd(2, 3); return { icon: '⏱️', question: `From ${s} o'clock to ${s + d} o'clock is how long?`, instruction: 'Find the difference.', options: optionsFor(d, [d + 1, s + d, 1]).map(o => ({ ...o, label: `${o.value} hours` })), answer: d, hint: 'Almost! Count the hours between.', explain: `${d} hours` }; }
  function qHalf() { return { icon: '🕧', question: 'How many minutes in half an hour?', instruction: 'Half of 60.', options: optionsFor(30, [50, 15, 60]), answer: 30, hint: 'Almost! 60 ÷ 2.', explain: '30 minutes' }; }
  function qHalfLater() { const s = rnd(1, 10); return { icon: '⏩', question: `It is ${s} o'clock. What time is it half an hour later?`, instruction: 'Long hand goes to 6.', options: tOpts(H(s) + 30, [H(s + 1), H(s) + 15]), answer: H(s) + 30, hint: 'Almost!', explain: words(H(s) + 30) }; }
  function qWhich() { return { icon: '🤔', question: 'Which lasts longer: 1 hour or half an hour?', instruction: 'Compare.', options: ['1 hour', 'half an hour'].map(v => ({ value: v, label: v })), answer: '1 hour', hint: 'Almost! 60 or 30 minutes?', explain: '1 hour = 60 minutes' }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qEnd(), qHow(), qHalf(), qHalfLater(), qWhich()], moduleId: MODULE_ID, badgeId: 'time-solver', title: 'Time Solver' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
