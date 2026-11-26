/* ============================================================
   Reed 主题 · 站内搜索
   数据来自构建时生成的 /search.json
   ============================================================ */

(function () {
  var input = document.getElementById('search-input');
  if (!input) return;

  var box = document.getElementById('search-results');
  var list = document.querySelector('.post-list');
  var strip = document.querySelector('.cat-strip');
  var data = null;
  var loading = false;

  function load() {
    if (data || loading) return;
    loading = true;
    fetch((window.__SEARCH_JSON__ || '/search.json'))
      .then(function (r) { return r.json(); })
      .then(function (d) { data = d; loading = false; run(input.value); })
      .catch(function () { loading = false; });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function snippet(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return text.slice(0, 90) + '…';
    var start = Math.max(0, i - 40);
    var s = (start > 0 ? '…' : '') + text.slice(start, start + 110) + '…';
    return esc(s).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
  }

  function run(q) {
    q = (q || '').trim();
    if (!q) {
      box.hidden = true;
      if (list) list.style.display = '';
      if (strip) strip.style.display = '';
      return;
    }
    if (!data) { load(); return; }

    var low = q.toLowerCase();
    var hits = data.filter(function (p) {
      return (p.title + ' ' + p.text).toLowerCase().indexOf(low) !== -1;
    });

    if (list) list.style.display = hits.length ? 'none' : '';
    if (strip) strip.style.display = 'none';

    box.hidden = false;
    if (!hits.length) {
      box.innerHTML = '<p class="search-empty">没有找到包含「' + esc(q) + '」的内容</p>';
      return;
    }

    var html = '<p class="search-count">找到 ' + hits.length + ' 篇</p><ul class="search-list">';
    hits.forEach(function (p) {
      html += '<li>'
        + '<a class="search-title" href="' + p.url + '">' + esc(p.title) + '</a>'
        + '<p class="search-snippet">' + snippet(p.text, low) + '</p>'
        + '</li>';
    });
    html += '</ul>';
    box.innerHTML = html;
  }

  input.addEventListener('input', function () { run(input.value); });
  input.addEventListener('focus', load);

  // 键盘快捷键：按 / 聚焦搜索框
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
})();
