// Sample directory for global search: loan officers, lenders, real estate agents, offices, title agencies and properties.
// Every record has an id, a category (cat), a display name and a market, so search can scope it to the persona's territory.
// Swap DIRECTORY for API calls that take (query, category, territory, limit) and return rows plus a total count.
var SEARCH_MARKETS = {
  Austin: { st: 'TX', zips: ['78704', '78745', '78702', '78749', '78731', '78751', '78757'], hoods: ['Barton Hills', 'South Lamar', 'East Cesar Chavez', 'Circle C', 'Tarrytown', 'Hyde Park', 'Allandale'] },
  Houston: { st: 'TX', zips: ['77007', '77008', '77019', '77024', '77056', '77494', '77479'], hoods: ['Rice Military', 'Heights', 'River Oaks', 'Memorial', 'Galleria', 'Katy', 'Sugar Land'] },
  Dallas: { st: 'TX', zips: ['75201', '75204', '75206', '75214', '75219', '75225', '75230'], hoods: ['Downtown', 'Uptown', 'Lower Greenville', 'Lakewood', 'Oak Lawn', 'Preston Hollow', 'North Dallas'] },
  'San Antonio': { st: 'TX', zips: ['78209', '78210', '78212', '78216', '78230', '78249', '78258'], hoods: ['Alamo Heights', 'Southtown', 'Monte Vista', 'Castle Hills', 'Medical Center', 'Helotes', 'Stone Oak'] },
  'Fort Worth': { st: 'TX', zips: ['76102', '76104', '76107', '76109', '76116', '76132', '76244'], hoods: ['Downtown', 'Fairmount', 'Cultural District', 'TCU', 'Ridglea', 'Wedgwood', 'Keller'] },
  Phoenix: { st: 'AZ', zips: ['85004', '85012', '85016', '85018', '85020', '85028', '85032'], hoods: ['Roosevelt Row', 'Midtown', 'Biltmore', 'Arcadia', 'Sunnyslope', 'Paradise Valley', 'Desert Ridge'] },
  Scottsdale: { st: 'AZ', zips: ['85250', '85251', '85254', '85255', '85257', '85258', '85260'], hoods: ['McCormick Ranch', 'Old Town', 'Kierland', 'DC Ranch', 'South Scottsdale', 'Gainey Ranch', 'Grayhawk'] },
  Mesa: { st: 'AZ', zips: ['85201', '85203', '85204', '85205', '85206', '85207', '85213'], hoods: ['Downtown Mesa', 'Dobson Ranch', 'Fiesta', 'Red Mountain', 'Superstition Springs', 'Las Sendas', 'Lehi'] },
  Chandler: { st: 'AZ', zips: ['85224', '85225', '85226', '85248', '85249', '85286', '85044'], hoods: ['Downtown Chandler', 'Ocotillo', 'West Chandler', 'Sun Lakes', 'Fulton Ranch', 'Cooper Commons', 'Ahwatukee'] }
};
// Each persona's territory, by market. Search, like every other screen, only returns what's inside it.
var SEARCH_SCOPE = {
  lo: ['Austin'],
  exec: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth'],
  rec: ['Houston'],
  ae: ['Phoenix', 'Scottsdale', 'Mesa', 'Chandler']
};

