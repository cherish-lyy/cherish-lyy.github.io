// ============================================================
// 构建时生成搜索索引 search.json
// 提取：标题、网址、日期、分类、正文纯文本
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

      // 日期 + 分类（都在 post-meta 里）
      let date = '';
      const cats = [];
      const metaMatch = html.match(/<div class="post-meta">([\s\S]*?)<\/div>\s*<\/header>/);
      if (metaMatch) {
        const meta = metaMatch[1];
        const dm = meta.match(/<time[^>]*>([^<]+)<\/time>/);
        if (dm) date = dm[1].trim();
        const re = /<a class="chip"[^>]*>([^<]+)<\/a>/g;
        let m;
        while ((m = re.exec(meta))) cats.push(m[1].trim());
      }

      const bodyMatch = html.match(/<div class="post-content">([\s\S]*?)<\/div>\s*<footer class="post-footer">/);
      const text = bodyMatch ? clean(bodyMatch[1]).slice(0, 6000) : '';

      const rel = path.relative(PUB, path.dirname(p)).split(path.sep).join('/');
      const url = rel ? '/' + rel + '/' : '/';

      if (title && text) out.push({ title, url, date, cats, text });
    }
  }
}

if (fs.existsSync(PUB)) {
  walk(PUB);
  // 按日期从新到旧预排序
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  fs.writeFileSync(path.join(PUB, 'search.json'), JSON.stringify(out), 'utf8');
  console.log('search.json 生成完成：' + out.length + ' 篇');
} else {
  console.log('找不到目录：' + PUB);
  process.exit(1);
}
