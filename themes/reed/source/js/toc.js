/* ============================================================
   Reed 主题 · 文章目录
   作用：
   1. 自动扫描正文里的 h2 / h3，生成可点击的目录
   2. 自动给标题加 id，点目录就跳过去
   3. 标题悬停显示 # 锚点，可复制链接
   4. 右下角「↑」按钮回到顶部
   ============================================================ */

(function () {
  var content = document.querySelector('.post-content');
  if (!content) return;

  // ---------- 0. 给表格包一层可横向滚动的容器，避免撑破页面 ----------
  [].slice.call(content.querySelectorAll('table')).forEach(function (tbl) {
    var p = tbl.parentElement;
    if (p && p.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
  });

  // ---------- 1. 先去掉正文里手写的「目录」块，避免重复 ----------
  var headingsAll = [].slice.call(content.querySelectorAll('h2'));
  for (var i = 0; i < headingsAll.length; i++) {
    if (headingsAll[i].textContent.trim().replace(/\s/g, '') === '目录') {
      var node = headingsAll[i];
      while (node) {
        var next = node.nextElementSibling;
        var isH2 = next && next.tagName === 'H2';
        node.remove();
        if (!next || isH2) break;
        node = next;
      }
      break;
    }
  }

  // ---------- 2. 收集标题 ----------
  var heads = [].slice.call(content.querySelectorAll('h2, h3'));
  if (heads.length === 0) return;

  var used = {};
  function makeId(text, index) {
    var s = text.trim().toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-');
    if (!s) s = 'sec-' + (index + 1);
    if (used[s]) { used[s]++; s = s + '-' + used[s]; }
    else { used[s] = 1; }
    return s;
  }

  // ---------- 3. 生成目录 ----------
  var toc = document.getElementById('post-toc');
  var items = '';

  heads.forEach(function (h, index) {
    var id = makeId(h.textContent, index);
    h.id = id;

    var level = (h.tagName === 'H2') ? 2 : 3;
    items += '<li class="toc-l' + level + '"><a href="#' + id + '">'
           + h.textContent.replace(/</g, '&lt;') + '</a></li>';

    // 标题后面加一个小 # 锚点
    var a = document.createElement('a');
    a.className = 'head-anchor';
    a.href = '#' + id;
    a.textContent = '#';
    a.setAttribute('aria-hidden', 'true');
    h.appendChild(a);
  });

  if (toc) {
    toc.innerHTML =
      '<div class="toc-head">目录<span class="toc-count">' + heads.length + ' 节</span></div>'
      + '<ol class="toc-list">' + items + '</ol>';
  }

  // ---------- 4. 回到顶部按钮 ----------
  var btn = document.createElement('button');
  btn.className = 'back-top';
  btn.type = 'button';
  btn.title = '回到顶部';
  btn.textContent = '↑';
  document.body.appendChild(btn);

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      btn.classList.toggle('show', window.scrollY > 600);
      ticking = false;
    });
  });

  // ---------- 5. 平滑滚动 + 避开顶部导航 ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;

    var id = decodeURIComponent(href.slice(1));
    var el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();
    var top = el.getBoundingClientRect().top + window.pageYOffset - 76;
    window.scrollTo({ top: top, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });
})();
