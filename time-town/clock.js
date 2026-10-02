/* ==============================================================
   🕒 Time Town → Clock                       time-town/clock.js
   🌱 Learn: the hands, o'clock · 🎮 Play: set the clock · 🧩 Practise: match times
   🧠 Think · 🚀 Challenge: clock ↔ digital · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const C = window.Clock;
  if (!MA || !K || !C) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, nextOrDone, dragMatch, quizRounds, makeSetter, PRAISE } = K;
  const { words, digital, face, faceHTML } = C;
  const MODULE_ID = 'time-town/clock';
  const hrs = () => rnd(1, 12) * 60 % 720;
  const timeOpts = (t, others) => shuffle([t, ...others]).map(v => ({ value: v, label: words(v) }));

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Meet the clock', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Set the clock', render: renderSet },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Clock match', render: renderPractise },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Clock or digital?', render: renderDigital },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Clock Champion', render: renderMaster }
  ];

  function renderLearn(box, done) {
    const asks = [['hour', 'the SHORT hand. It shows the HOUR'], ['minute', 'the LONG hand. It shows the MINUTES']];
    let i = 0;
    hands();
    function hands() {
      box.innerHTML = '';
      const [which, text] = asks[i];
      let solved = false;
      say(`Tap the ${which.toUpperCase()} hand!`);
      const f = face(3 * 60 + 0, 230);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const choose = name => {
        if (solved) return;
        if (name === which) {
          solved = true;
          MA.launchConfetti(20);
          say(`Yes! That is ${text}.`);
          $$('button', group).forEach(b => { b.disabled = true; });
          result.append(el('p', { class: 'round-result__text' }, `🕒 ${which} hand: ${text.split('. ')[0].replace('the ', '')}`));
          result.append(el('div', { class: 'stage-actions' }, button(i === 0 ? 'Next ▶' : 'Next: read the clock ▶', 'btn', () => { i += 1; if (i < asks.length) hands(); else read(); })));
        } else say(`That is the ${name} hand. Try the other one!`);
      };
      // the hands themselves can be tapped, and big buttons make it easy for small fingers
      [['hour', f.hour], ['minute', f.minute]].forEach(([name, line]) => {
        line.style.cursor = 'pointer';
        line.addEventListener('click', () => choose(name));
      });
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Which hand?' },
        button('🔵 short blue hand', 'pattern-btn', () => choose('hour'), { 'data-correct': which === 'hour' ? 'yes' : 'no' }),
        button('🔴 long red hand', 'pattern-btn', () => choose('minute'), { 'data-correct': which === 'minute' ? 'yes' : 'no' }));
      box.append(el('p', { class: 'round-label' }, `Hands ${i + 1} of 2`), instruction(`👆 Tap the ${which} hand.`), el('div', { class: 'frac-stage' }, f), group, result);
    }
    function read() {
      say('When the long hand points to 12, it is something o’clock. The short hand tells you which hour.');
      quizRounds(box, done, [0, 1, 2].map(() => () => {
        const t = hrs();
        return { icon: '🕒', question: 'What time is it?', instruction: 'Long hand on 12? It is o’clock!', visual: `<div class="frac-stage">${faceHTML(t)}</div>`, options: timeOpts(t, [(t + 60) % 720, (t + 120) % 720]), answer: t, hint: 'Almost! Where is the short hand pointing?', explain: words(t) };
      }), { label: 'Time' });
    }
  }

  function renderSet(box, done) {
    const h = () => rnd(1, 11) * 60;   // never 12 o'clock: the clock starts there
    const targets = [h(), h() + 30, h() + 15, h() + 45];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      let solved = false;
      say(`Set the clock to ${words(T)}.`);
      const f = face(0, 220);
      const read = el('p', { class: 'hop-count', 'aria-live': 'polite' }, words(0));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const setter = makeSetter({
        value: 0, min: 0, max: 705, target: T,
        steps: [{ d: -60, label: '− 1 hour' }, { d: 60, label: '+ 1 hour' }, { d: -15, label: '− 15 min' }, { d: 15, label: '+ 15 min' }],
        onChange: v => {
          f.setTime(v);
          read.textContent = words(v);
          if (v === T && !solved) {
            solved = true;
            setter.lock();
            MA.launchConfetti(30);
            say(`${words(T)}! ${pick(PRAISE)}`);
            nextOrDone(result, round === targets.length - 1, 'Next time ▶', () => { round += 1; next(); }, done, '🎮 Clock setter!');
          }
        }
      });
      box.append(el('p', { class: 'round-label' }, `Clock ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Set to'), el('strong', {}, words(T))),
        el('div', { class: 'frac-stage' }, f), read, setter.root, result);
    }
  }

  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const base = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 3);
      const mins = round === 0 ? [0, 30, 0] : [15, 45, 30];
      const times = base.map((h, i) => (h * 60 + mins[i]) % 720);
      const trick = [60, 120, 180, 240].map(d => (times[0] + d) % 720).find(v => !times.includes(v));
      say('Match each clock to its time.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: times.map(t => ({ face: face(t, 110), value: words(t), label: 'Clock' })),
        tiles: [...times.map(words), words(trick)],
        hint: 'Almost! Look at the long hand first, then the short hand.',
        onComplete: () => { MA.launchConfetti(25); say(pick(PRAISE)); nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Time matcher!'); }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`), instruction('✋ Drag each time onto its clock.'), cards, bank, result);
    }
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🕒<small>The long hand shows the minutes.</small>', truth: true, explain: 'True! The short hand shows the hour.' }),
      () => ({ text: `${faceHTML(4 * 60 + 30, 120)}<small>This says 6 o'clock.</small>`, truth: false, explain: 'The long hand is on 6, so it is HALF PAST. The short hand is past 4: half past 4.', fix: { question: 'What time is it?', options: ['half past 4', "6 o'clock", 'half past 6'], answer: 'half past 4' } }),
      () => ({ text: `${faceHTML(2 * 60 + 15, 120)}<small>quarter past 2</small>`, truth: true, explain: 'True! Long hand on 3 = quarter past.' }),
      () => ({ text: '⏰<small>At half past, the long hand points to 12.</small>', truth: false, explain: 'At half past, the long hand points to 6. At o’clock it points to 12.' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Look at the hands. True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderDigital(box, done) {
    say('Clocks can look different! A digital clock shows numbers only.');
    quizRounds(box, done, [0, 1, 2, 3].map(i => () => {
      const t = (rnd(1, 12) * 60 + [0, 30, 15, 45][i]) % 720;
      if (i % 2 === 0) return { icon: '📟', question: `Which clock shows ${digital(t)}?`, instruction: 'Read the hands.', options: shuffle([t, (t + 60) % 720, (t + 30) % 720]).map(v => ({ value: v, label: words(v), html: faceHTML(v, 90) })), answer: t, hint: 'Almost! Minutes first: :00 is 12, :30 is 6, :15 is 3, :45 is 9.', explain: `${digital(t)} = ${words(t)}` };
      return { icon: '⌚', question: 'What does this digital clock say in words?', instruction: 'Look at the minutes.', visual: `<span class="digital">${digital(t)}</span>`, options: timeOpts(t, [(t + 60) % 720, (t + 15) % 720]), answer: t, hint: 'Almost! :30 means half past.', explain: words(t) };
    }), { label: 'Clock', finalText: '🚀 Time detective!' });
  }

  function qOclock() { const t = hrs(); return { icon: '🕒', question: 'What time is it?', instruction: 'Read the hands.', visual: `<div class="frac-stage">${faceHTML(t, 140)}</div>`, options: timeOpts(t, [(t + 60) % 720, (t + 30) % 720]), answer: t, hint: 'Almost! Short hand = hour.', explain: words(t) }; }
  function qHalf() { const t = (hrs() + 30) % 720; return { icon: '🕧', question: 'What time is it?', instruction: 'Long hand on 6?', visual: `<div class="frac-stage">${faceHTML(t, 140)}</div>`, options: timeOpts(t, [(t + 30) % 720, (t + 60) % 720]), answer: t, hint: 'Almost! Long hand on 6 means half past.', explain: words(t) }; }
  function qQuarter() { const t = (hrs() + 15) % 720; return { icon: '🕒', question: 'What time is it?', instruction: 'Long hand on 3?', visual: `<div class="frac-stage">${faceHTML(t, 140)}</div>`, options: timeOpts(t, [(t + 30) % 720, (t + 15) % 720]), answer: t, hint: 'Almost! Long hand on 3 = quarter past.', explain: words(t) }; }
  function qHand() { return { icon: '✋', question: 'Which hand shows the hour?', instruction: 'Think!', options: [{ value: 'short', label: 'the short hand' }, { value: 'long', label: 'the long hand' }], answer: 'short', hint: 'Almost! The long hand shows minutes.', explain: 'The short hand shows the hour.' }; }
  function qLater() { const t = hrs(); return { icon: '⏩', question: `It is ${words(t)}. What time will it be in 1 hour?`, instruction: 'Move the short hand on one.', options: timeOpts((t + 60) % 720, [(t + 120) % 720, t]), answer: (t + 60) % 720, hint: 'Almost! Count on one hour.', explain: words((t + 60) % 720) }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qOclock(), qHalf(), qQuarter(), qHand(), qLater()], moduleId: MODULE_ID, badgeId: 'clock-champion', title: 'Clock Champion' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
