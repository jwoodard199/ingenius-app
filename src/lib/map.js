// Heat map: measures, persona defaults, sample values, fifths and Genie map briefings.
// ---- Heat map: US -> state -> county -> census tract (example values, real boundaries) ----
var METROS = [[-97.74, 30.27], [-95.37, 29.76], [-96.80, 32.78], [-98.49, 29.42], [-97.33, 32.75], [-106.49, 31.76], [-97.40, 27.80], [-101.85, 33.58], [-112.07, 33.45], [-111.83, 33.42], [-110.97, 32.22], [-111.65, 35.20]];
var MAP_METRICS = {
  purchase: { l: 'Purchase loans per 1,000 homes', s: 'purchase loans per 1,000 homes', t: 'num', base: 34, spread: 26, dir: 1 },
  hi100: { l: 'Households $100k+', s: 'households earning $100k+', t: 'pct', base: 36, spread: 22, dir: 1 },
  refi: { l: 'Loans above 7% rate', s: 'loans above a 7% rate', t: 'pct', base: 14, spread: 9, dir: -1 },
  lmi: { l: 'LMI share of loans', s: 'LMI share of loans', t: 'pct', base: 21, spread: 14, dir: -1 },
  share: { l: 'Your market share', s: 'your market share', t: 'pct', base: 4.2, spread: 3.2, dir: 1 },
  lodens: { l: 'LOs per 10,000 homes', s: 'loan officers per 10,000 homes', t: 'num1', base: 6, spread: 5, dir: 1 },
  window: { l: 'LOs in the recruiting window', s: 'LOs in the 3 to 5 year recruiting window', t: 'pct', base: 24, spread: 12, dir: 1 },
  loyalty: { l: 'Your loyalty', s: 'your loyalty', t: 'pct', base: 12, spread: 9, dir: -1 },
  broker: { l: 'Broker share of loans', s: 'broker share of loans', t: 'pct', base: 18, spread: 11, dir: 1 }
};
var MAP_PERSONA = {
  lo: { metrics: ['purchase', 'hi100', 'refi'], start: { st: '48', co: '48453' } },
  exec: { metrics: ['share', 'lmi', 'purchase'], start: { st: '48', co: null } },
  rec: { metrics: ['lodens', 'window', 'purchase'], start: { st: '48', co: '48201' } },
  ae: { metrics: ['loyalty', 'broker', 'purchase'], start: { st: '04', co: '04013' } }
};
var RAMP = ['#E4E6F1', '#B6BBD9', '#8288BA', '#4E5496', '#24285D'];
function hash01(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
function mapValue(mk, reg, level) {
  var m = MAP_METRICS[mk];
  var n = hash01(mk + reg.id) * 2 - 1;
  if (level === 'us') return Math.max(0, m.base + m.spread * 0.45 * n);
  var u = 0;
  METROS.forEach(function (p) { var dx = (reg.c[0] - p[0]) * 0.86, dy = reg.c[1] - p[1]; u = Math.max(u, Math.exp(-(dx * dx + dy * dy) / (level === 'st' ? 0.9 : 0.05))); });
  var v = m.base + m.spread * (m.dir * (u - 0.35) * 1.4 + 0.55 * n);
  return Math.max(m.t === 'pct' ? 0.5 : 0.2, v);
}
function mapFmt(mk, v) { var t = MAP_METRICS[mk].t; return t === 'pct' ? (Math.round(v * 10) / 10) + '%' : t === 'num1' ? (Math.round(v * 10) / 10).toString() : String(Math.round(v)); }
function mapDiff(mk, a, b) { var t = MAP_METRICS[mk].t, d = a - b; return (d >= 0 ? '+' : '−') + (t === 'pct' ? Math.abs(Math.round(d * 10) / 10) + ' pts' : Math.abs(Math.round(d * 10) / 10)); }
function stateName(sid) { var r = IG_GEO.us.r; for (var i = 0; i < r.length; i++) { if (r[i].id === sid) return r[i].n; } return ''; }
function regionOf(frame, id) { if (!frame) return null; for (var i = 0; i < frame.r.length; i++) { if (frame.r[i].id === id) return frame.r[i]; } return null; }
function childNoun(level, n) { var w = level === 'us' ? 'state' : level === 'st' ? 'county' : 'tract'; return n === 1 ? w : (w === 'county' ? 'counties' : w + 's'); }
function avgOf(arr) { return arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0; }

function mapModel(persona, st, co, mk) {
  var level = co && IG_GEO.co[co] ? 'co' : st ? 'st' : 'us';
  var frame = level === 'us' ? IG_GEO.us : level === 'st' ? IG_GEO.st[st] : IG_GEO.co[co];
  var vals = frame.r.map(function (r) { return mapValue(mk, r, level); });
  var sorted = vals.slice().sort(function (a, b) { return a - b; });
  var cuts = [0.2, 0.4, 0.6, 0.8].map(function (p) { return sorted[Math.floor((sorted.length - 1) * p)]; });
  var cls = vals.map(function (v) { var c = 0; while (c < 4 && v > cuts[c]) c++; return c; });
  var name = level === 'us' ? 'United States' : level === 'st' ? stateName(st) : regionOf(IG_GEO.st[st], co).n + ' County';
  var parentName = level === 'us' ? 'the national median' : level === 'st' ? 'the national average' : stateName(st);
  var here = avgOf(vals);
  var parent = level === 'co' ? avgOf(IG_GEO.st[st].r.map(function (r) { return mapValue(mk, r, 'st'); })) : level === 'st' ? avgOf(IG_GEO.us.r.map(function (r) { return mapValue(mk, r, 'us'); })) : here;
  return { level: level, frame: frame, vals: vals, cls: cls, cuts: cuts, sorted: sorted, name: name, parentName: parentName, here: here, parent: parent };
}

function mapBrief(persona, mm, mk) {
  var m = MAP_METRICS[mk], r = mm.frame.r, n = r.length;
  var order = r.map(function (x, i) { return i; }).sort(function (a, b) { return mm.vals[b] - mm.vals[a]; });
  var top = order[0], low = order[order.length - 1];
  var topFifth = order.filter(function (i) { return mm.cls[i] === 4; });
  var sumAll = mm.vals.reduce(function (a, b) { return a + b; }, 0), sumTop = topFifth.reduce(function (a, i) { return a + mm.vals[i]; }, 0);
  var label = function (i) { return mm.level === 'co' ? 'Census Tract ' + r[i].n : mm.level === 'st' ? r[i].n + ' County' : r[i].n; };
  var noun = childNoun(mm.level, 2);
  var above = mm.here >= mm.parent;
  var headline = mm.level === 'us'
    ? label(top) + ' leads the country on ' + m.s + ', with ' + label(low) + ' at the other end.'
    : mm.name + ' runs ' + (above ? 'above ' : 'below ') + mm.parentName + ' on ' + m.s + '.';
  var bullets = [];
  if (mm.level !== 'us') bullets.push(mm.name + ' averages ' + mapFmt(mk, mm.here) + ' across its ' + n + ' ' + noun + ', compared with ' + mapFmt(mk, mm.parent) + ' for ' + mm.parentName + ' (' + mapDiff(mk, mm.here, mm.parent) + ').');
  bullets.push(label(top) + ' is highest at ' + mapFmt(mk, mm.vals[top]) + '. ' + label(low) + ' is lowest at ' + mapFmt(mk, mm.vals[low]) + '.');
  var lowFifth = order.filter(function (i) { return mm.cls[i] === 0; });
  var avgIdx = function (ix) { return avgOf(ix.map(function (i) { return mm.vals[i]; })); };
  bullets.push(topFifth.length + ' ' + childNoun(mm.level, topFifth.length) + ' make the top fifth at ' + mapFmt(mk, mm.cuts[3]) + ' and up. They average ' + mapFmt(mk, avgIdx(topFifth)) + ', against ' + mapFmt(mk, avgIdx(lowFifth)) + ' for the bottom fifth.');
  var act = {
    lo: 'Start agent outreach in the top-fifth ' + noun + '. Pin any tract on the map to see all three measures for it.',
    exec: 'Compare branch coverage with the top-fifth ' + noun + '. Gaps there are the fastest share to win back.',
    rec: 'Recruiters should start with LOs based in the top-fifth ' + noun + ', where producers cluster.',
    ae: 'Prioritize broker shops in the top-fifth ' + noun + ' where your loyalty trails the area average.'
  }[persona];
  bullets.push(act);
  return { title: 'Genie briefing', badge: 'WRITTEN BY GENIE · NUMBERS CHECKED', headline: headline, bullets: bullets,
    caveat: 'Boundaries are 2010 Census tracts. Values are example data for this prototype; production uses ACS 5-year estimates and HMDA filings, refreshed each year.',
    how: 'Genie read all ' + n + ' ' + noun + ' in ' + mm.name + ' for ' + m.s + ', ranked them into fifths, compared the area with ' + mm.parentName + ', and checked each number above against the map data before writing.' };
}

function tableBrief(persona, rep, data, cols) {
  var first = cols[0];
  var bar = cols.filter(function (c) { return c.bar; })[0] || cols[1];
  var trend = cols.filter(function (c) { return c.t === 'trend'; })[0];
  var sorted = data.slice().sort(function (a, b) { return b[bar.k] - a[bar.k]; });
  var bullets = [];
  if (!data.length) return { title: 'Genie briefing', badge: 'WRITTEN BY GENIE · NUMBERS CHECKED', headline: 'No rows match your filters, so there is nothing to brief yet.', bullets: ['Clear a filter or let Genie loosen them, then ask again.'], caveat: '', how: 'Genie checked the current filters and found zero matching rows.' };
  var total = data.reduce(function (a, r) { return a + r[bar.k]; }, 0);
  var topShare = Math.round(sorted.slice(0, Math.min(3, sorted.length)).reduce(function (a, r) { return a + r[bar.k]; }, 0) / (total || 1) * 100);
  bullets.push(data.length + ' of ' + rep.data.length + ' rows match your current view.');
  bullets.push(sorted[0][first.k] + ' leads on ' + bar.l.toLowerCase() + ' with ' + fmtCell(bar, sorted[0][bar.k]) + '. The top 3 make up ' + topShare + '% of the total.');
  if (trend) {
    var up = data.filter(function (r) { return r[trend.k] > 0; }).length;
    var drop = data.slice().sort(function (a, b) { return a[trend.k] - b[trend.k]; })[0];
    bullets.push(up + ' of ' + data.length + ' are trending up. The steepest drop is ' + drop[first.k] + ' at ' + fmtCell(trend, drop[trend.k]) + '.');
  }
  if (rep.ai && rep.ai[0]) bullets.push('Next step: try “' + rep.ai[0].q + '” to narrow this to the rows worth acting on.');
  return { title: 'Genie briefing', badge: 'WRITTEN BY GENIE · NUMBERS CHECKED', headline: rep.label + ': ' + sorted[0][first.k] + ' stands out, and ' + (trend ? 'momentum is ' + (data.filter(function (r) { return r[trend.k] > 0; }).length * 2 >= data.length ? 'mostly positive.' : 'mostly negative.') : 'the rest trail well behind.'),
    bullets: bullets, caveat: 'Figures are example data for this prototype, covering the last 12 months in your territory.',
    how: 'Genie read the ' + data.length + ' rows in your current view, ranked them by ' + bar.l.toLowerCase() + (trend ? ', counted who is trending up' : '') + ', and checked each number above against the table.' };
}

// Sample lenders, brokers and loan officers for any area on the heat map (seeded by the area, so it is stable).
var MAP_LENDERS = {
  tx: [['Your company', 'Retail'], ['Rival Mortgage', 'Retail'], ['Lone Star Lending', 'Retail'], ['Hill Country Home Loans', 'Retail'], ['Gulf Coast Lending', 'Retail'], ['Bayou Home Loans', 'Retail'],
    ['Prime Street Mortgage', 'Retail'], ['Summit Lending', 'Correspondent'], ['Texas Star Bank', 'Bank'], ['Alamo Credit Union', 'Credit union'], ['Heartland Mortgage Brokers', 'Broker'], ['Riverwalk Home Loans', 'Broker'], ['Pecan Street Lending', 'Broker']],
  az: [['Summit Home Loans', 'Retail'], ['Canyon Mortgage Group', 'Broker'], ['Crestline Lending', 'Retail'], ['Mesa Home Funding', 'Broker'], ['Red Rock Lending', 'Broker'], ['Desert Sky Mortgage', 'Retail'],
    ['Valley Lending Partners', 'Broker'], ['Copper State Mortgage', 'Correspondent'], ['Saguaro Home Loans', 'Broker'], ['Sonoran Lending', 'Retail'], ['Pinnacle Peak Loans', 'Broker'], ['Grand Canyon Bank', 'Bank']]
};
var MAP_TABLE_CACHE = {};
function mapTables(persona, level, id, kind, yourShare) {
  var key = persona + '|' + kind + '|' + id + '|' + yourShare;
  if (MAP_TABLE_CACHE[key]) return MAP_TABLE_CACHE[key];
  var h = 7; for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100003;
  var r = rng(h), pool = MAP_LENDERS[persona === 'ae' ? 'az' : 'tx'];
  var total = { us: 3200000, st: 90000, co: 6000, tract: 140 }[kind] * between(r, 0.7, 1.3);
  var avgLoan = between(r, 290000, 390000);
  var w = pool.map(function (p, i) { return (i < 3 ? 2.2 : 1) * between(r, 0.4, 1.6); });
  var sum = w.reduce(function (a, b) { return a + b; }, 0);
  var shares = w.map(function (x) { return x / sum * 78; });
  if (persona !== 'ae') { var yi = 0, want = yourShare != null ? yourShare : shares[0]; var rest = shares.slice(1).reduce(function (a, b) { return a + b; }, 0); shares = shares.map(function (x, i) { return i === yi ? want : x / rest * (78 - want); }); }
  var lenders = pool.map(function (p, i) {
    var loans = Math.max(1, Math.round(total * shares[i] / 100));
    return { name: p[0], channel: p[1], loans: loans, volume: loans * avgLoan * between(r, 0.85, 1.15), share: Math.round(shares[i] * 10) / 10,
      purchase: Math.round(between(r, 45, 82) * 10) / 10, los: Math.max(1, Math.round(loans / between(r, 18, 40))), yoy: Math.round(between(r, -32, 44)) };
  });
  var nLo = kind === 'tract' ? 12 : 30, los = [];
  for (var j = 0; j < nLo; j++) {
    var li = Math.floor(Math.pow(r(), 1.4) * lenders.length), L = lenders[li];
    var ten = Math.round(between(r, 0.6, 14) * 10) / 10, loans = Math.max(1, Math.round(L.loans / Math.max(1, L.los) * between(r, 0.4, 2.4)));
    los.push({ name: person(r, j + h % 17), lender: L.name, loans: loans, volume: loans * avgLoan * between(r, 0.8, 1.2), purchase: Math.round(between(r, 35, 90) * 10) / 10,
      tenure: ten, window: ten >= 3 && ten <= 5 ? 'Yes' : 'No', yoy: Math.round(between(r, -45, 55)) });
  }
  MAP_TABLE_CACHE[key] = { lenders: lenders, los: los };
  return MAP_TABLE_CACHE[key];
}
