// ============================================================
// 构建时生成搜索索引 search.json
// 扫描 public 下所有文章页，提取标题和正文纯文本
// ============================================================

const fs = require('fs');
const path = require('path');

const PUB = process.argv[2] || 'site/public';
const out = [];

function clean(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (f === 'index.html') {
      const html = fs.readFileSync(p, 'utf8');
      if (!html.includes('class="post-content"')) continue;

      const titleMatch = html.match(/<h1 class="post-title">([\s\S]*?)<\/h1>/);
      const title = titleMatch ? clean(titleMatch[1]) : '';

      const bodyMatch = html.match(/<div class="post-content">([\s\S]*?)<\/div>\s*<footer class="post-footer">/);
      const text = bodyMatch ? clean(bodyMatch[1]).slice(0, 6000) : '';

      const rel = path.relative(PUB, path.dirname(p)).split(path.sep).join('/');
      const url = rel ? '/' + rel + '/' : '/';

      if (title && text) out.push({ title, url, text });
    }
  }
}

if (fs.existsSync(PUB)) {
  walk(PUB);
  fs.writeFileSync(path.join(PUB, 'search.json'), JSON.stringify(out), 'utf8');
  console.log('search.json 生成完成：' + out.length + ' 篇');
} else {
  console.log('找不到目录：' + PUB);
  process.exit(1);
}
