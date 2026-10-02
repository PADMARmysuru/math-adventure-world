/* ==============================================================
   💰 Money Market — money.js  (shared coins, notes and prices)
   --------------------------------------------------------------
   Change CURRENCY to use another symbol (for example '$' or '£').
   Coins and notes are simple original drawings, not copies of real money.
   ============================================================== */
'use strict';

(function () {
  const CURRENCY = { symbol: '₹', coins: [1, 2, 5, 10, 20], notes: [10, 20, 50, 100] };
  const fmt = v => `${CURRENCY.symbol}${v}`;

  function make(tag, cls, text, label) {
    const n = document.createElement(tag);
    n.className = cls;
    n.textContent = text;
    if (label) { n.setAttribute('role', 'img'); n.setAttribute('aria-label', label); }
    return n;
  }
  const coin = (v, small = false) => make('span', `coin coin--${v}${small ? ' coin--small' : ''}`, fmt(v), `${fmt(v)} coin`);
  const note = (v, small = false) => make('span', `note note--${v}${small ? ' note--small' : ''}`, fmt(v), `${fmt(v)} note`);
  /** Draw a value as a coin (up to 20) or a note (50 and above). */
  const piece = (v, small = false) => (v >= 50 ? note(v, small) : coin(v, small));
  const groupHTML = (list, kind = 'piece') => `<span class="money-group" role="img" aria-label="${list.map(fmt).join(', ')}">${list.map(v => (kind === 'note' ? note(v, true) : piece(v, true)).outerHTML).join('')}</span>`;
  const groupNode = (list, kind) => { const w = document.createElement('span'); w.innerHTML = groupHTML(list, kind); return w.firstChild; };

  /** Fewest pieces for an amount (greedy works for these coins). */
  function fewest(total, denoms) {
    const out = [];
    [...denoms].sort((a, b) => b - a).forEach(d => { while (total >= d) { out.push(d); total -= d; } });
    return out;
  }

  window.Money = { CURRENCY, fmt, coin, note, piece, groupHTML, groupNode, fewest };
})();
