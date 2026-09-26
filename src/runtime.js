// Minimal renderer for the InGenius app template: {{holes}}, <sc-if>, <sc-for>, design-system imports.
(function () {
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
  var ONLY = /^\{\{\s*([\w.$]+)\s*\}\}$/;
  function lookup(path, scope) {
    var parts = path.split('.');
    var v;
    for (var i = scope.length - 1; i >= 0; i--) { if (scope[i] && parts[0] in scope[i]) { v = scope[i][parts[0]]; break; } }
    for (var j = 1; j < parts.length && v != null; j++) v = v[parts[j]];
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null || v === false ? '' : String(v); });
  }
  function valueOf(str, scope) {
    var m = str && str.trim().match(ONLY);
    return m ? lookup(m[1], scope) : str;
  }
  var EVENTS = { onclick: 'click', oninput: 'input', onchange: 'change', onmouseenter: 'mouseenter', onmouseleave: 'mouseleave', onkeydown: 'keydown', ondragstart: 'dragstart', ondragend: 'dragend', ondragover: 'dragover', ondragleave: 'dragleave', ondrop: 'drop' };

  function renderChildren(node, scope, out) {
    for (var c = node.firstChild; c; c = c.nextSibling) renderNode(c, scope, out);
  }
  function renderNode(node, scope, out) {
    if (node.nodeType === 3) { out.push(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'helmet') return;
    if (tag === 'sc-if') { if (valueOf(node.getAttribute('value'), scope)) renderChildren(node, scope, out); return; }
    if (tag === 'sc-for') {
      var list = valueOf(node.getAttribute('list'), scope) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (item, i) { var fr = {}; fr[as] = item; fr[as + 'Index'] = i; renderChildren(node, scope.concat([fr]), out); });
      return;
    }
    if (tag === 'x-import') {
      var comp = node.getAttribute('component-from-global-scope');
      var el;
      if (comp === 'InGenius.Tag') {
        el = document.createElement('span');
        el.className = 'ig-tag ig-tag-' + (valueOf(node.getAttribute('tone'), scope) || 'neutral');
      } else {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'ig-btn ig-btn-' + (valueOf(node.getAttribute('variant'), scope) || 'primary');
        if (node.hasAttribute('disabled') && valueOf(node.getAttribute('disabled'), scope)) el.disabled = true;
        var fn = valueOf(node.getAttribute('on-click'), scope);
        if (typeof fn === 'function') el.addEventListener('click', fn);
      }
      var kids = []; renderChildren(node, scope, kids); kids.forEach(function (k) { el.appendChild(k); });
      out.push(el); return;
    }
    var ns = node.namespaceURI;
    var e = ns && ns !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(ns, tag) : document.createElement(tag);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name;
      if (name.indexOf('hint-') === 0) continue;
      if (EVENTS[name.toLowerCase()]) {
        var h = valueOf(at.value, scope);
        if (typeof h === 'function') e.addEventListener(EVENTS[name.toLowerCase()], h);
        continue;
      }
      var raw = valueOf(at.value, scope);
      if (raw === false || raw == null) continue;
      var val = typeof raw === 'string' ? interp(raw, scope) : String(raw);
      if (name === 'value' && tag === 'input') { e.value = val; e.setAttribute('value', val); continue; }
      e.setAttribute(name, val);
    }
    var inner = []; renderChildren(node, scope, inner); inner.forEach(function (k) { e.appendChild(k); });
    out.push(e);
  }

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    if (this.__schedule) this.__schedule();
  };

  window.mountDC = function (Component, templateHTML, mountEl, getProps) {
    var tpl = document.createElement('template');
    tpl.innerHTML = templateHTML;
    var inst = new Component(getProps());
    var queued = false;
    function scrollers() { return Array.prototype.slice.call(mountEl.querySelectorAll('*')).filter(function (n) { return n.scrollTop || n.scrollLeft; }); }
    function path(n) { var p = []; while (n && n !== mountEl) { p.unshift(Array.prototype.indexOf.call(n.parentNode.children, n)); n = n.parentNode; } return p; }
    function at(p) { var n = mountEl; for (var i = 0; i < p.length && n; i++) n = n.children[p[i]]; return n; }
    function draw() {
      queued = false;
      var prevProps = inst.props; inst.props = getProps();
      if (inst.componentDidUpdate && prevProps && prevProps.compact !== inst.props.compact) { /* layout-only prop */ }
      var saved = scrollers().map(function (n) { return { p: path(n), t: n.scrollTop, l: n.scrollLeft }; });
      var act = document.activeElement, focusPath = null, sel = null;
      if (act && mountEl.contains(act)) { focusPath = path(act); try { sel = [act.selectionStart, act.selectionEnd]; } catch (err) { sel = null; } }
      var vals = inst.renderVals();
      var out = []; renderChildren(tpl.content, [vals], out);
      mountEl.replaceChildren.apply(mountEl, out);
      saved.forEach(function (s) { var n = at(s.p); if (n) { n.scrollTop = s.t; n.scrollLeft = s.l; } });
      if (focusPath) { var f = at(focusPath); if (f && f.focus) { f.focus({ preventScroll: true }); if (sel && sel[0] != null) { try { f.setSelectionRange(sel[0], sel[1]); } catch (err) {} } } }
    }
    inst.__schedule = function () { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    draw();
    return inst;
  };
})();
