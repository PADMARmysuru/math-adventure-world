/* ==============================================================
   🎲 Challenge Arena → Mixed Challenges   challenge-arena/mixed-challenges.js
   Questions from every place on the map, getting harder step by step.
   🌱 Warm-up · 🎮 Topic wheel · 🧩 Mixed practice · 🧠 True or false
   🚀 Tricky mix · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const A = window.Arena;
  if (!MA || !K || !A) return;
  const { shuffle, el, button, instruction, say, nextOrDone, quizRounds, PRAISE, pick } = K;
  const MODULE_ID = 'challenge-arena/mixed-challenges';
  const TOPIC_ICONS = { number: '🏝️ Number', shape: '🏰 Shapes', measure: '📏 Measure', money: '💰 Money', time: '⏰ Time', data: '📊 Data', pattern: '🌳 Patterns' };

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Warm-up', render: (box, done) => { say('Welcome to the Arena! Questions come from every place on the map. Let’s warm up!'); quizRounds(box, done, A.mixed(4, 1), { label: 'Warm-up' }); } },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Topic wheel', render: renderWheel },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Mixed practice', render: (box, done) => { say('Five questions, all different!'); quizRounds(box, done, A.mixed(5, 2), { label: 'Question', finalText: '🧩 Mixed master!' }); } },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Tricky mix', render: (box, done) => { say('These are trickier. Take your time!'); quizRounds(box, done, A.mixed(6, 3), { label: 'Tricky', finalText: '🚀 Arena star!' }); } },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Arena Champion', render: (box, done) => K.runMaster(box, done, { makeQuestions: () => A.mixed(5, 3).map(f => f()), moduleId: MODULE_ID, badgeId: 'arena-champion', title: 'Arena Champion' }) }
  ];

  /** Choose any 3 topics from the wheel, then answer one question from each. */
  function renderWheel(box, done) {
    box.innerHTML = '';
    const chosen = [];
    say('Pick any 3 places from the map. I will ask one question from each!');
    const grid = el('div', { class: 'topic-grid', role: 'group', 'aria-label': 'Topics' });
    const status = el('p', { class: 'hop-count', 'aria-live': 'polite' }, 'Picked: 0 of 3');
    A.TOPICS.forEach(t => {
      const b = button(TOPIC_ICONS[t], 'topic-btn', () => {
        if (chosen.includes(t) || chosen.length >= 3) return;
        chosen.push(t);
        b.classList.add('is-selected');
        b.disabled = true;
        status.textContent = `Picked: ${chosen.length} of 3`;
        if (chosen.length === 3) {
          say(`${chosen.map(c => TOPIC_ICONS[c]).join(', ')}. Let’s go!`);
          setTimeout(() => quizRounds(box, done, chosen.map(c => () => A.ask(c, 2)), { label: 'Topic', finalText: '🎮 Wheel winner!' }), 500);
        }
      }, { 'data-correct': 'yes' });
      grid.append(b);
    });
    box.append(instruction('👆 Tap 3 topics.'), grid, status);
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '45 > 54', truth: false, explain: '54 has 5 tens, so 54 is bigger.' }),
      () => ({ text: '🔺<small>A triangle has 3 corners.</small>', truth: true, explain: 'True!' }),
      () => ({ text: '🕧<small>Half past 3 comes before 3 o’clock.</small>', truth: false, explain: 'Half past 3 is AFTER 3 o’clock.' }),
      () => ({ text: '5 × 2 = 2 × 5', truth: true, explain: 'True! Both make 10.' }),
      () => ({ text: '🎲<small>Rolling a 6 on a normal dice is impossible.</small>', truth: false, explain: 'It is possible! A dice has a 6.' })
    ]).slice(0, 4);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Mixed true or false. Think carefully!');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
