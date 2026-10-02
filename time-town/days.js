/* ==============================================================
   🌞 Time Town → Days                         time-town/days.js
   🌱 Learn: order the days · 🎮 Play: the day train · 🧩 Practise: weekday or weekend
   🧠 Think · 🚀 Challenge: yesterday, today, tomorrow · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const C = window.Clock;
  if (!MA || !K || !C) return;
  const { $, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, nextOrDone, sortZones, quizRounds, optionsFor, PRAISE } = K;
  const { DAYS } = C;
  const MODULE_ID = 'time-town/days';
  const dayAt = i => DAYS[((i % 7) + 7) % 7];
  const dayOpts = (right, extra) => shuffle([right, ...shuffle(DAYS.filter(d => d !== right && !extra?.includes?.(d))).slice(0, 2)]).map(v => ({ value: v, label: v }));

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Days in order', render: renderOrder },
    { id: 'play', icon: '🎮', label: 'Play', title: 'The day train', render: renderTrain },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Weekday or weekend?', render: renderSort },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Yesterday and tomorrow', render: renderYT },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Day Detective', render: renderMaster }
  ];

  function renderOrder(box, done) {
    C.orderRound(box, { items: DAYS, label: 'Monday → Sunday', prompt: 'There are 7 days in a week. Put them in order, starting with Monday!',
      onDone: res => { res.append(el('p', { class: 'round-result__text' }, '🌞 Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday')); done(); } });
  }

  const train = (i, gap) => `<div class="day-train">${[-1, 0, 1].map(k => `<span class="day-car${k === gap ? ' is-gap' : ''}">${k === gap ? '?' : dayAt(i + k)}</span>`).join('')}</div>`;

  function renderTrain(box, done) {
    say('All aboard the day train! Which day is missing?');
    quizRounds(box, done, [0, 1, 2, 3].map(r => () => {
      const i = rnd(0, 6); const gap = r % 2 === 0 ? 1 : -1;
      const ans = dayAt(i + gap);
      return { icon: '🚂', question: gap === 1 ? `Which day comes after ${dayAt(i)}?` : `Which day comes before ${dayAt(i)}?`, instruction: 'Say the days in order.', visual: train(i, gap), options: dayOpts(ans), answer: ans, hint: 'Almost! Say the days from Monday.', explain: `${gap === 1 ? 'After' : 'Before'} ${dayAt(i)} comes ${ans}.` };
    }), { label: 'Carriage', finalText: '🎮 Train driver!' });
  }

  function renderSort(box, done) {
    say('Weekdays are school days. The weekend is Saturday and Sunday. Sort them!');
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    box.innerHTML = '';
    const { bank, zones } = sortZones({
      zones: [{ id: 'weekday', label: '🏫 Weekday' }, { id: 'weekend', label: '🎉 Weekend' }],
      items: DAYS.map((d, i) => ({ face: d.slice(0, 3), cat: i >= 5 ? 'weekend' : 'weekday', label: d })),
      hint: item => (item.cat === 'weekend' ? `${item.label} is part of the weekend!` : `${item.label} is a weekday.`),
      onComplete: () => { MA.launchConfetti(30); say('5 weekdays and 2 weekend days make 7!'); result.append(el('p', { class: 'round-result__text' }, '🧩 5 + 2 = 7 days')); done(); }
    });
    box.append(instruction('✋ Drag each day into a group.'), bank, zones, result);
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '📅<small>There are 7 days in a week.</small>', truth: true, explain: 'True!' }),
      () => ({ text: '🎉<small>Saturday and Sunday are the weekend.</small>', truth: true, explain: 'True! The 2 weekend days.' }),
      () => ({ text: '🌞<small>The day after Friday is Thursday.</small>', truth: false, explain: 'Friday → Saturday. Thursday comes BEFORE Friday.', fix: { question: 'What comes after Friday?', options: ['Saturday', 'Thursday', 'Monday'], answer: 'Saturday' } }),
      () => ({ text: '🏫<small>There are 6 weekdays.</small>', truth: false, explain: 'There are 5 weekdays: Monday to Friday.', fix: { question: 'How many weekdays?', options: [5, 6, 7], answer: 5 } })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('True or false about days?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderYT(box, done) {
    say('Yesterday was the day before. Tomorrow is the day after!');
    quizRounds(box, done, [
      () => { const i = rnd(0, 6); return { icon: '⏪', question: `Today is ${dayAt(i)}. What was yesterday?`, instruction: 'One day back.', options: dayOpts(dayAt(i - 1)), answer: dayAt(i - 1), hint: 'Almost! Go back one day.', explain: dayAt(i - 1) }; },
      () => { const i = rnd(0, 6); return { icon: '⏩', question: `Today is ${dayAt(i)}. What will tomorrow be?`, instruction: 'One day on.', options: dayOpts(dayAt(i + 1)), answer: dayAt(i + 1), hint: 'Almost! Go forward one day.', explain: dayAt(i + 1) }; },
      () => { const i = rnd(0, 6); return { icon: '🧠', question: `Yesterday was ${dayAt(i)}. What is tomorrow?`, instruction: 'Two days after yesterday!', options: dayOpts(dayAt(i + 2)), answer: dayAt(i + 2), hint: `Almost! Today is ${dayAt(i + 1)}.`, explain: `Today is ${dayAt(i + 1)}, so tomorrow is ${dayAt(i + 2)}.` }; },
      () => { const i = rnd(0, 6); return { icon: '🗓️', question: `What day is 3 days after ${dayAt(i)}?`, instruction: 'Count on 3.', options: dayOpts(dayAt(i + 3)), answer: dayAt(i + 3), hint: 'Almost! Count on one day at a time.', explain: dayAt(i + 3) }; }
    ], { label: 'Puzzle', finalText: '🚀 Day detective!' });
  }

  function qAfter() { const i = rnd(0, 6); return { icon: '➡️', question: `What comes after ${dayAt(i)}?`, instruction: 'Say the days.', options: dayOpts(dayAt(i + 1)), answer: dayAt(i + 1), hint: 'Almost!', explain: dayAt(i + 1) }; }
  function qFirst() { return { icon: '1️⃣', question: 'Which day comes first in a school week?', instruction: 'Think!', options: dayOpts('Monday'), answer: 'Monday', hint: 'Almost! School starts on…', explain: 'Monday' }; }
  function qWeekend() { return { icon: '🎉', question: 'Which day is part of the weekend?', instruction: 'No school!', options: shuffle(['Sunday', 'Tuesday', 'Thursday']).map(v => ({ value: v, label: v })), answer: 'Sunday', hint: 'Almost! Saturday and Sunday.', explain: 'Sunday' }; }
  function qCount() { return { icon: '🔢', question: 'How many days are in a week?', instruction: 'Count.', options: optionsFor(7, [5, 2, 12]), answer: 7, hint: 'Almost!', explain: '7 days' }; }
  function qYest() { const i = rnd(0, 6); return { icon: '⏪', question: `Today is ${dayAt(i)}. What was yesterday?`, instruction: 'One day back.', options: dayOpts(dayAt(i - 1)), answer: dayAt(i - 1), hint: 'Almost!', explain: dayAt(i - 1) }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qAfter(), qFirst(), qWeekend(), qCount(), qYest()], moduleId: MODULE_ID, badgeId: 'day-detective', title: 'Day Detective' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
