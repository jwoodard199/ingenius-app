// LO movement: sample moves, Sankey layout and Genie movement briefings.
// ---- LO movement: who moved between companies (example data) ----
var FLOW_ORGS = {
  tx: ['Your company', 'Rival Mortgage', 'Lone Star Lending', 'Hill Country Home Loans', 'Gulf Coast Lending', 'Bayou Home Loans', 'Independents'],
  az: ['Summit Home Loans', 'Canyon Mortgage Group', 'Crestline Lending', 'Mesa Home Funding', 'Red Rock Lending', 'Desert Sky Mortgage', 'Other lenders']
};
var FLOW_MONTHS = ['Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026', 'Dec 2025', 'Nov 2025', 'Oct 2025'];
var FLOW_CACHE = {};
function flowMoves(persona) {
  if (FLOW_CACHE[persona]) return FLOW_CACHE[persona];
  var az = persona === 'ae', orgs = FLOW_ORGS[az ? 'az' : 'tx'];
  // Pull toward a few realistic patterns: two rivals hiring hard, one company bleeding people.
  var pullTo = az ? [2, 3, 2, 0] : [1, 2, 1, 0, 4];
  var pushFrom = az ? [0, 5, 1, 4] : [3, 5, 0, 6, 2];
  var r = rng(persona === 'ae' ? 911 : persona === 'rec' ? 707 : persona === 'exec' ? 505 : 303);
  var out = [];
  for (var i = 0; i < 64; i++) {
    var f = r() < 0.6 ? pushFrom[Math.floor(r() * pushFrom.length)] : Math.floor(r() * orgs.length);
    var t = r() < 0.6 ? pullTo[Math.floor(r() * pullTo.length)] : Math.floor(r() * orgs.length);
    if (t === f) t = (t + 1 + Math.floor(r() * (orgs.length - 1))) % orgs.length;
    var ten = Math.round(between(r, 8, 90)) / 10;
    out.push({ name: person(r, i + 4), from: orgs[f], to: orgs[t], m: Math.floor(r() * 12), units: Math.round(between(r, 12, 96)), tenure: ten, window: ten >= 3 && ten <= 5 ? 'Yes' : 'No' });
  }
  FLOW_CACHE[persona] = out;
  return out;
}
function flowLayout(moves, measure, W, H, labelW, nodeW) {
  var w = function (mv) { return measure === 'units' ? mv.units : 1; };
  var outT = {}, inT = {}, pair = {}, total = 0;
  moves.forEach(function (mv) {
    var v = w(mv); total += v;
    outT[mv.from] = (outT[mv.from] || 0) + v; inT[mv.to] = (inT[mv.to] || 0) + v;
    var k = mv.from + '→' + mv.to; if (!pair[k]) pair[k] = { from: mv.from, to: mv.to, v: 0, n: 0, units: 0 }; pair[k].v += v; pair[k].n++; pair[k].units += mv.units;
  });
  var left = Object.keys(outT).sort(function (a, b) { return outT[b] - outT[a]; });
  var right = Object.keys(inT).sort(function (a, b) { return inT[b] - inT[a]; });
  var gap = 10;
  var k = total ? (H - gap * (Math.max(left.length, right.length) - 1)) / total : 0;
  var place = function (keys, tot, x) { var y = 0, res = {}; keys.forEach(function (key) { var h = tot[key] * k; res[key] = { key: key, x: x, y: y, h: h, v: tot[key], cursor: y }; y += h + gap; }); return res; };
  var L = place(left, outT, labelW), R = place(right, inT, W - labelW - nodeW);
  var links = Object.keys(pair).map(function (key) { return pair[key]; });
  links.sort(function (a, b) { return right.indexOf(a.to) - right.indexOf(b.to); });
  links.forEach(function (l) { l.h = l.v * k; l.y0 = L[l.from].cursor; L[l.from].cursor += l.h; });
  links.sort(function (a, b) { return left.indexOf(a.from) - left.indexOf(b.from); });
  links.forEach(function (l) { l.y1 = R[l.to].cursor; R[l.to].cursor += l.h; });
  var x0 = labelW + nodeW, x1 = W - labelW - nodeW, xm = (x0 + x1) / 2;
  links.forEach(function (l) {
    var a = l.y0, b = l.y0 + l.h, c = l.y1, d = l.y1 + l.h;
    l.d = 'M' + x0 + ',' + a.toFixed(1) + 'C' + xm + ',' + a.toFixed(1) + ' ' + xm + ',' + c.toFixed(1) + ' ' + x1 + ',' + c.toFixed(1) + 'L' + x1 + ',' + d.toFixed(1) + 'C' + xm + ',' + d.toFixed(1) + ' ' + xm + ',' + b.toFixed(1) + ' ' + x0 + ',' + b.toFixed(1) + 'Z';
  });
  return { left: left.map(function (key) { return L[key]; }), right: right.map(function (key) { return R[key]; }), links: links, total: total, outT: outT, inT: inT };
}
function flowNet(moves) { var net = {}; moves.forEach(function (mv) { net[mv.to] = (net[mv.to] || 0) + 1; net[mv.from] = (net[mv.from] || 0) - 1; }); return net; }
function flowBrief(persona, moves, home, periodText) {
  var net = flowNet(moves), orgs = Object.keys(net).sort(function (a, b) { return net[b] - net[a]; });
  var win = orgs[0], lose = orgs[orgs.length - 1];
  var units = moves.reduce(function (a, m) { return a + m.units; }, 0);
  var pairs = {}; moves.forEach(function (m) { var k = m.from + ' to ' + m.to; pairs[k] = (pairs[k] || 0) + 1; });
  var bigPair = Object.keys(pairs).sort(function (a, b) { return pairs[b] - pairs[a]; })[0];
  var inWin = moves.filter(function (m) { return m.window === 'Yes'; }).length;
  var sign = function (n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); };
  var bullets = [moves.length + ' loan officers changed companies ' + periodText + ', taking ' + units.toLocaleString('en-US') + ' units of annual production with them.'];
  if (home) {
    var ins = moves.filter(function (m) { return m.to === home; }), outs = moves.filter(function (m) { return m.from === home; });
    var topDest = {}; outs.forEach(function (m) { topDest[m.to] = (topDest[m.to] || 0) + 1; });
    var dest = Object.keys(topDest).sort(function (a, b) { return topDest[b] - topDest[a]; })[0];
    bullets.push('Your company hired ' + ins.length + ' and lost ' + outs.length + ' (net ' + sign(ins.length - outs.length) + ')' + (dest ? '. Most departures went to ' + dest + ' (' + topDest[dest] + ').' : '.'));
  }
  bullets.push('The busiest route was ' + bigPair + ', with ' + pairs[bigPair] + ' moves.');
  bullets.push(inWin + ' of the ' + moves.length + ' movers (' + Math.round(inWin / (moves.length || 1) * 100) + '%) were 3 to 5 years into their last job, which is the recruiting window.');
  bullets.push({
    lo: 'Watch referral partners tied to LOs who just moved. Their agents are open to a new lender for a few months.',
    exec: 'Check in with your own LOs in the recruiting window at branches that lost people to ' + win + '.',
    rec: lose + ' is losing people fastest. Its LOs in the recruiting window are your best targets.',
    ae: 'Reach out to LOs who landed at ' + win + ' while they choose which wholesale partners to use.'
  }[persona]);
  return { title: 'Genie briefing', badge: 'WRITTEN BY GENIE · NUMBERS CHECKED',
    headline: win + ' gained the most people (' + sign(net[win]) + ') and ' + lose + ' lost the most (' + sign(net[lose]) + ').',
    bullets: bullets,
    caveat: 'Example data for this prototype. Production tracks moves through NMLS license changes, confirmed against loan-level HMDA filings.',
    how: 'Genie counted each loan officer whose NMLS company changed ' + periodText + ', netted hires against departures for every company, found the busiest routes, and checked each number above against the moves table.' };
}
