// Sample personas, their home-page views, action items and Genie prompts.
var PERSONAS = {
  lo: {
    name: 'Alex Rivera', initials: 'AR', role: 'Loan officer', roleCaps: 'LOAN OFFICER', territory: 'Austin, TX',
    greeting: 'Good morning, Alex',
    headline: 'Start with the Chens. Their rate is 1.2 points above today’s, and Dana Ruiz is back on the market for a lender.',
    nudge: { text: 'You have 3 past clients with rates 1%+ above today’s. Want me to pull them up?', cta: 'Show me', prompt: 1 },
    cards: [
      { eyebrow: 'RETENTION', title: 'Past clients to reach out to', value: '3', note: 'Rates 1%+ above today’s', cta: 'See past clients', view: 'past' },
      { eyebrow: 'REFERRAL PARTNERS', title: 'Agents to call this week', value: '5', note: 'Active in your ZIPs, not sending to you', cta: 'See agents', view: 'top' },
      { eyebrow: 'RELATIONSHIPS', title: 'Partners going quiet', value: '2', note: 'No deals sent to you in 90+ days', cta: 'See partners', view: 'quiet' }
    ],
    tray: [
      { kind: 'Retention', title: 'Mark and Lisa Chen', why: 'Rate 7.1%, 1.2 points above today. Closed with you in March 2024.', action: 'Enroll in refi pipeline' },
      { kind: 'Agent match', title: 'Dana Ruiz, Compass', why: '31 purchase deals in 78704 last year. Sends most of them to one LO at a competitor.', action: 'Call Dana' },
      { kind: 'Going quiet', title: 'Sam Ortiz, KW Austin', why: 'Sent you 6 deals last year, none in the past 104 days.', action: 'Send a note' },
      { kind: 'Follow-up', title: 'Priya Shah', why: 'Pre-approval issued 12 days ago. No offer yet.', action: 'Log a call' },
      { kind: 'Builder match', title: 'Hillside Homes', why: '40 new lots opening in Buda. No preferred lender listed.', action: 'Add to CRM' }
    ],
    views: [
      { id: 'top', label: 'Top agents in my ZIPs', noun: 'agents', total: 214, chips: ['Austin ZIPs', 'Purchase', 'Last 12 months', 'Not working with me'], act: 'Add to pipeline', results: [
        { name: 'Dana Ruiz', sub: 'Compass · 78704, 78745', metric: '31 purchase deals · $14.2M', lender: 'Sends most deals to J. Park, Rival Mortgage' },
        { name: 'Marcus Webb', sub: 'eXp Realty · 78702', metric: '24 purchase deals · $10.9M', lender: 'Sends most deals to Lone Star Lending' },
        { name: 'Keisha Grant', sub: 'KW Austin Southwest · 78749', metric: '22 purchase deals · $9.6M', lender: 'Splits deals across 3 LOs' },
        { name: 'Tom Alvarez', sub: 'Realty Austin · 78704', metric: '19 purchase deals · $8.8M', lender: 'Sends most deals to Hill Country Home Loans' }
      ]},
      { id: 'quiet', label: 'Agents who used to send me deals', noun: 'agents', total: 2, chips: ['Sent me 3+ deals', 'Nothing in 90 days'], act: 'Send a note', results: [
        { name: 'Sam Ortiz', sub: 'KW Austin · 6 deals with you last year', metric: 'Last deal 104 days ago', lender: 'Now sends to Rival Mortgage' },
        { name: 'Lena Park', sub: 'Compass · 4 deals with you last year', metric: 'Last deal 96 days ago', lender: 'Now splits deals across 2 LOs' }
      ]},
      { id: 'past', label: 'Past clients above today’s rates', noun: 'past clients', total: 3, chips: ['My closed loans', 'Rate 1%+ above today', 'Owner occupied'], act: 'Enroll in refi pipeline', results: [
        { name: 'Mark and Lisa Chen', sub: 'Closed March 2024 · 30-year fixed', metric: 'Rate 7.1% · 1.2 pts above today' },
        { name: 'Rob Delgado', sub: 'Closed October 2023 · FHA', metric: 'Rate 6.9% · 1.0 pt above today' },
        { name: 'Anita Moss', sub: 'Closed January 2024 · 30-year fixed', metric: 'Rate 6.9% · 1.0 pt above today' }
      ]},
      { id: 'heavy', label: 'Heavy hitters in 78704', noun: 'agents', total: 6, chips: ['78704', '20+ purchase deals'], act: 'Add to pipeline',
        road: { before: ['78704', '20+ purchase deals'], after: ['78704', '10+ purchase deals'], msg: 'No agents in 78704 had 20+ purchase deals this year, so I lowered it to 10+. 6 agents match.', empty: 'Nobody in 78704 reached 20+ purchase deals in the last 12 months.' },
        results: [
          { name: 'Dana Ruiz', sub: 'Compass', metric: '17 purchase deals in 78704', lender: 'Sends most deals to J. Park, Rival Mortgage' },
          { name: 'Tom Alvarez', sub: 'Realty Austin', metric: '14 purchase deals in 78704', lender: 'Sends most deals to Hill Country Home Loans' },
          { name: 'Grace Kim', sub: 'Moreland Properties', metric: '11 purchase deals in 78704', lender: 'Splits deals across 2 LOs' }
      ]}
    ],
    prompts: [
      { q: 'Who are the top purchase agents in my ZIPs who don’t work with me?', view: 'top', did: ['Set the area to your Austin ZIPs', 'Filtered to purchase loans in the last 12 months', 'Left out agents you’ve already closed with'], a: 'Here are the top 4 of 214. Dana Ruiz stands out: 31 purchase deals, mostly sent to one LO at a competitor.' },
      { q: 'Which past clients should I call about a refi?', view: 'past', did: ['Opened your past clients', 'Kept loans with rates 1%+ above today’s', 'Kept owner-occupied homes only'], a: '3 past clients match. The Chens are furthest above today’s rate, so they’re first in your action items.' },
      { q: 'Find agents in 78704 with 20+ purchase deals', view: 'heavy', did: ['Filtered to 78704 and 20+ purchase deals', 'Found no matches, so lowered it to 10+'], a: 'Nobody hit 20+ in 78704 this year. At 10+ there are 6 agents, and here are the top 3.' }
    ],
    crmTitle: 'My pipeline', sync: 'Syncing with your CRM',
    stages: [{ name: 'NEW', n: '4' }, { name: 'CONTACTED', n: '6' }, { name: 'MEETING', n: '2' }, { name: 'REFERRING', n: '9' }],
    log: [{ text: 'Keisha Grant moved to Meeting', when: 'Yesterday' }, { text: 'Note sent to Lena Park', when: 'Monday' }]
  },
  exec: {
    name: 'Morgan Lee', initials: 'ML', role: 'Lender executive', roleCaps: 'LENDER EXECUTIVE', territory: 'Texas region',
    greeting: 'Good morning, Morgan',
    headline: 'Houston purchase share is down 1.1 points. Two of your Houston LOs are in the recruiting window with falling production.',
    nudge: { text: 'Maria Chen’s production dropped 45% in 60 days after her best year. That pattern often means someone is getting ready to leave.', cta: 'Tell me more', prompt: 1 },
    cards: [
      { eyebrow: 'TEAM HEALTH', title: 'LOs at risk of leaving', value: '3', note: '2 likely leaving, 1 heavily recruited', cta: 'See who', view: 'risk' },
      { eyebrow: 'RECRUITING', title: 'Recruit targets', value: '12', note: 'In your footprint and in the recruiting window', cta: 'See targets', view: 'recruit' },
      { eyebrow: 'FAIR LENDING', title: 'LMI share of originations', value: '18.4%', note: 'Peers 16.9%. Branch 12 below goal.', cta: 'See branches', view: 'lmi' },
      { eyebrow: 'MARKET SHARE', title: 'Purchase share, Texas', value: '4.2%', note: '↓ 0.3 pts vs last quarter', cta: 'See where', view: 'share' }
    ],
    tray: [
      { kind: 'Likely leaving', risk: true, title: 'Maria Chen, Houston', why: '4 years with you. Production down 45% in 60 days after a strong year.', action: 'Schedule check-in' },
      { kind: 'Heavily recruited', title: 'D. Brooks, Dallas', why: '3 years with you. Volume up 38% year over year. Two competitors are hiring nearby.', action: 'Review growth path' },
      { kind: 'Recruit target', title: '3 LOs at Rival Mortgage, Houston', why: 'In the recruiting window, with production falling.', action: 'Assign to recruiter' },
      { kind: 'Fair lending', risk: true, title: 'Branch 12, San Antonio', why: 'LMI share 11.2%, below your 15% goal.', action: 'View tracts' }
    ],
    views: [
      { id: 'risk', label: 'LOs at risk of leaving', noun: 'LOs', total: 3, chips: ['My team', '3 to 5 years tenure', 'Growth or drop-off'], act: 'Schedule check-in', results: [
        { name: 'Maria Chen', sub: 'Houston Galleria branch · 4.1 years', metric: '↓ 45% production, last 60 days', tag: 'Likely leaving', tagTone: 'danger' },
        { name: 'R. Singh', sub: 'Austin North branch · 4.6 years', metric: '↓ 22% production, last 90 days', tag: 'Likely leaving', tagTone: 'danger' },
        { name: 'D. Brooks', sub: 'Dallas Uptown branch · 3.2 years', metric: '↑ 38% volume year over year', tag: 'Heavily recruited', tagTone: 'accent' }
      ]},
      { id: 'recruit', label: 'Top recruit targets', noun: 'LOs', total: 12, chips: ['Our footprint', 'Competitors', '3 to 5 years tenure', '40+ units'], act: 'Assign to recruiter', results: [
        { name: 'Tom Reyes', sub: 'Rival Mortgage, Houston · 4 years', metric: '62 units · ↓ 30% this year', tag: 'Likely leaving', tagTone: 'danger' },
        { name: 'Ana Flores', sub: 'Gulf Coast Lending, Houston · 3 years', metric: '48 units · ↑ 41% this year', tag: 'Heavily recruited', tagTone: 'accent' },
        { name: 'Katy branch, Rival Mortgage', sub: '6 LOs · Houston', metric: '210 units combined', tag: 'Whole branch', tagTone: 'neutral' }
      ]},
      { id: 'lmi', label: 'LMI performance vs peers', noun: 'branches', total: 9, chips: ['Texas region', 'Last 12 months', 'By branch'], act: 'View tracts', results: [
        { name: 'Branch 4, Dallas', sub: 'LMI share of originations', metric: '21.3% · peers 17.0%', tag: 'Above peers', tagTone: 'success' },
        { name: 'Branch 7, Houston', sub: 'LMI share of originations', metric: '17.8% · peers 16.4%', tag: 'Above peers', tagTone: 'success' },
        { name: 'Branch 12, San Antonio', sub: 'LMI share of originations', metric: '11.2% · peers 15.8%', tag: 'Below goal', tagTone: 'danger' }
      ]},
      { id: 'share', label: 'Where we’re losing share', noun: 'markets', total: 4, chips: ['Texas region', 'Purchase', 'Quarter over quarter'], act: 'See drivers', results: [
        { name: 'Houston', sub: 'Purchase share', metric: '3.1% · ↓ 1.1 pts', tag: 'Losing share', tagTone: 'danger' },
        { name: 'San Antonio', sub: 'Purchase share', metric: '2.4% · ↓ 0.2 pts', tag: 'Losing share', tagTone: 'danger' },
        { name: 'Dallas', sub: 'Purchase share', metric: '5.6% · ↑ 0.4 pts', tag: 'Gaining', tagTone: 'success' }
      ]}
    ],
    prompts: [
      { q: 'Why is Houston purchase share down?', view: 'share', did: ['Compared Houston with last quarter', 'Broke the change down by LO and by competitor'], a: 'Two drivers. Maria Chen and R. Diaz are down 45% and 31%, and Rival Mortgage added 4 LOs in Houston. I flagged Maria in your action items.' },
      { q: 'Who on my team is at risk of leaving?', view: 'risk', did: ['Looked at your LOs with 3 to 5 years of tenure', 'Checked for high growth or a steep drop-off'], a: '3 LOs fit. Maria Chen and R. Singh show a drop-off after strong years. D. Brooks is growing fast, so other firms are likely calling him.' },
      { q: 'Summarize our fair lending performance for the board', view: 'lmi', did: ['Pulled LMI share by branch for the last 12 months', 'Compared each branch with peers in its market'], a: 'LMI share is 18.4% against 16.9% for peers. Branch 12 in San Antonio is the exception at 11.2%. I can export this as a one-page summary.' }
    ],
    crmTitle: 'Recruiting pipeline', sync: 'Syncing with the in-house recruiting CRM',
    stages: [{ name: 'IDENTIFIED', n: '12' }, { name: 'CONTACTED', n: '5' }, { name: 'MEETING', n: '3' }, { name: 'OFFER', n: '1' }],
    log: [{ text: 'Tom Reyes assigned to Casey Nguyen', when: 'Yesterday' }, { text: 'Check-in scheduled with R. Singh', when: 'Monday' }]
  },
  rec: {
    name: 'Casey Nguyen', initials: 'CN', role: 'Recruiter', roleCaps: 'RECRUITER', territory: 'Houston metro',
    greeting: 'Good morning, Casey',
    headline: '12 new matches since yesterday, and Tom Reyes’s company just announced a merger.',
    nudge: { text: '5 candidates in your pipeline haven’t heard from you in 14 days. Want me to line them up?', cta: 'Line them up', prompt: 0 },
    cards: [
      { eyebrow: 'NEW MATCHES', title: 'From your saved searches', value: '12', note: 'Since yesterday', cta: 'See matches', view: 'window' },
      { eyebrow: 'MOVABLE', title: 'Candidates with new signals', value: '3', note: 'Already in your pipeline', cta: 'See candidates', view: 'trend' },
      { eyebrow: 'BRANCHES', title: 'Whole branches worth recruiting', value: '2', note: 'In the Houston metro', cta: 'See branches', view: 'branches' }
    ],
    tray: [
      { kind: 'Movable', title: 'Tom Reyes, Rival Mortgage', why: 'His company announced a merger. 4 years tenure, 62 units.', action: 'Call Tom' },
      { kind: 'New match', title: 'Ana Flores, Gulf Coast Lending', why: 'In the recruiting window with volume up 41%.', action: 'Enroll in sequence' },
      { kind: 'Follow-up', title: 'Kevin Ma, Summit Lending', why: 'Meeting held Tuesday. Follow-up is due.', action: 'Send follow-up' },
      { kind: 'Assigned list', title: 'Houston purchase LOs', why: 'Assigned by Morgan Lee. 20 targets.', action: 'Open list' }
    ],
    views: [
      { id: 'window', label: 'In the recruiting window', noun: 'LOs', total: 38, chips: ['Houston metro', '3 to 5 years tenure', '40+ units'], act: 'Enroll in sequence', results: [
        { name: 'Tom Reyes', sub: 'Rival Mortgage · 4 years', metric: '62 units · 70% purchase · LMI 24%', tag: 'Likely leaving', tagTone: 'danger' },
        { name: 'Ana Flores', sub: 'Gulf Coast Lending · 3 years', metric: '48 units · ↑ 41% · LMI 19%', tag: 'Heavily recruited', tagTone: 'accent' },
        { name: 'Luis Ortega', sub: 'Bayou Home Loans · 5 years', metric: '44 units · 58% of deals from 5 agents', tag: 'Portable book', tagTone: 'neutral' }
      ]},
      { id: 'trend', label: 'Producers trending down', noun: 'LOs', total: 9, chips: ['Houston metro', '↓ 20%+ this year', '30+ units last year'], act: 'Enroll in sequence', results: [
        { name: 'Tom Reyes', sub: 'Rival Mortgage · 4 years', metric: '↓ 30% this year', tag: 'Likely leaving', tagTone: 'danger' },
        { name: 'Beth Carroll', sub: 'Lakeside Mortgage · 4 years', metric: '↓ 26% this year', tag: 'Likely leaving', tagTone: 'danger' }
      ]},
      { id: 'lmi', label: 'Strong LMI producers', noun: 'LOs', total: 14, chips: ['Houston metro', 'LMI share 20%+', '30+ units'], act: 'Enroll in sequence', results: [
        { name: 'Tom Reyes', sub: 'Rival Mortgage', metric: 'LMI 24% · market 16%', tag: 'Fair lending +', tagTone: 'success' },
        { name: 'Joy Adeyemi', sub: 'First Harbor Lending', metric: 'LMI 27% · market 16%', tag: 'Fair lending +', tagTone: 'success' }
      ]},
      { id: 'branches', label: 'Whole branches worth recruiting', noun: 'branches', total: 2, chips: ['Houston metro', '4+ LOs', '150+ units combined'], act: 'Add branch to pipeline', results: [
        { name: 'Katy branch, Rival Mortgage', sub: '6 LOs · branch manager 4 years', metric: '210 units combined · ↓ 18%', tag: 'Whole branch', tagTone: 'neutral' },
        { name: 'Sugar Land, Gulf Coast Lending', sub: '4 LOs · branch manager 3 years', metric: '160 units combined · ↑ 12%', tag: 'Whole branch', tagTone: 'neutral' }
      ]}
    ],
    prompts: [
      { q: 'Find purchase-heavy LOs in Houston in the recruiting window with strong LMI share', view: 'window', did: ['Set the area to the Houston metro', 'Filtered to 3 to 5 years tenure and 40+ units', 'Ranked by purchase share and LMI share'], a: '38 LOs match. Tom Reyes is first: 70% purchase, LMI 24% against a 16% market, and his company just announced a merger.' },
      { q: 'Why is Tom Reyes a good target?', view: 'trend', did: ['Opened Tom Reyes’s production history', 'Checked his referral partners and fair lending scores'], a: 'Three reasons. His production is down 30% after a strong year, 58% of his deals come from 5 agents so his book is portable, and his LMI share beats the market.' },
      { q: 'Which Houston branches are worth recruiting whole?', view: 'branches', did: ['Grouped Houston LOs by branch', 'Kept branches with 4+ LOs and 150+ units'], a: '2 branches fit. Katy at Rival Mortgage is the stronger target: 210 units, and its manager is in the recruiting window.' }
    ],
    crmTitle: 'Recruiting pipeline', sync: 'Sequences send from InGenius',
    stages: [{ name: 'IDENTIFIED', n: '38' }, { name: 'CONTACTED', n: '14' }, { name: 'MEETING', n: '6' }, { name: 'OFFER', n: '2' }],
    log: [{ text: 'Kevin Ma moved to Meeting held', when: 'Tuesday' }, { text: '6 LOs enrolled in Houston Q4 sequence', when: 'Monday' }]
  },
  ae: {
    name: 'Riley Park', initials: 'RP', role: 'Account executive', roleCaps: 'ACCOUNT EXECUTIVE', territory: 'Phoenix territory',
    greeting: 'Good morning, Riley',
    headline: 'Summit Home Loans sent you 6% of its volume last quarter, down from 11%. Worth a visit this week.',
    nudge: { text: 'Jen Alvarez, who sent you 22 loans last year, just joined Crestline Lending. Crestline isn’t an account yet.', cta: 'Show LOs who moved', prompt: 2 },
    cards: [
      { eyebrow: 'NEW ACCOUNTS', title: 'Brokers not sending to you', value: '18', note: 'Loan mix fits your products', cta: 'See brokers', view: 'new' },
      { eyebrow: 'SLIPPING', title: 'Accounts shifting to competitors', value: '3', note: 'Loyalty down 3+ points', cta: 'See accounts', view: 'slip' },
      { eyebrow: 'LO MOVED', title: 'LOs who changed companies', value: '2', note: 'In your territory this month', cta: 'See moves', view: 'moved' }
    ],
    tray: [
      { kind: 'LO moved', title: 'Jen Alvarez joined Crestline Lending', why: 'She sent you 22 loans last year. Crestline isn’t an account yet.', action: 'Draft intro note' },
      { kind: 'Slipping', risk: true, title: 'Summit Home Loans', why: 'Loyalty fell from 11% to 6%. Desert Wholesale gained.', action: 'Plan a visit' },
      { kind: 'New account', title: 'Canyon Mortgage Group', why: '140 loans last year, 45% FHA. Not sending to you.', action: 'Add to CRM' },
      { kind: 'Visit due', title: 'Mesa Home Funding', why: 'Quarterly visit due Friday.', action: 'Log visit' }
    ],
    views: [
      { id: 'new', label: 'Brokers not sending to me', noun: 'brokers', total: 18, chips: ['Phoenix territory', 'Broker shops', 'Loyalty 0%'], act: 'Add to CRM', results: [
        { name: 'Canyon Mortgage Group', sub: 'Broker shop · 9 LOs', metric: '140 loans · 45% FHA' },
        { name: 'Saguaro Home Loans', sub: 'Broker shop · 5 LOs', metric: '96 loans · 30% non-QM' }
      ]},
      { id: 'slip', label: 'Accounts shifting to competitors', noun: 'accounts', total: 3, chips: ['Phoenix territory', 'My accounts', 'Loyalty dropping'], act: 'Plan a visit', results: [
        { name: 'Summit Home Loans', sub: 'Broker shop · 210 loans last year', metric: 'Loyalty 6% · was 11%', tag: 'Slipping', tagTone: 'danger' },
        { name: 'Valley Lending Partners', sub: 'Broker shop · 120 loans', metric: 'Loyalty 9% · was 14%', tag: 'Slipping', tagTone: 'danger' }
      ]},
      { id: 'fha', label: 'Top FHA and VA producers', noun: 'LOs', total: 26, chips: ['Phoenix territory', 'FHA or VA', '20+ loans'], act: 'Add to CRM', results: [
        { name: 'Marco Diaz', sub: 'Canyon Mortgage Group', metric: '38 FHA and VA loans · loyalty 0%' },
        { name: 'Erin Walsh', sub: 'Summit Home Loans', metric: '31 FHA and VA loans · loyalty 10%' }
      ]},
      { id: 'moved', label: 'LOs who moved', noun: 'LOs', total: 2, chips: ['Phoenix territory', 'Changed companies', 'Last 30 days'], act: 'Draft intro note', results: [
        { name: 'Jen Alvarez', sub: 'Summit Home Loans → Crestline Lending', metric: 'Sent you 22 loans last year', tag: 'New org', tagTone: 'accent' },
        { name: 'Paul Ricci', sub: 'Valley Lending → Mesa Home Funding', metric: 'Mesa is already your account', tag: 'Moved', tagTone: 'neutral' }
      ]}
    ],
    prompts: [
      { q: 'Brief me on Summit Home Loans', view: 'slip', did: ['Pulled Summit’s last 12 months', 'Checked their loyalty to you against competing lenders'], a: '210 loans last year, 40% FHA. Their loyalty to you fell from 11% to 6% while Desert Wholesale rose to 19%. Lead with your FHA pricing.' },
      { q: 'Which brokers in my territory do FHA volume and don’t send to us?', view: 'new', did: ['Kept broker shops in your Phoenix territory', 'Kept shops with 0% loyalty to you'], a: '18 brokers match. Canyon Mortgage Group is the biggest at 140 loans, 45% FHA.' },
      { q: 'Who moved companies this month?', view: 'moved', did: ['Checked LOs in your territory for company changes', 'Limited it to the last 30 days'], a: '2 LOs moved. Jen Alvarez is the opening: she sent you 22 loans, and her new company Crestline isn’t an account yet.' }
    ],
    crmTitle: 'My accounts', sync: 'Syncing with your CRM',
    stages: [{ name: 'PROSPECTS', n: '18' }, { name: 'ACTIVE', n: '42' }, { name: 'SLIPPING', n: '3' }, { name: 'VISITS DUE', n: '4' }],
    log: [{ text: 'Visit logged at Valley Lending Partners', when: 'Yesterday' }, { text: 'Canyon Mortgage Group added as prospect', when: 'Monday' }]
  }
};
var ORDER = ['lo', 'exec', 'rec', 'ae'];
var FILTER_GROUPS = [
  { name: 'LOAN TYPE', options: ['Purchase', 'Refinance', 'FHA', 'VA', 'Conventional', 'Non-QM'] },
  { name: 'TIME PERIOD', options: ['Last 90 days', 'Last 12 months', 'Last 24 months'] },
  { name: 'VOLUME', options: ['10+ deals', '20+ deals', '40+ deals'] },
  { name: 'FAIR LENDING', options: ['LMI tracts', 'Majority-minority tracts'] }
];

