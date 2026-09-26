// Seeded random helpers so the sample data is the same on every load.
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dayLabel(i) { var dt = new Date(2026, 7, 27 + i); return MONTHS[dt.getMonth()] + ' ' + dt.getDate(); }
function series(key, max) {
  var seed = { lo: 7, exec: 13, rec: 21, ae: 29 }[key], out = [];
  for (var i = 0; i < 30; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    var r = seed / 233280;
    var wave = Math.sin(i / 4.2 + seed % 3) * 0.25 + 0.55;
    var a = Math.max(1, Math.round((wave * 0.7 + r * 0.45) * (max - 3)));
    var p = i > 19 ? Math.min(3, 1 + Math.round(r * 2)) : (r > 0.7 ? 1 : 0);
    out.push({ a: a, p: Math.min(p, max - a) });
  }
  return out;
}
function initials(name) { var w = name.replace(/[^A-Za-z ]/g, ' ').split(' ').filter(Boolean); return ((w[0] || '')[0] || '') + ((w[1] || '')[0] || ''); }

function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var FIRST = ['Dana', 'Marcus', 'Keisha', 'Tom', 'Grace', 'Luis', 'Priya', 'Sam', 'Lena', 'Omar', 'Rachel', 'Derek', 'Nina', 'Carlos', 'Beth', 'Joy', 'Ana', 'Kevin', 'Maria', 'Jen'];
var LAST = ['Ruiz', 'Webb', 'Grant', 'Alvarez', 'Kim', 'Ortega', 'Shah', 'Ortiz', 'Park', 'Haddad', 'Stein', 'Cole', 'Patel', 'Mendez', 'Carroll', 'Adeyemi', 'Flores', 'Ma', 'Chen', 'Walsh'];
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
function between(r, a, b) { return a + r() * (b - a); }
function rows(n, seed, make) { var r = rng(seed), out = []; for (var i = 0; i < n; i++) out.push(make(r, i)); return out; }
function person(r, i) { return FIRST[(i * 7 + 3) % 20] + ' ' + LAST[(i * 11 + Math.floor(r() * 3)) % 20]; }
