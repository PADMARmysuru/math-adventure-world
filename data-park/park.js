/* ==============================================================
   📊 Data Park — park.js  (shared tallies, pictograms and block graphs)
   data is a list of rows: [{ label, emoji, count }]
   ============================================================== */
'use strict';

(function () {
  /** Tally marks: bundles of 5 (four lines and a line across). */
  function tallyHTML(n) {
    let html = '<span class="tally" aria-label="' + n + ' tally marks">';
    for (let g = 0; g < Math.floor(n / 5); g++) html += '<span class="tally__gate"><i></i><i></i><i></i><i></i><b></b></span>';
    if (n % 5) html += `<span class="tally__rest">${'<i></i>'.repeat(n % 5)}</span>`;
    return html + '</span>';
  }

  function tallyTableHTML(data) {
    return `<table class="data-table"><thead><tr><th>Item</th><th>Tally</th></tr></thead><tbody>${data.map(r => `<tr><td>${r.emoji} ${r.label}</td><td>${tallyHTML(r.count)}</td></tr>`).join('')}</tbody></table>`;
  }

  /** Pictogram: one picture stands for `key` items. */
  function pictogramHTML(data, { key = 1, pic } = {}) {
    const rows = data.map(r => {
      const p = pic || r.emoji;
      const full = Math.floor(r.count / key);
      const part = r.count % key ? `<span class="picto__half">${p}</span>` : '';
      return `<div class="picto__row"><span class="picto__label">${r.label}</span><span class="picto__pics">${`<span>${p}</span>`.repeat(full)}${part}</span></div>`;
    }).join('');
    return `<div class="picto">${rows}<p class="picto__key">Key: ${pic || 'each picture'} = ${key}</p></div>`;
  }

  /** Block graph: columns of blocks with a numbered side. */
  function blockGraphHTML(data, max = 8) {
    const cols = data.map(r => `<div class="bg__col"><div class="bg__stack">${'<span class="bg__block"></span>'.repeat(r.count)}</div><span class="bg__label">${r.emoji}<small>${r.label}</small></span></div>`).join('');
    const axis = Array.from({ length: max }, (_, i) => `<span>${max - i}</span>`).join('');
    return `<div class="bg" style="--max:${max}"><div class="bg__axis">${axis}</div><div class="bg__cols">${cols}</div></div>`;
  }

  function sample(names, min = 1, max = 8) {
    const counts = new Set();
    return names.map(([emoji, label]) => {
      let c;
      do { c = min + Math.floor(Math.random() * (max - min + 1)); } while (counts.has(c));
      counts.add(c);
      return { emoji, label, count: c };
    });
  }

  window.Park = { tallyHTML, tallyTableHTML, pictogramHTML, blockGraphHTML, sample };
})();
