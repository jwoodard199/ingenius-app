// Boots the app. Optional URL parameters let you jump straight to a sample view, for example:
//   index.html?persona=exec&tab=reports&report=flow
//   persona: lo | exec | rec | ae      tab: home | explore | actions | reports | crm (pipeline board)
//   report: map | flow | any report id in src/data/reports.js
(function () {
  var params = new URLSearchParams(window.location.search);
  var LABELS = { lo: 'Loan officer', exec: 'Lender executive', rec: 'Recruiter', ae: 'Account executive' };
  var persona = LABELS[params.get('persona')] || 'Lender executive';
  var mq = window.matchMedia('(max-width: 767px)');
  var props = function () { return { persona: persona, allowCompare: params.get('compare') !== 'off', compact: mq.matches }; };
  var app = mountDC(Component, document.getElementById('ig-template').innerHTML, document.getElementById('app'), props);
  var patch = {};
  if (params.get('tab')) patch.tab = params.get('tab');
  if (params.get('report')) patch.reportId = params.get('report');
  if (Object.keys(patch).length) app.setState(patch);
  var onChange = function () { app.__schedule(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
  window.InGeniusApp = app;
})();
