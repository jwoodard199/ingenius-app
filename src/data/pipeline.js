// Sample pipeline deals and recruits for each persona, and the Home widgets each persona starts with.
// Home widgets each persona starts with. People can turn any of them on or off from Customize.
var HOME_WIDGETS = ['kpis', 'movement', 'pipeline', 'chart', 'table', 'actions'];
var HOME_DEFAULTS = {
  lo: { kpis: true, pipeline: true, chart: true, table: true, actions: true },
  exec: { kpis: true, movement: true, chart: true, table: true, actions: true },
  rec: { kpis: true, movement: true, pipeline: true, table: true, actions: true },
  ae: { kpis: true, pipeline: true, chart: true, table: true, actions: true }
};
// ---- Pipeline board: deals (LO, AE) and recruits (exec, recruiter), example data ----
// Each item: stage is an index into stages, value is dollars (loan amount, or yearly production / volume),
// owner is an index into team, days is time in the current stage.
var PIPE_DOTS = ['#8286A8', '#4E5496', '#24285D', '#F89624', '#1D7A55'];
var PIPE_TODAY = 'Sep 26';
var PIPELINES = {
  lo: {
    noun: 'deal', nouns: 'deals', Noun: 'Deal', valueLabel: 'Loan amount', perYear: false, dateLabel: 'Target close',
    stages: ['New lead', 'Pre-approved', 'In process', 'Clear to close', 'Closed'],
    next: ['Pre-approve', 'Send to processing', 'Clear to close', 'Close and fund', ''],
    team: [{ i: 'AR', n: 'Alex Rivera' }, { i: 'JT', n: 'Jess Tran' }, { i: 'MB', n: 'Marco Bell' }],
    items: [
      { id: 'lo1', name: 'Mark and Lisa Chen', sub: 'Rate-and-term refi · past client', value: 412000, stage: 0, pri: 'High', owner: 0, date: 'Oct 2', days: 2, tag: 'Retention', nextStep: 'Call about a refi. Their rate is 1.2 points above today.' },
      { id: 'lo2', name: 'Ben and Ari Cole', sub: 'Purchase · from Dana Ruiz, Compass', value: 520000, stage: 0, pri: 'Medium', owner: 0, date: 'Oct 6', days: 1, tag: 'Agent referral', nextStep: 'Book the intro call Dana asked for.' },
      { id: 'lo3', name: 'Hillside Homes, lot 14', sub: 'New construction · Buda', value: 389000, stage: 0, pri: 'Low', owner: 2, date: 'Nov 14', days: 5, tag: 'Builder', nextStep: 'Send the builder incentive sheet.' },
      { id: 'lo4', name: 'Priya Shah', sub: 'Purchase · 78704', value: 465000, stage: 1, pri: 'High', owner: 0, date: 'Oct 9', days: 12, tag: 'No offer yet', nextStep: 'Check in. Pre-approval went out 12 days ago and there is no offer yet.' },
      { id: 'lo5', name: 'Diego Ortega', sub: 'FHA purchase · from Sam Ortiz, KW', value: 318000, stage: 1, pri: 'Medium', owner: 0, date: 'Oct 20', days: 26, nextStep: 'Ask Sam whether Diego is still looking.' },
      { id: 'lo6', name: 'Nina Patel', sub: 'VA purchase · Round Rock', value: 402000, stage: 1, pri: 'Low', owner: 2, date: 'Nov 1', days: 8, nextStep: 'Send the certificate of eligibility request.' },
      { id: 'lo7', name: 'Keisha Grant', sub: 'Purchase · appraisal ordered', value: 548000, stage: 2, pri: 'High', owner: 1, date: 'Oct 10', days: 9, nextStep: 'Appraisal due Monday. Jess is tracking it.' },
      { id: 'lo8', name: 'Omar Haddad', sub: 'Cash-out refi · title issue', value: 290000, stage: 2, pri: 'Medium', owner: 1, date: 'Oct 17', days: 23, nextStep: 'Title needs a lien release from 2019.' },
      { id: 'lo9', name: 'Rachel Stein', sub: 'Jumbo purchase · Westlake', value: 1150000, stage: 2, pri: 'High', owner: 0, date: 'Oct 24', days: 6, tag: 'Jumbo', nextStep: 'Underwriting asked for two more bank statements.' },
      { id: 'lo10', name: 'Luis and Ana Mendez', sub: 'Purchase · from Grace Kim', value: 436000, stage: 2, pri: 'Low', owner: 1, date: 'Oct 28', days: 4, nextStep: 'Insurance quote is on the way.' },
      { id: 'lo11', name: 'Lena Park', sub: 'Purchase · closing Oct 1', value: 375000, stage: 3, pri: 'High', owner: 1, date: 'Oct 1', days: 3, nextStep: 'Send closing disclosure reminder.' },
      { id: 'lo12', name: 'Carlos Webb', sub: 'Refi · closing Oct 3', value: 262000, stage: 3, pri: 'Medium', owner: 0, date: 'Oct 3', days: 2, nextStep: 'Confirm the signing time.' },
      { id: 'lo13', name: 'Beth Carroll', sub: 'Purchase · funded', value: 344000, stage: 4, pri: 'Low', owner: 0, date: 'Sep 22', days: 4, nextStep: 'Ask for a review and a referral.' },
      { id: 'lo14', name: 'Joy Adeyemi', sub: 'FHA purchase · funded', value: 298000, stage: 4, pri: 'Low', owner: 1, date: 'Sep 18', days: 8, nextStep: 'Send the closing gift.' }
    ]
  },
  exec: {
    noun: 'recruit', nouns: 'recruits', Noun: 'Recruit', valueLabel: 'Production, last 12 months', perYear: true, dateLabel: 'Next step',
    stages: ['Identified', 'Contacted', 'Meeting', 'Offer', 'Hired'],
    next: ['Mark contacted', 'Book a meeting', 'Make an offer', 'Mark hired', ''],
    team: [{ i: 'ML', n: 'Morgan Lee' }, { i: 'CN', n: 'Casey Nguyen' }, { i: 'TW', n: 'Taylor Wu' }],
    items: [
      { id: 'ex1', name: 'Sofia Ramos', sub: 'Rival Mortgage · Houston', value: 48000000, stage: 0, pri: 'Medium', owner: 1, date: 'Oct 4', days: 3, tag: 'In window', nextStep: '4.1 years at Rival. Casey is drafting the first note.' },
      { id: 'ex2', name: 'Ethan Brooks', sub: 'Lone Star Lending · Dallas', value: 62000000, stage: 0, pri: 'High', owner: 2, date: 'Oct 7', days: 5, tag: 'Volume up 38%', nextStep: 'Taylor to reach out through a mutual agent.' },
      { id: 'ex3', name: 'Grace Liu', sub: 'Bayou Home Loans · Houston', value: 31000000, stage: 0, pri: 'Low', owner: 1, date: 'Oct 15', days: 9, nextStep: 'Add to the Houston Q4 sequence.' },
      { id: 'ex4', name: 'Aaron Pike', sub: 'Hill Country Home Loans · Austin', value: 27000000, stage: 0, pri: 'Low', owner: 2, date: 'Oct 18', days: 11, nextStep: 'Check his non-solicit dates.' },
      { id: 'ex5', name: 'Tom Reyes', sub: 'Rival Mortgage · Houston', value: 55000000, stage: 1, pri: 'High', owner: 1, date: 'Sep 30', days: 4, tag: 'Merger news', nextStep: 'His company announced a merger. Call before it closes.' },
      { id: 'ex6', name: 'Ana Flores', sub: 'Gulf Coast Lending · Houston', value: 44000000, stage: 1, pri: 'Medium', owner: 1, date: 'Oct 2', days: 6, tag: 'Volume up 41%', nextStep: 'She opened the second email. Follow up by phone.' },
      { id: 'ex7', name: 'Marcus Webb', sub: 'Summit Lending · San Antonio', value: 38000000, stage: 1, pri: 'Medium', owner: 2, date: 'Oct 9', days: 24, nextStep: 'No reply to two notes. Try a referral intro.' },
      { id: 'ex8', name: 'Kevin Ma', sub: 'Summit Lending · Houston', value: 51000000, stage: 2, pri: 'High', owner: 1, date: 'Sep 29', days: 3, tag: 'Follow-up due', nextStep: 'Meeting held Tuesday. Send the comp outline.' },
      { id: 'ex9', name: 'Dee Carter', sub: 'Prime Street · Dallas', value: 67000000, stage: 2, pri: 'Medium', owner: 2, date: 'Oct 5', days: 22, nextStep: 'Waiting on her to share her pipeline mix.' },
      { id: 'ex10', name: 'Luis Ortega', sub: 'Rival Mortgage · Houston', value: 72000000, stage: 3, pri: 'High', owner: 0, date: 'Oct 1', days: 5, tag: 'Offer out', nextStep: 'Offer expires Oct 1. Morgan to call Friday.' },
      { id: 'ex11', name: 'Jenna Moss', sub: 'Joined from Bayou Home Loans', value: 36000000, stage: 4, pri: 'Low', owner: 1, date: 'Sep 15', days: 11, nextStep: 'Onboarding week two.' },
      { id: 'ex12', name: 'Sam Kaur', sub: 'Joined from Lone Star Lending', value: 41000000, stage: 4, pri: 'Low', owner: 2, date: 'Aug 28', days: 29, nextStep: 'First loans in processing.' }
    ]
  },
  rec: {
    noun: 'recruit', nouns: 'recruits', Noun: 'Recruit', valueLabel: 'Production, last 12 months', perYear: true, dateLabel: 'Next step',
    stages: ['Identified', 'Contacted', 'Meeting', 'Offer', 'Hired'],
    next: ['Mark contacted', 'Book a meeting', 'Make an offer', 'Mark hired', ''],
    team: [{ i: 'CN', n: 'Casey Nguyen' }, { i: 'DM', n: 'Dev Mehta' }, { i: 'ML', n: 'Morgan Lee' }],
    items: [
      { id: 'rc1', name: 'Mei Zhang', sub: 'Gulf Coast Lending · Sugar Land', value: 46000000, stage: 0, pri: 'High', owner: 1, date: 'Oct 8', days: 2, tag: 'Volume up 29%', nextStep: 'Dev is finding a warm intro.' },
      { id: 'rc2', name: 'Holly Grant', sub: 'Bayou Home Loans · Katy', value: 29000000, stage: 0, pri: 'Medium', owner: 0, date: 'Oct 3', days: 4, tag: 'In window', nextStep: '3.6 years at Bayou. Enroll in the Q4 sequence.' },
      { id: 'rc3', name: 'Victor Sandoval', sub: 'Rival Mortgage · Pasadena', value: 34000000, stage: 0, pri: 'Medium', owner: 0, date: 'Oct 6', days: 6, nextStep: 'Enroll in the Q4 sequence.' },
      { id: 'rc4', name: 'Tara Nolan', sub: 'Prime Street · Houston', value: 39000000, stage: 0, pri: 'Medium', owner: 0, date: 'Oct 12', days: 8, nextStep: 'Look up her non-solicit dates.' },
      { id: 'rc5', name: 'Owen Price', sub: 'Summit Lending · The Woodlands', value: 22000000, stage: 0, pri: 'Low', owner: 1, date: 'Oct 21', days: 14, nextStep: 'Hold until his anniversary in November.' },
      { id: 'rc6', name: 'Tom Reyes', sub: 'Rival Mortgage · Houston', value: 55000000, stage: 1, pri: 'High', owner: 0, date: 'Sep 30', days: 4, tag: 'Merger news', nextStep: 'His company announced a merger. Call before it closes.' },
      { id: 'rc7', name: 'Ana Flores', sub: 'Gulf Coast Lending · Houston', value: 44000000, stage: 1, pri: 'High', owner: 0, date: 'Oct 2', days: 6, tag: 'Volume up 41%', nextStep: 'She opened the second email. Follow up by phone.' },
      { id: 'rc8', name: 'Jamal Wright', sub: 'Bayou Home Loans · Houston', value: 33000000, stage: 1, pri: 'Low', owner: 1, date: 'Oct 10', days: 27, nextStep: 'No reply to three notes. Try LinkedIn.' },
      { id: 'rc9', name: 'Kevin Ma', sub: 'Summit Lending · Houston', value: 51000000, stage: 2, pri: 'High', owner: 0, date: 'Sep 29', days: 3, tag: 'Follow-up due', nextStep: 'Meeting held Tuesday. Send the comp outline.' },
      { id: 'rc10', name: 'Lucia Perez', sub: 'Rival Mortgage · Houston', value: 40000000, stage: 2, pri: 'Medium', owner: 1, date: 'Oct 4', days: 21, nextStep: 'Second meeting with Morgan to schedule.' },
      { id: 'rc11', name: 'Luis Ortega', sub: 'Rival Mortgage · Houston', value: 72000000, stage: 3, pri: 'High', owner: 2, date: 'Oct 1', days: 5, tag: 'Offer out', nextStep: 'Offer expires Oct 1. Morgan to call Friday.' },
      { id: 'rc12', name: 'Nora Blake', sub: 'Gulf Coast Lending · Katy', value: 37000000, stage: 3, pri: 'Medium', owner: 0, date: 'Oct 5', days: 7, nextStep: 'She asked about marketing support.' },
      { id: 'rc13', name: 'Jenna Moss', sub: 'Joined from Bayou Home Loans', value: 36000000, stage: 4, pri: 'Low', owner: 0, date: 'Sep 15', days: 11, nextStep: 'Onboarding week two.' }
    ]
  },
  ae: {
    noun: 'deal', nouns: 'deals', Noun: 'Deal', valueLabel: 'Est. volume per year', perYear: true, dateLabel: 'Next step',
    stages: ['Prospect', 'First meeting', 'Trial loans', 'Onboarding', 'Won'],
    next: ['Book a meeting', 'Start trial loans', 'Start onboarding', 'Mark won', ''],
    team: [{ i: 'RP', n: 'Riley Park' }, { i: 'KS', n: 'Kim Soto' }, { i: 'BL', n: 'Ben Lowe' }],
    items: [
      { id: 'ae1', name: 'Canyon Mortgage Group', sub: '140 loans last year · 45% FHA', value: 42000000, stage: 0, pri: 'High', owner: 0, date: 'Oct 3', days: 2, tag: 'Not sending to you', nextStep: 'Book an intro with their ops lead.' },
      { id: 'ae2', name: 'Crestline Lending', sub: 'Jen Alvarez just joined', value: 28000000, stage: 0, pri: 'High', owner: 0, date: 'Oct 1', days: 1, tag: 'LO moved', nextStep: 'Jen sent you 22 loans last year. Draft an intro note.' },
      { id: 'ae3', name: 'Saguaro Home Loans', sub: 'Tempe · 60 loans last year', value: 18000000, stage: 0, pri: 'Low', owner: 1, date: 'Oct 20', days: 9, nextStep: 'Kim to send the rate sheet.' },
      { id: 'ae4', name: 'Red Rock Funding', sub: 'Scottsdale · broker', value: 24000000, stage: 1, pri: 'Medium', owner: 0, date: 'Oct 7', days: 25, nextStep: 'They went quiet after the first meeting. Send the FHA overlay sheet.' },
      { id: 'ae5', name: 'Mesa Home Funding', sub: 'Mesa · quarterly visit due', value: 31000000, stage: 1, pri: 'Medium', owner: 1, date: 'Oct 2', days: 6, tag: 'Visit due', nextStep: 'Quarterly visit due Friday.' },
      { id: 'ae6', name: 'Summit Home Loans', sub: 'Loyalty down to 6% from 11%', value: 36000000, stage: 2, pri: 'High', owner: 0, date: 'Oct 4', days: 8, tag: 'Slipping', nextStep: 'Desert Wholesale gained. Plan a visit with pricing.' },
      { id: 'ae7', name: 'Copper State Mortgage', sub: 'Chandler · 3 trial loans in', value: 22000000, stage: 2, pri: 'Medium', owner: 1, date: 'Oct 11', days: 22, nextStep: 'Trial loans are stuck on condo reviews.' },
      { id: 'ae8', name: 'Valley Lending Partners', sub: 'Glendale · setting up pricing', value: 27000000, stage: 3, pri: 'Medium', owner: 0, date: 'Oct 8', days: 5, nextStep: 'Pricing engine login goes live Monday.' },
      { id: 'ae9', name: 'Desert Sky Mortgage', sub: 'Gilbert · training booked', value: 19000000, stage: 3, pri: 'Low', owner: 1, date: 'Oct 14', days: 7, nextStep: 'LO training on Oct 14.' },
      { id: 'ae10', name: 'Sonoran Lending', sub: 'Phoenix · signed Sep 20', value: 33000000, stage: 4, pri: 'Low', owner: 0, date: 'Sep 20', days: 6, nextStep: 'First loans expected next week.' },
      { id: 'ae11', name: 'Pinnacle Peak Loans', sub: 'Scottsdale · signed Sep 9', value: 21000000, stage: 4, pri: 'Low', owner: 2, date: 'Sep 9', days: 17, nextStep: 'Check in after 30 days.' }
    ]
  }
};
function pipeMoney(v, perYear) {
  var t = v >= 1e9 ? '$' + (Math.round(v / 1e7) / 100) + 'B' : v >= 1e6 ? '$' + (Math.round(v / 1e5) / 10) + 'M' : '$' + Math.round(v / 1e3) + 'K';
  return perYear ? t + '/yr' : t;
}
// Sample note and file counts, fixed per item so they are the same on every load.
function pipeCounts(id) {
  var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return { notes: h % 6, files: (h >> 2) % 4 };
}
var PIPE_STUCK = 21;