var EXTRA = {
  lo: { first: 'Alex', page: 'Home', chartTitle: 'Referral deals', chartUnit: 'Deals', tableTitle: 'Referral partners', max: 10,
    chartTip: 'Agents you called within 48 hours of a new listing sent you twice as many deals. Want me to line up this week’s calls?', chartCta: 'Line up my calls', tipPrompt: 0,
    kpis: [{ label: 'Loans closed', value: '14', compare: '10', delta: '↑ 40%', up: true }, { label: 'Referral volume', value: '$3.55M', compare: '$3.72M', delta: '↓ 5%', up: false }, { label: 'Active partners', value: '22', compare: '16', delta: '↑ 6', up: true }],
    tiles: ['Top agents to call', 'Refi candidates', 'Heavy hitters in 78704', 'What should I do first?'] },
  exec: { first: 'Morgan', chartTitle: 'Team production', chartUnit: 'Units', tableTitle: 'Team health', max: 12,
    chartTip: 'Houston is running 1.1 points below last quarter’s purchase share. Two LOs explain most of it.', chartCta: 'Explain the drop', tipPrompt: 0,
    kpis: [{ label: 'Team units', value: '412', compare: '398', delta: '↑ 4%', up: true }, { label: 'Purchase share', value: '4.2%', compare: '4.5%', delta: '↓ 0.3 pts', up: false }, { label: 'LMI share', value: '18.4%', compare: '17.9%', delta: '↑ 0.5 pts', up: true }],
    tiles: ['Why is Houston down?', 'Who might leave?', 'Fair lending for the board', 'What should I do first?'] },
  rec: { first: 'Casey', chartTitle: 'Outreach activity', chartUnit: 'Touches', tableTitle: 'Candidates', max: 11,
    chartTip: 'Candidates you reached within a week of a company change booked meetings 3 times as often.', chartCta: 'Find recent movers', tipPrompt: 0,
    kpis: [{ label: 'Candidates contacted', value: '38', compare: '31', delta: '↑ 23%', up: true }, { label: 'Meetings held', value: '6', compare: '4', delta: '↑ 2', up: true }, { label: 'Hires this quarter', value: '2', compare: '1', delta: '↑ 1', up: true }],
    tiles: ['Find movable LOs', 'Why Tom Reyes?', 'Whole branches', 'What should I do first?'] },
  ae: { first: 'Riley', chartTitle: 'Loans submitted by your accounts', chartUnit: 'Loans', tableTitle: 'Accounts', max: 12,
    chartTip: 'Submissions dipped mid-month when Summit Home Loans shifted volume to Desert Wholesale.', chartCta: 'Brief me on Summit', tipPrompt: 0,
    kpis: [{ label: 'Loans submitted', value: '318', compare: '344', delta: '↓ 8%', up: false }, { label: 'Active accounts', value: '42', compare: '40', delta: '↑ 2', up: true }, { label: 'Account loyalty', value: '12%', compare: '13%', delta: '↓ 1 pt', up: false }],
    tiles: ['Brief me on Summit', 'Brokers not sending to us', 'Who moved companies?', 'What should I do first?'] }
};
