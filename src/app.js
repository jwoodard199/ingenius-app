// The app component: state, and the values each part of the template reads.
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = this.fresh(this.keyFor(props.persona), props.allowCompare !== false);
  }
  keyFor(label) { return { 'Loan officer': 'lo', 'Lender executive': 'exec', 'Recruiter': 'rec', 'Account executive': 'ae' }[label] || 'lo'; }
  componentDidUpdate(prev) {
    if (prev.persona !== this.props.persona) this.setState(this.fresh(this.keyFor(this.props.persona), this.state.allowCompare));
    if (prev.allowCompare !== this.props.allowCompare) this.setState({ allowCompare: this.props.allowCompare !== false });
  }
  fresh(p, allow) {
    return { persona: p, allowCompare: allow, tab: 'home', viewId: null, chips: null, banner: null, roadUndone: false, aiPop: false, modal: null, thread: [], done: {}, acted: {}, expanded: 0, fsel: {}, log: [], hover: null, reportId: null, rFilters: [], rSort: { col: null, dir: 'asc' }, rSearch: '', rAdd: false, rEdit: null, rHoverBin: null, rBanner: null, mapSt: undefined, mapCo: undefined, mapMetric: null, mapHover: null, mapSel: null, mapShow: 'all', mapPop: null, mapNote: null, briefHow: false, aiBrief: false, flowMeasure: null, flowPeriod: null, flowFocus: null, flowHover: null, flowPop: null, flowDir: 'going', flowCohort: 'a', plView: 'board', plPri: {}, plOwn: {}, plStuck: false, plQ: '', plPop: null, plSel: null, plMoves: {}, plAdded: [], plAdd: null, plDraft: '', plColSort: {}, plBanner: null, loSearch: '', loSort: { col: null, dir: 'asc' }, homeW: null, homeEdit: false, nudgeOff: false, nudgeHidden: {}, nudgeTip: false };
  }
  data() { return PERSONAS[this.state.persona]; }
  prompts() {
    var d = this.data();
    var t0 = d.tray[0];
    return d.prompts.concat([{ q: 'What should I do first today?', view: d.views[0].id, did: ['Ranked your open action items by value and urgency', 'Opened the view that goes with the top one'], a: 'Start with ' + t0.title + '. ' + t0.why + ' It’s at the top of your action items.' }]);
  }
  findView(id) { var vs = this.data().views; for (var i = 0; i < vs.length; i++) { if (vs[i].id === id) return vs[i]; } return vs[0]; }
  viewState(id, ai) {
    var v = this.findView(id);
    var chips = v.chips.map(function (c) { return { label: c, ai: !!ai }; });
    var banner = null;
    if (v.road) {
      chips = v.road.after.map(function (c) { return { label: c, ai: true }; });
      banner = v.road.msg;
    } else if (ai) {
      banner = 'Genie set ' + chips.length + ' filters for you. Remove any of them, or undo them all.';
    }
    return { viewId: v.id, chips: chips, banner: banner, roadUndone: false };
  }
  run(i) {
    var p = this.prompts()[i];
    var thread = this.state.thread.concat([{ q: p.q, did: p.did, a: p.a }]);
    this.setState(Object.assign(this.viewState(p.view, true), { thread: thread }));
  }
  addLog(text) { return [{ text: text, when: 'Just now' }].concat(this.state.log); }
  gridParts(cols, data, allData, hidden, sortKey) {
    var self = this, s = this.state, first = cols[0], sk = sortKey || 'rSort', so = s[sk] || { col: null, dir: 'asc' };
    var isNum = function (c) { return c.t !== 'text'; };
    var sum = function (arr, k) { return arr.reduce(function (a, r) { return a + r[k]; }, 0); };
    // Table
    var maxOf = {};
    cols.forEach(function (c) { if (c.bar) { var mx = 0; allData.forEach(function (r) { if (r[c.k] > mx) mx = r[c.k]; }); maxOf[c.k] = mx || 1; } });
    var template = '40px ' + cols.map(function (c) { return 'minmax(' + Math.round(c.w * 0.85) + 'px, 1fr)'; }).join(' ');
    var minW = 40 + cols.reduce(function (a, c) { return a + Math.round(c.w * 0.85); }, 0);
    var rowBase = 'display: grid; grid-template-columns: ' + template + '; min-width: ' + minW + 'px;';
    var CELL = 'box-sizing: border-box; padding: 0 10px; display: flex; align-items: center; min-height: 34px; border-right: 1px solid #EEF0F6; font-size: 13px; line-height: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; font-variant-numeric: tabular-nums; ';
    var NUM = 'box-sizing: border-box; padding: 0 8px; display: flex; align-items: center; justify-content: flex-end; min-height: 34px; font-size: 11px; color: #8286A8; border-right: 1px solid #DADCE8; position: sticky; left: 0; z-index: 1; font-variant-numeric: tabular-nums; background: #F4F5F9; ';
    var head = cols.map(function (c) {
      var on = so.col === c.k;
      return { label: c.l, arrow: on ? (so.dir === 'desc' ? '↓' : '↑') : '', sort: on ? (so.dir === 'desc' ? 'descending' : 'ascending') : 'none',
        cellStyle: 'box-sizing: border-box; display: flex; border-right: 1px solid #DADCE8; min-width: 0;',
        btnStyle: FONT + 'flex-grow: 1; min-width: 0; min-height: 34px; display: flex; align-items: center; gap: 4px; padding: 0 10px; border: none; background: ' + (on ? '#E6E8F2' : 'transparent') + '; color: #474945; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; ' + (isNum(c) ? 'justify-content: flex-end;' : 'justify-content: flex-start;'),
        arrowStyle: 'font-size: 12px; color: #24285D;',
        click: function () { var p = {}; p[sk] = on ? (so.dir === 'asc' ? { col: c.k, dir: 'desc' } : { col: null, dir: 'asc' }) : { col: c.k, dir: isNum(c) ? 'desc' : 'asc' }; self.setState(p); } };
    });
    var body = data.map(function (row, i) {
      return { n: i + 1, style: rowBase + 'border-bottom: 1px solid #EEF0F6; background: #FFFFFF;',
        cells: cols.map(function (c) {
          var v = row[c.k], locked = c.gated && hidden;
          var color = locked ? '#8286A8' : c.t === 'trend' ? (v > 0 ? '#1D7A55' : v < 0 ? '#B3261E' : '#474945') : '#24285D';
          return { text: locked ? 'Hidden by org' : fmtCell(c, v), bar: !!c.bar && !locked,
            barStyle: 'position: absolute; top: 7px; bottom: 7px; left: 0; border-radius: 0 4px 4px 0; background: rgba(36,40,93,0.10); width: ' + Math.max(2, Math.round(v / (maxOf[c.k] || 1) * 100)) + '%;',
            style: CELL + (isNum(c) ? 'justify-content: flex-end; ' : '') + 'color: ' + color + '; font-weight: ' + ((c.t === 'trend' || c === first) ? '600' : '400') + ';' + (locked ? ' font-style: italic;' : '') };
        }) };
    });
    var foot = cols.map(function (c, i) {
      var text = '';
      if (i === 0) text = 'Total · ' + data.length;
      else if (data.length && ((c.t === 'num' || c.t === 'money') && !c.avg || c.sum)) text = fmtCell(c, sum(data, c.k));
      else if (data.length && (c.t === 'pct' || c.avg)) text = 'avg ' + fmtCell(c, sum(data, c.k) / data.length);
      return { text: text, style: CELL + 'font-weight: 600; ' + (isNum(c) ? 'justify-content: flex-end;' : '') };
    });
    return { head: head, body: body, foot: foot, rowBase: rowBase, CELL: CELL, NUM: NUM };
  }
  pipeItems() {
    var s = this.state, P = PIPELINES[s.persona];
    return P.items.concat(s.plAdded).map(function (it) {
      var moved = s.plMoves[it.id];
      return Object.assign({}, it, moved === undefined ? {} : { stage: moved, days: 0 });
    });
  }
  pipeMove(it, to) {
    var P = PIPELINES[this.state.persona];
    var mv = Object.assign({}, this.state.plMoves); mv[it.id] = to;
    this.setState({ plMoves: mv, log: this.addLog(it.name + ' moved to ' + P.stages[to]) });
  }
  pipeVals(compact) {
    var self = this, s = this.state, P = PIPELINES[s.persona], d = this.data();
    var all = this.pipeItems();
    var q = (s.plQ || '').toLowerCase();
    var priOn = Object.keys(s.plPri).filter(function (k) { return s.plPri[k]; });
    var ownOn = Object.keys(s.plOwn).filter(function (k) { return s.plOwn[k]; }).map(Number);
    var shown = all.filter(function (it) {
      if (priOn.length && priOn.indexOf(it.pri) < 0) return false;
      if (ownOn.length && ownOn.indexOf(it.owner) < 0) return false;
      if (s.plStuck && !(it.days >= PIPE_STUCK && it.stage < P.stages.length - 1)) return false;
      return !q || (it.name + ' ' + it.sub + ' ' + (it.tag || '')).toLowerCase().indexOf(q) >= 0;
    });
    var last = P.stages.length - 1;
    var open = all.filter(function (it) { return it.stage < last; });
    var openValue = open.reduce(function (a, it) { return a + it.value; }, 0);
    var stuck = open.filter(function (it) { return it.days >= PIPE_STUCK; });
    var stuckValue = stuck.reduce(function (a, it) { return a + it.value; }, 0);
    var money = function (v) { return pipeMoney(v, P.perYear); };
    var PRI = { High: 'background: #FBEAE9; color: #B3261E;', Medium: 'background: #FEF3E6; color: #A34F00;', Low: 'background: #EEF7F2; color: #1D7A55;' };
    var TAG = 'display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 999px; font-size: 12px; line-height: 16px; font-weight: 600; white-space: nowrap; ';
    var ICON = 'display: inline-flex; align-items: center; gap: 3px; font-size: 12px; line-height: 16px; color: #474945; font-variant-numeric: tabular-nums;';
    var BTN = FONT + 'height: 32px; display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; box-sizing: border-box; ';
    var avatar = function (o, size) { return 'width: ' + size + 'px; height: ' + size + 'px; flex-shrink: 0; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-family: Montserrat, sans-serif; font-size: ' + (size > 26 ? 12 : 10) + 'px; font-weight: 700; border: 2px solid #FFFFFF; box-sizing: border-box; ' + ['background: #24285D; color: #FFFFFF;', 'background: #F89624; color: #24285D;', 'background: #B6BBD9; color: #24285D;'][o % 3]; };

    var card = function (it) {
      var sel = s.plSel === it.id, c = pipeCounts(it.id), owner = P.team[it.owner] || P.team[0];
      var stale = it.days >= PIPE_STUCK && it.stage < last;
      return {
        id: it.id, name: it.name, sub: it.sub, value: money(it.value), pri: it.pri, priStyle: TAG + PRI[it.pri],
        hasTag: !!it.tag, tag: it.tag || '', tagStyle: TAG + 'background: #F4F5F9; color: #24285D;',
        initials: owner.i, ownerName: owner.n, avatarStyle: avatar(it.owner, 24),
        date: it.date, dateLabel: P.dateLabel, notes: String(c.notes), files: String(c.files),
        daysText: it.days === 0 ? 'Today' : it.days + 'd', daysLabel: it.days === 0 ? 'Moved to this stage today' : it.days + ' days in this stage',
        daysStyle: ICON + (stale ? 'color: #B3261E; font-weight: 600;' : ''),
        iconStyle: ICON, open: sel, expanded: sel ? 'true' : 'false', nextStep: it.nextStep || 'Added from InGenius. Next step not set yet.',
        style: 'background: #FFFFFF; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; padding: 12px; box-sizing: border-box; cursor: grab; ' +
          (sel ? 'border: 1px solid #24285D; box-shadow: 0 6px 18px rgba(36,40,93,0.16);' : 'border: 1px solid #DADCE8; box-shadow: 0 1px 2px rgba(36,40,93,0.06);'),
        toggle: function () { self.setState({ plSel: sel ? null : it.id, plPop: null }); },
        hasBack: it.stage > 0, backLabel: '← ' + P.stages[Math.max(0, it.stage - 1)], back: function () { self.pipeMove(it, it.stage - 1); },
        hasFwd: it.stage < last, fwdLabel: (P.next[it.stage] || '') + ' →', fwd: function () { self.pipeMove(it, it.stage + 1); },
        backStyle: BTN + 'border: 1px solid #DADCE8; background: #FFFFFF; color: #24285D;',
        fwdStyle: BTN + 'border: 1px solid #24285D; background: #24285D; color: #FFFFFF;',
        dragStart: function (e) { self._plDrag = it.id; if (e && e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', it.id); } catch (err) {} } },
        dragEnd: function () { self._plDrag = null; }
      };
    };
    var sortFns = {
      value: function (a, b) { return b.value - a.value; },
      days: function (a, b) { return b.days - a.days; },
      pri: function (a, b) { return ['High', 'Medium', 'Low'].indexOf(a.pri) - ['High', 'Medium', 'Low'].indexOf(b.pri); }
    };
    var OPT = FONT + 'height: 34px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: left; color: #24285D; ';
    var ICONBTN = 'width: 28px; height: 28px; border: none; border-radius: 8px; background: transparent; color: #474945; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0;';
    var colW = compact ? 272 : 0;
    var columns = P.stages.map(function (name, i) {
      var items = shown.filter(function (it) { return it.stage === i; });
      var mode = s.plColSort[i] || 'pri';
      items = items.slice().sort(sortFns[mode]);
      var total = items.reduce(function (a, it) { return a + it.value; }, 0);
      var adding = s.plAdd === i, menu = s.plPop === 'col' + i;
      var clearHi = function (e) { if (e && e.currentTarget && e.currentTarget.style) e.currentTarget.style.boxShadow = 'none'; };
      return {
        name: name, count: String(items.length), total: items.length ? money(total) : '',
        dotStyle: 'width: 10px; height: 10px; border-radius: 999px; flex-shrink: 0; background: ' + PIPE_DOTS[i] + ';',
        cards: items.map(card), empty: items.length === 0,
        emptyText: s.plStuck || priOn.length || ownOn.length || q ? 'Nothing here matches your filters.' : 'Drop a ' + P.noun + ' here.',
        style: 'background: #F4F5F9; border-radius: 16px; padding: 10px; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; box-shadow: none; transition: box-shadow 120ms; min-width: 0; ' + (compact ? 'width: ' + colW + 'px; flex-shrink: 0;' : ''),
        addLabel: '+ Add new ' + P.noun, addAria: 'Add a ' + P.noun + ' to ' + name, menuAria: name + ' options',
        addOpen: adding, draft: s.plDraft || '', addPh: P.Noun + ' name',
        onDraft: function (e) { self.setState({ plDraft: e && e.target ? e.target.value : '' }); },
        startAdd: function () { self.setState({ plAdd: adding ? null : i, plDraft: '', plPop: null }); },
        cancelAdd: function () { self.setState({ plAdd: null, plDraft: '' }); },
        saveAdd: function () {
          var nm = (self.state.plDraft || '').trim();
          if (!nm) return;
          var it = { id: 'new' + (self.state.plAdded.length + 1), name: nm, sub: 'Added just now', value: 0, stage: i, pri: 'Medium', owner: 0, date: PIPE_TODAY, days: 0, tag: 'New' };
          self.setState({ plAdded: self.state.plAdded.concat([it]), plAdd: null, plDraft: '', plSel: it.id, log: self.addLog(P.Noun + ' added: ' + nm + ' (' + name + ')') });
        },
        addBtnStyle: FONT + 'height: 38px; border: 1px dashed #8286A8; border-radius: 12px; background: transparent; color: #474945; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%;',
        iconBtn: ICONBTN, menuOpen: menu, menuExpanded: menu ? 'true' : 'false',
        toggleMenu: function () { self.setState({ plPop: menu ? null : 'col' + i }); },
        sortOpts: [['pri', 'Sort by priority'], ['value', 'Sort by value'], ['days', 'Sort by days in stage']].map(function (o) {
          var on = o[0] === mode;
          return { label: o[1], pressed: on ? 'true' : 'false', style: OPT + (on ? 'background: #F4F5F9; font-weight: 600;' : 'background: transparent;'),
            pick: function () { var cs = Object.assign({}, self.state.plColSort); cs[i] = o[0]; self.setState({ plColSort: cs, plPop: null }); } };
        }),
        menuStyle: 'position: absolute; z-index: 12; top: 36px; right: 0; width: 220px; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 10px; padding: 6px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 8px 24px rgba(36,40,93,0.16);',
        dragOver: function (e) { if (!self._plDrag) return; if (e && e.preventDefault) e.preventDefault(); if (e && e.currentTarget && e.currentTarget.style) e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #24285D'; },
        dragLeave: clearHi,
        drop: function (e) {
          if (e && e.preventDefault) e.preventDefault(); clearHi(e);
          var id = self._plDrag; self._plDrag = null;
          var it = self.pipeItems().filter(function (x) { return x.id === id; })[0];
          if (it && it.stage !== i) self.pipeMove(it, i);
        }
      };
    });

    // Filters: Notion-style pills, plus the Genie shortcut for stuck items.
    var pills = [];
    if (priOn.length) pills.push({ label: 'Priority', value: priOn.join(', '), clear: function () { self.setState({ plPri: {} }); } });
    if (ownOn.length) pills.push({ label: 'Owner', value: ownOn.map(function (o) { return P.team[o].n; }).join(', '), clear: function () { self.setState({ plOwn: {} }); } });
    if (s.plStuck) pills.push({ label: 'Genie', value: 'In one stage ' + PIPE_STUCK + '+ days', clear: function () { self.setState({ plStuck: false, plBanner: null }); } });
    var toggleIn = function (key, k) { return function () { var o = Object.assign({}, self.state[key]); o[k] = !o[k]; var p = {}; p[key] = o; self.setState(p); }; };
    var chk = function (on) { return FONT + 'height: 32px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: 8px; font-size: 13px; cursor: pointer; ' + (on ? 'border: 1px solid #24285D; background: #24285D; color: #FFFFFF; font-weight: 600;' : 'border: 1px solid #DADCE8; background: #FFFFFF; color: #24285D;'); };
    var filterCount = priOn.length + ownOn.length + (s.plStuck ? 1 : 0);

    // List view: the same items as a sortable table.
    var rows = shown.map(function (it) { return { name: it.name, sub: it.sub, stage: P.stages[it.stage], si: it.stage, value: it.value, pri: it.pri, owner: (P.team[it.owner] || P.team[0]).n, date: it.date, days: it.days }; });
    var tcols = [{ k: 'name', l: P.Noun, t: 'text', w: 200 }, { k: 'stage', l: 'Stage', t: 'text', w: 130 }, { k: 'value', l: P.valueLabel, t: 'money', w: 190, bar: true },
      { k: 'pri', l: 'Priority', t: 'text', w: 100 }, { k: 'owner', l: 'Owner', t: 'text', w: 140 }, { k: 'date', l: P.dateLabel, t: 'text', w: 120 }, { k: 'days', l: 'In stage', t: 'days', w: 110, avg: true }];
    var sc = s.rSort.col && tcols.some(function (c) { return c.k === s.rSort.col; }) ? s.rSort.col : 'si';
    var sd = s.rSort.col ? (s.rSort.dir === 'desc' ? -1 : 1) : 1;
    if (sc === 'stage') sc = 'si';
    rows = rows.slice().sort(function (a, b) { var x = a[sc], y = b[sc]; return (x > y ? 1 : x < y ? -1 : 0) * sd || b.value - a.value; });
    var tb = this.gridParts(tcols, rows, all.map(function (it) { return { value: it.value }; }), false);

    var viewBtn = function (id, label) {
      var on = (s.plView || 'board') === id;
      return { label: label, pressed: on ? 'true' : 'false', go: function () { self.setState({ plView: id, plPop: null, rSort: { col: null, dir: 'asc' } }); },
        style: FONT + 'height: 34px; display: flex; align-items: center; gap: 6px; padding: 0 14px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; ' + (on ? 'background: #FFFFFF; color: #24285D; box-shadow: 0 1px 3px rgba(36,40,93,0.14);' : 'background: transparent; color: #474945;') };
    };
    var view = s.plView || 'board';
    var genieText = stuck.length
      ? stuck.length + ' open ' + (stuck.length === 1 ? P.noun + ' has' : P.nouns + ' have') + ' sat in one stage for ' + PIPE_STUCK + '+ days, worth ' + money(stuckValue) + '. ' + stuck.slice().sort(sortFns.value)[0].name + ' is the biggest.'
      : 'Nothing is stuck. Every open ' + P.noun + ' moved in the last ' + PIPE_STUCK + ' days.';
    return {
      pl: { noun: P.noun, nouns: P.nouns, Noun: P.Noun },
      plIsBoard: view === 'board', plIsList: view === 'list', plIsActivity: view === 'activity',
      plViews: [viewBtn('board', 'Board'), viewBtn('list', 'List'), viewBtn('activity', 'Activity')],
      plViewsStyle: 'display: flex; gap: 2px; padding: 3px; border-radius: 10px; background: #E6E8F2;',
      plCountTag: open.length + ' open ' + (open.length === 1 ? P.noun : P.nouns),
      plSummary: money(openValue) + ' in the pipeline · ' + all.filter(function (it) { return it.stage === last; }).length + ' ' + P.stages[last].toLowerCase() + ' this quarter',
      plTeam: P.team.map(function (t, i) { return { i: t.i, n: t.n, style: avatar(i, 32) + (i ? 'margin-left: -4px;' : '') }; }),
      plAddLabel: 'Add ' + P.noun, plAddTop: function () { self.setState({ plView: 'board', plAdd: 0, plDraft: '', plPop: null }); },
      plAddStyle: BTN + 'height: 36px; border: 1px solid #24285D; background: #24285D; color: #FFFFFF;',
      plShare: function () { self.setState({ plBanner: { title: 'Link copied.', text: 'Anyone on your team with access to this ' + (P.noun === 'deal' ? 'pipeline' : 'recruiting pipeline') + ' can open it.' } }); },
      plShareStyle: BTN + 'height: 36px; border: 1px solid #DADCE8; background: #FFFFFF; color: #24285D;',
      plFiltersLabel: filterCount ? 'Filters · ' + filterCount : 'Filters',
      plFiltersOpen: s.plPop === 'filters', plFiltersAttr: s.plPop === 'filters' ? 'true' : 'false',
      plToggleFilters: function () { self.setState({ plPop: s.plPop === 'filters' ? null : 'filters' }); },
      plFiltersStyle: BTN + 'height: 36px; ' + (filterCount ? 'border: 1px solid #24285D; background: #EEF0F8; color: #24285D;' : 'border: 1px solid #DADCE8; background: #FFFFFF; color: #24285D;'),
      plPriOpts: ['High', 'Medium', 'Low'].map(function (p) { var on = !!s.plPri[p]; return { label: p, pressed: on ? 'true' : 'false', style: chk(on), toggle: toggleIn('plPri', p) }; }),
      plOwnOpts: P.team.map(function (t, i) { var on = !!s.plOwn[i]; return { label: t.n, pressed: on ? 'true' : 'false', style: chk(on), toggle: toggleIn('plOwn', i) }; }),
      plStuckOpt: { label: 'In one stage ' + PIPE_STUCK + '+ days', pressed: s.plStuck ? 'true' : 'false', style: chk(s.plStuck), toggle: function () { self.setState({ plStuck: !s.plStuck }); } },
      plPopStyle: 'position: absolute; z-index: 14; top: 42px; right: 0; width: ' + (compact ? '100%' : '340px') + '; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 8px 24px rgba(36,40,93,0.16);',
      plClearAll: function () { self.setState({ plPri: {}, plOwn: {}, plStuck: false, plQ: '', plBanner: null }); },
      plHasPills: pills.length > 0, plPills: pills,
      plQ: s.plQ || '', plOnSearch: function (e) { self.setState({ plQ: e && e.target ? e.target.value : '' }); },
      plSearchPh: 'Search ' + P.nouns,
      plGenieText: genieText, plGenieHas: stuck.length > 0 && !s.plStuck,
      plGenieBtn: 'Show ' + (stuck.length === 1 ? 'it' : 'them'),
      plGenieRun: function () {
        self.setState({ plStuck: true, plView: s.plView === 'activity' ? 'board' : (s.plView || 'board'), plColSort: {}, plBanner: { title: 'Genie filtered the board.', text: 'Kept open ' + P.nouns + ' that have been in one stage ' + PIPE_STUCK + '+ days and sorted each column by priority. Remove the Genie pill to undo.' } });
      },
      plGenieAsk: function () { self.setState({ aiPop: true }); },
      plHasBanner: !!s.plBanner, plBanner: s.plBanner || { title: '', text: '' }, plDismiss: function () { self.setState({ plBanner: null }); },
      plColumns: columns,
      plBoardStyle: compact ? 'display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; margin: 0 -16px; padding-left: 16px; padding-right: 16px; align-items: flex-start;'
        : 'display: grid; gap: 14px; grid-template-columns: repeat(' + P.stages.length + ', minmax(0, 1fr)); align-items: start;',
      plNone: shown.length === 0,
      plTableTitle: 'All ' + P.nouns, plCount: rows.length + ' of ' + all.length,
      plTableCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;'),
      plScroll: 'border: 1px solid #DADCE8; border-radius: 8px; overflow: auto; max-height: ' + (compact ? '460px' : '560px') + '; background: #FFFFFF;',
      plHeadRow: tb.rowBase + 'position: sticky; top: 0; z-index: 2; background: #F4F5F9; border-bottom: 1px solid #DADCE8;',
      plNumHead: tb.NUM + 'z-index: 3;', plNumCell: tb.NUM, plNumFoot: tb.NUM,
      plHead: tb.head, plRows: tb.body, plRowCount: String(rows.length + 2),
      plFootRow: tb.rowBase + 'position: sticky; bottom: 0; z-index: 2; background: #F4F5F9; border-top: 1px solid #DADCE8;',
      plFoot: tb.foot,
      plSync: d.sync
    };
  }
  homeWidgets() {
    var s = this.state;
    return s.homeW || HOME_DEFAULTS[s.persona];
  }
  homeVals(compact) {
    var self = this, s = this.state, d = this.data(), x = EXTRA[s.persona], P = PIPELINES[s.persona];
    var on = this.homeWidgets();
    var names = { kpis: 'Key numbers', movement: 'LO movement', pipeline: d.crmTitle, chart: x.chartTitle, table: x.tableTitle, actions: 'Action items' };
    var descs = { kpis: 'Your headline measures against last month.', movement: 'Who moved between companies. Click it to open the movement report.',
      pipeline: 'Your ' + P.nouns + ' by stage. Click it to open the board.', chart: 'The 30-day trend with Genie’s projection.',
      table: 'Prebuilt views and the list that goes with them.', actions: 'Today’s action items from Genie.' };
    var count = HOME_WIDGETS.filter(function (k) { return on[k]; }).length;
    var opts = HOME_WIDGETS.map(function (k) {
      var v = !!on[k], isDefault = !!HOME_DEFAULTS[s.persona][k];
      return { name: names[k], desc: descs[k], checked: v ? 'true' : 'false', hint: isDefault ? 'Default for ' + d.role.toLowerCase() : '', hasHint: isDefault,
        toggle: function () { var w = Object.assign({}, self.homeWidgets()); w[k] = !w[k]; self.setState({ homeW: w }); },
        style: FONT + 'display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border-radius: 10px; cursor: pointer; text-align: left; color: #24285D; box-sizing: border-box; ' + (v ? 'border: 1px solid #24285D; background: #F4F5F9;' : 'border: 1px solid #DADCE8; background: #FFFFFF;'),
        trackStyle: 'width: 36px; height: 20px; border-radius: 999px; flex-shrink: 0; position: relative; box-sizing: border-box; ' + (v ? 'background: #24285D;' : 'background: #DADCE8;'),
        knobStyle: 'position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(21,24,58,0.3); ' + (v ? 'left: 18px;' : 'left: 2px;') };
    });

    // LO movement widget: the same moves as the report, summarized, with a mini Sankey.
    var home = s.persona === 'ae' ? null : 'Your company';
    var moves = flowMoves(s.persona).filter(function (mv) { return mv.m < 12; });
    var net = flowNet(moves);
    var ranked = Object.keys(net).sort(function (a, b) { return net[b] - net[a]; });
    var sign = function (n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); };
    var stats = [{ value: String(moves.length), label: 'LOs moved' }];
    if (home) stats.push({ value: sign(net[home] || 0), label: 'Your net change' });
    else stats.push({ value: String(moves.filter(function (m) { return m.to !== 'Other lenders'; }).length), label: 'Into your accounts' });
    stats.push({ value: sign(net[ranked[0]]), label: 'Top gainer: ' + ranked[0] });
    var COLS = compact ? 'grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) 12px minmax(0, 1fr) 58px;' : 'grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.2fr) 14px minmax(0, 1.2fr) 60px 72px;';
    var CELLT = 'min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ';
    var mineFirst = moves.slice().sort(function (a, b) { var ha = home && (a.to === home || a.from === home) ? 0 : 1, hb = home && (b.to === home || b.from === home) ? 0 : 1; return ha - hb || a.m - b.m || b.units - a.units; });
    var recent = mineFirst.slice(0, compact ? 4 : 6).map(function (mv) {
      var hired = home && mv.to === home, lost = home && mv.from === home;
      var tone = hired ? '#1D7A55' : lost ? '#B3261E' : '#8286A8';
      return { name: mv.name, from: mv.from, to: mv.to, units: String(mv.units), when: FLOW_MONTHS[mv.m].replace(' 20', ' ’'),
        dot: 'width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; background: ' + tone + ';',
        fromStyle: CELLT + (lost ? 'font-weight: 600; color: #B3261E;' : 'color: #24285D;'),
        toStyle: CELLT + (hired ? 'font-weight: 600; color: #1D7A55;' : 'color: #24285D;'),
        row: 'display: grid; ' + COLS + ' gap: 10px; align-items: center; padding: 9px 0; border-top: 1px solid #EEF0F6; font-size: 13px; line-height: 18px;' };
    });
    var openFlow = function () { self.setState({ tab: 'reports', reportId: 'flow', rFilters: [], rSort: { col: null, dir: 'asc' }, rSearch: '', rAdd: false, rEdit: null, rBanner: null, rHoverBin: null, flowFocus: null, flowHover: null, flowPop: null, aiPop: false, homeEdit: false }); };

    // Pipeline widget: counts by stage as one stacked bar.
    var items = this.pipeItems(), totalN = items.length || 1;
    var segs = P.stages.map(function (name, i) {
      var its = items.filter(function (it) { return it.stage === i; });
      var val = its.reduce(function (a, it) { return a + it.value; }, 0);
      return { name: name, n: String(its.length), value: its.length ? pipeMoney(val, P.perYear) : '—',
        dot: 'width: 10px; height: 10px; border-radius: 999px; flex-shrink: 0; background: ' + PIPE_DOTS[i] + ';',
        seg: 'height: 100%; background: ' + PIPE_DOTS[i] + '; width: ' + (its.length / totalN * 100).toFixed(2) + '%;' + (its.length ? '' : ' display: none;') };
    });
    var CARD = 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 16px; gap: 12px;' : 'padding: 20px 24px; gap: 14px;');
    var BODY = FONT + 'display: flex; flex-direction: column; gap: 14px; width: 100%; padding: 0; margin: 0; border: none; background: transparent; text-align: left; cursor: pointer; color: #24285D;';
    var LINK = FONT + 'height: 32px; display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; border: 1px solid #24285D; border-radius: 8px; background: #FFFFFF; color: #24285D; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;';
    return {
      hw: on, homeCount: count + ' of ' + HOME_WIDGETS.length + ' widgets',
      homeEdit: !!s.homeEdit, homeEditAttr: s.homeEdit ? 'true' : 'false',
      homeToggleEdit: function () { self.setState({ homeEdit: !s.homeEdit }); },
      homeReset: function () { self.setState({ homeW: null }); },
      homeResetLabel: 'Reset to ' + d.role.toLowerCase() + ' defaults',
      homeOpts: opts, homeNone: count === 0,
      homeBarStyle: 'position: relative; display: flex; align-items: center; z-index: 20;',
      homeEditBtn: FONT + 'height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid #DADCE8; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer; box-sizing: border-box; ' + (compact ? 'width: 40px; padding: 0;' : 'padding: 0 14px;') + (s.homeEdit ? 'background: #24285D; color: #FFFFFF; border-color: #24285D;' : 'background: #FFFFFF; color: #24285D;'),
      homePanelStyle: 'position: absolute; z-index: 30; top: 48px; right: ' + (compact ? '-100px' : '0') + '; width: ' + (compact ? '358px' : '380px') + '; max-height: ' + (compact ? '640px' : '760px') + '; overflow-y: auto; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 12px 32px rgba(36,40,93,0.18);',
      hmCard: CARD, hmBody: BODY, hmLink: LINK,
      hmMoveStats: stats, hmMoveRecent: recent, hmMoveHead: 'display: grid; ' + COLS + ' gap: 10px; padding: 0 0 6px; font-size: 11px; line-height: 16px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #474945;',
      hmMoveStatRow: 'display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr));',
      hmMoveOpen: openFlow, hmMoveSub: home ? 'Last 12 months. Green is hired by you, red is lost. Open the report for the full diagram.' : 'Last 12 months, in your Phoenix territory. Open the report for the full diagram.',
      hmPipeSegs: segs, hmPipeOpen: function () { self.setState({ tab: 'crm', plView: 'board', aiPop: false, homeEdit: false }); },
      hmPipeLegend: 'display: grid; gap: 6px 16px; grid-template-columns: repeat(' + (compact ? 1 : 2) + ', minmax(0, 1fr));'
    };
  }
  mapState() {
    var s = this.state, cfg = MAP_PERSONA[s.persona];
    var st = s.mapSt === undefined ? cfg.start.st : s.mapSt;
    var co = s.mapCo === undefined ? cfg.start.co : s.mapCo;
    var mk = s.mapMetric || cfg.metrics[0];
    return { st: st, co: co, mk: mk };
  }
  mapVals(compact) {
    var self = this, s = this.state, cfg = MAP_PERSONA[s.persona];
    var ms = this.mapState(), mk = ms.mk, m = MAP_METRICS[mk];
    var mm = mapModel(s.persona, ms.st, ms.co, mk);
    var level = mm.level, fr = mm.frame;
    var show = s.mapShow || 'all';
    var sel = s.mapSel, hov = s.mapHover;
    var label = function (r) { return level === 'co' ? 'Tract ' + r.n : level === 'st' ? r.n + ' County' : r.n; };
    var regions = fr.r.map(function (r, i) {
      var c = mm.cls[i], dim = (show === 'top' && c !== 4) || (show === 'low' && c !== 0);
      var on = r.id === hov, picked = r.id === sel;
      return { d: r.d, aria: label(r) + ': ' + mapFmt(mk, mm.vals[i]),
        fill: dim ? '#F4F5F9' : RAMP[c],
        stroke: picked || on ? '#F89624' : '#FFFFFF',
        sw: picked ? '2.5' : on ? '2' : '0.75',
        hover: function () { if (self.state.mapHover !== r.id) self.setState({ mapHover: r.id }); },
        click: function () {
          if (level === 'us') self.setState({ mapSt: r.id, mapCo: null, mapSel: null, mapHover: null, mapNote: null, rSearch: '', rSort: { col: null, dir: 'asc' } });
          else if (level === 'st') {
            if (IG_GEO.co[r.id]) self.setState({ mapCo: r.id, mapSel: null, mapHover: null, mapNote: null, rSearch: '', rSort: { col: null, dir: 'asc' } });
            else self.setState({ mapSel: r.id, mapNote: r.n + ' County: tract boundaries for ' + stateName(ms.st) + ' load from the Census feed in production. This prototype includes tracts for Texas and Arizona.' });
          } else self.setState({ mapSel: r.id === sel ? null : r.id });
        } };
    });
    // Put hovered / selected shapes last so their outline draws on top.
    var lift = regions.filter(function (g, i) { return fr.r[i].id === hov || fr.r[i].id === sel; });
    regions = regions.filter(function (g, i) { return !(fr.r[i].id === hov || fr.r[i].id === sel); }).concat(lift);

    var hovReg = regionOf(fr, hov), selReg = regionOf(fr, sel);
    var focus = hovReg || selReg;
    var fIdx = focus ? fr.r.indexOf(focus) : -1;
    var readout = focus ? label(focus) + ': ' + mapFmt(mk, mm.vals[fIdx]) + ' · ' + ['bottom', 'second', 'middle', 'fourth', 'top'][mm.cls[fIdx]] + ' fifth' + (level !== 'co' ? (level === 'us' ? ' · click to see counties' : (IG_GEO.co[focus.id] ? ' · click to see tracts' : '')) : '')
      : (level === 'us' ? 'Hover a state for its value. Click to drill in.' : level === 'st' ? 'Hover a county for its value. Click a county to see its census tracts.' : 'Hover a tract for its value. Click to pin it.');

    var crumbs = [{ label: 'United States', go: function () { self.setState({ mapSt: null, mapCo: null, mapSel: null, mapHover: null, mapNote: null, rSearch: '', rSort: { col: null, dir: 'asc' } }); } }];
    if (ms.st) crumbs.push({ label: stateName(ms.st), go: function () { self.setState({ mapCo: null, mapSel: null, mapHover: null, mapNote: null, rSearch: '', rSort: { col: null, dir: 'asc' } }); } });
    if (level === 'co') crumbs.push({ label: mm.name, go: function () { self.setState({ mapSel: null }); } });
    crumbs = crumbs.map(function (c, i) { var last = i === crumbs.length - 1; return { label: c.label, go: c.go, sep: i > 0, current: last ? 'page' : 'false',
      style: FONT + 'border: none; background: transparent; padding: 0 2px; font-size: 13px; cursor: pointer; ' + (last ? 'color: #24285D; font-weight: 600;' : 'color: #474945; text-decoration: underline;') }; });

    var order = fr.r.map(function (x, i) { return i; }).sort(function (a, b) { return mm.vals[b] - mm.vals[a]; });
    var ti = order[0];
    var noun = childNoun(level, 2);
    var kpis = [
      { label: m.l, value: mapFmt(mk, mm.here), sub: level === 'us' ? 'Average of the 48 states and DC' : mm.parentName.charAt(0).toUpperCase() + mm.parentName.slice(1) + ': ' + mapFmt(mk, mm.parent) + ' · ' + mapDiff(mk, mm.here, mm.parent) },
      { label: 'Top ' + childNoun(level, 1), value: mapFmt(mk, mm.vals[ti]), sub: label(fr.r[ti]) },
      { label: 'Top fifth starts at', value: mapFmt(mk, mm.cuts[3]), sub: mm.cls.filter(function (c) { return c === 4; }).length + ' ' + noun + ' in the top fifth' },
      { label: noun.charAt(0).toUpperCase() + noun.slice(1) + ' shown', value: String(fr.r.length), sub: level === 'co' ? '2010 Census tract boundaries' : 'In ' + mm.name }
    ];
    var legend = RAMP.map(function (col, i) {
      var lo = i === 0 ? mm.sorted[0] : mm.cuts[i - 1], hi = i === 4 ? mm.sorted[mm.sorted.length - 1] : mm.cuts[i];
      return { style: 'display: block; height: 12px; border-radius: 3px; background: ' + col + ';', text: mapFmt(mk, lo) + '–' + mapFmt(mk, hi) };
    });
    var brief = mapBrief(s.persona, mm, mk);
    // Region report: follows the drill level (US, state, county) and what is on the map.
    var avgOf = function (k) { var t = 0; fr.r.forEach(function (r, i) { t += k === mk ? mm.vals[i] : mapValue(k, r, level); }); return fr.r.length ? t / fr.r.length : 0; };
    var levelName = { us: 'UNITED STATES', st: 'STATE', co: 'COUNTY' }[level];
    var regionTitle = level === 'co' ? mm.name + ', ' + stateName(ms.st) : mm.name;
    var measures = cfg.metrics.map(function (k) {
      var main = k === mk, v = main ? mm.here : avgOf(k);
      return { label: MAP_METRICS[k].l, value: mapFmt(k, v),
        sub: main && level !== 'us' ? mapDiff(mk, mm.here, mm.parent) + ' vs ' + (level === 'st' ? 'US' : stateName(ms.st)) : main ? 'Mapped' : '',
        labelStyle: 'flex-grow: 1; min-width: 0; font-size: 13px; line-height: 18px; ' + (main ? 'font-weight: 600; color: #24285D;' : 'color: #474945;'),
        subStyle: 'font-size: 12px; line-height: 16px; color: #474945; white-space: nowrap; width: 116px; flex-shrink: 0; text-align: right;' };
    });
    var counts = [0, 0, 0, 0, 0]; mm.cls.forEach(function (c) { counts[c]++; });
    var drillTo = function (r) { return function () {
      if (level === 'us') self.setState({ mapSt: r.id, mapCo: null, mapSel: null, mapHover: null, mapNote: null, rSearch: '', rSort: { col: null, dir: 'asc' } });
      else if (level === 'st' && IG_GEO.co[r.id]) self.setState({ mapCo: r.id, mapSel: null, mapHover: null, mapNote: null, rSearch: '', rSort: { col: null, dir: 'asc' } });
      else self.setState({ mapSel: r.id, mapHover: null });
    }; };
    var ROW = FONT + 'display: flex; align-items: center; gap: 10px; width: 100%; min-height: 32px; padding: 0 8px; border: none; border-radius: 8px; background: transparent; color: #24285D; font-size: 13px; cursor: pointer;';
    var item = function (i, rank) { var r = fr.r[i]; return { rank: String(rank), name: label(r), value: mapFmt(mk, mm.vals[i]), go: drillTo(r), style: ROW,
      sw: 'width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; background: ' + RAMP[mm.cls[i]] + ';' }; };
    var topN = compact ? 3 : 5;
    var canDrill = level === 'us' || (level === 'st' && !!IG_GEO.co[fr.r[ti].id]);
    var mapRep = {
      eyebrow: levelName + ' REPORT', title: regionTitle,
      sub: fr.r.length + ' ' + noun + (level === 'co' ? ' · 2010 Census tracts' : '') + ' · ' + m.l.toLowerCase() + ' averages ' + mapFmt(mk, mm.here),
      measures: measures,
      mixTitle: 'How ' + noun + ' split across the fifths',
      mix: counts.map(function (n, i) { return { text: n + ' ' + noun + ' in the ' + ['bottom', 'second', 'middle', 'fourth', 'top'][i] + ' fifth', style: 'height: 100%; background: ' + RAMP[i] + '; flex: ' + Math.max(n, 0.001) + ' 1 0;' + (n ? '' : ' display: none;') }; }),
      topTitle: 'Top ' + noun + ' on ' + m.l.toLowerCase(), top: order.slice(0, topN).map(function (i, j) { return item(i, j + 1); }),
      lowTitle: 'Lowest ' + noun, low: order.slice(-3).reverse().map(function (i, j) { return item(i, fr.r.length - j); }),
      canDrill: canDrill, drillLabel: canDrill ? 'Open ' + label(fr.r[ti]) : '', drill: drillTo(fr.r[ti]),
      note: level === 'us' ? 'Click a state on the map, or in the list, to get its report.' : level === 'st' ? 'Click a county to drill into its census tracts.' : 'Click a tract to pin its details. Values are example data for this prototype.'
    };
    var selInfo = null;
    if (selReg && level === 'co') {
      var si = fr.r.indexOf(selReg);
      selInfo = { title: 'Census Tract ' + selReg.n, geoid: 'GEOID ' + selReg.id,
        rows: cfg.metrics.map(function (k) { return { l: MAP_METRICS[k].l, v: mapFmt(k, mapValue(k, selReg, 'co')) }; }),
        rank: 'Ranks ' + (order.indexOf(si) + 1) + ' of ' + fr.r.length + ' tracts on ' + m.s + '.' };
    }
    // Detail tables at the bottom: lenders and brokers in the area on screen, then their loan officers.
    var scope = selReg && level === 'co' ? selReg : null;
    var scopeName = scope ? 'Tract ' + scope.n : regionTitle;
    var tbl = mapTables(s.persona, level, scope ? scope.id : (ms.co || ms.st || 'us'), scope ? 'tract' : level, mk === 'share' ? mm.here : null);
    var tcols = [{ k: 'name', l: 'Lender', t: 'text', w: 210 }, { k: 'channel', l: 'Channel', t: 'text', w: 120 }, { k: 'loans', l: 'Loans, last 12 months', t: 'num', w: 180, bar: true },
      { k: 'volume', l: 'Volume', t: 'money', w: 130 }, { k: 'share', l: 'Market share', t: 'pct', w: 130, sum: true }, { k: 'purchase', l: 'Purchase share', t: 'pct', w: 140 },
      { k: 'los', l: 'Active LOs', t: 'num', w: 110 }, { k: 'yoy', l: 'Loans vs last year', t: 'trend', u: '%', w: 160 }];
    var allRows = tbl.lenders;
    var q = (s.rSearch || '').toLowerCase();
    var trows = allRows.filter(function (row) { return !q || (row.name + ' ' + row.channel).toLowerCase().indexOf(q) >= 0; });
    var sortCol = s.rSort.col && tcols.some(function (c) { return c.k === s.rSort.col; }) ? s.rSort.col : 'loans';
    var sdir = s.rSort.col ? (s.rSort.dir === 'desc' ? -1 : 1) : -1;
    trows = trows.slice().sort(function (a, b) { var x = a[sortCol], y = b[sortCol]; return (x > y ? 1 : x < y ? -1 : 0) * sdir; });
    var tb = this.gridParts(tcols, trows, allRows, false);
    var lcols = [{ k: 'name', l: 'Loan officer', t: 'text', w: 170 }, { k: 'lender', l: 'Lender', t: 'text', w: 200 }, { k: 'loans', l: 'Loans, last 12 months', t: 'num', w: 180, bar: true },
      { k: 'volume', l: 'Volume', t: 'money', w: 130 }, { k: 'purchase', l: 'Purchase share', t: 'pct', w: 140 }, { k: 'tenure', l: 'Tenure', t: 'yrs', w: 110, avg: true },
      { k: 'window', l: 'Recruiting window', t: 'text', w: 150 }, { k: 'yoy', l: 'Loans vs last year', t: 'trend', u: '%', w: 160 }];
    var lq = (s.loSearch || '').toLowerCase(), lso = s.loSort || { col: null, dir: 'asc' };
    var lrows = tbl.los.filter(function (row) { return !lq || (row.name + ' ' + row.lender).toLowerCase().indexOf(lq) >= 0; });
    var lsc = lso.col && lcols.some(function (c) { return c.k === lso.col; }) ? lso.col : 'loans';
    var lsd = lso.col ? (lso.dir === 'desc' ? -1 : 1) : -1;
    lrows = lrows.slice().sort(function (a, b) { var x = a[lsc], y = b[lsc]; return (x > y ? 1 : x < y ? -1 : 0) * lsd; });
    var ltb = this.gridParts(lcols, lrows, tbl.los, false, 'loSort');
    var PILL = FONT + 'height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 10px; border-radius: 8px; font-size: 13px; cursor: pointer; box-sizing: border-box; color: #24285D; background: #F4F5F9; border: 1px solid #DADCE8;';
    var showLabels = { all: 'All ' + noun, top: 'Top fifth only', low: 'Bottom fifth only' };
    return {
      rTableTitle: 'Lenders and brokers in ' + scopeName, rTableDesc: 'Loans originated in this area in the last 12 months. Sorted by loans until you pick a column.',
      hasLoTable: true, loTableTitle: 'Loan officers in ' + scopeName, loTableDesc: 'LOs with loans in this area in the last 12 months.',
      loSearchVal: s.loSearch || '', loOnSearch: function (e) { self.setState({ loSearch: e && e.target ? e.target.value : '' }); },
      loCount: lrows.length + ' of ' + tbl.los.length, loRowCount: String(lrows.length + 2),
      loHeadRow: ltb.rowBase + 'position: sticky; top: 0; z-index: 2; background: #F4F5F9; border-bottom: 1px solid #DADCE8;',
      loFootRow: ltb.rowBase + 'position: sticky; bottom: 0; z-index: 2; background: #F4F5F9; border-top: 1px solid #DADCE8;',
      loNum: ltb.NUM, loNumHead: ltb.NUM + 'z-index: 3;', loHead: ltb.head, loRows: ltb.body, loFoot: ltb.foot, loNone: lrows.length === 0,
      rTableCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;'),
      rSearchVal: s.rSearch || '',
      rOnSearch: function (e) { self.setState({ rSearch: e && e.target ? e.target.value : '' }); },
      rCount: trows.length + ' of ' + allRows.length,
      rRowCount: String(trows.length + 2),
      rScroll: 'border: 1px solid #DADCE8; border-radius: 8px; overflow: auto; max-height: ' + (compact ? '380px' : '420px') + '; background: #FFFFFF;',
      rHeadRow: tb.rowBase + 'position: sticky; top: 0; z-index: 2; background: #F4F5F9; border-bottom: 1px solid #DADCE8;',
      rNumHead: tb.NUM + 'z-index: 3;', rNumCell: tb.NUM, rNumFoot: tb.NUM,
      rHead: tb.head, rRows: tb.body, rNone: trows.length === 0,
      rNoneHint: 'No lenders match your search.',
      rFix: function () { self.setState({ rSearch: '' }); },
      rFootRow: tb.rowBase + 'position: sticky; bottom: 0; z-index: 2; background: #F4F5F9; border-top: 1px solid #DADCE8;',
      rFoot: tb.foot,
      mapW: fr.w, mapH: fr.h, mapViewBox: '0 0 ' + fr.w + ' ' + fr.h,
      mapRegions: regions, mapReadout: readout, mapCrumbs: crumbs,
      mapTitle: m.l + (level === 'co' ? ' by census tract' : level === 'st' ? ' by county' : ' by state'),
      mapSvgStyle: 'display: block; width: 100%; height: ' + (compact ? '300px' : '440px') + ';',
      mapLegend: legend, mapLegendTitle: m.l + ', in fifths of ' + noun,
      mapKpis: kpis, mapHasNote: !!s.mapNote, mapNote: s.mapNote || '',
      mapMetricText: m.l, mapShowText: showLabels[show],
      mapPillStyle: PILL,
      mapMetricOpen: s.mapPop === 'metric', mapShowOpen: s.mapPop === 'show',
      mapMetricOpenAttr: s.mapPop === 'metric' ? 'true' : 'false', mapShowOpenAttr: s.mapPop === 'show' ? 'true' : 'false',
      mapToggleMetric: function () { self.setState({ mapPop: s.mapPop === 'metric' ? null : 'metric' }); },
      mapToggleShow: function () { self.setState({ mapPop: s.mapPop === 'show' ? null : 'show' }); },
      mapMetricOpts: cfg.metrics.map(function (k) { var on = k === mk; return { label: MAP_METRICS[k].l, pressed: on ? 'true' : 'false', pick: function () { self.setState({ mapMetric: k, mapPop: null }); },
        style: FONT + 'height: 34px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: left; color: #24285D; ' + (on ? 'background: #F4F5F9; font-weight: 600;' : 'background: transparent;') }; }),
      mapShowOpts: ['all', 'top', 'low'].map(function (k) { var on = k === show; return { label: showLabels[k], pressed: on ? 'true' : 'false', pick: function () { self.setState({ mapShow: k, mapPop: null }); },
        style: FONT + 'height: 34px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: left; color: #24285D; ' + (on ? 'background: #F4F5F9; font-weight: 600;' : 'background: transparent;') }; }),
      mapUp: function () { var rs = { rSearch: '', rSort: { col: null, dir: 'asc' } }; if (level === 'co') self.setState(Object.assign({ mapCo: null, mapSel: null, mapHover: null }, rs)); else if (level === 'st') self.setState(Object.assign({ mapSt: null, mapCo: null, mapSel: null, mapHover: null, mapNote: null }, rs)); },
      mapCanUp: level !== 'us',
      mapLeave: function () { if (self.state.mapHover) self.setState({ mapHover: null }); },
      mapHasSel: !!selInfo, mapSelInfo: selInfo || { title: '', geoid: '', rows: [], rank: '' },
      mapClearSel: function () { self.setState({ mapSel: null }); },
      mapGrid: 'display: grid; gap: 16px; align-items: start; ' + (compact ? 'grid-template-columns: minmax(0, 1fr);' : 'grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);'),
      brief: brief, mapRep: mapRep,
      briefGet: function () { self.setState({ rBanner: { kind: 'export', title: 'Report ready: ' + regionTitle + ', ' + m.l.toLowerCase() + '.', did: ['Saved the map, the region report, ' + allRows.length + ' lenders and ' + tbl.los.length + ' loan officers to Excel'], canUndo: false } }); },
      briefAsk: function () { self.setState({ aiPop: true, aiBrief: true }); },
      rExport: function () { self.setState({ rBanner: { kind: 'export', title: 'Exported ' + allRows.length + ' lenders and ' + tbl.los.length + ' loan officers to Excel.', did: ['Covers ' + scopeName + ', last 12 months'], canUndo: false } }); },
      rHasBanner: !!s.rBanner,
      rBanner: s.rBanner ? { title: s.rBanner.title, didText: (s.rBanner.did || []).join('. ') + '.', canUndo: false } : { title: '', didText: '', canUndo: false },
      rBannerStyle: 'border-radius: 8px; padding: 8px 12px; display: flex; gap: 8px; align-items: center; background: #EEF7F2; border: 1px solid #1D7A55;',
      rBannerIcon: '#1D7A55',
      rDismiss: function () { self.setState({ rBanner: null }); },
      rUndo: function () {},
      rKpiRow: 'display: grid; gap: 12px; grid-template-columns: repeat(' + (compact ? 2 : 4) + ', minmax(0, 1fr));',
      rKpiCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; padding: ' + (compact ? '12px 14px' : '14px 18px') + '; display: flex; flex-direction: column; gap: 2px; min-width: 0;',
      rPopStyle: 'position: absolute; z-index: 12; top: 38px; left: 0; width: ' + (compact ? '100%' : '300px') + '; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 10px; padding: 8px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 8px 24px rgba(36,40,93,0.16);',
      rChartCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;')
    };
  }
  // Shared Sankey output: ribbons, node bars and HTML labels positioned over the SVG.
  skVals(lay, W, H, compact, clickNode) {
    var self = this, s = this.state, hov = s.flowHover, fmt = function (v) { return v.toLocaleString('en-US'); };
    var links = lay.links.map(function (l, i) {
      var key = l.s + '→' + l.t, on = key === hov;
      return { d: l.d, fill: skTint(l.color, (on ? 0.8 : hov ? 0.16 : 1) * (l.color === SK.lav ? 0.55 : 0.34)), aria: l.s + ' to ' + l.t + ': ' + fmt(l.v),
        hover: function () { if (self.state.flowHover !== key) self.setState({ flowHover: key }); } };
    });
    var nodes = lay.nodes.map(function (n) {
      return { x: n.x.toFixed(1), y: n.y.toFixed(1), h: Math.max(2, n.h).toFixed(1), w: lay.nodeW, fill: n.color, label: n.label + ', ' + fmt(n.v) };
    });
    var labels = lay.nodes.map(function (n) {
      var cy = (n.y + n.h / 2) / (H + 4) * 100, can = !!clickNode && clickNode(n, true);
      var pos = n.first ? 'right: ' + ((W - n.x + 6) / W * 100).toFixed(2) + '%; text-align: right;' : 'left: ' + ((n.x + lay.nodeW + 6) / W * 100).toFixed(2) + '%; text-align: left;';
      return { name: n.label, value: fmt(n.v), pressed: 'false',
        click: function () { if (clickNode) clickNode(n, false); },
        style: FONT + 'position: absolute; top: ' + cy.toFixed(2) + '%; transform: translateY(-50%); ' + pos + ' display: flex; flex-direction: column; gap: 0; padding: 2px 4px; border: none; border-radius: 4px; background: ' + (n.first || n.last ? 'transparent' : 'rgba(255,255,255,0.72)') + '; color: #24285D; line-height: 1.25; font-size: ' + (compact ? '10px' : '12px') + '; font-weight: 600; max-width: ' + (n.first ? 22 : 30) + '%; cursor: ' + (can ? 'pointer' : 'default') + ';' };
    });
    var hl = null; lay.links.forEach(function (l) { if (l.s + '→' + l.t === hov) hl = l; });
    return { flowLinks: links, flowNodes: nodes, flowLabels: labels, flowViewBox: '0 0 ' + W + ' ' + (H + 4), hl: hl,
      flowLeave: function () { if (self.state.flowHover) self.setState({ flowHover: null }); },
      flowSvgStyle: 'display: block; width: 100%; height: auto; overflow: visible;' };
  }
  flowVals(compact) {
    var self = this, s = this.state;
    var home = s.persona === 'ae' ? null : 'Your company';
    var orgs = FLOW_ORGS[s.persona === 'ae' ? 'az' : 'tx'].filter(function (o) { return o !== 'Other lenders' && o !== 'Independents'; });
    var focus = s.flowFocus && orgs.indexOf(s.flowFocus) >= 0 ? s.flowFocus : (home || orgs[0]);
    var dir = s.flowDir || 'going';
    var measure = s.flowMeasure || 'los', period = s.flowPeriod || 12;
    var periodText = period === 12 ? 'in the last 12 months' : 'in the last 6 months';
    var markets = s.persona === 'ae' ? ['Phoenix', 'Scottsdale', 'Mesa', 'Tucson'] : ['Houston', 'Dallas', 'Austin', 'San Antonio'];
    var mkt = function (mv) { var h = 0; for (var i = 0; i < mv.name.length; i++) h = (h * 31 + mv.name.charCodeAt(i)) % 101; return markets[h % markets.length]; };
    var all = flowMoves(s.persona).filter(function (mv) { return mv.m < period; });
    var mine = all.filter(function (mv) { return dir === 'going' ? mv.from === focus : mv.to === focus; });
    var w = function (mv) { return measure === 'units' ? mv.units : 1; };
    var W = compact ? 360 : 760, H = compact ? 300 : 380;
    var focusColor = SK.navy, outColor = dir === 'going' ? SK.red : SK.green;
    var others = {}, mk = {}, lk = {};
    mine.forEach(function (mv) {
      var other = dir === 'going' ? mv.to : mv.from, m = mkt(mv);
      others[other] = (others[other] || 0) + w(mv); mk[m] = (mk[m] || 0) + w(mv);
      var a = dir === 'going' ? focus : other, b = m, c = dir === 'going' ? other : focus;
      var k1 = a + '|' + b, k2 = b + '|' + c;
      lk[k1] = lk[k1] || { s: a, t: b, v: 0 }; lk[k1].v += w(mv);
      lk[k2] = lk[k2] || { s: b, t: c, v: 0 }; lk[k2].v += w(mv);
    });
    var otherKeys = Object.keys(others).sort(function (a, b) { return others[b] - others[a]; });
    var mkKeys = markets.filter(function (m) { return mk[m]; });
    var colFocus = [{ key: focus, label: focus, color: focusColor }];
    var colMk = mkKeys.map(function (m) { return { key: m, label: m, color: SK.indigo }; });
    var colOther = otherKeys.map(function (o) { return { key: o, label: o, color: outColor }; });
    var cols = dir === 'going' ? [colFocus, colMk, colOther] : [colOther, colMk, colFocus];
    var links = Object.keys(lk).map(function (k) { var l = lk[k]; var toMkt = mkKeys.indexOf(l.t) >= 0; l.color = (dir === 'going') === toMkt ? SK.lav : outColor; return l; });
    var lay = sankeyCols(cols, links, W, H, { nodeW: compact ? 8 : 10, gap: compact ? 10 : 14, padL: compact ? 84 : 150, padR: compact ? 86 : 170 });
    var sk = this.skVals(lay, W, H, compact, function (n, test) {
      if (orgs.indexOf(n.key) < 0 || n.key === focus) return false;
      if (!test) self.setState({ flowFocus: n.key, flowHover: null, rSearch: '' });
      return true;
    });
    var unit = function (v) { return measure === 'units' ? v.toLocaleString('en-US') + ' units' : v + (v === 1 ? ' LO' : ' LOs'); };
    var total = mine.reduce(function (a, mv) { return a + w(mv); }, 0);
    var readout = sk.hl ? sk.hl.s + ' → ' + sk.hl.t + ': ' + unit(sk.hl.v)
      : mine.length ? 'Hover a band to see the numbers. Click a company on the ' + (dir === 'going' ? 'right' : 'left') + ' to see its own ' + (dir === 'going' ? 'departures' : 'hires') + '.' : 'No moves ' + (dir === 'going' ? 'out of ' : 'into ') + focus + ' ' + periodText + '.';

    var ins = all.filter(function (m) { return m.to === focus; }), outs = all.filter(function (m) { return m.from === focus; });
    var sign = function (n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); };
    var units = mine.reduce(function (a, m) { return a + m.units; }, 0);
    var isYou = focus === home, who = isYou ? 'you' : focus;
    var kpis = [
      { label: dir === 'going' ? 'LOs who left' : 'LOs who joined', value: String(mine.length), sub: (isYou ? 'Your company' : focus) + ', ' + (period === 12 ? 'last 12 months' : 'last 6 months') },
      { label: 'Production that moved', value: units.toLocaleString('en-US'), sub: 'Units in the 12 months before each move' },
      { label: 'Net change', value: sign(ins.length - outs.length), sub: ins.length + ' joined, ' + outs.length + ' left' },
      { label: dir === 'going' ? 'Top destination' : 'Top source', value: otherKeys.length ? String(others[otherKeys[0]]) : '0', sub: otherKeys[0] || 'None yet' }
    ];
    var q = (s.rSearch || '').toLowerCase();
    var rowsAll = mine.map(function (mv) { return { name: mv.name, from: mv.from, to: mv.to, market: mkt(mv), when: FLOW_MONTHS[mv.m], m: mv.m, units: mv.units, tenure: mv.tenure, window: mv.window }; });
    var trows = rowsAll.filter(function (row) { return !q || (row.name + ' ' + row.from + ' ' + row.to + ' ' + row.market).toLowerCase().indexOf(q) >= 0; });
    var tcols = [{ k: 'name', l: 'Loan officer', t: 'text', w: 160 }, { k: 'from', l: 'From', t: 'text', w: 180 }, { k: 'to', l: 'To', t: 'text', w: 180 }, { k: 'market', l: 'Market', t: 'text', w: 120 },
      { k: 'when', l: 'Moved', t: 'text', w: 100 }, { k: 'units', l: 'Units, prior 12 months', t: 'num', w: 180, bar: true }, { k: 'tenure', l: 'Tenure at move', t: 'yrs', w: 130, avg: true }, { k: 'window', l: 'Recruiting window', t: 'text', w: 150 }];
    var sc = s.rSort.col && tcols.some(function (c) { return c.k === s.rSort.col; }) ? s.rSort.col : 'm';
    var sd = s.rSort.col ? (s.rSort.dir === 'desc' ? -1 : 1) : 1;
    if (sc === 'when') sc = 'm', sd = -sd;
    trows = trows.slice().sort(function (a, b) { var x = a[sc], y = b[sc]; return (x > y ? 1 : x < y ? -1 : 0) * sd; });
    var OPT = FONT + 'height: 34px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: left; color: #24285D; ';
    var opts = function (list, cur, key) { return list.map(function (o) { var on = o[0] === cur; return { label: o[1], pressed: on ? 'true' : 'false', style: OPT + (on ? 'background: #F4F5F9; font-weight: 600;' : 'background: transparent;'),
      pick: function () { var p = { flowPop: null, flowHover: null }; p[key] = o[0]; self.setState(p); } }; }); };
    var dirBtn = function (id, label) { var on = dir === id; return { label: label, pressed: on ? 'true' : 'false', go: function () { self.setState({ flowDir: id, flowHover: null, rSearch: '', rSort: { col: null, dir: 'asc' } }); },
      style: FONT + 'height: 32px; padding: 0 14px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; ' + (on ? 'background: #FFFFFF; color: #24285D; box-shadow: 0 1px 3px rgba(36,40,93,0.14);' : 'background: transparent; color: #474945;') }; };
    var ROWS = function (clickable) { return FONT + 'display: flex; align-items: center; gap: 10px; width: 100%; min-height: 32px; padding: 0 8px; border: none; border-radius: 8px; background: transparent; color: #24285D; font-size: 13px; cursor: ' + (clickable ? 'pointer;' : 'default;'); };
    var barOf = function (v, max, col) { return 'display: block; height: 100%; border-radius: 999px; background: ' + col + '; width: ' + Math.max(4, Math.round(v / (max || 1) * 100)) + '%;'; };
    var swOf = function (col) { return 'width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; background: ' + col + ';'; };
    var maxO = otherKeys.length ? others[otherKeys[0]] : 1, mkSorted = mkKeys.slice().sort(function (a, b) { return mk[b] - mk[a]; }), maxM = mkSorted.length ? mk[mkSorted[0]] : 1;
    var inWin = mine.filter(function (mv) { return mv.window === 'Yes'; }).length;
    var flowRep = {
      eyebrow: 'MOVEMENT REPORT', title: isYou ? 'Your company' : focus,
      sub: (dir === 'going' ? 'LOs who left' : 'LOs who joined') + ', ' + (period === 12 ? 'last 12 months' : 'last 6 months'),
      measures: [
        { label: 'LOs who joined', value: String(ins.length), sub: ins.reduce(function (a, m) { return a + m.units; }, 0).toLocaleString('en-US') + ' units' },
        { label: 'LOs who left', value: String(outs.length), sub: outs.reduce(function (a, m) { return a + m.units; }, 0).toLocaleString('en-US') + ' units' },
        { label: 'Net change', value: sign(ins.length - outs.length), sub: 'Joined minus left' },
        { label: 'In the recruiting window', value: String(inWin), sub: 'of ' + mine.length + ' ' + (dir === 'going' ? 'who left' : 'who joined') }
      ],
      lists: [
        { title: dir === 'going' ? 'Where they went' : 'Where they came from', items: otherKeys.slice(0, 5).map(function (o) {
          var can = orgs.indexOf(o) >= 0;
          return { name: o, value: unit(others[o]), go: function () { if (can) self.setState({ flowFocus: o, flowHover: null, rSearch: '' }); }, style: ROWS(can), sw: swOf(outColor), bar: barOf(others[o], maxO, outColor) }; }) },
        { title: 'By market', items: mkSorted.map(function (m) { return { name: m, value: unit(mk[m]), go: function () { self.setState({ rSearch: m }); }, style: ROWS(true), sw: swOf(SK.indigo), bar: barOf(mk[m], maxM, SK.indigo) }; }) }
      ],
      note: 'Click a company to see its own movement, or a market to filter the table. Ask Genie for a briefing.'
    };
    return Object.assign(this.flowCommon(compact, trows, rowsAll, tcols, 'moves'), sk, {
      flowHasDir: true, flowDirs: [dirBtn('going', 'Going'), dirBtn('coming', 'Coming')], flowRep: flowRep,
      flowReadout: readout,
      flowTitle: (dir === 'going' ? 'Where LOs went from ' : 'Where LOs came from, into ') + (isYou ? 'your company' : focus),
      flowSub: (dir === 'going' ? 'Left to right: the company, the market they left, and where they landed. ' : 'Left to right: where they came from, the market they joined, and the company. ') + 'Band width is ' + (measure === 'units' ? 'production moved.' : 'the number of LOs.') + ' ' + (period === 12 ? 'Last 12 months.' : 'Last 6 months.'),
      flowLegend: [{ label: focus, swatch: 'background: ' + SK.navy + ';' }, { label: 'Market', swatch: 'background: ' + SK.indigo + ';' }, { label: dir === 'going' ? 'Where they went' : 'Where they came from', swatch: 'background: ' + outColor + ';' }],
      flowKpis: kpis,
      flowHasCompany: true, flowCompanyText: focus, flowCompanyOpen: s.flowPop === 'company', flowCompanyAttr: s.flowPop === 'company' ? 'true' : 'false',
      flowToggleCompany: function () { self.setState({ flowPop: s.flowPop === 'company' ? null : 'company' }); },
      flowCompanyOpts: opts(orgs.map(function (o) { return [o, o]; }), focus, 'flowFocus'),
      flowHasMeasure: true, flowMeasureText: measure === 'units' ? 'Production moved' : 'Number of LOs',
      flowMeasureOpts: opts([['los', 'Number of LOs'], ['units', 'Production moved']], measure, 'flowMeasure'),
      flowPeriodLabel: 'Period', flowPeriodText: period === 12 ? 'Last 12 months' : 'Last 6 months',
      flowPeriodOpts: opts([[12, 'Last 12 months'], [6, 'Last 6 months']], period, 'flowPeriod'),
      brief: flowBrief(s.persona, all, home, periodText),
      briefGet: function () { self.setState({ rBanner: { kind: 'export', title: 'Report ready: loan officer movement.', did: ['Saved the Sankey chart, the Genie briefing and ' + trows.length + ' moves to Excel'], canUndo: false } }); },
      rTableTitle: 'Detail: every LO who ' + (dir === 'going' ? 'left ' : 'joined ') + (isYou ? 'your company' : focus),
      rTableDesc: 'Newest first until you pick a column. Production is the LO’s units in the 12 months before the move.',
      rNoneHint: 'No moves match your search.'
    });
  }
  retainVals(compact) {
    var self = this, s = this.state, R = RETAIN[s.persona] || RETAIN.lo;
    var ck = s.flowCohort || 'a', c = R.cohorts[ck], measure = s.flowMeasure === 'units' ? 'volume' : 'n';
    var mul = measure === 'volume' ? R.avg : 1;
    var fmtN = function (v) { return measure === 'volume' ? pipeMoney(v, false) : v.toLocaleString('en-US'); };
    var W = compact ? 360 : 760, H = compact ? 300 : 380;
    var outs = [{ key: 'none', label: 'No new loan yet', color: SK.grey }, { key: 'back', label: R.you, color: SK.green }, { key: 'lost', label: 'Went to another lender', color: SK.orange }];
    var cols = [[{ key: 'root', label: R.who, color: SK.navy }], RETAIN_EVENTS.map(function (e) { return { key: e, label: e, color: SK.indigo }; }), outs];
    var links = [];
    c.e.forEach(function (r, i) {
      links.push({ s: 'root', t: RETAIN_EVENTS[i], v: r[0] * mul, color: SK.lav });
      [[1, 'back', SK.green], [2, 'lost', SK.orange], [3, 'none', SK.grey]].forEach(function (o) { if (r[o[0]]) links.push({ s: RETAIN_EVENTS[i], t: o[1], v: r[o[0]] * mul, color: o[2] }); });
    });
    var lay = sankeyCols(cols, links, W, H, { nodeW: compact ? 8 : 10, gap: compact ? 10 : 14, padL: compact ? 70 : 110, padR: compact ? 96 : 190 });
    var labelOf = { root: R.who, none: 'No new loan yet', back: R.you, lost: 'Went to another lender' };
    lay.links.forEach(function (l) { l.s = labelOf[l.s] || l.s; l.t = labelOf[l.t] || l.t; });
    var sk = this.skVals(lay, W, H, compact, null);
    sk.flowLabels.forEach(function (lb, i) { var n = lay.nodes[i]; lb.value = fmtN(n.v / (measure === 'volume' ? 1 : 1)); });
    var back = c.e.reduce(function (a, r) { return a + r[1]; }, 0), lost = c.e.reduce(function (a, r) { return a + r[2]; }, 0);
    var readout = sk.hl ? sk.hl.s + ' → ' + sk.hl.t + ': ' + fmtN(sk.hl.v) : 'Hover a band to see the numbers.';
    var kpis = [
      { label: R.who, value: c.total.toLocaleString('en-US'), sub: 'Closed ' + c.label },
      { label: 'Took out a new loan', value: (back + lost).toLocaleString('en-US'), sub: Math.round((back + lost) / c.total * 100) + '% of the total' },
      { label: R.you, value: back.toLocaleString('en-US'), sub: Math.round(back / (back + lost) * 100) + '% kept', tone: 'good' },
      { label: 'Went to another lender', value: lost.toLocaleString('en-US'), sub: 'About ' + pipeMoney(lost * R.avg, false) + ' in loans' }
    ];
    var rivals = RETAIN_RIVALS[s.persona] || RETAIN_RIVALS.lo;
    var rowsAll = [];
    c.e.forEach(function (r, i) {
      [[1, R.you], [2, 'Went to another lender'], [3, 'No new loan yet']].forEach(function (o, j) {
        if (!r[o[0]] && !(i === 0 && j === 2)) return;
        var n = i === 0 && j === 2 ? r[0] : r[o[0]];
        rowsAll.push({ event: RETAIN_EVENTS[i], outcome: o[1], n: n, share: n / c.total * 100, volume: o[0] === 3 ? 0 : n * R.avg, rival: o[0] === 2 ? rivals[i % rivals.length] : '—' });
      });
    });
    var q = (s.rSearch || '').toLowerCase();
    var trows = rowsAll.filter(function (row) { return !q || (row.event + ' ' + row.outcome + ' ' + row.rival).toLowerCase().indexOf(q) >= 0; });
    var tcols = [{ k: 'event', l: 'What happened to the home', t: 'text', w: 210 }, { k: 'outcome', l: 'New loan', t: 'text', w: 230 }, { k: 'n', l: R.who, t: 'num', w: 140, bar: true },
      { k: 'share', l: 'Share of ' + R.who.toLowerCase(), t: 'pct', w: 170 }, { k: 'volume', l: 'Loan volume', t: 'money', w: 140 }, { k: 'rival', l: 'Top other lender', t: 'text', w: 190 }];
    var sc = s.rSort.col && tcols.some(function (cc) { return cc.k === s.rSort.col; }) ? s.rSort.col : null;
    if (sc) { var sd = s.rSort.dir === 'desc' ? -1 : 1; trows = trows.slice().sort(function (a, b) { var x = a[sc], y = b[sc]; return (x > y ? 1 : x < y ? -1 : 0) * sd; }); }
    var OPT = FONT + 'height: 34px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: left; color: #24285D; ';
    var opts = function (list, cur, key) { return list.map(function (o) { var on = o[0] === cur; return { label: o[1], pressed: on ? 'true' : 'false', style: OPT + (on ? 'background: #F4F5F9; font-weight: 600;' : 'background: transparent;'),
      pick: function () { var p = { flowPop: null, flowHover: null }; p[key] = o[0]; self.setState(p); } }; }); };
    var RROW = FONT + 'display: flex; align-items: center; gap: 10px; width: 100%; min-height: 32px; padding: 0 8px; border: none; border-radius: 8px; background: transparent; color: #24285D; font-size: 13px; cursor: pointer;';
    var rbar = function (pct, col) { return 'display: block; height: 100%; border-radius: 999px; background: ' + col + '; width: ' + Math.max(4, Math.round(pct)) + '%;'; };
    var flowRep = {
      eyebrow: 'RETENTION REPORT', title: R.who + ', closed ' + c.label, sub: 'Tracked through September 2026',
      measures: [
        { label: R.who, value: c.total.toLocaleString('en-US'), sub: 'Closed ' + c.label },
        { label: 'Took out a new loan', value: (back + lost).toLocaleString('en-US'), sub: Math.round((back + lost) / c.total * 100) + '% of the total' },
        { label: 'Recapture rate', value: Math.round(back / (back + lost) * 100) + '%', sub: 'Of new loans' },
        { label: 'Lost loan volume', value: pipeMoney(lost * R.avg, false), sub: lost.toLocaleString('en-US') + ' loans' }
      ],
      lists: [
        { title: 'Recapture by what happened to the home', items: [1, 2, 3].map(function (i) { var r = c.e[i], took = r[1] + r[2], pct = took ? r[1] / took * 100 : 0;
          return { name: RETAIN_EVENTS[i], value: Math.round(pct) + '%', go: function () { self.setState({ rSearch: RETAIN_EVENTS[i] }); }, style: RROW, sw: 'width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; background: ' + SK.green + ';', bar: rbar(pct, SK.green) }; }) },
        { title: 'Lost to another lender', items: [1, 2, 3].map(function (i) { var r = c.e[i], pct = r[2] / (lost || 1) * 100;
          return { name: RETAIN_EVENTS[i], value: r[2].toLocaleString('en-US'), go: function () { self.setState({ rSearch: RETAIN_EVENTS[i] }); }, style: RROW, sw: 'width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; background: ' + SK.orange + ';', bar: rbar(pct, SK.orange) }; }) }
      ],
      note: 'Click a row to filter the table. Ask Genie for a briefing.'
    };
    return Object.assign(this.flowCommon(compact, trows, rowsAll, tcols, 'paths'), sk, {
      flowHasDir: false, flowDirs: [], flowReadout: readout, flowRep: flowRep,
      flowTitle: R.title, flowSub: c.total.toLocaleString('en-US') + ' ' + R.who.toLowerCase() + ' closed ' + c.label + ', tracked through September 2026. Band width is ' + (measure === 'volume' ? 'loan volume.' : 'the number of borrowers.'),
      flowLegend: [{ label: 'What happened to the home', swatch: 'background: ' + SK.indigo + ';' }, { label: R.you, swatch: 'background: ' + SK.green + ';' }, { label: 'Went to another lender', swatch: 'background: ' + SK.orange + ';' }, { label: 'No new loan yet', swatch: 'background: ' + SK.grey + ';' }],
      flowKpis: kpis, flowHasCompany: false, flowCompanyText: '', flowCompanyOpen: false, flowCompanyAttr: 'false', flowToggleCompany: function () {}, flowCompanyOpts: [],
      flowHasMeasure: true, flowMeasureText: measure === 'volume' ? 'Loan volume' : 'Borrowers',
      flowMeasureOpts: opts([['los', 'Borrowers'], ['units', 'Loan volume']], measure === 'volume' ? 'units' : 'los', 'flowMeasure'),
      flowPeriodLabel: 'Closed', flowPeriodText: c.label,
      flowPeriodOpts: opts([['a', '2021 to 2023'], ['b', '2024 to 2025']], ck, 'flowCohort'),
      brief: retainBrief(s.persona, R, c, measure),
      briefGet: function () { self.setState({ rBanner: { kind: 'export', title: 'Report ready: loan retention.', did: ['Saved the Sankey chart, the Genie briefing and ' + trows.length + ' paths to Excel'], canUndo: false } }); },
      rTableTitle: 'Detail: every path', rTableDesc: 'Each row is one path through the chart. Loan volume uses the average new loan.',
      rNoneHint: 'No paths match your search.'
    });
  }
  flowCommon(compact, trows, rowsAll, tcols, noun) {
    var self = this, s = this.state;
    var tb = this.gridParts(tcols, trows, rowsAll, false);
    return {
      flowPill: FONT + 'height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 10px; border-radius: 8px; font-size: 13px; cursor: pointer; box-sizing: border-box; color: #24285D; background: #F4F5F9; border: 1px solid #DADCE8;',
      flowMeasureOpen: s.flowPop === 'measure', flowPeriodOpen: s.flowPop === 'period',
      flowMeasureAttr: s.flowPop === 'measure' ? 'true' : 'false', flowPeriodAttr: s.flowPop === 'period' ? 'true' : 'false',
      flowToggleMeasure: function () { self.setState({ flowPop: s.flowPop === 'measure' ? null : 'measure' }); },
      flowTogglePeriod: function () { self.setState({ flowPop: s.flowPop === 'period' ? null : 'period' }); },
      flowDirStyle: 'display: flex; gap: 2px; padding: 3px; border-radius: 10px; background: #E6E8F2; flex-shrink: 0;',
      mapGrid: 'display: grid; gap: 16px; align-items: start; ' + (compact ? 'grid-template-columns: minmax(0, 1fr);' : 'grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);'),
      briefAsk: function () { self.setState({ aiPop: true, aiBrief: true }); },
      rExport: function () { self.setState({ rBanner: { kind: 'export', title: 'Exported ' + trows.length + ' ' + noun + ' to Excel.', did: ['Includes every column in the detail table'], canUndo: false } }); },
      rHasBanner: !!s.rBanner,
      rBanner: s.rBanner ? { title: s.rBanner.title, didText: (s.rBanner.did || []).join('. ') + '.', canUndo: false } : { title: '', didText: '', canUndo: false },
      rBannerStyle: 'border-radius: 8px; padding: 8px 12px; display: flex; gap: 8px; align-items: center; background: #EEF7F2; border: 1px solid #1D7A55;',
      rBannerIcon: '#1D7A55', rDismiss: function () { self.setState({ rBanner: null }); }, rUndo: function () {},
      rKpiRow: 'display: grid; gap: 12px; grid-template-columns: repeat(' + (compact ? 2 : 4) + ', minmax(0, 1fr));',
      rKpiCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; padding: ' + (compact ? '12px 14px' : '14px 18px') + '; display: flex; flex-direction: column; gap: 2px; min-width: 0;',
      rPopStyle: 'position: absolute; z-index: 12; top: 38px; left: 0; width: ' + (compact ? '100%' : '300px') + '; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 10px; padding: 8px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 8px 24px rgba(36,40,93,0.16);',
      rChartCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;'),
      rTableCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;'),
      rSearchVal: s.rSearch || '', rOnSearch: function (e) { self.setState({ rSearch: e && e.target ? e.target.value : '' }); },
      rCount: trows.length + ' of ' + rowsAll.length, rRowCount: String(trows.length + 2),
      rScroll: 'border: 1px solid #DADCE8; border-radius: 8px; overflow: auto; max-height: ' + (compact ? '380px' : '420px') + '; background: #FFFFFF;',
      rHeadRow: tb.rowBase + 'position: sticky; top: 0; z-index: 2; background: #F4F5F9; border-bottom: 1px solid #DADCE8;',
      rNumHead: tb.NUM + 'z-index: 3;', rNumCell: tb.NUM, rNumFoot: tb.NUM,
      rHead: tb.head, rRows: tb.body, rNone: trows.length === 0,
      rFix: function () { self.setState({ rSearch: '' }); },
      rFootRow: tb.rowBase + 'position: sticky; bottom: 0; z-index: 2; background: #F4F5F9; border-top: 1px solid #DADCE8;',
      rFoot: tb.foot
    };
  }
  reportVals(compact) {
    var self = this, s = this.state;
    var lib = REPORTS[s.persona];
    var rep = lib[0];
    lib.forEach(function (r) { if (r.id === s.reportId) rep = r; });
    var cfg = RCFG[rep.id];
    var tabs = {
      isReports: s.tab === 'reports',
      rep: rep,
      rTabsRow: 'display: flex; align-items: center; gap: 8px; ' + (compact ? 'flex-wrap: wrap;' : ''),
      rTabsStyle: 'display: flex; gap: 2px; padding: 3px; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 10px; box-sizing: border-box; min-width: 0; overflow-x: auto; ' + (compact ? 'width: 100%;' : 'flex-shrink: 0;'),
      rLib: lib.map(function (r) {
        var on = r.id === rep.id;
        return { label: compact ? RCFG[r.id].short : r.label, pressed: on ? 'true' : 'false',
          style: FONT + 'height: 32px; padding: 0 12px; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; ' + (on ? 'background: #24285D; color: #FFFFFF;' : 'background: transparent; color: #474945;'),
          pick: function () { self.setState({ reportId: r.id, rFilters: [], rSort: { col: null, dir: 'asc' }, rAdd: false, rEdit: null, rBanner: null, rHoverBin: null }); } };
      }),
      rNew: function () { self.setState({ aiPop: true }); },
      rNewStyle: FONT + 'height: 38px; display: flex; align-items: center; gap: 6px; padding: 0 12px; border: 1px dashed #8286A8; border-radius: 10px; background: transparent; color: #24285D; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;'
    };
    if (rep.map) return Object.assign(tabs, this.mapVals(compact), { isTable: false, isMap: true, isFlow: false });
    if (rep.sankey) return Object.assign(tabs, rep.retain ? this.retainVals(compact) : this.flowVals(compact), { isTable: false, isMap: false, isFlow: true, hasLoTable: false });
    var hidden = s.persona === 'lo' && !s.allowCompare;
    var cols = rep.cols;
    var colOf = function (k) { for (var i = 0; i < cols.length; i++) { if (cols[i].k === k) return cols[i]; } return cols[0]; };
    var first = cols[0];
    var barCol = cols.filter(function (c) { return c.bar; })[0] || cols[1];
    var filters = s.rFilters;
    var q = (s.rSearch || '').toLowerCase();
    var passes = function (row, skip) {
      for (var i = 0; i < filters.length; i++) { if (i !== skip && !test(row, filters[i])) return false; }
      if (!q) return true;
      return cols.some(function (c) { return !(c.gated && hidden) && String(row[c.k]).toLowerCase().indexOf(q) >= 0; });
    };
    var data = rep.data.filter(function (row) { return passes(row, -1); });
    if (s.rSort.col) {
      var sc = s.rSort.col, dir = s.rSort.dir === 'desc' ? -1 : 1;
      data = data.slice().sort(function (a, b) { var x = a[sc], y = b[sc]; return (x > y ? 1 : x < y ? -1 : 0) * dir; });
    }
    var sum = function (arr, k) { return arr.reduce(function (a, r) { return a + r[k]; }, 0); };
    var isNum = function (c) { return c.t !== 'text'; };
    var setF = function (next, extra) { self.setState(Object.assign({ rFilters: next, rBanner: null, rAdd: false, rEdit: null }, extra || {})); };

    // KPI tiles: filtered value, with the full report as context.
    var kpis = [{ label: cfg.noun, value: String(data.length), sub: 'of ' + rep.data.length + ' in your territory' }];
    var agg = function (c, arr) { return (c.t === 'pct' || c.avg || c.t === 'yrs' || c.t === 'pts' || c.t === 'days') ? (arr.length ? sum(arr, c.k) / arr.length : 0) : sum(arr, c.k); };
    var aggLabel = function (c) { return ((c.t === 'pct' || c.avg || c.t === 'yrs' || c.t === 'pts' || c.t === 'days') ? 'Avg ' : 'Total ') + lc(c.l); };
    cfg.kpis.forEach(function (k) {
      var c = colOf(k);
      if (c.t === 'trend') {
        var up = data.filter(function (r) { return r[c.k] > 0; }).length;
        kpis.push({ label: c.l + ' rising', value: data.length ? Math.round(up / data.length * 100) + '%' : '0%', sub: up + ' of ' + data.length + ' trending up' });
      } else {
        kpis.push({ label: aggLabel(c), value: fmtCell(c, agg(c, data)), sub: 'All rows: ' + fmtCell(c, agg(c, rep.data)) });
      }
    });

    // Chart 1: distribution of the report's main measure. Grey = all rows, navy = matching.
    var vals = rep.data.map(function (r) { return r[barCol.k]; });
    var lo = Math.min.apply(null, vals), hiV = Math.max.apply(null, vals);
    var nb = compact ? 5 : 6, step = (hiV - lo) / nb || 1;
    var bins = [];
    for (var b = 0; b < nb; b++) bins.push({ a: lo + step * b, z: b === nb - 1 ? hiV + 1e-9 : lo + step * (b + 1), all: 0, hit: 0 });
    var binOf = function (v) { return Math.min(nb - 1, Math.floor((v - lo) / step)); };
    rep.data.forEach(function (r) { bins[binOf(r[barCol.k])].all++; });
    data.forEach(function (r) { bins[binOf(r[barCol.k])].hit++; });
    var maxBin = Math.max.apply(null, bins.map(function (x) { return x.all; })) || 1;
    var short = function (v) { var c = barCol; return c.t === 'money' ? fmtCell(c, v) : c.t === 'pct' ? Math.round(v) + '%' : c.t === 'pts' ? v.toFixed(1) : String(Math.round(v)); };
    var hb = s.rHoverBin == null ? -1 : s.rHoverBin;
    var hist = {
      title: barCol.l + ' distribution',
      readout: hb >= 0 ? short(bins[hb].a) + ' to ' + short(bins[hb].z) + ': ' + bins[hb].hit + ' matching of ' + bins[hb].all + ' ' + cfg.noun.toLowerCase() : 'How ' + cfg.noun.toLowerCase() + ' spread across ' + barCol.l.toLowerCase() + '. Hover a bar for counts.',
      bins: bins.map(function (x, i) {
        var on = i === hb;
        return { label: short(x.a) + '+',
          hover: function () { if (self.state.rHoverBin !== i) self.setState({ rHoverBin: i }); },
          colStyle: 'flex: 1 1 0; height: 100%; position: relative; border-radius: 4px 4px 0 0; ' + (on ? 'background: #F4F5F9;' : ''),
          ghostStyle: 'position: absolute; left: 0; right: 0; bottom: 0; border-radius: 4px 4px 0 0; background: #DADCE8; height: ' + Math.round(x.all / maxBin * 100) + '%;',
          barStyle: 'position: absolute; left: 0; right: 0; bottom: 0; border-radius: 4px 4px 0 0; background: ' + (on ? '#F89624' : '#24285D') + '; height: ' + Math.round(x.hit / maxBin * 100) + '%;' };
      })
    };

    // Chart 2: breakdown by a category (click to filter) or change per row (diverging).
    var bars;
    if (cfg.chart.kind === 'group') {
      var gc = colOf(cfg.chart.by), m = cfg.chart.m ? colOf(cfg.chart.m) : null;
      var groups = {}, order = [];
      data.forEach(function (r) { var g = r[gc.k]; if (!(g in groups)) { groups[g] = 0; order.push(g); } groups[g] += m ? r[m.k] : 1; });
      order.sort(function (a, b) { return groups[b] - groups[a]; });
      var gmax = order.length ? groups[order[0]] : 1;
      var already = filters.some(function (f) { return f.c === gc.k; });
      bars = { diverging: false,
        title: cfg.chart.title || (m ? m.l : cfg.noun) + ' by ' + lc(gc.l),
        hint: already ? 'Showing the ' + gc.l.toLowerCase() + ' you filtered to.' : 'Click a bar to filter the report to it.',
        items: order.slice(0, 7).map(function (g) {
          var v = groups[g];
          return { label: g, value: m ? fmtCell(m, v) : String(v), aria: 'Filter to ' + g,
            pick: function () { setF(filters.filter(function (f) { return f.c !== gc.k; }).concat([{ c: gc.k, o: 'is', v: [g] }])); },
            rowStyle: FONT + 'display: flex; align-items: center; gap: 10px; min-height: 30px; padding: 0 6px; border: none; border-radius: 6px; background: transparent; color: #24285D; cursor: pointer; width: 100%;',
            barStyle: 'position: absolute; left: 0; top: 0; bottom: 0; border-radius: 0 4px 4px 0; background: #24285D; width: ' + Math.max(2, Math.round(v / (gmax || 1) * 100)) + '%;',
            valStyle: 'width: 64px; flex-shrink: 0; text-align: right; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;' };
        }) };
    } else {
      var tc = colOf(cfg.chart.m);
      var rowsC = data.slice().sort(function (a, b) { return b[tc.k] - a[tc.k]; });
      if (rowsC.length > 8) rowsC = rowsC.slice(0, 4).concat(rowsC.slice(-4));
      var amax = Math.max.apply(null, rowsC.map(function (r) { return Math.abs(r[tc.k]); }).concat([1]));
      bars = { diverging: true,
        title: tc.l + ' by ' + lc(first.l),
        hint: rowsC.length < data.length ? 'Biggest gains and drops. Click a row to find it in the table.' : 'Click a row to find it in the table.',
        items: rowsC.map(function (r) {
          var v = r[tc.k], w = Math.round(Math.abs(v) / amax * 50);
          return { label: r[first.k], value: fmtCell(tc, v), aria: 'Find ' + r[first.k] + ' in the table',
            pick: function () { self.setState({ rSearch: String(r[first.k]) }); },
            rowStyle: FONT + 'display: flex; align-items: center; gap: 10px; min-height: 28px; padding: 0 6px; border: none; border-radius: 6px; background: transparent; color: #24285D; cursor: pointer; width: 100%;',
            barStyle: 'position: absolute; top: 0; bottom: 0; background: ' + (v >= 0 ? '#1D7A55' : '#B3261E') + '; width: ' + Math.max(1, w) + '%; ' + (v >= 0 ? 'left: 50%; border-radius: 0 4px 4px 0;' : 'right: 50%; border-radius: 4px 0 0 4px;'),
            valStyle: 'width: 72px; flex-shrink: 0; text-align: right; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; color: ' + (v > 0 ? '#1D7A55' : v < 0 ? '#B3261E' : '#474945') + ';' };
        }) };
    }

    var tb = this.gridParts(cols, data, rep.data, hidden);
    var head = tb.head, body = tb.body, foot = tb.foot, rowBase = tb.rowBase, CELL = tb.CELL, NUM = tb.NUM;

    // Notion-style filters
    var pills = filters.map(function (f, i) {
      var c = colOf(f.c), open = s.rEdit === i;
      return { col: c.l, op: opLabel(c, f), val: valLabel(c, f), ai: !!f.ai, open: open ? 'true' : 'false',
        edit: function () { self.setState({ rEdit: open ? null : i, rAdd: false }); },
        style: FONT + 'height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 10px; border-radius: 8px; font-size: 13px; cursor: pointer; box-sizing: border-box; color: #24285D; background: ' + (open ? '#E6E8F2' : '#F4F5F9') + '; border: 1px solid ' + (f.ai ? '#F89624' : (open ? '#8286A8' : '#DADCE8')) + ';' };
    });
    var ed = null;
    if (s.rEdit != null && filters[s.rEdit]) {
      var fi = s.rEdit, f = filters[fi], c = colOf(f.c);
      var upd = function (patch) { var n = filters.slice(); n[fi] = Object.assign({}, f, patch, { ai: false }); self.setState({ rFilters: n, rBanner: null }); };
      var opsList = c.t === 'text' ? [['is', 'is'], ['not', 'is not']] : [['>=', '≥'], ['<=', '≤'], ['>', '>'], ['<', '<']];
      var OPB = FONT + 'height: 26px; padding: 0 8px; border: none; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; ';
      var ROW = FONT + 'height: 32px; display: flex; align-items: center; gap: 10px; padding: 0 8px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: left; color: #24285D; ';
      var sel = Array.isArray(f.v) ? f.v : [f.v];
      ed = { col: c.l, isNum: c.t !== 'text', valText: c.t === 'text' ? '' : 'Current: ' + fmtVal(c, f.v),
        ops: opsList.map(function (o) { var on = f.o === o[0]; return { label: o[1], pressed: on ? 'true' : 'false', pick: function () { upd({ o: o[0] }); },
          style: OPB + (on ? 'background: #FFFFFF; color: #24285D; box-shadow: 0 1px 2px rgba(36,40,93,0.2);' : 'background: transparent; color: #474945;') }; }),
        onNum: function (e) { var n = parseFloat(e && e.target ? e.target.value : ''); if (!isNaN(n)) upd({ v: c.t === 'money' ? n * 1000 : n }); },
        vals: (c.t === 'text' ? distinct(rep.data, c.k) : filterOptions(c, rep.data).map(function (o) { return o.v; }).filter(function (v, j, a) { return a.indexOf(v) === j; })).map(function (v) {
          var on = c.t === 'text' ? sel.indexOf(v) >= 0 : f.v === v;
          return { label: c.t === 'text' ? v : fmtVal(c, v), pressed: on ? 'true' : 'false',
            pick: function () {
              if (c.t !== 'text') { upd({ v: v }); return; }
              var nv = on ? sel.filter(function (x) { return x !== v; }) : sel.concat([v]);
              upd({ v: nv });
            },
            style: ROW + (on ? 'background: #F4F5F9;' : 'background: transparent;'),
            checkStyle: 'width: 16px; height: 16px; flex-shrink: 0; border-radius: ' + (c.t === 'text' ? '4px' : '999px') + '; display: flex; align-items: center; justify-content: center; box-sizing: border-box; ' + (on ? 'background: #24285D; border: 1px solid #24285D;' : 'background: #FFFFFF; border: 1px solid #8286A8;') };
        }),
        remove: function () { var n = filters.slice(); n.splice(fi, 1); setF(n); } };
    }
    var TYPE_ICON = { text: 'Aa', num: '#', money: '$', pct: '%', pts: '±', yrs: 'yr', days: 'd', trend: '↕' };
    var filterable = cols.filter(function (c) { return !(c.gated && hidden); });
    var banner = s.rBanner;

    return Object.assign(tabs, {
      isTable: true, isMap: false, isFlow: false, hasLoTable: false,
      rTableTitle: rep.label, rTableDesc: rep.desc,
      brief: tableBrief(s.persona, rep, data, cols),
      briefGet: function () { self.setState({ rBanner: { kind: 'export', title: 'Report ready: ' + rep.label + '.', did: ['Saved the Genie briefing, charts and ' + data.length + ' rows to Excel'], canUndo: false } }); },
      briefAsk: function () { self.setState({ aiPop: true, aiBrief: false }); },
      rAi: rep.ai.slice(0, compact ? 1 : 2).map(function (a) { return { q: a.q, run: function () {
        setF(a.f.map(function (x) { return Object.assign({ ai: true }, x); }), { rBanner: { title: 'Genie built this filter.', did: a.did, canUndo: true, prev: filters, kind: 'ai' } });
      } }; }),
      rHasBanner: !!banner,
      rBanner: banner ? { title: banner.title, didText: (banner.did || []).join('. ') + '.', canUndo: !!banner.canUndo } : { title: '', didText: '', canUndo: false },
      rBannerStyle: 'border-radius: 8px; padding: 8px 12px; display: flex; gap: 8px; align-items: center; ' + (banner && banner.kind === 'export' ? 'background: #EEF7F2; border: 1px solid #1D7A55;' : 'background: #FFFFFF; border: 1px solid #F89624;'),
      rBannerIcon: banner && banner.kind === 'export' ? '#1D7A55' : '#A34F00',
      rUndo: function () { self.setState({ rFilters: (banner && banner.prev) || [], rBanner: null }); },
      rDismiss: function () { self.setState({ rBanner: null }); },
      rExport: function () {
        self.setState({ rAdd: false, rEdit: null, rBanner: { kind: 'export', title: 'Exported ' + data.length + ' rows to ' + rep.label + '.xlsx.', did: ['Kept your filters, search and sort', hidden ? 'Left out lender details your org hides' : 'Charts go on a second sheet'], canUndo: false } });
      },
      rSearchVal: s.rSearch || '',
      rOnSearch: function (e) { self.setState({ rSearch: e && e.target ? e.target.value : '' }); },
      rPills: pills, rHasFilters: filters.length > 0 || !!s.rSort.col || !!q,
      rHasSort: !!s.rSort.col, rSortText: s.rSort.col ? colOf(s.rSort.col).l + (s.rSort.dir === 'desc' ? ' ↓' : ' ↑') : '',
      rSortClear: function () { self.setState({ rSort: { col: null, dir: 'asc' } }); },
      rClear: function () { setF([], { rSort: { col: null, dir: 'asc' }, rSearch: '' }); },
      rAddOpen: s.rAdd ? 'true' : 'false',
      rAddToggle: function () { self.setState({ rAdd: !s.rAdd, rEdit: null }); },
      rPickCol: !!s.rAdd,
      rColOpts: filterable.map(function (c) { return { label: c.l, icon: TYPE_ICON[c.t] || 'Aa', pick: function () {
        var nf = c.t === 'text' ? { c: c.k, o: 'is', v: [] } : { c: c.k, o: '>=', v: filterOptions(c, rep.data)[0].v };
        self.setState({ rFilters: filters.concat([nf]), rAdd: false, rEdit: filters.length, rBanner: null });
      } }; }),
      rEditing: !!ed, ed: ed || { col: '', isNum: false, valText: '', ops: [], vals: [], onNum: function () {}, remove: function () {} },
      rClosePop: function () { self.setState({ rEdit: null, rAdd: false }); },
      rPopStyle: 'position: absolute; z-index: 12; top: 38px; left: 0; width: ' + (compact ? '100%' : '320px') + '; max-height: 360px; overflow-y: auto; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 10px; padding: 8px; display: flex; flex-direction: column; gap: 2px; box-shadow: 0 8px 24px rgba(36,40,93,0.16);',
      rKpiRow: 'display: grid; gap: 12px; ' + 'grid-template-columns: repeat(' + (compact ? 2 : Math.min(4, kpis.length)) + ', minmax(0, 1fr));',
      rKpiCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; padding: ' + (compact ? '12px 14px' : '14px 18px') + '; display: flex; flex-direction: column; gap: 2px; min-width: 0;',
      rKpis: kpis.slice(0, 4),
      rChartRow: 'display: grid; gap: 16px; ' + (compact ? 'grid-template-columns: minmax(0, 1fr);' : 'grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);'),
      rChartCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 14px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;'),
      hist: hist, bars: bars,
      rTableCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 14px;' : 'padding: 18px 20px;'),
      rCount: data.length + ' of ' + rep.data.length,
      rRowCount: String(data.length + 2),
      rScroll: 'border: 1px solid #DADCE8; border-radius: 8px; overflow: auto; max-height: ' + (compact ? '380px' : '420px') + '; background: #FFFFFF;',
      rHeadRow: rowBase + 'position: sticky; top: 0; z-index: 2; background: #F4F5F9; border-bottom: 1px solid #DADCE8;',
      rNumHead: NUM + 'z-index: 3;',
      rNumCell: NUM, rNumFoot: NUM,
      rHead: head, rRows: body, rNone: data.length === 0,
      rNoneHint: filters.length ? 'Your filters rule out every row. Genie can drop the tightest one.' : 'Nothing matches your search.',
      rFix: function () {
        if (!filters.length) { self.setState({ rSearch: '' }); return; }
        var best = 0, bestN = -1;
        filters.forEach(function (fx, i) { var n = rep.data.filter(function (r) { return passes(r, i); }).length; if (n > bestN) { bestN = n; best = i; } });
        var d0 = filters[best], c0 = colOf(d0.c), n = filters.slice(); n.splice(best, 1);
        setF(n, { rBanner: { title: 'Genie loosened your filters.', did: ['Removed “' + c0.l + ' ' + opLabel(c0, d0) + ' ' + valLabel(c0, d0) + '”, which ruled out every row'], canUndo: true, prev: filters, kind: 'ai' } });
      },
      rFootRow: rowBase + 'position: sticky; bottom: 0; z-index: 2; background: #F4F5F9; border-top: 1px solid #DADCE8;',
      rFoot: foot
    });
  }
  renderVals() {
    var self = this, s = this.state, d = this.data(), x = EXTRA[s.persona];
    var compact = !!this.props.compact;
    var tab = s.tab;
    var dd = Object.assign({}, d, x);

    var tray = d.tray.map(function (t, i) {
      var st = s.done[i];
      var exp = s.expanded === i && !st;
      return {
        kind: t.kind, title: t.title, why: t.why, action: t.action,
        open: !st, isDone: !!st, doneLabel: st === 'snoozed' ? 'Snoozed until tomorrow' : 'Done · synced to CRM',
        dash: (10 + (i * 11) % 30) + ' 60',
        kindStyle: 'font-size: 12px; line-height: 16px; font-weight: 600; padding: 2px 8px; border-radius: 999px; ' + (t.risk ? 'color: #B3261E; border: 1px solid #B3261E;' : 'color: #24285D; background: #F4F5F9; border: 1px solid #DADCE8;'),
        wrapStyle: 'border-radius: 10px; ' + (exp ? 'background: #F4F5F9;' : 'background: transparent;') + (st ? ' opacity: 0.65;' : ''),
        chevStyle: 'flex-shrink: 0; margin-top: 3px; transform: rotate(' + (exp ? '90' : '0') + 'deg);',
        expandedAttr: exp ? 'true' : 'false', showActions: exp,
        toggle: function () { self.setState({ expanded: s.expanded === i ? null : i }); },
        act: function () { var dn = Object.assign({}, s.done); dn[i] = 'done'; self.setState({ done: dn, expanded: null, log: self.addLog(t.action + ': ' + t.title) }); },
        snooze: function () { var dn = Object.assign({}, s.done); dn[i] = 'snoozed'; self.setState({ done: dn, expanded: null }); }
      };
    });
    var doneCount = 0, cleared = 0;
    d.tray.forEach(function (t, i) { if (s.done[i] === 'done') doneCount++; if (s.done[i]) cleared++; });
    var total = d.tray.length, remaining = total - cleared;

    var activeId = s.viewId || d.views[0].id;
    var v = this.findView(activeId);
    var views = d.views.map(function (vw) {
      var on = vw.id === activeId;
      return { label: vw.label, total: vw.total, pressed: on ? 'true' : 'false',
        style: TABV + (on ? 'border: 1px solid #24285D; background: #FFFFFF; color: #24285D; box-shadow: inset 0 0 0 1px #24285D;' : 'border: 1px solid #DADCE8; background: #FFFFFF; color: #474945;'),
        countStyle: 'min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box; border-radius: 999px; font-size: 12px; line-height: 22px; text-align: center; ' + (on ? 'background: #24285D; color: #FFFFFF;' : 'background: #F4F5F9; color: #474945;'),
        pick: function () { self.setState(self.viewState(vw.id, false)); } };
    });
    var chipsRaw = s.chips || v.chips.map(function (c) { return { label: c, ai: false }; });
    var chips = chipsRaw.map(function (c, i) {
      return {
        label: c.label, ai: c.ai,
        style: 'min-height: 32px; display: flex; align-items: center; gap: 6px; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 600; box-sizing: border-box; color: #24285D; ' + (c.ai ? 'background: #F4F5F9; border: 1px solid #F89624;' : 'background: #FFFFFF; border: 1px solid #8286A8;'),
        remove: function () { var n = chipsRaw.slice(); n.splice(i, 1); self.setState({ chips: n }); }
      };
    });
    var empty = !!(v.road && s.roadUndone);
    var isLo = s.persona === 'lo';
    var results = empty ? [] : v.results.map(function (r, i) {
      var key = s.persona + ':' + v.id + ':' + i;
      var acted = !!s.acted[key];
      var locked = isLo && !s.allowCompare && !!r.lender;
      return {
        name: r.name, sub: r.sub, metric: r.metric, initials: initials(r.name).toUpperCase(),
        hasTag: !!r.tag, tag: r.tag || '', tagTone: r.tagTone || 'neutral',
        hasLender: !!r.lender, locked: locked,
        lenderText: locked ? 'Lender details hidden by your org’s settings' : (r.lender || ''),
        acted: acted, btnVariant: acted ? 'secondary' : 'primary',
        actLabel: acted ? 'Done · synced' : v.act,
        act: function () { var a = Object.assign({}, s.acted); a[key] = true; self.setState({ acted: a, log: self.addLog(v.act + ': ' + r.name) }); }
      };
    });

    var ser = series(s.persona, x.max);
    var peak = 0; ser.forEach(function (c, i) { if (c.a > ser[peak].a) peak = i; });
    var hi = s.hover == null ? peak : s.hover;
    var dot = compact ? 7 : 12, gapPx = compact ? 2 : 4;
    var cols = ser.map(function (c, i) {
      var dots = [];
      var on = i === hi;
      for (var k = 0; k < c.p; k++) dots.push('display: block; width: ' + dot + 'px; height: ' + dot + 'px; border-radius: 999px; background: #B9BDD8;');
      for (var j = 0; j < c.a; j++) dots.push('display: block; width: ' + dot + 'px; height: ' + dot + 'px; border-radius: 999px; background: ' + (on ? '#F89624' : '#24285D') + ';');
      return { dots: dots, hover: function () { if (self.state.hover !== i) self.setState({ hover: i }); },
        style: 'flex: 1 1 0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: ' + gapPx + 'px; height: 100%; cursor: default; border-radius: 6px; ' + (on ? 'background: #F4F5F9;' : '') };
    });
    var hc = ser[hi];
    var readout = dayLabel(hi) + ': ' + hc.a + ' ' + x.chartUnit.toLowerCase() + ' actual' + (hc.p ? ', ' + (hc.a + hc.p) + ' projected by Genie' : '');
    var xlabels = [0, 6, 12, 18, 24, 29].map(dayLabel);

    var prompts = this.prompts();
    var menuDef = [{ id: 'home', label: 'Home' }, { id: 'explore', label: 'Explore' }, { id: 'actions', label: 'Action items', short: 'Actions' }, { id: 'reports', label: 'Reports' }, { id: 'crm', label: d.crmTitle, short: d.crmTitle.split(' ').pop().replace(/^./, function (ch) { return ch.toUpperCase(); }) }];
    var menu = menuDef.map(function (m) {
      var on = tab === m.id;
      return { label: compact && m.short ? m.short : m.label, isReports: m.id === 'reports', current: on ? 'page' : 'false', isHome: m.id === 'home', isExplore: m.id === 'explore', isActions: m.id === 'actions', isCrm: m.id === 'crm',
        hasBadge: m.id === 'actions' && remaining > 0,
        // Phone: the count sits as a small badge on the icon's top right corner.
        badgeStyle: 'box-sizing: border-box; border-radius: 999px; background: #F89624; color: #24285D; font-weight: 700; text-align: center; ' + (compact ? 'position: absolute; top: 3px; left: calc(50% + 3px); min-width: 17px; height: 17px; padding: 0 4px; font-size: 10px; line-height: 15px; border: 1px solid ' + (on ? '#FFFFFF' : '#24285D') + ';' : 'min-width: 20px; height: 20px; padding: 0 6px; font-size: 11px; line-height: 20px;'),
        go: function () { self.setState({ tab: m.id, aiPop: false }); },
        style: FONT + 'display: flex; align-items: center; justify-content: center; gap: ' + (compact ? '2px; position: relative; flex-direction: column; flex: 1 1 0; min-height: 52px; padding: 4px 2px; font-size: 11px; border-radius: 12px;' : '8px; min-height: 44px; padding: 0 16px; font-size: 14px; border-radius: 999px;') + ' border: none; font-weight: 600; cursor: pointer; white-space: nowrap; ' + (on ? 'background: #FFFFFF; color: #24285D;' : 'background: transparent; color: #EEF0F8;') };
    });
    var titles = { home: 'Home', explore: 'Explore', actions: 'Action items', reports: 'Reports', crm: d.crmTitle };
    var cardR = '16px';
    var cardStyle = 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: ' + cardR + '; display: flex; flex-direction: column; min-width: 0; box-sizing: border-box; ' + (compact ? 'padding: 16px; gap: 12px;' : 'padding: 20px 24px; gap: 14px;');
    var aiLast = s.thread.length ? s.thread[s.thread.length - 1] : { q: '', did: [], a: '' };

    var filterGroups = FILTER_GROUPS.map(function (g) {
      return { name: g.name, options: g.options.map(function (o) {
        var on = !!s.fsel[o];
        return { label: o, pressed: on ? 'true' : 'false', style: (on ? PILL_ON : PILL_OFF),
          toggle: function () { var f = Object.assign({}, s.fsel); f[o] = !f[o]; self.setState({ fsel: f }); } };
      }) };
    });

    return Object.assign(this.reportVals(compact), this.pipeVals(compact), this.homeVals(compact), {
      d: dd, compact: compact, wide: !compact,
      rootStyle: VARS + FONT + 'position: relative; overflow: hidden; display: flex; flex-direction: column; background: #EEF0F6; color: #24285D; ' + 'width: 100%; height: 100%;',
      headerStyle: 'position: relative; z-index: 20; flex-shrink: 0; display: flex; align-items: center; box-sizing: border-box; ' + (compact ? 'gap: 10px; min-height: 56px; padding: 8px 16px;' : 'gap: 16px; min-height: 64px; padding: 12px 40px; margin-bottom: 16px;') + ' background: #FFFFFF; border-bottom: 1px solid #DADCE8; box-shadow: 0 1px 3px rgba(36,40,93,0.06);',
      logoStyle: 'display: block; flex-shrink: 0; ' + (compact ? 'width: 26px; height: 34px;' : 'width: 28px; height: 36px;'),
      pageTitle: titles[tab],
      mainStyle: 'flex-grow: 1; min-height: 0; overflow-y: auto; box-sizing: border-box; ' + (compact ? 'padding: 20px 16px 96px;' : 'padding: 8px 40px 120px;'),
      // Desktop: Action items floats right and the other widgets wrap around it, going full width once they pass its bottom.
      gridStyle: compact ? 'display: grid; gap: 20px; align-items: start; grid-template-columns: repeat(1, minmax(0, 1fr));' : 'display: flow-root;',
      homeSideStyle: 'display: flex; flex-direction: column; gap: 20px; min-width: 0; ' + (compact ? 'order: 1;' : 'float: right; width: calc((100% - 20px) / 3); margin: 0 0 20px 20px;'),
      homeMainStyle: 'min-width: 0; ' + (compact ? 'display: flex; flex-direction: column; gap: 20px;' : 'display: block;'),
      hwBox: 'display: flow-root; min-width: 0; ' + (compact ? '' : 'margin-bottom: 20px;'),
      narrowCol: 'display: flex; flex-direction: column; gap: 20px; ' + (compact ? '' : 'max-width: 880px; margin: 0 auto;'),
      kpiRow: 'display: grid; gap: ' + (compact ? '10px; grid-template-columns: repeat(1, minmax(0, 1fr));' : '20px; grid-template-columns: repeat(3, minmax(0, 1fr));'),
      kpiCard: 'background: #FFFFFF; border: 1px solid #DADCE8; border-radius: ' + cardR + '; padding: ' + (compact ? '14px 16px' : '18px 20px') + '; display: flex; flex-direction: column; gap: 4px;',
      kpis: x.kpis.map(function (k) { return Object.assign({}, k, { deltaStyle: 'font-size: 13px; line-height: 18px; font-weight: 600; color: ' + (k.up ? '#1D7A55' : '#B3261E') + ';' }); }),
      cardStyle: cardStyle,
      aiCardStyle: 'background: #F4F5F9; border: 1px solid #DADCE8; border-radius: ' + cardR + '; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box; ' + (compact ? 'padding: 16px;' : 'padding: 20px;'),
      chartWrap: 'display: flex; gap: 24px; ' + (compact ? 'flex-direction: column-reverse;' : 'align-items: stretch;'),
      chartSide: 'display: flex; flex-direction: column; gap: 14px; justify-content: space-between; ' + (compact ? '' : 'width: 220px; flex-shrink: 0;'),
      plotStyle: 'display: flex; align-items: flex-end; gap: ' + (compact ? '1px' : '4px') + '; height: ' + (x.max * (dot + gapPx)) + 'px;',
      cols: cols, readout: readout, xlabels: xlabels,
      runTip: function () { self.run(x.tipPrompt); },
      isHome: tab === 'home', isExplore: tab === 'explore', isActions: tab === 'actions', isCrm: tab === 'crm',
      goExplore: function () { self.setState({ tab: 'explore' }); },
      tray: tray, doneCount: doneCount, total: total, remaining: remaining, allDone: remaining === 0,
      progressStyle: 'height: 100%; background: #24285D; border-radius: 999px; width: ' + Math.round(doneCount / total * 100) + '%;',
      views: views, chips: chips,
      hasBanner: !!s.banner && !empty, bannerText: s.banner || '',
      undo: function () {
        if (v.road) { self.setState({ roadUndone: true, banner: null, chips: v.road.before.map(function (c) { return { label: c, ai: false }; }) }); }
        else { self.setState({ banner: null, chips: v.chips.map(function (c) { return { label: c, ai: false }; }) }); }
      },
      isEmpty: empty, emptyHint: v.road ? v.road.empty : '',
      redo: function () { self.setState(self.viewState(v.id, true)); },
      hasResults: !empty, results: results,
      rowStyle: 'border-bottom: 1px solid #DADCE8; ' + (compact ? 'display: flex; flex-direction: column; gap: 6px; padding: 12px 0;' : 'display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.6fr) minmax(0, 1.6fr) 190px; gap: 16px; align-items: center; padding: 12px 0;'),
      actionCell: 'display: flex; ' + (compact ? 'padding-top: 4px;' : 'justify-content: flex-end;'),
      countLine: 'Showing ' + results.length + ' of ' + v.total + ' ' + v.noun + ' · ' + d.territory,
      stagesGrid: 'display: grid; gap: 12px; ' + (compact ? 'grid-template-columns: repeat(2, minmax(0, 1fr));' : 'grid-template-columns: repeat(4, minmax(0, 1fr));'),
      log: s.log.concat(d.log),
      menu: menu, remaining: remaining,
      fadeStyle: 'position: absolute; z-index: 29; left: 0; right: 0; bottom: 0; pointer-events: none; height: ' + (compact ? '96px' : '130px') + '; background: linear-gradient(to bottom, rgba(238,240,246,0), rgba(238,240,246,0.92) 55%, #EEF0F6);',
      menuStyle: 'position: absolute; z-index: 30; display: flex; align-items: center; background: #24285D; border: 1px solid #15183A; box-sizing: border-box; box-shadow: 0 2px 4px rgba(21,24,58,0.20), 0 12px 32px rgba(21,24,58,0.30); ' + (compact ? 'left: 8px; right: 80px; bottom: 8px; gap: 2px; padding: 6px; border-radius: 18px;' : 'left: 50%; bottom: 24px; transform: translateX(-50%); gap: 4px; padding: 6px; border-radius: 999px;'),
      aiExpanded: s.aiPop ? 'true' : 'false',
      aiBtnStyle: 'position: absolute; z-index: 31; display: flex; align-items: center; justify-content: center; padding: 0; border: 2px solid #FFFFFF; border-radius: 999px; cursor: pointer; background: #F89624; color: #24285D; box-shadow: 0 2px 4px rgba(21,24,58,0.20), 0 12px 28px rgba(21,24,58,0.28); ' + (compact ? 'right: 8px; bottom: 8px; width: 64px; height: 64px;' : 'right: 40px; bottom: 22px; width: 64px; height: 64px;') + (s.aiPop ? ' outline: 3px solid #24285D; outline-offset: 2px;' : ''),
      lampSize: '32',
      toggleAi: function () { self.setState({ aiPop: !s.aiPop }); },
      closeAi: function () { self.setState({ aiPop: false }); },
      aiPopOpen: s.aiPop,
      aiPopStyle: 'position: absolute; z-index: 28; ' + (compact ? 'left: 8px; right: 8px; bottom: 84px; max-height: 700px; overflow-y: auto;' : 'right: 40px; bottom: 100px; width: 760px; max-width: calc(100% - 80px); max-height: calc(100% - 200px); overflow-y: auto;') + ' border-radius: 16px; box-shadow: 0 8px 32px rgba(36,40,93,0.18);',
      aiIdle: s.thread.length === 0 && !(s.aiBrief && tab === 'reports'), aiHasThread: s.thread.length > 0 && !(s.aiBrief && tab === 'reports'), aiLast: aiLast,
      briefHowOpen: !!s.briefHow, briefToggleHow: function () { self.setState({ briefHow: !s.briefHow }); },
      nudgeShow: tab === 'reports' && !s.aiPop && !s.nudgeOff && !s.nudgeHidden[s.reportId || '_first'],
      nudgeSub: 'Genie can brief you on ' + ((REPORTS[s.persona].filter(function (r) { return r.id === s.reportId; })[0] || REPORTS[s.persona][0]).label || 'this report') + ' and check the numbers.',
      nudgeGo: function () { var h = Object.assign({}, s.nudgeHidden); h[s.reportId || '_first'] = true; self.setState({ aiPop: true, aiBrief: true, nudgeHidden: h }); },
      nudgeHide: function () { var h = Object.assign({}, s.nudgeHidden); h[s.reportId || '_first'] = true; self.setState({ nudgeHidden: h }); },
      nudgeOff: function () { self.setState({ nudgeOff: true, nudgeTip: false }); },
      nudgeTip: !!s.nudgeTip, nudgeTipOn: function () { if (!self.state.nudgeTip) self.setState({ nudgeTip: true }); }, nudgeTipOff: function () { if (self.state.nudgeTip) self.setState({ nudgeTip: false }); },
      nudgeOnAttr: s.nudgeOff ? 'false' : 'true', nudgeToggle: function () { self.setState({ nudgeOff: !s.nudgeOff, nudgeHidden: {} }); },
      nudgeTrack: 'width: 36px; height: 20px; border-radius: 999px; flex-shrink: 0; position: relative; display: inline-block; ' + (s.nudgeOff ? 'background: #DADCE8;' : 'background: #24285D;'),
      nudgeKnob: 'position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(21,24,58,0.3); ' + (s.nudgeOff ? 'left: 2px;' : 'left: 18px;'),
      nudgeStyle: 'position: absolute; z-index: 31; box-sizing: border-box; background: #FFFFFF; border: 1px solid #DADCE8; border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 32px rgba(36,40,93,0.22); ' + (compact ? 'left: 12px; right: 12px; bottom: 88px;' : 'right: 40px; bottom: 100px; width: 320px;'),
      nudgeTail: 'position: absolute; bottom: -7px; right: 26px; width: 12px; height: 12px; background: #FFFFFF; border-right: 1px solid #DADCE8; border-bottom: 1px solid #DADCE8; transform: rotate(45deg);',
      aiCanBrief: tab === 'reports', aiBriefing: !!s.aiBrief && tab === 'reports',
      aiBriefSub: 'Genie summarizes what stands out and checks the numbers.',
      aiBriefOn: function () { self.setState({ aiBrief: true }); }, aiBriefOff: function () { self.setState({ aiBrief: false }); },
      briefHowOpenAttr: s.briefHow ? 'true' : 'false', briefHowIcon: 'transform: rotate(' + (s.briefHow ? '90' : '0') + 'deg);',
      aiNoun: s.persona === 'lo' ? 'market' : s.persona === 'ae' ? 'accounts' : s.persona === 'rec' ? 'candidates' : 'team',
      aiTiles: x.tiles.map(function (label, i) { return { label: label, run: function () { self.run(i); },
        iconStyle: 'width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; ' + (i === 3 ? 'background: #F89624; color: #24285D;' : 'background: #24285D; color: #FFFFFF;') }; }),
      clearThread: function () { self.setState({ thread: [] }); },
      showResults: function () { self.setState({ tab: 'explore', aiPop: false }); },
      modalOpen: !!s.modal, modalFilters: s.modal === 'filters', modalPersona: s.modal === 'persona',
      dialogStyle: 'position: absolute; z-index: 40; background: #FFFFFF; overflow-y: auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 8px 24px rgba(36, 40, 93, 0.18); ' + (compact ? 'left: 0; right: 0; bottom: 0; max-height: 760px; border-radius: 16px 16px 0 0; padding: 16px 16px 24px;' : 'top: 80px; left: 50%; width: 560px; margin-left: -280px; max-height: 740px; border-radius: 16px; padding: 24px;'),
      openFilters: function () { self.setState({ modal: 'filters' }); },
      openPersona: function () { self.setState({ modal: 'persona' }); },
      closeModal: function () { self.setState({ modal: null }); },
      askInstead: function () { self.setState({ modal: null, aiPop: true }); },
      filterGroups: filterGroups,
      applyFilters: function () {
        var cur = chipsRaw.slice();
        Object.keys(s.fsel).forEach(function (k) { if (s.fsel[k] && !cur.some(function (c) { return c.label === k; })) cur.push({ label: k, ai: false }); });
        self.setState({ chips: cur, fsel: {}, modal: null, viewId: activeId });
      },
      personaList: ORDER.map(function (k) {
        var p = PERSONAS[k], on = k === s.persona;
        return { initials: p.initials, role: p.role, name: p.name, territory: p.territory, pressed: on ? 'true' : 'false',
          style: FONT + 'display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border-radius: 10px; cursor: pointer; background: ' + (on ? '#F4F5F9' : '#FFFFFF') + '; border: ' + (on ? '2px solid #24285D' : '1px solid #DADCE8') + '; color: #24285D;',
          pick: function () { self.setState(self.fresh(k, s.allowCompare)); } };
      }),
      allowCompare: s.allowCompare ? 'true' : 'false',
      toggleCompare: function () { self.setState({ allowCompare: !s.allowCompare }); },
      switchTrack: 'flex-shrink: 0; width: 52px; height: 32px; border-radius: 999px; border: none; padding: 3px; display: flex; cursor: pointer; justify-content: ' + (s.allowCompare ? 'flex-end' : 'flex-start') + '; background: ' + (s.allowCompare ? '#24285D' : '#8286A8') + ';'
    });
  }
}
