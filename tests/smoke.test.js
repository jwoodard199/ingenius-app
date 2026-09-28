// Runs every persona through every report and the main interactions, without a browser.
// Usage: node tests/smoke.test.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
class DCLogic { constructor(p) { this.props = p; this.state = {}; } setState(o) { Object.assign(this.state, o); } }
global.DCLogic = DCLogic;
const files = ['assets/data/ig-geo.js', 'src/data/personas.js', 'src/ui/style-tokens.js', 'src/data/generators.js', 'src/data/reports.js', 'src/lib/table.js', 'src/lib/map.js', 'src/lib/flow.js', 'src/lib/sankey.js', 'src/data/pipeline.js', 'src/app.js'];
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
  }
}
console.log('ok: ' + checks + ' checks passed');
