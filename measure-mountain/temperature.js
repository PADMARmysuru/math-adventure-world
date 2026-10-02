/* ==============================================================
   🌡️ Measure Mountain → Temperature       measure-mountain/temperature.js
   --------------------------------------------------------------
   🌱 Learn      hot or cold? then read a thermometer in °C
   🎮 Play       set the thermometer to the right temperature, then dress Milo
   🧩 Practise   drag readings onto thermometers
   🧠 Think      true or false? (higher red line = warmer)
   🚀 Challenge  weather week: warmest, coldest, how much warmer?
   🏆 Master     five mixed questions → Temperature Tracker badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const M = window.Measure;
  if (!MA || !K || !M) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, nextOrDone, dragMatch, sortZones, quizRounds, optionsFor, PRAISE } = K;

  const MODULE_ID = 'measure-mountain/temperature';
  const fives = (lo, hi) => { const a = []; for (let v = lo; v <= hi; v += 5) a.push(v); return a; };

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Hot or cold?',          render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Set the temperature',   render: renderSet },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Thermometer match',     render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',        render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Weather week',          render: renderWeek },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Temperature Tracker',   render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    sortHotCold();
    function sortHotCold() {
      box.innerHTML = '';
      say('Temperature tells us how hot or cold something is. Sort these!');
      const items = [['🔥', 'fire', 'hot'], ['☀️', 'sunny beach day', 'hot'], ['🍵', 'cup of tea', 'hot'], ['🍲', 'bowl of soup', 'hot'],
        ['❄️', 'snow', 'cold'], ['🧊', 'ice cube', 'cold'], ['⛄', 'snowman', 'cold'], ['🍦', 'ice cream', 'cold']];
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { bank, zones } = sortZones({
        zones: [{ id: 'hot', label: '🥵 Hot' }, { id: 'cold', label: '🥶 Cold' }],
        items: items.map(([e, n, c]) => ({ face: e, cat: c, label: n })),
        hint: item => `Would a ${item.label} feel ${item.cat === 'hot' ? 'warm or cold' : 'warm or hot'} to touch? Think again!`,
        onComplete: () => {
          MA.launchConfetti(25);
          say('Now let’s measure exactly how hot or cold, with a thermometer!');
          result.append(el('div', { class: 'stage-actions' }, button('Next: read a thermometer ▶', 'btn', readRounds)));
        }
      });
      box.append(el('p', { class: 'round-label' }, 'Part 1 of 2'), instruction('✋ Drag each picture to Hot or Cold.'), bank, zones, result);
    }
    function readRounds() {
      const vals = shuffle(fives(5, 35)).slice(0, 3);
      quizRounds(box, done, vals.map((v, i) => () => ({
        icon: '🌡️', question: 'What temperature does it show?', instruction: 'Look at the top of the red line.',
        say: i === 0 ? 'The red line goes up when it is warmer. Read the number at the top of the red line. We say degrees Celsius, °C.' : 'Read the thermometer!',
        visual: `<div class="frac-stage">${M.thermometer({ value: v }).outerHTML}</div>`,
        options: shuffle([v, v + 5, v - 5]).map(x => ({ value: x, label: `${x} °C` })),
        answer: v, hint: 'Almost! Each small mark is 5 degrees.', explain: `${v} °C`
      })), { label: 'Thermometer' });
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — set the temperature, then dress Milo
     ------------------------------------------------------------ */
  function renderSet(box, done) {
    const targets = shuffle([10, 15, 20, 25, 30, 35]).slice(0, 3);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      let v = 0;
      let solved = false;
      say(`Make the thermometer show ${T} degrees.`);
      const th = M.thermometer({ value: 0 });
      const readout = el('p', { class: 'hop-count', 'aria-live': 'polite' }, '0 °C');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const change = d => {
        if (solved) return;
        v = Math.max(0, Math.min(40, v + d));
        th.setValue(v);
        readout.textContent = `${v} °C`;
        if (v === T) {
          solved = true;
          MA.launchConfetti(25);
          say(`${T} °C! ${T >= 25 ? 'That is hot!' : T <= 10 ? 'Brrr, that is cold!' : 'That is mild.'}`);
          dress(result, T);
        }
      };
      box.append(el('p', { class: 'round-label' }, `Day ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Set to'), el('strong', {}, `${T} °C`)),
        el('div', { class: 'frac-stage' }, th), readout,
        el('div', { class: 'pv-controls' },
          button('− 5', 'pv-btn pv-btn--minus', () => change(-5), { 'aria-label': 'Cooler by 5 degrees' }),
          button('+ 5', 'pv-btn pv-btn--ten', () => change(5), { 'aria-label': 'Warmer by 5 degrees' })),
        result);
    }
    function dress(result, T) {
      const right = T >= 25 ? 'shorts' : T <= 10 ? 'coat' : 'jumper';
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'What should Milo wear?' });
      say('What should Milo wear today?');
      [['🩳', 'shorts'], ['🧥', 'coat'], ['🧶', 'jumper']].forEach(([e, n]) => {
        const b = button(`${e} ${n}`, 'pattern-btn', () => {
          if (n === right) {
            $$('button', group).forEach(x => { x.disabled = true; });
            b.classList.add('is-right');
            say(`Good choice! A ${n} is right for ${T} °C.`);
            nextOrDone(result, round === targets.length - 1, 'Next day ▶', () => { round += 1; next(); }, done, '🎮 Weather wizard!');
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say(T >= 25 ? 'Too warm for that! It is hot today.' : T <= 10 ? 'Milo would be cold! It is chilly today.' : 'Not too hot, not too cold. Something in between!');
          }
        });
        group.append(b);
      });
      result.append(el('p', { class: 'fix-q' }, '🦊 What should Milo wear?'), group);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const vals = shuffle(fives(0, 40)).slice(0, 3);
      const trick = fives(0, 40).find(v => !vals.includes(v) && Math.abs(v - vals[0]) === 5) ?? fives(0, 40).find(v => !vals.includes(v));
      say('Read each thermometer and drag on the temperature.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: vals.map(v => ({ face: M.thermometer({ value: v, size: 170 }), value: `${v} °C`, label: 'Thermometer' })),
        tiles: [...vals.map(v => `${v} °C`), `${trick} °C`],
        hint: 'Almost! Find the top of the red line, then the number next to it.',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick!` : pick(PRAISE));
          nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Thermometer reader!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`),
        instruction('✋ Drag each temperature onto its thermometer. Or tap one, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => ({ text: '🧊 vs 🍲<small>Ice is hotter than soup.</small>', truth: false, explain: 'Ice is very cold. Hot soup is much hotter!' }),
      () => ({ text: '🌡️⬆️<small>When the red line goes up, it is getting warmer.</small>', truth: true, explain: 'True! Higher means warmer.' }),
      () => ({ text: '☀️ 30 °C<small>A hot summer day could be 30 °C.</small>', truth: true, explain: 'True! 30 °C is a hot day.' }),
      () => ({ text: '❄️ 0 °C<small>0 °C is a warm day for the beach.</small>', truth: false, explain: '0 °C is freezing! Water turns to ice. Beach days are more like 25 to 35 °C.', fix: { question: 'Which is a beach day?', options: ['30 °C', '0 °C', '5 °C'], answer: '30 °C' } })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Hot or not? True or false?' : pick(['True or false?', 'Think about the weather!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — weather week
     ------------------------------------------------------------ */
  function renderWeek(box, done) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const temps = shuffle(fives(10, 35)).slice(0, 5);
    const hot = days[temps.indexOf(Math.max(...temps))];
    const cold = days[temps.indexOf(Math.min(...temps))];
    const [i1, i2] = shuffle([0, 1, 2, 3, 4]).slice(0, 2).sort((a, b) => temps[b] - temps[a]);
    const chart = () => `<div class="week">${days.map((d, i) => `<div class="week__day">${M.thermometer({ value: temps[i], size: 120 }).outerHTML}<strong>${d}</strong><small>${temps[i]} °C</small></div>`).join('')}</div>`;
    const dayOpts = right => shuffle([right, ...shuffle(days.filter(d => d !== right)).slice(0, 2)]).map(d => ({ value: d, label: d }));
    say('Here is the weather for one school week. Let’s investigate!');
    quizRounds(box, done, [
      { icon: '☀️', question: 'Which day was the warmest?', instruction: 'Highest red line.', visual: chart(), options: dayOpts(hot), answer: hot, hint: 'Almost! Find the tallest red line.', explain: `${hot} was the warmest.` },
      { icon: '❄️', question: 'Which day was the coldest?', instruction: 'Lowest red line.', visual: chart(), options: dayOpts(cold), answer: cold, hint: 'Almost! Find the shortest red line.', explain: `${cold} was the coldest.` },
      { icon: '📈', question: `How many degrees warmer was ${days[i1]} than ${days[i2]}?`, instruction: 'Find the difference.', visual: chart(), options: optionsFor(temps[i1] - temps[i2], [temps[i1] - temps[i2] + 5, temps[i1] + temps[i2], temps[i1]]).map(o => ({ ...o, label: `${o.value} °C` })), answer: temps[i1] - temps[i2], hint: `Almost! ${temps[i1]} − ${temps[i2]} = ?`, explain: `${temps[i1]} − ${temps[i2]} = ${temps[i1] - temps[i2]} degrees warmer` }
    ], { label: 'Question', finalText: '🚀 Weather investigator!' });
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qRead() { const v = pick(fives(5, 35)); return { icon: '🌡️', question: 'What does the thermometer show?', instruction: 'Top of the red line.', visual: `<div class="frac-stage">${M.thermometer({ value: v, size: 190 }).outerHTML}</div>`, options: shuffle([v, v + 5, v - 5]).map(x => ({ value: x, label: `${x} °C` })), answer: v, hint: 'Almost! Each mark is 5 degrees.', explain: `${v} °C` }; }
  function qWarmer() { const a = pick(fives(10, 25)); const b = a + 10; return { icon: '🔥', question: `Which is warmer: ${a} °C or ${b} °C?`, instruction: 'Bigger number = warmer.', options: shuffle([a, b]).map(x => ({ value: x, label: `${x} °C` })), answer: b, hint: 'Almost! Which number is bigger?', explain: `${b} °C is warmer.` }; }
  function qCold() { return { icon: '🥶', question: 'Which would feel the coldest?', instruction: 'Think!', options: shuffle([['🧊', 'ice'], ['☕', 'hot cocoa'], ['🌞', 'sunshine']]).map(([e, n]) => ({ value: n, label: `${e} ${n}` })), answer: 'ice', hint: 'Almost! What melts in the sun?', explain: 'Ice is the coldest.' }; }
  function qUnit() { return { icon: '°C', question: 'What do we use to measure temperature?', instruction: 'Which tool?', options: shuffle([['🌡️', 'thermometer'], ['📏', 'ruler'], ['⚖️', 'scales']]).map(([e, n]) => ({ value: n, label: `${e} ${n}` })), answer: 'thermometer', hint: 'Almost! It has a red line.', explain: 'A thermometer measures temperature.' }; }
  function qDiff() { const a = pick([10, 15, 20]); const b = a + pick([5, 10, 15]); return { icon: '📈', question: `In the morning it was ${a} °C. In the afternoon it was ${b} °C. How much warmer?`, instruction: 'Find the difference.', options: optionsFor(b - a, [b - a + 5, b + a, b]).map(o => ({ ...o, label: `${o.value} °C` })), answer: b - a, hint: `Almost! ${b} − ${a} = ?`, explain: `${b - a} degrees warmer` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qRead(), qWarmer(), qCold(), qUnit(), qDiff()], moduleId: MODULE_ID, badgeId: 'temperature-tracker', title: 'Temperature Tracker' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
