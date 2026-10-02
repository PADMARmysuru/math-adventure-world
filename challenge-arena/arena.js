/* ==============================================================
   🎯 Challenge Arena — arena.js  (mixed question bank for every topic)
   Arena.ask(topic, level) → a challenge object for MA.renderChallenge
   topics: number, shape, measure, money, time, data, pattern
   level: 1 (warm-up) … 3 (tricky)
   ============================================================== */
'use strict';

(function () {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = l => l[Math.floor(Math.random() * l.length)];
  const shuffle = l => l.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const nums = (ans, cands, fmt = String) => {
    const v = [ans];
    cands.forEach(c => { if (v.length < 3 && c >= 0 && !v.includes(c)) v.push(c); });
    let k = 1;
    while (v.length < 3) { if (!v.includes(ans + k)) v.push(ans + k); k += 1; }
    return shuffle(v).map(x => ({ value: x, label: fmt(x) }));
  };
  const words = (ans, others) => shuffle([ans, ...others]).map(x => ({ value: x, label: x }));
  const cur = () => (window.Money && window.Money.CURRENCY.symbol) || '₹';

  const BANK = {
    number(level) {
      const t = pick(['add', 'sub', 'compare', 'place', 'skip', 'times']);
      const big = level >= 2;
      if (t === 'add') { const a = big ? rnd(21, 68) : rnd(3, 9); const b = big ? rnd(3, 9) : rnd(2, 9); return { icon: '➕', question: `${a} + ${b} = ?`, instruction: 'Add.', options: nums(a + b, [a + b + 1, a + b - 1, a + b + 10]), answer: a + b, hint: 'Almost! Count on.', explain: `${a} + ${b} = ${a + b}` }; }
      if (t === 'sub') { const a = big ? rnd(30, 90) : rnd(10, 18); const b = rnd(2, 9); return { icon: '➖', question: `${a} − ${b} = ?`, instruction: 'Take away.', options: nums(a - b, [a - b + 1, a - b - 1, a + b]), answer: a - b, hint: 'Almost! Count back.', explain: `${a} − ${b} = ${a - b}` }; }
      if (t === 'compare') { const a = rnd(12, 98); let b; do { b = rnd(12, 98); } while (b === a); return { icon: '⚖️', question: `Which is bigger: ${a} or ${b}?`, instruction: 'Tens first.', options: shuffle([a, b]).map(v => ({ value: v, label: String(v) })), answer: Math.max(a, b), hint: 'Almost! Compare the tens.', explain: `${Math.max(a, b)} is bigger.` }; }
      if (t === 'place') { const tn = rnd(2, 9); const o = rnd(1, 9); return { icon: '🧱', question: `What is the value of the ${tn} in ${tn * 10 + o}?`, instruction: 'Tens or ones?', options: nums(tn * 10, [tn, tn * 10 + o]), answer: tn * 10, hint: 'Almost! It is in the tens place.', explain: `${tn} tens = ${tn * 10}` }; }
      if (t === 'skip') { const s = pick([2, 5, 10]); const st = s * rnd(1, 6); return { icon: '👣', question: `${st}, ${st + s}, ${st + 2 * s}, ?`, instruction: `Count in ${s}s.`, options: nums(st + 3 * s, [st + 3 * s + 1, st + 2 * s + 1]), answer: st + 3 * s, hint: `Almost! Add ${s}.`, explain: String(st + 3 * s) }; }
      const f = pick([2, 5, 10]); const n = rnd(2, level >= 3 ? 10 : 6); return { icon: '✖️', question: `${n} × ${f} = ?`, instruction: `Count in ${f}s.`, options: nums(n * f, [n * f + f, n + f, n * f - 1]), answer: n * f, hint: `Almost! ${n} groups of ${f}.`, explain: `${n * f}` };
    },
    shape() {
      const s = pick([['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8]]);
      const t = pick(['sides', 'name', 'solid', 'sym']);
      if (t === 'sides') return { icon: '🔺', question: `How many sides does a ${s[0]} have?`, instruction: 'Picture it.', options: nums(s[1], [s[1] + 1, s[1] - 1]), answer: s[1], hint: 'Almost! Draw it in the air.', explain: `${s[1]} sides` };
      if (t === 'name') return { icon: '🔷', question: `Which shape has ${s[1]} sides?`, instruction: 'Count the sides.', options: words(s[0], shuffle(['triangle', 'square', 'pentagon', 'hexagon', 'octagon'].filter(x => x !== s[0])).slice(0, 2)), answer: s[0], hint: 'Almost!', explain: s[0] };
      if (t === 'solid') { const o = pick([['⚽', 'sphere'], ['🎲', 'cube'], ['🥫', 'cylinder'], ['🍦', 'cone']]); return { icon: o[0], question: `${o[0]} is shaped like a…`, instruction: 'Solid shapes.', options: words(o[1], shuffle(['sphere', 'cube', 'cylinder', 'cone'].filter(x => x !== o[1])).slice(0, 2)), answer: o[1], hint: 'Almost!', explain: o[1] }; }
      return { icon: '🦋', question: 'How many lines of symmetry does a square have?', instruction: 'Fold it in your head.', options: nums(4, [2, 1]), answer: 4, hint: 'Almost! Up, across and both diagonals.', explain: '4' };
    },
    measure() {
      const t = pick(['unit', 'ruler', 'heavy', 'temp']);
      if (t === 'unit') { const x = pick([['🚌 a bus', 'm'], ['✏️ a pencil', 'cm'], ['🍉 a melon', 'kg'], ['🥛 a jug of milk', 'litres']]); return { icon: '📏', question: `Which unit would you use for ${x[0]}?`, instruction: 'Length, mass or capacity?', options: words(x[1], ['m', 'cm', 'kg', 'litres'].filter(u => u !== x[1]).slice(0, 2)), answer: x[1], hint: 'Almost! What are you measuring?', explain: x[1] }; }
      if (t === 'ruler') { const a = rnd(4, 12); const b = rnd(2, a - 1); return { icon: '📐', question: `A ribbon is ${a} cm. Another is ${b} cm. How much longer is the first?`, instruction: 'Difference.', options: nums(a - b, [a + b, a - b + 1]), answer: a - b, hint: 'Almost! Take away.', explain: `${a - b} cm` }; }
      if (t === 'heavy') return { icon: '⚖️', question: 'On a balance, the heavier side…', instruction: 'Think.', options: words('goes down', ['goes up', 'disappears']), answer: 'goes down', hint: 'Almost!', explain: 'goes down' };
      const a = pick([10, 15, 20]); const b = a + pick([5, 10]); return { icon: '🌡️', question: `${a} °C or ${b} °C: which is warmer?`, instruction: 'Bigger is warmer.', options: [a, b].map(v => ({ value: v, label: `${v} °C` })), answer: b, hint: 'Almost!', explain: `${b} °C` };
    },
    money() {
      const t = pick(['total', 'change', 'coins']);
      if (t === 'total') { const a = rnd(2, 9); const b = rnd(2, 9); return { icon: '🪙', question: `${cur()}${a} + ${cur()}${b} = ?`, instruction: 'Add.', options: nums(a + b, [a + b + 1, a + b - 1], v => `${cur()}${v}`), answer: a + b, hint: 'Almost!', explain: `${cur()}${a + b}` }; }
      if (t === 'change') { const p = rnd(2, 9); return { icon: '🛒', question: `Pay ${cur()}10 for something costing ${cur()}${p}. Change?`, instruction: 'Count on.', options: nums(10 - p, [p, 10 - p + 1], v => `${cur()}${v}`), answer: 10 - p, hint: `Almost! ${p} + ? = 10`, explain: `${cur()}${10 - p}` }; }
      return { icon: '💰', question: `How many ${cur()}2 coins make ${cur()}10?`, instruction: 'Count in 2s.', options: nums(5, [2, 10]), answer: 5, hint: 'Almost! 2, 4, 6, 8, 10.', explain: '5' };
    },
    time() {
      const h = rnd(1, 11);
      const t = pick(['later', 'half', 'days', 'months']);
      if (t === 'later') return { icon: '🕒', question: `It is ${h} o'clock. What time is it 2 hours later?`, instruction: 'Count on.', options: words(`${h + 2 > 12 ? h - 10 : h + 2} o'clock`, [`${h + 1} o'clock`, `${h + 3 > 12 ? h - 9 : h + 3} o'clock`]), answer: `${h + 2 > 12 ? h - 10 : h + 2} o'clock`, hint: 'Almost!', explain: `${h + 2 > 12 ? h - 10 : h + 2} o'clock` };
      if (t === 'half') return { icon: '🕧', question: 'Where does the long hand point at half past?', instruction: 'Picture the clock.', options: nums(6, [12, 3]), answer: 6, hint: 'Almost! Half way round.', explain: 'to the 6' };
      if (t === 'days') return { icon: '📅', question: 'How many days are in a week?', instruction: 'Count them.', options: nums(7, [5, 12]), answer: 7, hint: 'Almost!', explain: '7' };
      return { icon: '🗓️', question: 'Which month comes after June?', instruction: 'In order.', options: words('July', ['May', 'August']), answer: 'July', hint: 'Almost!', explain: 'July' };
    },
    data() {
      const a = rnd(2, 9); let b; do { b = rnd(2, 9); } while (b === a);
      const t = pick(['most', 'diff', 'chance']);
      if (t === 'most') return { icon: '📊', question: `Cats: ${a}. Dogs: ${b}. Which pet is more popular?`, instruction: 'Compare.', options: words(a > b ? 'cats' : 'dogs', [a > b ? 'dogs' : 'cats']), answer: a > b ? 'cats' : 'dogs', hint: 'Almost!', explain: a > b ? 'cats' : 'dogs' };
      if (t === 'diff') return { icon: '➖', question: `Red: ${Math.max(a, b)} votes. Blue: ${Math.min(a, b)} votes. How many more for red?`, instruction: 'Difference.', options: nums(Math.abs(a - b), [a + b, Math.max(a, b)]), answer: Math.abs(a - b), hint: 'Almost!', explain: String(Math.abs(a - b)) };
      return { icon: '🎲', question: 'Rolling a 7 on a normal 1–6 dice is…', instruction: 'Think.', options: words('impossible', ['certain', 'possible']), answer: 'impossible', hint: 'Almost! Is there a 7?', explain: 'impossible' };
    },
    pattern() {
      const u = pick([['🔴', '🔵'], ['⭐', '🌙', '🌙'], ['🍎', '🍌', '🍇']]);
      const seq = Array.from({ length: u.length * 2 }, (_, i) => u[i % u.length]);
      return { icon: '🔁', question: `${seq.join(' ')} … what comes next?`, instruction: 'Find the repeat.', options: words(u[0], [...new Set(u.slice(1))]).slice(0, 3), answer: u[0], hint: 'Almost! Say it out loud.', explain: u[0] };
    }
  };

  const TOPICS = Object.keys(BANK);
  function ask(topic = pick(TOPICS), level = 2) {
    const q = BANK[topic](level);
    q.topic = topic;
    return q;
  }
  const mixed = (n, level) => Array.from({ length: n }, (_, i) => () => ask(TOPICS[(i + rnd(0, TOPICS.length - 1)) % TOPICS.length], level));

  window.Arena = { ask, mixed, TOPICS, rnd, pick, shuffle };
})();
