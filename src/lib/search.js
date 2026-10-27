// Global search: match a query across the directory, scoped to the persona's territory.
// quickSearch returns only a few rows per category plus each category's total, so the header dropdown stays fast;
// advancedSearch pages through one category with its own filters and sorts.
var SEARCH_QUICK = 3;      // rows per category in the header dropdown
var SEARCH_QUICK_ONE = 6;  // rows when the dropdown is toggled to one category
var SEARCH_PAGE = 20;      // rows per page on the advanced search page

function fmtShort(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + n;
}
function searchCat(id) { for (var i = 0; i < SEARCH_CATS.length; i++) if (SEARCH_CATS[i].id === id) return SEARCH_CATS[i]; return SEARCH_CATS[0]; }
function searchScope(persona) { return SEARCH_SCOPE[persona] || SEARCH_SCOPE.lo; }
function inScope(x, markets) { return x.markets ? x.markets.some(function (m) { return markets.indexOf(m) >= 0; }) : markets.indexOf(x.market) >= 0; }
function searchTokens(q) { return String(q || '').toLowerCase().replace(/[^a-z0-9#$/&’' ]/g, ' ').split(/\s+/).filter(Boolean); }

// Score one record: every word must match somewhere. Name matches outrank other fields, and word starts outrank the middle of a word.
function searchScore(x, cat, toks) {
  if (!toks.length) return 1;
  var name = x.name.toLowerCase(), other = cat.fields.slice(1).map(function (f) { return String(x[f] == null ? '' : x[f]).toLowerCase(); }).join(' ');
  var total = 0;
  for (var i = 0; i < toks.length; i++) {
    var t = toks[i], s = 0;
    if (name.indexOf(t) === 0) s = 6;
    else if ((' ' + name).indexOf(' ' + t) >= 0) s = 5;
    else if (name.indexOf(t) > 0) s = 3;
    else if ((' ' + other).indexOf(' ' + t) >= 0) s = 2;
    else if (t.length > 2 && other.indexOf(t) >= 0) s = 1;
    if (!s) return 0;
    total += s;
  }
  return total;
}
function searchMatches(persona, catId, q) {
  var cat = searchCat(catId), markets = searchScope(persona), toks = searchTokens(q), out = [];
  for (var i = 0; i < DIRECTORY.length; i++) {
    var x = DIRECTORY[i];
    if (x.cat !== catId || !inScope(x, markets)) continue;
    var sc = searchScore(x, cat, toks);
    if (sc) out.push({ x: x, s: sc });
  }
  // Best match first; ties go to the bigger producer (units, deals, closings or price).
  out.sort(function (a, b) { return b.s - a.s || (b.x[cat.weight] || 0) - (a.x[cat.weight] || 0); });
  return out.map(function (m) { return m.x; });
}
// Header dropdown: a few rows per category, plus the total so "See all" can say how many.
function quickSearch(persona, q, only) {
  var cats = only ? [searchCat(only)] : SEARCH_CATS, lim = only ? SEARCH_QUICK_ONE : SEARCH_QUICK;
  return cats.map(function (c) { var all = searchMatches(persona, c.id, q); return { cat: c, total: all.length, rows: all.slice(0, lim) }; });
}
function searchTest(x, f, v) {
  if (f.t === 'min') return v == null || (x[f.k] || 0) >= v;
  if (!v || !v.length) return true;
  var have = x[f.k];
  return Array.isArray(have) ? have.some(function (h) { return v.indexOf(h) >= 0; }) : v.indexOf(have) >= 0;
}
// Advanced page: one category, its filters, a sort, and paging.
function advancedSearch(persona, catId, q, filters, sortId, limit) {
  var cat = searchCat(catId), rows = searchMatches(persona, catId, q);
  rows = rows.filter(function (x) { return cat.filters.every(function (f) { return searchTest(x, f, filters ? filters[f.k] : null); }); });
  var so = cat.sorts.filter(function (o) { return (o.id || o.k) === sortId; })[0];
  if (so) rows = rows.slice().sort(function (a, b) { var av = a[so.k], bv = b[so.k]; if (av == null || bv == null) return (av == null) - (bv == null); var c = typeof av === 'string' ? av.localeCompare(bv) : av - bv; return so.dir === 'desc' ? -c : c; });
  return { total: rows.length, rows: rows.slice(0, limit || SEARCH_PAGE) };
}
// Choices for a "pick" filter: its fixed options, or the values found in the persona's territory.
function searchOptions(persona, cat, f) {
  if (f.opts) return f.opts;
  var markets = searchScope(persona), seen = {}, out = [];
  DIRECTORY.forEach(function (x) {
    if (x.cat !== cat.id || !inScope(x, markets)) return;
    [].concat(x[f.k]).forEach(function (v) { if (!seen[v] && (f.k !== 'markets' || markets.indexOf(v) >= 0)) { seen[v] = true; out.push(v); } });
  });
  return out.sort();
}
function searchFmt(v, f) {
  if (v == null || v === '') return '–';
  if (f === 'money') return fmtShort(v);
  if (f === 'num') return typeof v === 'number' ? v.toLocaleString('en-US') : v;
  if (f === 'yrs') return v + ' yrs';
  if (f === 'pct') return (v > 0 ? '+' : '') + v + '%';
  if (f === 'pctv') return v + '%';
  if (f === 'pts') return (v > 0 ? '+' : '') + v + ' pts';
  return String(v);
}
var SEARCH_TONE = { 'Likely leaving': 'danger', 'Heavily recruited': 'accent', 'In window': 'accent', 'Gaining share': 'success', 'Losing share': 'danger', 'Works with you': 'success', 'For sale': 'success', 'Pending': 'accent', 'Sold': 'neutral', 'Off market': 'neutral' };