var DIRECTORY = (function () {
  var r = rng(907), out = [];
  var FN = ['Dana', 'Marcus', 'Keisha', 'Tom', 'Grace', 'Luis', 'Priya', 'Sam', 'Lena', 'Omar', 'Rachel', 'Derek', 'Nina', 'Carlos', 'Beth', 'Joy', 'Ana', 'Kevin', 'Maria', 'Jen', 'Hector', 'Tasha', 'Ben', 'Mei', 'Jamal', 'Erin', 'Victor', 'Holly', 'Raj', 'Paige', 'Andre', 'Sofia'];
  var LN = ['Ruiz', 'Webb', 'Grant', 'Alvarez', 'Kim', 'Ortega', 'Shah', 'Ortiz', 'Park', 'Haddad', 'Stein', 'Cole', 'Patel', 'Mendez', 'Carroll', 'Adeyemi', 'Flores', 'Ma', 'Chen', 'Walsh', 'Nguyen', 'Brooks', 'Reyes', 'Singh', 'Foster', 'Lopez', 'Hart', 'Ito', 'Morales', 'Bishop', 'Vance'];
  var used = {};
  function name(seed) {
    for (var k = 0; k < 40; k++) { var n = FN[(seed * 7 + k * 5) % FN.length] + ' ' + LN[(seed * 11 + k * 3 + Math.floor(r() * 4)) % LN.length]; if (!used[n]) { used[n] = true; return n; } }
    return FN[seed % FN.length] + ' ' + LN[(seed * 3) % LN.length] + ' Jr.';
  }
  function money(x) { return Math.round(x / 1000) * 1000; }
  var LENDERS = {
    TX: [['Your company', 'Retail lender'], ['Rival Mortgage', 'Retail lender'], ['Lone Star Lending', 'Retail lender'], ['Hill Country Home Loans', 'Retail lender'], ['Gulf Coast Lending', 'Retail lender'], ['Bayou Home Loans', 'Retail lender'],
      ['Lakeside Mortgage', 'Retail lender'], ['First Harbor Lending', 'Retail lender'], ['Alamo Home Loans', 'Retail lender'], ['Texas Star Bank', 'Bank'], ['Alamo Credit Union', 'Credit union'], ['Heartland Mortgage Brokers', 'Broker shop'], ['Riverwalk Home Loans', 'Broker shop'], ['Pecan Street Lending', 'Broker shop'], ['Lone Star Wholesale', 'Wholesale lender']],
    AZ: [['Summit Home Loans', 'Retail lender'], ['Canyon Mortgage Group', 'Broker shop'], ['Crestline Lending', 'Retail lender'], ['Mesa Home Funding', 'Broker shop'], ['Red Rock Lending', 'Broker shop'], ['Desert Sky Mortgage', 'Retail lender'],
      ['Valley Lending Partners', 'Broker shop'], ['Copper State Mortgage', 'Wholesale lender'], ['Saguaro Home Loans', 'Broker shop'], ['Sonoran Lending', 'Retail lender'], ['Pinnacle Peak Loans', 'Broker shop'], ['Grand Canyon Bank', 'Bank'], ['Desert Wholesale', 'Wholesale lender']]
  };
  var BRANDS = { TX: ['Compass', 'eXp Realty', 'Keller Williams', 'Coldwell Banker', 'RE/MAX', 'Realty Austin', 'Moreland Properties'], AZ: ['Compass', 'eXp Realty', 'Keller Williams', 'Coldwell Banker', 'RE/MAX', 'Russ Lyon Sotheby’s', 'HomeSmart'] };
  var TITLES = {
    Austin: ['Bluebonnet Title', 'Pecan Street Title', 'Capitol Escrow & Title'], Houston: ['Bayou City Title', 'Gulf Title Partners', 'Galleria Escrow'],
    Dallas: ['Trinity Escrow', 'Uptown Title Group', 'Lakewood Title'], 'San Antonio': ['Riverwalk Title', 'Mission Title & Escrow', 'Stone Oak Title'],
    'Fort Worth': ['Cowtown Title', 'Sundance Escrow', 'Fairmount Title'], Phoenix: ['Saguaro Title & Escrow', 'Camelback Escrow', 'Biltmore Title'],
    Scottsdale: ['Sonoran Title', 'Old Town Escrow'], Mesa: ['Superstition Title', 'Red Mountain Escrow'], Chandler: ['Ocotillo Title', 'Price Corridor Escrow']
  };
  var STREETS = ['Oak', 'Cedar', 'Maple', 'Willow', 'Pecan', 'Mesquite', 'Juniper', 'Magnolia', 'Laurel', 'Sycamore', 'Elm', 'Aspen', 'Hackberry', 'Ironwood', 'Palo Verde', 'Agave'];
  var SUFFIX = ['St', 'Ave', 'Dr', 'Ln', 'Ct', 'Way', 'Trl', 'Blvd'];
  // People and companies other screens already show, so search finds the same names.
  var KNOWN = {
    agent: { Austin: [['Dana Ruiz', 'Compass'], ['Marcus Webb', 'eXp Realty'], ['Keisha Grant', 'Keller Williams'], ['Tom Alvarez', 'Realty Austin'], ['Grace Kim', 'Moreland Properties'], ['Sam Ortiz', 'Keller Williams'], ['Lena Park', 'Compass']] },
    lo: { Houston: [['Tom Reyes', 'Rival Mortgage', 4.0, 62, -30], ['Ana Flores', 'Gulf Coast Lending', 3.0, 48, 41], ['Maria Chen', 'Your company', 4.1, 40, -45]], Austin: [['R. Singh', 'Your company', 4.6, 38, -22]], Dallas: [['D. Brooks', 'Your company', 3.2, 57, 38]],
      Phoenix: [['Jen Alvarez', 'Crestline Lending', 5.2, 44, 6]], Scottsdale: [['Ken Ito', 'Summit Home Loans', 2.6, 51, 18]], Mesa: [['Paul Ricci', 'Mesa Home Funding', 3.8, 29, -12]], Chandler: [['Ava Brooks', 'Red Rock Lending', 1.9, 22, 9]] }
  };
  var seq = 0;
  function add(cat, rec) { rec.id = cat + (++seq); rec.cat = cat; out.push(rec); return rec; }
  var lenderRecs = {};
  ['TX', 'AZ'].forEach(function (st) {
    var mk = Object.keys(SEARCH_MARKETS).filter(function (m) { return SEARCH_MARKETS[m].st === st; });
    LENDERS[st].forEach(function (L, i) {
      var markets = i < 3 || L[1] === 'Wholesale lender' ? mk.slice() : mk.filter(function () { return r() > 0.45; });
      if (!markets.length) markets = [mk[i % mk.length]];
      var los = L[1] === 'Wholesale lender' ? Math.round(between(r, 6, 14)) : Math.round(between(r, 8, 140));
      var units = Math.round(los * between(r, 18, 34)), change = Math.round(between(r, -18, 18)) / 10;
      lenderRecs[L[0]] = add('lender', { name: L[0], type: L[1], markets: markets, market: markets[0], hq: markets[0] + ', ' + st, los: los, units: units, volume: money(units * between(r, 290000, 420000)),
        share: Math.round(between(r, 6, 58)) / 10, change: change, trend: change >= 0 ? 'Gaining share' : 'Losing share', nmls: String(100000 + Math.floor(r() * 2800000)) });
    });
  });
  Object.keys(SEARCH_MARKETS).forEach(function (m, mi) {
    var M = SEARCH_MARKETS[m], st = M.st;
    var lenders = LENDERS[st].filter(function (L) { return L[1] !== 'Wholesale lender' && lenderRecs[L[0]].markets.indexOf(m) >= 0; }).map(function (L) { return L[0]; });
    // Loan officers
    var known = (KNOWN.lo[m] || []);
    for (var i = 0; i < 30; i++) {
      var k = known[i];
      var ten = k ? k[2] : Math.round(between(r, 6, 140)) / 10, units = k ? k[3] : Math.round(between(r, 8, 96)), yoy = k ? k[4] : Math.round(between(r, -45, 48));
      var nm = k ? k[0] : name(mi * 31 + i); used[nm] = true;
      var signal = ten >= 3 && ten <= 5 ? (yoy <= -20 ? 'Likely leaving' : yoy >= 25 ? 'Heavily recruited' : 'In window') : 'Stable';
      add('lo', { name: nm, company: k ? k[1] : pick(r, lenders), market: m, st: st, nmls: String(200000 + Math.floor(r() * 2400000)), tenure: ten,
        tenureBand: ten < 3 ? 'Under 3 years' : ten <= 5 ? '3 to 5 years' : 'Over 5 years', units: units, volume: money(units * between(r, 270000, 430000)), yoy: yoy,
        purchase: Math.round(between(r, 42, 88)), signal: signal });
    }
    // Real estate offices, then their agents
    var offices = [], knownBrands = (KNOWN.agent[m] || []).map(function (k) { return k[1]; }).filter(function (b, i, all) { return all.indexOf(b) === i; });
    for (var o = 0; o < 8; o++) {
      var brand = knownBrands[o] || BRANDS[st][(mi + o) % 5], hood = M.hoods[(o * 3 + mi) % M.hoods.length], zi = (o * 2 + mi) % M.zips.length;
      offices.push(add('office', { name: brand + ' ' + hood, brand: brand, market: m, st: st, zip: M.zips[zi], address: (100 + Math.floor(r() * 8800)) + ' ' + pick(r, STREETS) + ' ' + pick(r, SUFFIX) + ', ' + m + ', ' + st + ' ' + M.zips[zi],
        agents: 0, deals: 0, volume: 0, leader: name(mi * 17 + o + 400) }));
    }
    var agents = [];
    for (var a = 0; a < 36; a++) {
      var ka = (KNOWN.agent[m] || [])[a];
      var off = ka ? offices.filter(function (x) { return x.brand === ka[1]; })[0] : offices[Math.floor(r() * offices.length)];
      var deals = ka ? Math.round(between(r, 14, 34)) : Math.round(between(r, 2, 34)), avg = between(r, st === 'AZ' ? 360000 : 330000, 760000);
      var withYou = r() > 0.72 ? Math.round(between(r, 1, 6)) : 0;
      var agent = add('agent', { name: ka ? ka[0] : name(mi * 23 + a + 200), brokerage: off.brand, office: off.name, officeId: off.id, market: m, st: st, zip: off.zip,
        deals: deals, volume: money(deals * avg), avgPrice: money(avg), yoy: Math.round(between(r, -30, 45)), withYou: withYou, worksWithYou: withYou ? 'Works with you' : 'Not yet', license: String(400000 + Math.floor(r() * 500000)) });
      off.agents += 1; off.deals += deals; off.volume += agent.volume;
      agents.push(agent);
    }
    // Offices count agents beyond the sample ones shown here.
    offices.forEach(function (x) { x.agents = Math.max(1, x.agents) * Math.round(between(r, 3, 9)); x.deals = Math.round(x.deals * x.agents / Math.max(1, agents.filter(function (ag) { return ag.officeId === x.id; }).length)); x.volume = money(x.deals * between(r, 380000, 620000)); });
    // Title agencies
    (TITLES[m] || []).forEach(function (t, ti) {
      var closings = Math.round(between(r, 120, 1400)), days = Math.round(between(r, 24, 48));
      add('title', { name: t, market: m, st: st, offices: Math.round(between(r, 1, 6)), closings: closings, share: Math.round(between(r, 30, 220)) / 10, avgDays: days,
        speed: days < 30 ? 'Under 30 days' : days <= 40 ? '30 to 40 days' : 'Over 40 days', escrow: name(mi * 13 + ti + 600), zip: M.zips[(ti * 3) % M.zips.length] });
    });
    // Properties
    for (var p = 0; p < 40; p++) {
      var type = pick(r, ['Single family', 'Single family', 'Single family', 'Townhome', 'Condo']);
      var beds = type === 'Condo' ? Math.round(between(r, 1, 3)) : Math.round(between(r, 2, 5.4)), price = money(between(r, 0.62, 1.55) * (st === 'AZ' ? 460000 : 410000) * (0.6 + beds * 0.18));
      var status = pick(r, ['For sale', 'For sale', 'Pending', 'Sold', 'Off market']), zi2 = Math.floor(r() * M.zips.length);
      var la = agents[Math.floor(r() * agents.length)];
      add('property', { name: (100 + Math.floor(r() * 9800)) + ' ' + pick(r, STREETS) + ' ' + pick(r, SUFFIX) + (type === 'Condo' ? ' #' + (100 + Math.floor(r() * 900)) : ''), city: m, market: m, st: st, zip: M.zips[zi2], hood: M.hoods[zi2],
        type: type, beds: beds, baths: Math.max(1, beds - (r() > 0.5 ? 1 : 0)) + (r() > 0.6 ? 0.5 : 0), sqft: Math.round((600 + beds * 420 + r() * 600) / 10) * 10, price: price,
        priceBand: price < 300000 ? 'Under $300K' : price < 500000 ? '$300K to $500K' : price < 750000 ? '$500K to $750K' : '$750K and up',
        status: status, dom: status === 'For sale' || status === 'Pending' ? Math.round(between(r, 1, 75)) : null, agent: la.name, agentId: la.id, brokerage: la.brokerage,
        lastSold: pick(r, ['Mar 2019', 'Jun 2020', 'Aug 2021', 'Jan 2022', 'Oct 2016', 'May 2023', 'Nov 2018']) });
    }
  });
  return out;
})();

