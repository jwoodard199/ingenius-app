// Formatting, filter operators and per-report dashboard config.
var OPS = { '>=': '≥', '<=': '≤', '>': '>', '<': '<', 'is': 'is' };
function fmtCell(c, v) {
  if (c.t === 'text') return String(v);
  if (c.t === 'num') return Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (c.t === 'money') return v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : '$' + Math.round(v / 1e3) + 'K';
  if (c.t === 'pct') return (Math.round(v * 10) / 10) + '%';
  if (c.t === 'pts') return (v > 0 ? '+' : '') + v.toFixed(1) + ' pts';
  if (c.t === 'yrs') return v.toFixed(1) + ' yrs';
  if (c.t === 'days') return Math.round(v) + ' days';
  if (c.t === 'dec') return (Math.round(v * 10) / 10).toFixed(1);
  if (c.t === 'trend') return (v > 0 ? '↑ ' : v < 0 ? '↓ ' : '') + Math.abs(v) + c.u;
  return String(v);
}
function fmtVal(c, v) { return c.t === 'text' ? '“' + v + '”' : fmtCell(c, v).replace(/^[↑↓] /, v < 0 ? '-' : ''); }
// Words Genie ignores when matching a question to a report.
var GENIE_STOP = ['the', 'and', 'for', 'with', 'who', 'what', 'which', 'that', 'this', 'are', 'have', 'show', 'all', 'from', 'how', 'many', 'list', 'find', 'give', 'our', 'your', 'you', 'did', 'does', 'any', 'but', 'was', 'were', 'has', 'had', 'can', 'build', 'make', 'report', 'want', 'see', 'get', 'please', 'into', 'about', 'them', 'they', 'most', 'more'];
function test(row, f) {
  var x = row[f.c];
  if (f.o === 'is' || f.o === 'not') {
    var vs = Array.isArray(f.v) ? f.v : [f.v];
    if (!vs.length) return true;
    return f.o === 'is' ? vs.indexOf(x) >= 0 : vs.indexOf(x) < 0;
  }
  if (f.o === '>=') return x >= f.v;
  if (f.o === '<=') return x <= f.v;
  if (f.o === '>') return x > f.v;
  if (f.o === '<') return x < f.v;
  return true;
}
function lc(t) { return /^[A-Z]{2,}/.test(t) ? t : t.toLowerCase(); }
function distinct(data, k) { var seen = []; data.forEach(function (r) { if (seen.indexOf(r[k]) < 0) seen.push(r[k]); }); return seen.slice(0, 10); }
function opLabel(c, f) { return f.o === 'not' ? 'is not' : f.o === 'is' ? '' : OPS[f.o]; }
function valLabel(c, f) {
  if (c.t !== 'text') return fmtVal(c, f.v);
  var vs = Array.isArray(f.v) ? f.v : [f.v];
  if (!vs.length) return 'Any';
  return vs.length > 2 ? vs.slice(0, 2).join(', ') + ' +' + (vs.length - 2) : vs.join(', ');
}
var RCFG = {
  flow: { noun: 'Moves', short: 'Movement', kpis: [], chart: { kind: 'group', by: 'n' } },
  retain: { noun: 'Paths', short: 'Retention', kpis: [], chart: { kind: 'group', by: 'n' } },
  map: { noun: 'Areas', short: 'Map', kpis: [], chart: { kind: 'group', by: 'n' } },
  agents: { noun: 'Agents', short: 'Agents', kpis: ['deals', 'volume', 'yoy'], chart: { kind: 'group', by: 'brokerage', m: 'deals' } },
  clients: { noun: 'Clients', short: 'Past clients', kpis: ['balance', 'gap', 'days'], chart: { kind: 'group', by: 'status' } },
  zips: { noun: 'ZIPs', short: 'ZIPs', kpis: ['units', 'volume', 'yoy'], chart: { kind: 'change', m: 'yoy' } },
  los: { noun: 'Loan officers', short: 'LOs', kpis: ['units', 'volume', 'yoy'], chart: { kind: 'group', by: 'signal' } },
  markets: { noun: 'Markets', short: 'Share', kpis: ['units', 'share', 'change'], chart: { kind: 'change', m: 'change' } },
  fair: { noun: 'Branches', short: 'Fair lending', kpis: ['orig', 'lmi', 'mmct'], chart: { kind: 'change', m: 'gap' } },
  targets: { noun: 'Loan officers', short: 'Targets', kpis: ['units', 'volume', 'yoy'], chart: { kind: 'group', by: 'signal' } },
  branches: { noun: 'Branches', short: 'Branches', kpis: ['los', 'units', 'yoy'], chart: { kind: 'change', m: 'yoy' } },
  accounts: { noun: 'Accounts', short: 'Loyalty', kpis: ['loans', 'loyalty', 'change'], chart: { kind: 'change', m: 'change' } },
  moves: { noun: 'Moves', short: 'LO moves', kpis: ['sent'], chart: { kind: 'group', by: 'to', m: 'sent', title: 'Loans sent to you, by new company' } }
};
function filterOptions(c, data) {
  var vals = data.map(function (r) { return r[c.k]; });
  if (c.t === 'text') {
    var seen = [];
    vals.forEach(function (v) { if (seen.indexOf(v) < 0) seen.push(v); });
    return seen.slice(0, 8).map(function (v) { return { o: 'is', v: v }; });
  }
  if (c.t === 'trend') return [{ o: '>', v: 0 }, { o: '<', v: 0 }, { o: '>=', v: 10 }];
  var s = vals.slice().sort(function (a, b) { return a - b; });
  var q = function (p) { var v = s[Math.floor((s.length - 1) * p)]; return c.t === 'money' ? Math.round(v / 1e5) * 1e5 : (c.t === 'num' || c.t === 'days' ? Math.round(v) : Math.round(v * 10) / 10); };
  return [{ o: '>=', v: q(0.5) }, { o: '>=', v: q(0.75) }, { o: '<=', v: q(0.25) }];
}
