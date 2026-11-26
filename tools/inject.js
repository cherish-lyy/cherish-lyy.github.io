// ============================================
// 护眼阅读样式注入脚本
// 作用：网站生成后，把下面这段 CSS 塞进每个页面的 <head>
//       让正文变成 18px / 行高 1.9 / 米白底 / 深灰字
// 参数：要处理的目录（默认 site/public）
// 这个文件不用改。
// ============================================

const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'site/public';

const css = `
<style>
/* ===== 护眼阅读样式 start ===== */
body {
  background: #FAFAF8 !important;
  color: #2E2E2E !important;
  font-size: 18px !important;
  line-height: 1.9 !important;
  font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", sans-serif !important;
  -webkit-font-smoothing: antialiased;
}
.article-entry,
.article-entry p,
.article-entry li,
.article-entry blockquote,
.post-body p,
.post-body li {
  font-size: 18px !important;
  line-height: 1.9 !important;
  color: #2E2E2E !important;
}
.article-entry { max-width: 760px !important; }
.article-entry p { margin: 0 0 1.1em 0 !important; }
.article-entry h1 { font-size: 27px !important; line-height: 1.4 !important; }
.article-entry h2 { font-size: 22px !important; line-height: 1.5 !important; margin-top: 1.8em !important; }
.article-entry h3 { font-size: 19px !important; line-height: 1.6 !important; margin-top: 1.5em !important; }
.article-entry h4 { font-size: 18px !important; }
.article-entry code {
  font-size: 15px !important;
  background: #F1F0EB !important;
  color: #1F3A2E !important;
  padding: 1px 4px !important;
  border-radius: 3px !important;
}
.article-entry pre,
.article-entry pre code,
.highlight pre {
  font-size: 15px !important;
  line-height: 1.7 !important;
}
.highlight { background: #F4F3EE !important; }
.article-entry a, a { color: #1F6FB2 !important; }
.article-entry blockquote {
  border-left: 3px solid #C9C6BD !important;
  color: #4A4A44 !important;
  background: #F5F4EF !important;
}
.article-entry table { font-size: 16px !important; }
.article-entry table th,
.article-entry table td { padding: 8px 12px !important; }

/* 侧边栏和导航稍微放大，别太小 */
#sidebar, #sidebar a, .header-inner, .header-inner a, .article-meta, .archive-article-title {
  font-size: 15px !important;
  line-height: 1.8 !important;
}
/* ===== 护眼阅读样式 end ===== */
</style>
`;

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.html')) {
      let html = fs.readFileSync(p, 'utf8');
      if (!html.includes('护眼阅读样式 start')) {
        html = html.replace('</head>', css + '</head>');
        fs.writeFileSync(p, html);
      }
    }
  }
}

walk(target);
console.log('护眼样式已注入：' + target);
