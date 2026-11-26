/* ============================================================
   Reed 主题 · 站内搜索（关键词 + 分类 + 时间）
   数据来自构建时生成的 /search.json
   ============================================================ */

(function () {
  var input = document.getElementById('search-input');
  if (!input) return;

  var box = document.getElementById('search-results');
  var catsBox = document.getElementById('search-cats');
  var sortBtn = document.getElementById('search-sort');
  var list = document.querySelector('.post-list');
  var strip = document.querySelector('.cat-strip');
  var filters = document.getElementById('search-filters');

  var data = null;
  var loading = false;
  var state = { q: '', cat: '', sort: 'asc' };

  function load() {
    if (data || loading) return;
    loading = true;
    fetch('/search.json?v=' + (window.__BUILD_TS__ || Date.now()))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        data = d;
        loading = false;
        buildCats();
        render();
      })
      .catch(function () { loading = false; });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function buildCats() {
    if (!catsBox || catsBox.dataset.built) return;
    var set = [];
    data.forEach(function (p) {
      (p.cats || []).forEach(function (c) {
        if (set.indexOf(c) === -1) set.push(c);
      });
    });
    set.sort();

    var html = '<button class="cat-tag active" data-cat="">全部</button>';
    set.forEach(function (c) {
      html += '<button class="cat-tag" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    });
    catsBox.innerHTML = html;
    catsBox.dataset.built = '1';
    if (filters) filters.hidden = false;

    catsBox.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.cat-tag') : null;
      if (!btn) return;
      [].forEach.call(catsBox.querySelectorAll('.cat-tag'), function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.cat = btn.dataset.cat || '';
      render();
    });
  }

  function snippet(text, q) {
    if (!q) return esc(text.slice(0, 100)) + '…';
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text.slice(0, 100)) + '…';
    var start = Math.max(0, i - 40);
    var s = (start > 0 ? '…' : '') + text.slice(start, start + 120) + '…';
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return esc(s).replace(re, '<mark>$1</mark>');
  }

  function render() {
    var q = (input.value || '').trim();
    state.q = q;

    var nothing = !q && !state.cat;
    if (nothing) {
      box.hidden = true;
      if (list) list.style.display = '';
      if (strip) strip.style.display = '';
      return;
    }

    if (!data) { load(); return; }

    var low = q.toLowerCase();
    var hits = data.filter(function (p) {
      var hay = (p.title + ' ' + p.text + ' ' + (p.date || '') + ' ' + (p.cats || []).join(' ')).toLowerCase();
      var okQ = !low || hay.indexOf(low) !== -1;
      var okC = !state.cat || (p.cats || []).indexOf(state.cat) !== -1;
      return okQ && okC;
    });

    hits.sort(function (a, b) {
      return state.sort === 'asc'
        ? (a.date > b.date ? 1 : a.date < b.date ? -1 : 0)
        : (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
    });

    if (filters) filters.hidden = false;
    if (list) list.style.display = 'none';
    if (strip) strip.style.display = 'none';
    box.hidden = false;

    var label = [];
    if (q) label.push('「' + q + '」');
    if (state.cat) label.push('分类 ' + state.cat);

    if (!hits.length) {
      box.innerHTML = '<p class="search-empty">没有找到' + esc(label.join(' + ')) + ' 的内容</p>';
      return;
    }

    var html = '<p class="search-count">' + esc(label.join(' + ') || '全部') + ' · 找到 ' + hits.length + ' 篇</p><ul class="search-list">';
    hits.forEach(function (p) {
      html += '<li>'
        + '<div class="search-item-meta">'
        +   '<time>' + esc((p.date || '').slice(0, 10)) + '</time>'
        +   (p.cats || []).map(function (c) { return '<span class="mini-chip">' + esc(c) + '</span>'; }).join('')
        + '</div>'
        + '<a class="search-title" href="' + p.url + '">' + esc(p.title) + '</a>'
        + '<p class="search-snippet">' + snippet(p.text, low) + '</p>'
        + '</li>';
    });
    html += '</ul>';
    box.innerHTML = html;
  }

  if (sortBtn) {
    sortBtn.addEventListener('click', function () {
      state.sort = state.sort === 'asc' ? 'desc' : 'asc';
      sortBtn.textContent = state.sort === 'asc' ? '最早优先 ↑' : '最新优先 ↓';
      render();
    });
  }

  input.addEventListener('input', render);
  input.addEventListener('focus', load);

  // 页面一加载就先把分类筛选项准备好，不用等用户输入
  load();

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
})();
