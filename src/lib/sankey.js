// Multi-column Sankey layout, plus loan retention sample data and briefings.
// ---- Multi-column Sankey: layout shared by LO movement and loan retention ----
// cols: [[{ key, label, color }]] left to right. links: [{ s, t, v, color }] between neighboring columns.
function sankeyCols(cols, links, W, H, opt) {
  opt = opt || {};
  var nodeW = opt.nodeW || 10, gap = opt.gap || 14, padL = opt.padL || 0, padR = opt.padR || 0;
  var vin = {}, vout = {};
  links.forEach(function (l) { vout[l.s] = (vout[l.s] || 0) + l.v; vin[l.t] = (vin[l.t] || 0) + l.v; });
  var val = function (k) { return Math.max(vin[k] || 0, vout[k] || 0); };
  cols = cols.map(function (c) { return c.filter(function (n) { return val(n.key) > 0; }); });
  var maxTot = 0, maxN = 0;
  cols.forEach(function (c) { var t = c.reduce(function (a, n) { return a + val(n.key); }, 0); if (t > maxTot) maxTot = t; if (c.length > maxN) maxN = c.length; });
  var k = maxTot ? (H - gap * Math.max(0, maxN - 1)) / maxTot : 0;
  var step = cols.length > 1 ? (W - padL - padR - nodeW) / (cols.length - 1) : 0;
  var nodes = {}, list = [];
  cols.forEach(function (c, ci) {
    var tot = c.reduce(function (a, n) { return a + val(n.key) * k; }, 0) + gap * Math.max(0, c.length - 1);
    var y = (H - tot) / 2;
    c.forEach(function (n) {
      var h = val(n.key) * k;
      var o = { key: n.key, label: n.label || n.key, color: n.color, col: ci, x: padL + ci * step, y: y, h: h, v: val(n.key), outC: y, inC: y, last: ci === cols.length - 1, first: ci === 0 };
      nodes[n.key] = o; list.push(o); y += h + gap;
    });
  });
  var order = function (key) { return list.indexOf(nodes[key]); };
  var ls = links.filter(function (l) { return nodes[l.s] && nodes[l.t]; }).map(function (l) { return Object.assign({}, l, { h: l.v * k }); });
  ls.slice().sort(function (a, b) { return order(a.t) - order(b.t); }).forEach(function (l) { l.y0 = nodes[l.s].outC; nodes[l.s].outC += l.h; });
  ls.slice().sort(function (a, b) { return order(a.s) - order(b.s); }).forEach(function (l) { l.y1 = nodes[l.t].inC; nodes[l.t].inC += l.h; });
  ls.forEach(function (l) {
    var x0 = nodes[l.s].x + nodeW, x1 = nodes[l.t].x, xm = (x0 + x1) / 2;
    var a = l.y0, b = l.y0 + l.h, c = l.y1, d = l.y1 + l.h, f = function (n) { return n.toFixed(1); };
    l.d = 'M' + f(x0) + ',' + f(a) + 'C' + f(xm) + ',' + f(a) + ' ' + f(xm) + ',' + f(c) + ' ' + f(x1) + ',' + f(c) + 'L' + f(x1) + ',' + f(d) + 'C' + f(xm) + ',' + f(d) + ' ' + f(xm) + ',' + f(b) + ' ' + f(x0) + ',' + f(b) + 'Z';
  });
  return { nodes: list, links: ls, nodeW: nodeW };
}
// Soft ribbon colors, from the InGenius ramps.
var SK = { navy: '#24285D', indigo: '#4E5496', lav: '#B6BBD9', grey: '#8286A8', green: '#1D7A55', orange: '#F89624', red: '#B3261E' };
function skTint(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }

// ---- Loan retention: where past clients went (example data) ----
// Life events in the middle, outcomes on the right. Numbers are borrowers; avg is the average new loan amount.
var RETAIN = {
  lo: { who: 'Past clients', title: 'Where your past clients went', you: 'Came back to you', avg: 348000,
    cohorts: { a: { label: '2021 to 2023', total: 2400, e: [[1380, 0, 0, 1380], [520, 260, 260, 0], [390, 190, 200, 0], [110, 25, 45, 40]] },
               b: { label: '2024 to 2025', total: 1650, e: [[1260, 0, 0, 1260], [210, 118, 92, 0], [140, 61, 79, 0], [40, 9, 17, 14]] } } },
  exec: { who: 'Past borrowers', title: 'Where your company’s past borrowers went', you: 'Came back to you', avg: 331000,
    cohorts: { a: { label: '2021 to 2023', total: 48600, e: [[27100, 0, 0, 27100], [11300, 6900, 4400, 0], [8000, 3300, 4700, 0], [2200, 300, 1100, 800]] },
               b: { label: '2024 to 2025', total: 33900, e: [[25400, 0, 0, 25400], [4300, 2700, 1600, 0], [3100, 1300, 1800, 0], [1100, 150, 540, 410]] } } },
  ae: { who: 'Borrowers', title: 'Where borrowers from your accounts went', you: 'Came back through your accounts', avg: 362000,
    cohorts: { a: { label: '2021 to 2023', total: 9800, e: [[5900, 0, 0, 5900], [2100, 1050, 1050, 0], [1400, 520, 880, 0], [400, 60, 180, 160]] },
               b: { label: '2024 to 2025', total: 7200, e: [[5600, 0, 0, 5600], [860, 470, 390, 0], [560, 200, 360, 0], [180, 25, 80, 75]] } } }
};
var RETAIN_EVENTS = ['Still in the same home', 'Refinanced', 'Sold and bought again', 'Moved out of area'];
var RETAIN_RIVALS = { lo: ['Rival Mortgage', 'Hill Country Home Loans', 'Online lenders'], exec: ['Rival Mortgage', 'Lone Star Lending', 'Online lenders'], ae: ['Desert Wholesale', 'Online lenders', 'Canyon Mortgage Group'] };
function retainBrief(persona, R, c, measure) {
  var e = c.e, back = e.reduce(function (a, r) { return a + r[1]; }, 0), lost = e.reduce(function (a, r) { return a + r[2]; }, 0);
  var took = back + lost, rate = Math.round(back / (took || 1) * 100);
  var fmt = function (n) { return n.toLocaleString('en-US'); };
  var leak = [1, 2, 3].sort(function (a, b) { return e[b][2] - e[a][2]; })[0];
  var refiRate = Math.round(e[1][1] / (e[1][0] || 1) * 100), saleRate = Math.round(e[2][1] / (e[2][0] || 1) * 100);
  return { title: 'Genie briefing', badge: 'WRITTEN BY GENIE · NUMBERS CHECKED',
    headline: 'You kept ' + rate + '% of ' + R.who.toLowerCase() + ' who took out a new loan, and lost ' + fmt(lost) + ' to other lenders.',
    bullets: [
      fmt(c.total) + ' ' + R.who.toLowerCase() + ' closed in ' + c.label + '. ' + fmt(took) + ' of them have taken out a new loan since.',
      'Refinances came back ' + refiRate + '% of the time. Home sales came back only ' + saleRate + '%.',
      'The biggest leak is ' + RETAIN_EVENTS[leak].toLowerCase() + ': ' + fmt(e[leak][2]) + ' borrowers went to another lender.',
      { lo: 'Set up listing alerts on past clients so you hear about a sale before the agent picks a lender.', exec: 'Give LOs listing alerts on their past borrowers. Home sales are where the company loses the most repeat business.', ae: 'Share listing alerts with your top accounts. Their borrowers who sell are the ones leaving.' }[persona] || ''
    ],
    caveat: 'Example data for this prototype. Production matches past loans to later deed and mortgage records by property and borrower.',
    how: 'Genie followed every borrower who closed in ' + c.label + ', matched each one to later deed and mortgage records, grouped them by what happened to the home, and checked every number above against the table below.' };
}
