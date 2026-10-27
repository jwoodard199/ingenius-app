// Runs every persona through every report and the main interactions, without a browser.
// Usage: node tests/smoke.test.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
class DCLogic { constructor(p) { this.props = p; this.state = {}; } setState(o) { Object.assign(this.state, o); } }
global.DCLogic = DCLogic;
const files = ['assets/data/ig-geo.js', 'src/data/personas.js', 'src/ui/style-tokens.js', 'src/data/generators.js', 'src/data/reports.js', 'src/lib/table.js', 'src/lib/map.js', 'src/lib/flow.js', 'src/lib/sankey.js', 'src/data/pipeline.js', 'src/data/directory.js', 'src/lib/search.js', 'src/app.js'];
const src = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') + '\n;global.Component = Component;';
new Function(src)();
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } };
for (const persona of ['Loan officer', 'Lender executive', 'Recruiter', 'Account executive']) {
  for (const compact of [false, true]) {
    const c = new Component({ persona, compact, allowCompare: true });
    let v = c.renderVals();
    for (const tab of ['home', 'explore', 'actions', 'crm', 'reports']) { c.state.tab = tab; v = c.renderVals(); ok(v.pageTitle, persona + ' ' + tab + ' has a title'); }
    for (let i = 0; i < v.rLib.length; i++) {
      v.rLib[i].pick(); v = c.renderVals();
      ok(v.isMap || v.isFlow || v.isTable, persona + ' report ' + i + ' renders a view');
      ok(Array.isArray(v.rRows), persona + ' report ' + i + ' has a detail table');
      ok(v.brief && v.brief.bullets.length > 0, persona + ' report ' + i + ' has a Genie briefing');
      if (v.isFlow) ok(v.flowRep && v.flowRep.measures.length === 4 && v.flowRep.lists.length > 0, persona + ' report ' + i + ' has a report panel');
      if (v.isMap) { ok(v.mapRep.measures.length > 0 && v.hasLoTable && v.loRows.length > 0, persona + ' map has a region report, lender table and LO table'); v.mapRegions[0].click(); v = c.renderVals(); ok(v.mapRep.title, 'region report follows the drill'); v.mapUp && v.mapUp(); v = c.renderVals(); }
      if (v.isFlow) {
        ok(v.flowLinks.length > 0 && v.flowLabels.length > 0, persona + ' Sankey has bands and labels');
        if (v.flowHasDir) { const t = v.flowTitle; v.flowDirs[1].go(); v = c.renderVals(); ok(v.flowTitle !== t, 'Coming and Going toggle'); v.flowDirs[0].go(); v = c.renderVals(); }
      }
      if (v.isTable && v.rAi[0]) { v.rAi[0].run(); v = c.renderVals(); ok(v.rHasBanner, 'Genie filter banner'); }
      v.rHead[0].click(); v = c.renderVals();
    }
    // Home widgets: persona defaults, customize, and the movement widget link.
    c.state.tab = 'home'; v = c.renderVals();
    if (persona === 'Recruiter') ok(v.hw.movement, 'recruiter Home has the movement widget');
    v.homeOpts.forEach(o => o.checked === 'true' && o.toggle()); v = c.renderVals(); ok(v.homeNone, 'all widgets can be turned off');
    v.homeReset(); v = c.renderVals(); ok(!v.homeNone, 'reset restores defaults');
    v.hmMoveOpen(); v = c.renderVals(); ok(v.isFlow, persona + ' movement widget opens the movement report');
    // Pipeline board: move with buttons, drag and drop, Genie filter, add, list view.
    v.hmPipeOpen(); v = c.renderVals(); ok(v.isCrm && v.plColumns.length === 5, persona + ' pipeline board');
    const first = v.plColumns[0].cards[0]; first.toggle(); v = c.renderVals();
    v.plColumns[0].cards.find(x => x.open).fwd(); v = c.renderVals();
    ok(v.plColumns[1].cards.some(x => x.name === first.name), 'card moves to the next stage');
    const dragged = v.plColumns[2].cards[0]; dragged.dragStart({ dataTransfer: { setData() {} } });
    v.plColumns[4].drop({ preventDefault() {}, currentTarget: { style: {} } }); v = c.renderVals();
    ok(v.plColumns[4].cards.some(x => x.name === dragged.name), 'drag and drop moves a card');
    v.plGenieRun(); v = c.renderVals(); ok(v.plHasPills, 'Genie filter pill');
    v.plClearAll(); v.plColumns[0].startAdd(); v = c.renderVals();
    v.plColumns[0].onDraft({ target: { value: 'New name' } }); v = c.renderVals(); v.plColumns[0].saveAdd(); v = c.renderVals();
    ok(v.plColumns[0].cards.some(x => x.name === 'New name'), 'add a card');
    v.plViews[1].go(); v = c.renderVals(); ok(v.plIsList && v.plRows.length > 0, 'list view table');
    // Genie: the report summary bubble can be hidden per report or turned off.
    c.state.tab = 'reports'; v = c.renderVals(); ok(v.nudgeShow, 'summary bubble on reports');
    v.nudgeTipOn(); v = c.renderVals(); ok(v.nudgeTip, 'bell shows its tooltip on hover');
    v.nudgeGo(); v = c.renderVals(); ok(c.state.aiPop && c.state.aiBrief, 'Summarize opens the briefing in Genie');
    v.aiClose ? v.aiClose() : c.setState({ aiPop: false }); v = c.renderVals(); ok(!v.nudgeShow, 'bubble stays away on a report already summarized');
    v.nudgeOff(); v = c.renderVals(); v.nudgeToggle(); v = c.renderVals(); ok(!c.state.nudgeOff, 'bubble can be turned back on');
    // Genie: full-screen chat builds a report and saves it to Reports.
    c.state.aiPop = true; v = c.renderVals();
    v.aiFullToggle(); v = c.renderVals(); ok(v.aiFull && /z-index: 50/.test(v.aiPopStyle), 'Genie expands to full screen');
    v.aiSuggest[0].ask(); v = c.renderVals(); ok(v.aiMsgs.length === 1 && v.aiMsgs[0].hasReport, 'Genie builds a report from a question');
    v.aiMsgs[0].open(); v = c.renderVals(); ok(c.state.tab === 'reports' && v.rep.custom && !c.state.aiFull, 'the Genie report opens in Reports as a custom report');
    ok(v.rLib.some(function (l) { return /^✦ /.test(l.label); }), 'custom report gets its own report tab');
    c.state.tab = 'crm'; v = c.renderVals();
    const words = JSON.stringify(v.plColumns.map(cl => cl.addLabel)) + v.plAddLabel + v.plCountTag;
    ok(!/task|opportunit/i.test(words), 'deal and recruit wording');
    // Global search: categorized quick results, the one-category toggle, and the advanced page.
    c.state.tab = 'home'; v = c.renderVals();
    ok(compact ? v.srShowIcon : v.srShowBox, persona + ' header has search');
    if (compact) { v.srOpenIcon(); v = c.renderVals(); ok(v.srShowBox && v.srPanelOpen, 'phone search opens full screen'); }
    v.srOnInput({ target: { value: 'a' } }); v = c.renderVals();
    ok(v.srPanelOpen && v.srGroups.length === 6, persona + ' quick search returns all six categories');
    ok(v.srGroups.every(g => g.rows.length <= 3), 'quick search shows at most 3 per category');
    ok(v.srGroups.some(g => g.total > g.rows.length), 'quick search reports totals beyond what it shows');
    v.srOnKey({ key: 'ArrowDown', preventDefault() {} }); v = c.renderVals(); ok(v.srActive, 'arrow keys move through results');
    v.srChips[3].pick(); v = c.renderVals();
    ok(v.srGroups.length === 1 && v.srGroups[0].label === 'Real estate agents' && v.srGroups[0].rows.length <= 6 && v.srHasOnly, 'toggle searches one category');
    v.srOnlyClear(); v = c.renderVals(); ok(v.srGroups.length === 6, 'toggle back to all categories');
    v.srGroups[5].seeAll(); v = c.renderVals();
    ok(v.isSearch && c.state.srCat === 'property' && v.srRows.length > 0 && v.srTabs.length === 6, 'See all opens advanced search for that category');
    ok(v.pageTitle === 'Search' && !v.srPanelOpen, 'advanced page replaces the dropdown');
    for (const tb of v.srTabs) {
      tb.pick(); v = c.renderVals();
      ok(v.srPills.length >= 3, persona + ' ' + tb.label + ' has its own filters');
      const n0 = v.srRows.length + (v.srMore ? 1 : 0);
      v.srGenieRun(); v = c.renderVals(); ok(v.srHasBanner && v.srPills.some(p => p.ai), tb.label + ' Genie filter');
      v.srUndo(); v = c.renderVals(); ok(!v.srHasFilters, 'Genie filter undo');
      const fp = v.srPills.find(p => !p.locked); fp.toggle(); v = c.renderVals(); ok(v.srPopOpen && v.srPopOpts.length > 0, 'filter popover');
      v.srPopOpts[v.srPopOpts.length > 1 ? 1 : 0].pick(); v = c.renderVals(); ok(v.srHasFilters, tb.label + ' filter applies');
      v.srResetF(); v = c.renderVals();
      v.srSortToggle(); v = c.renderVals(); v.srSorts[1].pick(); v = c.renderVals(); ok(!v.srSortPop, 'sort applies');
      if (v.srRows[0]) { v.srRows[0].toggle(); v = c.renderVals(); ok(v.srRows[0].open && v.srRows[0].detail.length > 0, 'row expands to details'); v.srRows[0].act(); v = c.renderVals(); ok(v.srRows[0].actDone, 'row action syncs to CRM'); }
      if (v.srRows[0] && v.srRows[0].hasLinks) { v.srRows[0].links[0].go(); v = c.renderVals(); ok(v.isSearch && v.srRows.length > 0, tb.label + ' links to the related company or people'); }
      c.state.srQ = 'a'; v = c.renderVals();
    }
    if (persona === 'Loan officer') { c.state.allowCompare = false; c.state.srCat = 'lo'; v = c.renderVals(); ok(v.srGated && v.srRows[0].cells[0].text === 'Hidden' && v.srPills.find(p => p.label === 'Units').locked, 'org permission hides LO production in search'); c.state.allowCompare = true; }
    v.srOnInput({ target: { value: 'zzqx' } }); v = c.renderVals(); ok(v.srNoRows, 'advanced search empty state');
    c.state.tab = 'home'; v = c.renderVals(); v.srOnInput({ target: { value: 'zzqx' } }); v = c.renderVals(); ok(v.srNoHits, 'quick search empty state');
  }
}
// Menu settings: position, order, show/hide, icon-only labels, phone overflow under More, reset, and saving.
{
  const store = {}; global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const c = new Component({ persona: 'Loan officer', compact: false, allowCompare: true });
  let v = c.renderVals();
  ok(v.navPos === 'bottom' && v.menu.length === 5 && v.navIsDefault, 'menu starts at the bottom with every item');
  c.state.modal = 'settings'; v = c.renderVals(); ok(v.modalSettings && v.navItems.length === 5 && v.navItems[0].locked, 'settings lists the menu items with Home locked first');
  v.navPositions[1].pick(); v = c.renderVals(); ok(v.navPos === 'left' && /flex-direction: column/.test(v.menuStyle) && /232px/.test(v.mainStyle), 'left rail');
  v.navPositions[2].pick(); v = c.renderVals(); ok(v.navPos === 'top' && /order: 1/.test(v.menuStyle) && /order: 2/.test(v.mainStyle) && /display: none/.test(v.fadeStyle), 'top bar');
  v.navItems[3].up(); v = c.renderVals(); ok(v.menu.map(m => m.label).join() === 'Home,Explore,Reports,Action items,My pipeline', 'arrows reorder');
  v.navItems[1].dragStart({}); v.navItems[4].drop({ preventDefault() {} }); v = c.renderVals(); ok(v.menu[4].label === 'Explore', 'drag and drop reorders');
  v.navItems[1].up(); v = c.renderVals(); ok(v.menu[0].label === 'Home', 'Home stays first');
  v.navItems[1].toggle(); v.navItems[2].toggle(); v = c.renderVals(); ok(v.menu.length === 3, 'items can be hidden');
  v.navItems[3].toggle(); v = c.renderVals(); ok(v.menu.length === 2 && v.navItems[4].showDisabled, 'at least two items stay visible');
  v.navLabelOpts[1].pick(); v = c.renderVals(); ok(!v.menu[0].showLabel && v.menu[0].aria === 'Home', 'icons only keeps an accessible name');
  ok(JSON.parse(store['ingenius.menu']).pos === 'top', 'settings are saved');
  const again = new Component({ persona: 'Recruiter', compact: false, allowCompare: true }); ok(again.renderVals().menu.length === 2, 'settings load on the next visit');
  v.personaList[2].pick(); v = c.renderVals(); ok(v.menu.length === 2, 'settings survive a persona switch');
  v.navReset(); v = c.renderVals(); ok(v.navIsDefault && v.menu.length === 5, 'reset to default');
  const ph = new Component({ persona: 'Loan officer', compact: true, allowCompare: true });
  ph.state.nav.pos = 'left'; v = ph.renderVals(); ok(v.navPos === 'bottom' && !v.navHasMore, 'phone keeps the bottom bar');
  ph.setNav({ phoneMax: 3 }); v = ph.renderVals(); ok(v.menu.length === 2 && v.navHasMore && v.navMoreItems.length === 3, 'phone overflow goes under More');
  v.navMoreToggle(); v = ph.renderVals(); ok(v.navMoreOpen, 'More opens');
  v.navMoreItems[2].go(); v = ph.renderVals(); ok(ph.state.tab === 'crm' && !v.navMoreOpen && v.navMoreCurrent === 'true', 'More item opens its page and marks More current');
  delete global.localStorage;
}
console.log('ok: ' + checks + ' checks passed');
