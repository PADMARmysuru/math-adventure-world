/* ==============================================================
   🐉 Challenge Arena → Boss Challenges     challenge-arena/boss-challenges.js
   Each right answer zaps the boss. You have 3 hearts; if they run out,
   you simply try again with full hearts. No progress is ever lost.
   🌱 Training dummy · 🎮 Number Dragon · 🧩 Shape Golem
   🧠 Riddle Sphinx · 🚀 Mega Boss · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const A = window.Arena;
  if (!MA || !K || !A) return;
  const { $, $$, pick, shuffle, el, button, instruction, say, pulse, wait, PRAISE } = K;
  const MODULE_ID = 'challenge-arena/boss-challenges';

  /** Boss battle. topics: list of bank topics. */
  function battle(box, done, { name, emoji, hp, topics, level, intro }) {
    let bossHp = hp;
    let hearts = 3;
    let busy = false;
    box.innerHTML = '';
    say(intro);
    const bossEl = el('div', { class: 'boss' }, el('span', { class: 'boss__emoji', 'aria-hidden': 'true' }, emoji), el('strong', {}, name));
    const hpBar = el('div', { class: 'boss-hp', role: 'progressbar', 'aria-label': `${name} energy`, 'aria-valuemin': 0, 'aria-valuemax': hp }, el('span', { class: 'boss-hp__fill' }));
    const heartsEl = el('p', { class: 'hearts', 'aria-live': 'polite' });
    const qArea = el('div', { class: 'boss-q' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const draw = () => {
      $('.boss-hp__fill', hpBar).style.width = `${(bossHp / hp) * 100}%`;
      hpBar.setAttribute('aria-valuenow', bossHp);
      heartsEl.textContent = `${'❤️'.repeat(hearts)}${'🤍'.repeat(3 - hearts)}`;
    };
    function ask() {
      const q = A.ask(pick(topics), level);
      qArea.innerHTML = '';
      const opts = el('div', { class: 'sprint-opts', role: 'group', 'aria-label': 'Answers' });
      q.options.forEach(o => opts.append(button(o.label, 'sprint-opt', async function () {
        if (busy) return;
        busy = true;
        if (o.value === q.answer) {
          this.classList.add('is-right');
          bossHp -= 1;
          pulse(bossEl, 'is-hit');
          draw();
          say(pick(['Zap!', 'Direct hit!', 'Pow!', 'Great answer!']));
          await wait(450);
          busy = false;
          if (bossHp <= 0) return win();
          ask();
        } else {
          this.classList.add('is-wrong');
          hearts -= 1;
          draw();
          say(`Ouch! ${q.hint} The answer was ${q.options.find(x => x.value === q.answer).label}.`);
          await wait(1200);
          busy = false;
          if (hearts <= 0) return lose();
          ask();
        }
      }, { 'data-correct': o.value === q.answer ? 'yes' : 'no' })));
      qArea.append(el('p', { class: 'sprint-q' }, `${q.icon} ${q.question}`), opts);
    }
    function win() {
      qArea.innerHTML = '';
      bossEl.classList.add('is-beaten');
      MA.launchConfetti(70);
      say(`You beat the ${name}! ${pick(PRAISE)}`);
      result.append(el('p', { class: 'round-result__text' }, `🏆 ${name} defeated!`));
      done();
    }
    function lose() {
      qArea.innerHTML = '';
      say(`The ${name} is tricky! Your hearts are full again. Try once more!`);
      result.append(el('div', { class: 'stage-actions' }, button('🔁 Battle again', 'btn', () => { result.innerHTML = ''; bossHp = hp; hearts = 3; draw(); ask(); })));
    }
    draw();
    ask();
    box.append(el('div', { class: 'battle' }, bossEl, hpBar, heartsEl), instruction('👆 Answer to zap the boss!'), qArea, result);
  }

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Training dummy', render: (b, d) => battle(b, d, { name: 'Training Dummy', emoji: '🎯', hp: 3, topics: ['number'], level: 1, intro: 'Boss battles! Each right answer zaps the boss. You have 3 hearts. Practise on the training dummy!' }) },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Number Dragon', render: (b, d) => battle(b, d, { name: 'Number Dragon', emoji: '🐉', hp: 5, topics: ['number'], level: 2, intro: 'The Number Dragon loves sums! Beat it with number skills!' }) },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Shape Golem', render: (b, d) => battle(b, d, { name: 'Shape Golem', emoji: '🗿', hp: 5, topics: ['shape', 'measure'], level: 2, intro: 'The Shape Golem is made of shapes and measures!' }) },
    { id: 'think', icon: '🧠', label: 'Think', title: 'Riddle Sphinx', render: (b, d) => battle(b, d, { name: 'Riddle Sphinx', emoji: '🦁', hp: 5, topics: ['time', 'data', 'pattern', 'money'], level: 2, intro: 'The Riddle Sphinx asks about time, money, data and patterns. Think carefully!' }) },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Mega Boss', render: (b, d) => battle(b, d, { name: 'Mega Boss', emoji: '👾', hp: 8, topics: A.TOPICS, level: 3, intro: 'The MEGA BOSS knows everything on the map! Are you ready?' }) },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Boss Beater', render: (box, done) => K.runMaster(box, done, { makeQuestions: () => A.mixed(5, 3).map(f => f()), moduleId: MODULE_ID, badgeId: 'boss-beater', title: 'Boss Beater' }) }
  ];

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