// What search shows for each category: the label, how a row reads, the filters on the advanced page, and the sorts.
var SEARCH_CATS = [
  { id: 'lo', label: 'Loan officers', one: 'loan officer', short: 'LOs', person: true, weight: 'units', fields: ['name', 'company', 'nmls', 'market'],
    sub: function (x) { return x.company + ' · ' + x.market + ', ' + x.st + ' · NMLS ' + x.nmls; },
    metric: function (x) { return x.units + ' units · ' + fmtShort(x.volume); },
    cols: [{ k: 'units', l: 'Units', f: 'num', gated: true }, { k: 'volume', l: 'Volume', f: 'money', gated: true }, { k: 'tenure', l: 'Tenure', f: 'yrs' }, { k: 'signal', l: 'Signal', f: 'tag' }],
    detail: [['company', 'Company'], ['market', 'Market'], ['nmls', 'NMLS ID'], ['tenure', 'Tenure', 'yrs'], ['units', 'Units, last 12 months', 'num', true], ['volume', 'Volume', 'money', true], ['yoy', 'Change vs last year', 'pct', true], ['purchase', 'Purchase share', 'pctv', true], ['signal', 'Signal']],
    filters: [{ k: 'market', l: 'Market', t: 'pick' }, { k: 'company', l: 'Company', t: 'pick' }, { k: 'tenureBand', l: 'Tenure', t: 'pick', opts: ['Under 3 years', '3 to 5 years', 'Over 5 years'] }, { k: 'units', l: 'Units', t: 'min', opts: [20, 40, 60, 80], gated: true }, { k: 'signal', l: 'Signal', t: 'pick', opts: ['Likely leaving', 'Heavily recruited', 'In window', 'Stable'] }],
    sorts: [{ k: 'units', l: 'Most units', dir: 'desc', gated: true }, { k: 'volume', l: 'Most volume', dir: 'desc', gated: true }, { k: 'yoy', l: 'Fastest growing', dir: 'desc', gated: true }, { k: 'tenure', l: 'Longest tenure', dir: 'desc' }, { k: 'name', l: 'Name, A to Z', dir: 'asc' }],
    genie: { q: 'In the recruiting window', f: { tenureBand: ['3 to 5 years'] }, did: 'Kept loan officers with 3 to 5 years of tenure' },
    links: [{ to: 'lender', by: 'company', label: function (x) { return 'Open ' + x.company; } }] },
  { id: 'lender', label: 'Lenders', one: 'lender', short: 'Lenders', weight: 'units', fields: ['name', 'type', 'nmls', 'hq'],
    sub: function (x) { return x.type + ' · ' + x.markets.length + (x.markets.length === 1 ? ' market' : ' markets') + ' · HQ ' + x.hq; },
    metric: function (x) { return x.los + ' LOs · ' + x.share + '% share'; },
    cols: [{ k: 'los', l: 'LOs', f: 'num' }, { k: 'units', l: 'Units', f: 'num' }, { k: 'share', l: 'Share', f: 'pctv' }, { k: 'trend', l: 'Trend', f: 'tag' }],
    detail: [['type', 'Type'], ['hq', 'Headquarters'], ['marketsText', 'Markets'], ['nmls', 'NMLS ID'], ['los', 'Loan officers', 'num'], ['units', 'Units, last 12 months', 'num'], ['volume', 'Volume', 'money'], ['share', 'Purchase share', 'pctv'], ['change', 'Share change', 'pts']],
    filters: [{ k: 'type', l: 'Type', t: 'pick', opts: ['Retail lender', 'Wholesale lender', 'Broker shop', 'Bank', 'Credit union'] }, { k: 'markets', l: 'Market', t: 'pick' }, { k: 'los', l: 'LOs', t: 'min', opts: [10, 25, 50, 100] }, { k: 'trend', l: 'Trend', t: 'pick', opts: ['Gaining share', 'Losing share'] }],
    sorts: [{ k: 'units', l: 'Most units', dir: 'desc' }, { k: 'los', l: 'Most LOs', dir: 'desc' }, { k: 'share', l: 'Highest share', dir: 'desc' }, { k: 'change', l: 'Biggest share gain', dir: 'desc' }, { k: 'name', l: 'Name, A to Z', dir: 'asc' }],
    genie: { q: 'Lenders losing share', f: { trend: ['Losing share'] }, did: 'Kept lenders whose purchase share fell vs last year' },
    links: [{ to: 'lo', q: function (x) { return x.name; }, label: function (x) { return 'See its loan officers'; } }] },
  { id: 'agent', label: 'Real estate agents', one: 'agent', short: 'Agents', person: true, weight: 'deals', fields: ['name', 'brokerage', 'office', 'zip', 'license', 'market'],
    sub: function (x) { return x.office + ' · ' + x.zip; },
    metric: function (x) { return x.deals + ' deals · ' + fmtShort(x.volume); },
    cols: [{ k: 'deals', l: 'Deals', f: 'num' }, { k: 'volume', l: 'Volume', f: 'money' }, { k: 'yoy', l: 'YoY', f: 'pct' }, { k: 'worksWithYou', l: 'With you', f: 'tag' }],
    detail: [['office', 'Office'], ['brokerage', 'Brokerage'], ['zip', 'ZIP'], ['license', 'License'], ['deals', 'Purchase deals, last 12 months', 'num'], ['volume', 'Volume', 'money'], ['avgPrice', 'Average price', 'money'], ['yoy', 'Change vs last year', 'pct'], ['withYou', 'Deals with you', 'num']],
    filters: [{ k: 'market', l: 'Market', t: 'pick' }, { k: 'brokerage', l: 'Brokerage', t: 'pick' }, { k: 'zip', l: 'ZIP', t: 'pick' }, { k: 'deals', l: 'Deals', t: 'min', opts: [5, 10, 15, 25] }, { k: 'worksWithYou', l: 'With you', t: 'pick', opts: ['Works with you', 'Not yet'] }],
    sorts: [{ k: 'deals', l: 'Most deals', dir: 'desc' }, { k: 'volume', l: 'Most volume', dir: 'desc' }, { k: 'yoy', l: 'Fastest growing', dir: 'desc' }, { k: 'name', l: 'Name, A to Z', dir: 'asc' }],
    genie: { q: '15+ deals, not working with you', f: { deals: 15, worksWithYou: ['Not yet'] }, did: 'Kept agents with 15+ purchase deals and no deals with you' },
    links: [{ to: 'office', by: 'office', label: function (x) { return 'Open ' + x.office; } }] },
  { id: 'office', label: 'Real estate offices', one: 'office', short: 'Offices', weight: 'deals', fields: ['name', 'brand', 'address', 'zip', 'leader'],
    sub: function (x) { return x.address; },
    metric: function (x) { return x.agents + ' agents · ' + x.deals + ' deals'; },
    cols: [{ k: 'agents', l: 'Agents', f: 'num' }, { k: 'deals', l: 'Deals', f: 'num' }, { k: 'volume', l: 'Volume', f: 'money' }, { k: 'brand', l: 'Brokerage', f: 'text' }],
    detail: [['brand', 'Brokerage'], ['address', 'Address'], ['leader', 'Managing broker'], ['agents', 'Agents', 'num'], ['deals', 'Purchase deals, last 12 months', 'num'], ['volume', 'Volume', 'money']],
    filters: [{ k: 'market', l: 'Market', t: 'pick' }, { k: 'brand', l: 'Brokerage', t: 'pick' }, { k: 'agents', l: 'Agents', t: 'min', opts: [10, 25, 50, 100] }, { k: 'deals', l: 'Deals', t: 'min', opts: [50, 100, 200, 400] }],
    sorts: [{ k: 'deals', l: 'Most deals', dir: 'desc' }, { k: 'agents', l: 'Most agents', dir: 'desc' }, { k: 'volume', l: 'Most volume', dir: 'desc' }, { k: 'name', l: 'Name, A to Z', dir: 'asc' }],
    genie: { q: 'Offices with 50+ agents', f: { agents: 50 }, did: 'Kept offices with 50 or more agents' },
    links: [{ to: 'agent', q: function (x) { return x.name; }, label: function () { return 'See its agents'; } }] },
  { id: 'title', label: 'Title agencies', one: 'title agency', short: 'Title', weight: 'closings', fields: ['name', 'market', 'escrow', 'zip'],
    sub: function (x) { return x.market + ', ' + x.st + ' · ' + x.offices + (x.offices === 1 ? ' office' : ' offices'); },
    metric: function (x) { return x.closings + ' closings · ' + x.avgDays + ' days avg'; },
    cols: [{ k: 'closings', l: 'Closings', f: 'num' }, { k: 'share', l: 'Share', f: 'pctv' }, { k: 'avgDays', l: 'Avg days to close', f: 'num' }, { k: 'offices', l: 'Offices', f: 'num' }],
    detail: [['market', 'Market'], ['escrow', 'Lead escrow officer'], ['offices', 'Offices', 'num'], ['closings', 'Closings, last 12 months', 'num'], ['share', 'Market share', 'pctv'], ['avgDays', 'Average days to close', 'num']],
    filters: [{ k: 'market', l: 'Market', t: 'pick' }, { k: 'closings', l: 'Closings', t: 'min', opts: [100, 250, 500, 1000] }, { k: 'speed', l: 'Days to close', t: 'pick', opts: ['Under 30 days', '30 to 40 days', 'Over 40 days'] }],
    sorts: [{ k: 'closings', l: 'Most closings', dir: 'desc' }, { k: 'share', l: 'Highest share', dir: 'desc' }, { k: 'avgDays', l: 'Fastest to close', dir: 'asc' }, { k: 'name', l: 'Name, A to Z', dir: 'asc' }],
    genie: { q: 'Fastest closers', f: { speed: ['Under 30 days'] }, did: 'Kept title agencies that close in under 30 days on average' } },
  { id: 'property', label: 'Properties', one: 'property', short: 'Properties', weight: 'price', fields: ['name', 'city', 'zip', 'hood', 'agent'],
    sub: function (x) { return x.city + ', ' + x.st + ' ' + x.zip + ' · ' + x.beds + ' bd · ' + x.baths + ' ba · ' + x.sqft.toLocaleString('en-US') + ' sq ft'; },
    metric: function (x) { return fmtShort(x.price) + ' · ' + x.status; },
    cols: [{ k: 'price', l: 'Price', f: 'money' }, { k: 'status', l: 'Status', f: 'tag' }, { k: 'beds', l: 'Beds', f: 'num' }, { k: 'agent', l: 'Listing agent', f: 'text' }],
    detail: [['type', 'Type'], ['hood', 'Neighborhood'], ['beds', 'Beds', 'num'], ['baths', 'Baths', 'num'], ['sqft', 'Square feet', 'num'], ['price', 'Price', 'money'], ['status', 'Status'], ['dom', 'Days on market', 'num'], ['agent', 'Listing agent'], ['lastSold', 'Last sold']],
    filters: [{ k: 'status', l: 'Status', t: 'pick', opts: ['For sale', 'Pending', 'Sold', 'Off market'] }, { k: 'market', l: 'City', t: 'pick' }, { k: 'zip', l: 'ZIP', t: 'pick' }, { k: 'type', l: 'Type', t: 'pick', opts: ['Single family', 'Townhome', 'Condo'] }, { k: 'priceBand', l: 'Price', t: 'pick', opts: ['Under $300K', '$300K to $500K', '$500K to $750K', '$750K and up'] }, { k: 'beds', l: 'Beds', t: 'min', opts: [2, 3, 4, 5] }],
    sorts: [{ k: 'price', l: 'Highest price', dir: 'desc' }, { k: 'price', l: 'Lowest price', dir: 'asc', id: 'priceAsc' }, { k: 'dom', l: 'Newest listings', dir: 'asc', id: 'dom' }, { k: 'sqft', l: 'Largest', dir: 'desc' }],
    genie: { q: 'For sale, 3+ beds under $500K', f: { status: ['For sale'], beds: 3, priceBand: ['Under $300K', '$300K to $500K'] }, did: 'Kept homes for sale with 3+ beds under $500K' },
    links: [{ to: 'agent', by: 'agent', label: function (x) { return 'Open listing agent ' + x.agent; } }] }
];
DIRECTORY.forEach(function (x) { if (x.markets) x.marketsText = x.markets.join(', '); });
