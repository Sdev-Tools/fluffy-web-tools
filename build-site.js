const fs = require("fs");
const path = require("path");

const root = __dirname;
const siteUrl = "https://sdev-tools.github.io/fluffy-web-tools";

const categories = [
  { id: "text", name: "テキスト", icon: "字", color: "#3e6671" },
  { id: "encode", name: "エンコード", icon: "符", color: "#2f776f" },
  { id: "color", name: "カラー", icon: "#", color: "#bd7a2a" },
  { id: "developer", name: "開発者", icon: "{ }", color: "#4f6f52" },
  { id: "converter", name: "単位変換", icon: "⇄", color: "#8a6f45" },
  { id: "generator", name: "生成", icon: "＋", color: "#6b6259" },
  { id: "image", name: "画像", icon: "□", color: "#526f77" }
];

const tools = [
  { id: "character-count", category: "text", icon: "字", name: "文字数・単語数カウント", description: "文字数、単語数、行数、文数、読了時間、原稿用紙換算をリアルタイムに確認できます。", tags: ["文字数", "単語数", "行数", "読了時間"], popular: true },
  { id: "case-converter", category: "text", icon: "Aa", name: "大文字・小文字変換", description: "英文や識別子を大文字、小文字、タイトルケース、camelCaseなどに変換します。", tags: ["大文字", "小文字", "camelCase"] },
  { id: "text-diff", category: "text", icon: "Δ", name: "テキスト差分チェック", description: "2つのテキストを行単位と単語単位で比較し、追加・削除・変更を見やすく表示します。", tags: ["差分", "比較", "diff"] },
  { id: "markdown-preview", category: "text", icon: "MD", name: "Markdownプレビュー", description: "Markdownを安全にHTMLプレビューし、見出しやリストの確認に使えます。", tags: ["Markdown", "HTML", "プレビュー"], external: ["marked"] },
  { id: "lorem-ipsum", category: "text", icon: "文", name: "ダミーテキスト生成", description: "日本語または英語のダミーテキストを段落数、文数、目標文字数に合わせて生成します。", tags: ["Lorem ipsum", "ダミー", "文章生成"] },
  { id: "base64", category: "encode", icon: "64", name: "Base64エンコード・デコード", description: "テキストやファイルをBase64に変換し、Base64文字列やData URIを復元します。", tags: ["Base64", "エンコード", "デコード"], popular: true },
  { id: "url-encode", category: "encode", icon: "%", name: "URLエンコード・デコード", description: "URLパラメータ向けに文字列を安全にエンコード・デコードします。", tags: ["URL", "encodeURIComponent", "パラメータ"] },
  { id: "html-entity", category: "encode", icon: "&", name: "HTMLエンティティ変換", description: "HTML特殊文字や数値参照をエスケープし、エンティティ文字列を元に戻します。", tags: ["HTML", "エスケープ", "エンティティ"] },
  { id: "jwt-decoder", category: "encode", icon: "JWT", name: "JWTデコーダー", description: "JWTをヘッダー、ペイロード、署名に分解し、日時クレームも読みやすく表示します。", tags: ["JWT", "JSON", "token"] },
  { id: "hash-generator", category: "encode", icon: "#=", name: "ハッシュ生成", description: "テキストやファイルからMD5、SHA-1、SHA-256、SHA-512のハッシュ値を生成します。", tags: ["MD5", "SHA-256", "SHA-512", "ハッシュ"] },
  { id: "yaml-json", category: "encode", icon: "YJ", name: "YAML ⇄ JSON変換", description: "シンプルなYAMLとJSONを相互変換し、設定ファイルの下書きを整えます。", tags: ["YAML", "JSON", "変換"] },
  { id: "csv-json", category: "encode", icon: "CSV", name: "CSV ⇄ JSON変換", description: "CSVをJSON配列へ変換し、JSON配列からCSVも生成できます。", tags: ["CSV", "JSON", "表"] },
  { id: "url-params", category: "encode", icon: "URL", name: "URLパラメータ解析", description: "URLのクエリパラメータを表形式で確認し、編集後のURLを生成できます。", tags: ["URL", "query", "パラメータ"] },
  { id: "color-picker", category: "color", icon: "●", name: "カラーピッカー", description: "色を選択してHEX、RGB、HSLを即座に確認し、コピーできます。", tags: ["色", "HEX", "RGB"], external: ["iro"] },
  { id: "color-converter", category: "color", icon: "#", name: "カラーコード変換", description: "HEX、RGB、HSL、RGBAのカラーコードを相互変換します。", tags: ["HEX", "RGB", "HSL", "RGBA"], popular: true },
  { id: "contrast-checker", category: "color", icon: "AA", name: "コントラスト比チェック", description: "文字色と背景色のWCAGコントラスト比、AA/AAA判定、サンプル表示を確認します。", tags: ["WCAG", "アクセシビリティ", "コントラスト"] },
  { id: "palette-generator", category: "color", icon: "▦", name: "カラーパレット生成", description: "ベースカラーから配色を生成し、PNG画像として保存できます。", tags: ["配色", "パレット", "画像化", "デザイン"] },
  { id: "json-formatter", category: "developer", icon: "{ }", name: "JSONフォーマッター", description: "JSONを整形、圧縮、検証し、構文エラー位置と行番号を確認できます。", tags: ["JSON", "整形", "minify"], popular: true },
  { id: "regex-tester", category: "developer", icon: ".*", name: "正規表現テスター", description: "正規表現のマッチ、キャプチャ、置換結果をリアルタイムで確認できます。", tags: ["Regex", "正規表現", "match", "replace"] },
  { id: "css-minifier", category: "developer", icon: "CSS", name: "CSS圧縮", description: "CSSのコメント、余分な空白、改行を取り除いて軽量化します。", tags: ["CSS", "minify", "圧縮"] },
  { id: "html-minifier", category: "developer", icon: "HTML", name: "HTML圧縮", description: "HTMLのコメントと不要な空白を、preやtextareaを保護しながら減らします。", tags: ["HTML", "minify", "圧縮"] },
  { id: "timestamp-converter", category: "developer", icon: "時", name: "Unixタイムスタンプ変換", description: "Unix秒・ミリ秒と日時を相互変換し、UTC/JST/ISO表示も確認できます。", tags: ["Unix", "timestamp", "日時"] },
  { id: "svg-optimizer", category: "developer", icon: "SVG", name: "SVG最適化・プレビュー", description: "SVGの不要なコメントや空白を減らし、プレビューとサイズ削減率を確認できます。", tags: ["SVG", "最適化", "プレビュー"] },
  { id: "cron-helper", category: "developer", icon: "CRON", name: "Cron式ヘルパー", description: "Cron式の説明と直近の実行予定を簡易確認できます。", tags: ["Cron", "スケジュール", "日時"] },
  { id: "css-clamp", category: "developer", icon: "clamp", name: "CSS clamp計算", description: "最小/最大サイズと画面幅からレスポンシブなclamp()を生成します。", tags: ["CSS", "clamp", "レスポンシブ"] },
  { id: "og-preview", category: "developer", icon: "OG", name: "OG/metaタグプレビュー", description: "タイトル、説明、画像URLからSNSカード風の見え方とmetaタグを作ります。", tags: ["OGP", "meta", "SEO"] },
  { id: "unit-length", category: "converter", icon: "m", name: "長さの単位変換", description: "mm、cm、m、km、inch、feet、yard、mileを相互変換します。", tags: ["長さ", "メートル", "インチ"] },
  { id: "unit-weight", category: "converter", icon: "kg", name: "重さの単位変換", description: "mg、g、kg、t、oz、lb、caratを相互変換します。", tags: ["重さ", "kg", "lb"] },
  { id: "unit-temperature", category: "converter", icon: "℃", name: "温度変換", description: "摂氏、華氏、ケルビンをリアルタイムに相互変換します。", tags: ["摂氏", "華氏", "ケルビン"] },
  { id: "unit-data", category: "converter", icon: "GB", name: "データ容量変換", description: "bit、Byte、KB、MB、GB、TBを1000/1024基準で相互変換します。", tags: ["容量", "Byte", "GB", "KiB"] },
  { id: "number-base", category: "converter", icon: "2/16", name: "進数変換", description: "2進数、8進数、10進数、16進数を同時に変換し、接頭辞や負数にも対応します。", tags: ["2進数", "16進数", "基数"] },
  { id: "date-calculator", category: "converter", icon: "日", name: "日付差分・営業日計算", description: "2つの日付の差分、加算日、土日を除いた営業日数を計算します。", tags: ["日付", "営業日", "差分"] },
  { id: "qr-code", category: "generator", icon: "QR", name: "QRコード生成", description: "URL、メール、電話、Wi-FiなどからQRコードを生成し、PNGとして保存できます。", tags: ["QRコード", "URL", "WiFi", "生成"], external: ["qrcode"], popular: true },
  { id: "password", category: "generator", icon: "鍵", name: "パスワード生成", description: "crypto.getRandomValuesで強いパスワードを生成し、強度や曖昧文字除外も確認できます。", tags: ["パスワード", "ランダム", "セキュリティ"] },
  { id: "uuid", category: "generator", icon: "ID", name: "UUID生成", description: "UUID v4を複数件生成し、引用符やカンマ付きでも出力できます。", tags: ["UUID", "v4", "randomUUID"] },
  { id: "random-number", category: "generator", icon: "乱", name: "乱数生成", description: "範囲、件数、整数・小数、重複可否を指定して安全に乱数を生成します。", tags: ["乱数", "ランダム", "抽選"] },
  { id: "placeholder-image", category: "generator", icon: "□＋", name: "プレースホルダー画像生成", description: "指定サイズ、背景色、文字入りの仮画像をCanvasで生成します。", tags: ["画像", "プレースホルダー", "Canvas"] },
  { id: "image-resize", category: "image", icon: "拡縮", name: "画像リサイズ・変換", description: "画像を読み込み、比率固定や品質指定でPNG/JPEG/WebPへ変換保存できます。", tags: ["画像", "リサイズ", "WebP", "Canvas"] },
  { id: "image-compress", category: "image", icon: "圧縮", name: "画像圧縮・WebP変換", description: "JPEG/WebP品質を調整して画像容量を軽くし、変換後サイズを確認できます。", tags: ["画像", "圧縮", "WebP"] },
  { id: "color-picker-image", category: "image", icon: "滴", name: "画像からカラー抽出", description: "画像を読み込んでクリックしたピクセルのHEX/RGB値を抽出し、履歴に保存します。", tags: ["画像", "色抽出", "スポイト"] }
].map((tool) => ({
  ...tool,
  url: `tools/${tool.category}/${tool.id}.html`,
  icon: tool.icon || categories.find((category) => category.id === tool.category).icon
}));

const byCategory = Object.fromEntries(categories.map((category) => [category.id, tools.filter((tool) => tool.category === category.id)]));

function ensureDir(dir) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function write(file, content) {
  const output = path.join(root, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, content.trimStart(), "utf8");
}

function relPrefix(tool) {
  return tool ? "../../" : "";
}

function head({ title, description, canonical, prefix = "", extraScripts = [] }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${siteUrl}/assets/img/tool-constellation.svg">
  <link rel="icon" href="${prefix}assets/img/favicon.svg?v=orange-sugu" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}assets/css/base.css">
  <link rel="stylesheet" href="${prefix}assets/css/layout.css">
  <link rel="stylesheet" href="${prefix}assets/css/card.css">
  <link rel="stylesheet" href="${prefix}assets/css/tool.css">
  <link rel="stylesheet" href="${prefix}assets/css/ads.css">
  ${extraScripts.join("\n  ")}
</head>`;
}

function header(prefix = "") {
  return `<header class="site-header">
  <a class="brand" href="${prefix}index.html" aria-label="すぐツール ホーム">
    <span class="brand-mark" aria-hidden="true"><span class="kana-su">す</span><span class="kana-gu">ぐ</span></span>
    <span class="brand-copy"><span class="brand-text">すぐツール</span><span class="brand-tagline">検索してすぐ使う</span></span>
  </a>
  <nav class="nav" aria-label="カテゴリ">
    ${categories.map((category) => `<a href="${prefix}index.html#${category.id}">${category.name}</a>`).join("")}
  </nav>
</header>`;
}

function footer(prefix = "") {
  return `<footer class="site-footer">
  <p>無料で使える静的WEBツール集。ブラウザ内で処理し、入力内容をサーバーへ送信しません。</p>
  <nav aria-label="フッター">
    <a href="${prefix}index.html">トップ</a>
    <a href="${prefix}robots.txt">robots.txt</a>
    <a href="${prefix}sitemap.xml">sitemap</a>
  </nav>
</footer>`;
}

function ad(slot, label = "広告") {
  return `<div class="ad-container" aria-label="${label}">
  <span>${label}スペース</span>
  <!-- AdSense承認後に ins.adsbygoogle を配置 -->
</div>`;
}

function schemaForHome() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "すぐツール",
    url: siteUrl + "/",
    description: "文字数カウント、Base64変換、QRコード生成、カラー変換などの無料オンラインツール集。",
    hasPart: tools.map((tool, index) => ({
      "@type": "WebApplication",
      position: index + 1,
      name: tool.name,
      url: `${siteUrl}/${tool.url}`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web"
    }))
  }, null, 2);
}

function schemaForTool(tool) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${siteUrl}/${tool.url}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" }
  }, null, 2);
}

function indexPage() {
  const title = `すぐツール | ${tools.length}種類の無料オンライン便利ツール`;
  const description = `文字数カウント、Base64変換、QRコード生成、カラー変換など${tools.length}種類の無料オンラインツールをブラウザだけで使えます。`;
  return `${head({ title, description, canonical: siteUrl + "/", prefix: "" })}
<body>
${header("")}
<main class="palette-page">
  <section class="command-hub" aria-label="ツール検索">
    <div class="command-heading">
      <p class="eyebrow">Command Palette Hub</p>
      <h1>何をしますか？</h1>
      <p>ツール名、目的、形式を入力して、必要な道具にすぐ移動できます。</p>
    </div>
    <div class="command-search">
      <label for="search-tools">ツールを検索</label>
      <input id="search-tools" type="search" placeholder="例: JSON、画像圧縮、文字数、Base64" autocomplete="off" autofocus>
      <div class="command-hints">
        <span><kbd>Ctrl</kbd><kbd>K</kbd>で検索</span>
        <span>カテゴリやタグでも絞り込み</span>
      </div>
    </div>
  </section>
  <div class="quick-search-dock" id="quick-search-dock" aria-label="固定検索">
    <label for="sticky-search-tools">検索</label>
    <input id="sticky-search-tools" type="search" placeholder="ツールを検索">
    <span><kbd>Ctrl</kbd><kbd>K</kbd></span>
  </div>
  <section class="palette-workspace">
    <aside class="category-rail" aria-label="カテゴリ">
      <button class="active" data-filter="all"><span>すべて</span><strong>${tools.length}</strong></button>
      <button data-filter="favorites"><span>お気に入り</span><strong id="favorite-count">0</strong></button>
      <button data-filter="recent"><span>最近使った</span><strong id="recent-count">0</strong></button>
      ${categories.map((category) => `<button data-filter="${category.id}"><span>${category.name}</span><strong>${byCategory[category.id].length}</strong></button>`).join("")}
    </aside>
    <section class="command-results">
      <div class="result-header">
        <div>
          <h2>ツール一覧</h2>
          <p>検索してEnter、または行を選択して開きます。</p>
        </div>
        <span id="result-count">${tools.length} tools</span>
      </div>
      ${ad("ad-home-mid", "トップページ広告")}
      <section class="tool-directory" id="tool-directory" aria-label="ツール一覧"></section>
    </section>
  </section>
  <button class="mobile-search-button" id="mobile-search-button" type="button" aria-label="検索を開く">検索</button>
</main>
${footer("")}
<script src="assets/js/tool-registry.js"></script>
<script src="assets/js/common.js"></script>
<script>
  initHome();
</script>
<script type="application/ld+json">${schemaForHome()}</script>
</body>
</html>`;
}

function toolPage(tool) {
  const prefix = relPrefix(tool);
  const category = categories.find((item) => item.id === tool.category);
  const related = tools.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 3);
  const title = `${tool.name} | 無料オンライン | すぐツール`;
  const description = `${tool.name}を無料でオンライン利用。${tool.description}登録不要でブラウザからすぐに使えます。`;
  const external = [];
  if (tool.external?.includes("marked")) external.push(`<script async src="https://cdn.jsdelivr.net/npm/marked@9.0.0/marked.min.js"></script>`);
  if (tool.external?.includes("qrcode")) external.push(`<script async src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>`);
  if (tool.external?.includes("iro")) external.push(`<script async src="https://cdn.jsdelivr.net/npm/@jaames/iro@5.5.2/dist/iro.min.js"></script>`);
  return `${head({ title, description, canonical: `${siteUrl}/${tool.url}`, prefix, extraScripts: external })}
<body data-tool-id="${tool.id}">
${header(prefix)}
<main class="tool-page">
  <nav class="breadcrumb" aria-label="パンくず">
    <a href="${prefix}index.html">トップ</a>
    <span>${category.name}</span>
    <span>${tool.name}</span>
  </nav>
  <section class="tool-heading">
    <div>
      <span class="tool-kicker">${category.name}</span>
      <h1>${tool.name}</h1>
      <p>${tool.description}</p>
    </div>
    <div class="tool-heading-actions">
      <button class="btn-secondary favorite-toggle" type="button" data-favorite-id="${tool.id}" aria-pressed="false"><span>☆</span> お気に入り</button>
      <a class="btn-secondary" href="${prefix}index.html#${category.id}">同カテゴリへ戻る</a>
    </div>
  </section>
  ${ad("ad-tool-top", "ツール上部広告")}
  <section class="tool-shell" id="tool-root" aria-label="${tool.name}"></section>
  ${ad("ad-tool-bottom", "ツール下部広告")}
  <section class="related-section">
    <div class="section-heading">
      <h2>関連ツール</h2>
      <span>${category.name}</span>
    </div>
    <div class="tool-list compact">
      ${related.map((item) => `<div class="tool-row" data-tool-id="${item.id}" data-category="${item.category}">
        <button class="favorite-star" type="button" data-favorite-id="${item.id}" aria-pressed="false">☆</button>
        <a class="row-link" href="../${item.category}/${item.id}.html">
          <span class="row-icon" style="--accent:${category.color}">${item.icon}</span>
          <span class="row-main"><span class="row-title">${item.name}</span><span class="row-desc">${item.description}</span></span>
          <span class="row-meta">${category.name}</span>
          <span class="row-arrow">→</span>
        </a>
      </div>`).join("")}
    </div>
  </section>
</main>
${footer(prefix)}
<script src="${prefix}assets/js/tool-registry.js"></script>
<script src="${prefix}assets/js/common.js"></script>
<script src="${prefix}assets/js/tools.js"></script>
<script>initToolChrome("${tool.id}"); initToolPage("${tool.id}");</script>
<script type="application/ld+json">${schemaForTool(tool)}</script>
</body>
</html>`;
}

function wordCountAliasPage() {
  const prefix = "../../";
  return `${head({ title: "単語数・行数カウントは統合されました | WEBツール集", description: "単語数・行数カウントは文字数・単語数カウントに統合されました。旧URLから統合版へ移動できます。", canonical: `${siteUrl}/tools/text/character-count.html`, prefix })}
<body>
${header(prefix)}
<main class="tool-page">
  <nav class="breadcrumb" aria-label="パンくず"><a href="${prefix}index.html">トップ</a><span>テキスト</span><span>統合のお知らせ</span></nav>
  <section class="tool-heading"><div><span class="tool-kicker">統合済み</span><h1>単語数・行数カウントは統合されました</h1><p>この機能は「文字数・単語数カウント」に統合しました。旧リンクを壊さないため、この案内ページを残しています。</p></div></section>
  <section class="tool-shell"><div class="result-panel"><a class="btn-primary" href="character-count.html">統合版を開く</a></div></section>
</main>
${footer(prefix)}
</body>
</html>`;
}

const baseCss = `
:root {
  color-scheme: light;
  --bg: #eef1e8;
  --surface: #fbfbf5;
  --surface-2: #dfe7da;
  --surface-3: #cbd8c3;
  --text: #202522;
  --muted: #667063;
  --line: #cbd4c5;
  --brand: #557b65;
  --brand-2: #496f72;
  --accent: #b88942;
  --danger: #dc2626;
  --ok: #057a55;
  --warn: #b45309;
  --radius: 5px;
  --shadow: 0 1px 2px rgba(36, 38, 41, 0.08);
  --font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
html { min-width: 320px; background: var(--bg); }
body { margin: 0; color: var(--text); font-family: var(--font); letter-spacing: 0; line-height: 1.65; }
h1, h2, h3, p, li, a, button, label, span { overflow-wrap: anywhere; }
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }
img { max-width: 100%; height: auto; }
main { width: min(1160px, calc(100% - 32px)); margin: 0 auto; }
.eyebrow, .tool-kicker { color: var(--accent); font-size: 0.78rem; font-weight: 800; letter-spacing: 0; text-transform: uppercase; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 0 16px; }
.section-heading h2 { margin: 0; font-size: 1.2rem; }
.section-heading span { color: var(--muted); font-size: 0.9rem; }
.toast { position: fixed; right: 18px; bottom: 18px; z-index: 50; max-width: min(360px, calc(100% - 36px)); padding: 12px 14px; border-radius: var(--radius); color: #fff; background: #172033; box-shadow: var(--shadow); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
`;

const layoutCss = `
.site-header { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 58px; padding: 10px max(20px, calc((100vw - 1160px) / 2)); border-bottom: 1px solid var(--line); background: #f4f6ee; }
.brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 900; color: var(--text); }
.brand-mark { position: relative; display: block; flex: 0 0 auto; width: 40px; height: 40px; border: 1px solid #8f6421; border-radius: 8px; color: #202522; background: #d99b36; box-shadow: inset 0 -1px 0 rgba(0,0,0,.14), 0 1px 1px rgba(32,37,34,.08); line-height: 1; overflow: hidden; }
.brand-mark::after { content: ""; position: absolute; inset: 3px; border: 1px solid rgba(255, 244, 218, .42); border-radius: 6px; pointer-events: none; }
.brand-mark .kana-su { position: absolute; left: 50%; top: calc(48% + 4px); z-index: 1; transform: translate(-50%, -50%); font-family: Meiryo, "Yu Gothic UI", "Yu Gothic", system-ui, sans-serif; font-size: 1.78rem; font-weight: 950; line-height: 1; letter-spacing: 0; }
.brand-mark .kana-gu { position: absolute; right: 5px; bottom: 5px; z-index: 1; font-family: Meiryo, "Yu Gothic UI", "Yu Gothic", system-ui, sans-serif; font-size: .52rem; font-weight: 900; line-height: 1; letter-spacing: 0; }
.brand-copy { display: grid; gap: 0; }
.brand-text { white-space: nowrap; font-size: 1.05rem; line-height: 1.2; }
.brand-tagline { color: var(--muted); font-size: 0.7rem; font-weight: 700; line-height: 1.2; white-space: nowrap; }
.nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 2px; }
.nav a { padding: 6px 8px; border-radius: 4px; color: var(--muted); font-size: 0.88rem; }
.nav a:hover { color: var(--text); background: var(--surface-2); }
.palette-page { padding-bottom: 92px; }
.command-hub { display: grid; grid-template-columns: minmax(220px, 0.7fr) minmax(360px, 1.3fr); gap: 28px; align-items: center; max-width: 100%; margin-top: 22px; padding: 26px; border: 1px solid #334239; border-radius: var(--radius); color: #f4f2e8; background: #1f2923; }
.command-heading h1 { margin: 4px 0 8px; font-size: clamp(1.9rem, 4vw, 3rem); line-height: 1.12; }
.command-heading p { max-width: 520px; margin: 0; color: #c7c0b5; }
.command-search { display: grid; gap: 8px; }
.command-search label { font-size: 0.82rem; color: #d6cfc4; font-weight: 800; }
.command-search input { width: 100%; min-height: 52px; padding: 12px 14px; border: 1px solid #70806f; border-radius: 4px; color: #f8f4ec; background: #263129; outline: none; }
.command-search input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(189, 122, 42, 0.25); }
.command-hints { display: flex; flex-wrap: wrap; gap: 10px; color: #aaa299; font-size: 0.82rem; }
kbd { display: inline-grid; place-items: center; min-width: 20px; min-height: 20px; margin-right: 3px; padding: 0 5px; border: 1px solid #80786e; border-radius: 3px; color: #f8f4ec; background: #17191b; font-size: 0.75rem; }
.quick-search-dock { position: fixed; top: 66px; left: max(16px, calc((100vw - 1160px) / 2)); right: max(16px, calc((100vw - 1160px) / 2)); z-index: 30; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: center; min-height: 54px; padding: 8px 12px; border: 1px solid #334239; border-radius: var(--radius); color: #f4f2e8; background: rgba(31, 41, 35, .97); box-shadow: var(--shadow); transform: translateY(-12px); opacity: 0; pointer-events: none; transition: opacity .16s ease, transform .16s ease; }
body.search-docked .quick-search-dock, .quick-search-dock:focus-within { transform: translateY(0); opacity: 1; pointer-events: auto; }
.quick-search-dock label { color: #d6cfc4; font-size: .82rem; font-weight: 850; }
.quick-search-dock input { width: 100%; min-height: 38px; padding: 8px 10px; border: 1px solid #70806f; border-radius: 4px; color: #f8f4ec; background: #263129; outline: none; }
.command-hub.is-commanding { border-color: #d49a3a; box-shadow: 0 0 0 2px rgba(189, 122, 42, .24); }
.mobile-search-button { display: none; }
.palette-workspace { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 18px; align-items: start; margin-top: 18px; }
.category-rail { position: sticky; top: 76px; display: grid; gap: 4px; padding: 10px; border: 1px solid var(--line); border-radius: var(--radius); background: #e4ebdc; }
.category-rail button { display: flex; justify-content: space-between; gap: 12px; width: 100%; min-height: 36px; padding: 8px 9px; border: 1px solid transparent; border-radius: 4px; color: var(--muted); background: transparent; text-align: left; }
.category-rail button:hover, .category-rail button.active { border-color: #b9c5b2; color: var(--text); background: var(--surface); }
.category-rail strong { color: var(--accent); font-size: 0.78rem; }
.command-results { min-width: 0; }
.result-header { display: flex; align-items: end; justify-content: space-between; gap: 14px; margin-bottom: 12px; }
.result-header h2 { margin: 0; font-size: 1.2rem; }
.result-header p { margin: 2px 0 0; color: var(--muted); font-size: 0.9rem; }
#result-count { color: var(--muted); font-size: 0.88rem; white-space: nowrap; }
.tool-directory { display: grid; gap: 18px; padding: 8px 0 0; }
.category-section { scroll-margin-top: 88px; }
.tool-page { padding: 20px 0 48px; }
.breadcrumb { display: flex; flex-wrap: wrap; gap: 8px; color: var(--muted); font-size: 0.9rem; }
.breadcrumb > * + *::before { content: "/"; margin-right: 8px; color: #9a9388; }
.tool-heading { display: flex; justify-content: space-between; gap: 24px; align-items: end; padding: 18px 0 8px; border-bottom: 1px solid var(--line); }
.tool-heading h1 { margin: 4px 0 8px; font-size: clamp(1.7rem, 4vw, 2.45rem); line-height: 1.12; }
.tool-heading p { max-width: 760px; margin: 0; color: var(--muted); }
.tool-heading-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.related-section { margin-top: 24px; padding-top: 22px; border-top: 1px solid var(--line); }
.use-cases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0; list-style: none; }
.use-cases li { min-height: 64px; padding: 14px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); }
.site-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px max(20px, calc((100vw - 1160px) / 2)); border-top: 1px solid var(--line); color: var(--muted); background: #e4ebdc; }
.site-footer p { margin: 0; }
.site-footer nav { display: flex; gap: 14px; }
@media (max-width: 880px) {
  main { width: min(100% - 24px, 1160px); }
  .site-header { position: static; align-items: flex-start; flex-direction: column; }
  .nav { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); width: 100%; justify-content: flex-start; gap: 2px 8px; overflow: visible; padding-bottom: 2px; }
  .nav a { min-width: 0; padding: 4px 0; font-size: 0.84rem; }
  .command-hub { grid-template-columns: 1fr; gap: 18px; margin-top: 14px; padding: 18px; }
  .quick-search-dock { top: 10px; left: 12px; right: 12px; }
  .palette-workspace { grid-template-columns: 1fr; }
  .category-rail { position: static; display: flex; flex-wrap: wrap; overflow: visible; }
  .category-rail button { flex: 1 1 106px; width: auto; min-width: 0; }
  .result-header { align-items: flex-start; flex-direction: column; }
  .tool-heading { align-items: flex-start; flex-direction: column; }
  .use-cases { grid-template-columns: 1fr; }
  .site-footer { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 680px) {
  .site-header { padding: 10px 12px; }
  .command-hub { padding: 16px; overflow: hidden; }
  .command-search input { min-width: 0; min-height: 48px; }
  .category-rail { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .category-rail button { width: 100%; }
  .mobile-search-button { position: fixed; left: 14px; right: 14px; bottom: 14px; z-index: 40; display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 14px; border: 1px solid #916729; border-radius: 6px; color: #202522; background: #d49a3a; font-weight: 900; box-shadow: var(--shadow); }
}
`;

const cardCss = `
.tool-group { display: grid; gap: 8px; }
.tool-list { display: grid; gap: 6px; }
.tool-list.compact { gap: 8px; }
.tool-row { display: grid; grid-template-columns: 32px 44px minmax(0, 1fr) auto 22px; gap: 10px; align-items: center; min-height: 56px; padding: 9px 10px; border: 1px solid var(--line); border-radius: var(--radius); background: rgba(255, 253, 248, 0.72); transition: border-color .14s ease, background .14s ease; }
.tool-row:hover, .tool-row:focus-within, .tool-row.is-selected { border-color: #aebba6; background: var(--surface); outline: none; }
.tool-row.is-compact { background: #f7f4ee; }
.row-link { display: contents; color: inherit; text-decoration: none; }
.favorite-star { display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 1px solid transparent; border-radius: 4px; color: #8a6f45; background: transparent; font-size: 1rem; line-height: 1; }
.favorite-star:hover, .favorite-star[aria-pressed="true"], .favorite-toggle[aria-pressed="true"] { border-color: #d3ba8e; color: #202522; background: #f6e7c8; }
.row-icon { display: grid; place-items: center; width: 38px; height: 28px; border-radius: 4px; color: #fff; background: var(--accent, var(--brand)); font-size: 0.72rem; font-weight: 900; }
.row-main { min-width: 0; }
.row-title { display: block; font-weight: 850; line-height: 1.3; }
.row-desc { display: block; color: var(--muted); font-size: 0.84rem; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-meta { justify-self: end; padding: 2px 6px; border: 1px solid #d2c8ba; border-radius: 3px; color: var(--muted); background: #f2eee7; font-size: 0.74rem; white-space: nowrap; }
.row-arrow { color: var(--accent); font-weight: 900; }
@media (max-width: 680px) {
  .tool-row { grid-template-columns: 30px 42px minmax(0, 1fr) 18px; min-height: 58px; }
  .row-meta { display: none; }
  .row-desc { white-space: normal; }
}
`;

const toolCss = `
.tool-shell { display: grid; gap: 16px; margin-top: 16px; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); box-shadow: none; }
.tool-panel { display: grid; gap: 14px; }
.tool-columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.tool-input-area, .tool-output-area, .control-group, .result-panel { display: grid; gap: 8px; min-width: 0; }
.input-header, .output-header, .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.input-label, .output-label, .control-label { font-weight: 850; }
.tool-textarea, .tool-input, .tool-select { width: 100%; border: 1px solid var(--line); border-radius: var(--radius); background: #fbfbf5; color: var(--text); }
.tool-textarea { min-height: 220px; resize: vertical; padding: 12px; line-height: 1.55; }
.tool-input, .tool-select { min-height: 42px; padding: 9px 10px; }
.output-readonly { background: #eef4e9; }
.tool-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn-primary, .btn-secondary, .btn-icon, .btn-danger { min-height: 40px; padding: 8px 12px; border: 1px solid transparent; border-radius: 6px; font-weight: 800; }
.btn-primary { color: #fff; background: #2f776f; }
.btn-secondary, .btn-icon { border-color: var(--line); color: var(--text); background: #fbfbf5; }
.btn-danger { color: #fff; background: var(--danger); }
.btn-primary:hover, .btn-secondary:hover, .btn-icon:hover { filter: brightness(0.96); }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.stat-card { min-height: 92px; padding: 14px; border: 1px solid var(--line); border-radius: var(--radius); background: #eff4ea; }
.stat-num { display: block; font-size: 1.55rem; font-weight: 950; line-height: 1.2; overflow-wrap: anywhere; }
.stat-label { display: block; color: var(--muted); font-size: 0.84rem; }
.result-panel { min-height: 120px; padding: 14px; border: 1px solid var(--line); border-radius: var(--radius); background: #eff4ea; overflow: auto; }
.tool-note { margin: 0; color: var(--muted); font-size: 0.88rem; }
.mini-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.mini-table th, .mini-table td { padding: 8px; border-bottom: 1px solid var(--line); text-align: left; }
.og-card { display: grid; gap: 8px; max-width: 520px; }
.og-thumb { min-height: 120px; border: 1px solid var(--line); background: #dfe7da; overflow: hidden; }
.og-thumb img { width: 100%; height: 180px; object-fit: cover; display: block; }
.preview-box svg { max-width: 100%; height: auto; }
.result-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.diff-line { padding: 6px 8px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; }
.diff-added { background: #dcfce7; }
.diff-removed { background: #fee2e2; }
.diff-same { background: #f1f5f9; color: var(--muted); }
.preview-box { min-height: 260px; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius); background: #fbfbf5; overflow: auto; }
.color-swatch { width: 100%; min-height: 92px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--swatch, #0f766e); }
.palette { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.palette button { min-height: 92px; border: 1px solid var(--line); border-radius: var(--radius); color: #fff; font-weight: 900; text-shadow: 0 1px 2px rgba(0,0,0,.5); }
.drop-zone { display: grid; place-items: center; min-height: 150px; padding: 18px; border: 2px dashed #b8c4ad; border-radius: var(--radius); color: var(--muted); background: #eff4ea; text-align: center; }
.canvas-wrap { display: grid; place-items: center; min-height: 220px; border: 1px solid var(--line); border-radius: var(--radius); background: #eff4ea; overflow: auto; }
.canvas-wrap canvas { max-width: 100%; height: auto; }
.inline-controls { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.check-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; color: var(--muted); }
.check-row label { display: inline-flex; align-items: center; gap: 6px; }
@media (max-width: 820px) {
  .tool-shell { padding: 12px; }
  .tool-columns, .inline-controls { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .palette { grid-template-columns: repeat(2, 1fr); }
}
`;

const adsCss = `
.ad-container { display: grid; place-items: center; min-height: 90px; margin: 14px 0; border: 1px dashed #b8c4ad; border-radius: var(--radius); color: #6f796b; background: rgba(251,251,245,0.58); font-size: 0.86rem; }
.ad-container-square { min-height: 250px; }
`;

const registryJs = `
const CATEGORIES = ${JSON.stringify(categories, null, 2)};
const TOOL_REGISTRY = ${JSON.stringify(tools, null, 2)};
`;

const commonJs = `
const STORAGE_KEYS = {
  favorites: "sugu-tools:favorites",
  recent: "sugu-tools:recent"
};

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("コピーしました");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("コピーしました");
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  copyText(element ? (element.value ?? element.textContent) : "");
}

async function pasteFromClipboard(elementId) {
  try {
    const text = await navigator.clipboard.readText();
    const element = document.getElementById(elementId);
    if (element) {
      element.value = text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } catch {
    showToast("クリップボードを読めませんでした");
  }
}

function clearAll(root = document) {
  root.querySelectorAll("textarea, input[type=text], input[type=search], input[type=number]").forEach((field) => {
    if (!field.dataset.keep) field.value = "";
  });
  root.querySelectorAll("[data-output]").forEach((node) => { node.textContent = ""; });
  root.dispatchEvent(new Event("input", { bubbles: true }));
}

function swapInputOutput(inputId = "input-text", outputId = "output-text") {
  const input = document.getElementById(inputId);
  const output = document.getElementById(outputId);
  if (!input || !output) return;
  const next = output.value || output.textContent;
  output.value = input.value;
  input.value = next;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function readStoredList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredList(key, values) {
  localStorage.setItem(key, JSON.stringify([...new Set(values)].slice(0, 30)));
}

function getFavorites() {
  return readStoredList(STORAGE_KEYS.favorites);
}

function getRecentTools() {
  return readStoredList(STORAGE_KEYS.recent);
}

function getToolById(id) {
  return typeof TOOL_REGISTRY === "undefined" ? undefined : TOOL_REGISTRY.find((tool) => tool.id === id);
}

function getCategoryById(id) {
  return typeof CATEGORIES === "undefined" ? undefined : CATEGORIES.find((category) => category.id === id);
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  if (!id) return;
  const favorites = getFavorites();
  const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
  writeStoredList(STORAGE_KEYS.favorites, next);
  updateFavoriteButtons();
  updateStoredCounts();
  showToast(next.includes(id) ? "お気に入りに追加しました" : "お気に入りから外しました");
}

function trackToolUse(id) {
  if (!getToolById(id)) return;
  const recent = getRecentTools().filter((item) => item !== id);
  writeStoredList(STORAGE_KEYS.recent, [id, ...recent].slice(0, 12));
  updateStoredCounts();
}

function updateStoredCounts() {
  const favoriteCount = document.getElementById("favorite-count");
  const recentCount = document.getElementById("recent-count");
  if (favoriteCount) favoriteCount.textContent = String(getFavorites().filter(getToolById).length);
  if (recentCount) recentCount.textContent = String(getRecentTools().filter(getToolById).length);
}

function updateFavoriteButtons() {
  const favorites = getFavorites();
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    const active = favorites.includes(button.dataset.favoriteId);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    if (button.classList.contains("favorite-star")) {
      button.textContent = active ? "★" : "☆";
      button.setAttribute("aria-label", active ? "お気に入りから外す" : "お気に入りに追加");
      button.title = active ? "お気に入りから外す" : "お気に入りに追加";
    } else {
      const mark = button.querySelector("span");
      if (mark) mark.textContent = active ? "★" : "☆";
    }
  });
}

function bindFavoriteButtons(afterToggle) {
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    if (button.dataset.favoriteBound) return;
    button.dataset.favoriteBound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(button.dataset.favoriteId);
      if (typeof afterToggle === "function") afterToggle();
    });
  });
  updateFavoriteButtons();
}

function initToolChrome(id) {
  bindFavoriteButtons();
  trackToolUse(id);
}

function initHome() {
  const directory = document.getElementById("tool-directory");
  const search = document.getElementById("search-tools");
  const stickySearch = document.getElementById("sticky-search-tools");
  const mobileSearchButton = document.getElementById("mobile-search-button");
  const tabs = [...document.querySelectorAll("[data-filter]")];
  const resultCount = document.getElementById("result-count");
  const commandHub = document.querySelector(".command-hub");
  let active = "all";

  function localUrl(tool) {
    return tool.url;
  }

  function renderToolRow(tool, category, compact) {
    return '<div class="tool-row' + (compact ? " is-compact" : "") + '" data-tool-id="' + escapeHtml(tool.id) + '" data-category="' + escapeHtml(tool.category) + '" data-tags="' + escapeHtml(tool.tags.join(",")) + '" data-name="' + escapeHtml(tool.name) + '">' +
      '<button class="favorite-star" type="button" data-favorite-id="' + escapeHtml(tool.id) + '" aria-pressed="false">☆</button>' +
      '<a href="' + localUrl(tool) + '" class="row-link" data-track-tool="' + escapeHtml(tool.id) + '">' +
        '<span class="row-icon" style="--accent:' + category.color + '">' + escapeHtml(tool.icon) + '</span>' +
        '<span class="row-main"><span class="row-title">' + escapeHtml(tool.name) + '</span><span class="row-desc">' + escapeHtml(tool.description) + '</span></span>' +
        '<span class="row-meta">' + escapeHtml(category.name) + '</span>' +
        '<span class="row-arrow">→</span>' +
      '</a>' +
    '</div>';
  }

  function renderCollectionBlock(group, title, ids, emptyText) {
    const rows = ids.map(getToolById).filter(Boolean).map((tool) => {
      const category = getCategoryById(tool.category) || CATEGORIES[0];
      return renderToolRow(tool, category, true);
    });
    return '<section class="tool-group" data-group="' + group + '">' +
      '<div class="section-heading"><h2>' + escapeHtml(title) + '</h2><span>' + rows.length + ' tools</span></div>' +
      (rows.length ? '<div class="tool-list">' + rows.join("") + '</div>' : '<div class="result-panel tool-note">' + escapeHtml(emptyText) + '</div>') +
    '</section>';
  }

  function renderHomeDirectory() {
    if (!directory || typeof TOOL_REGISTRY === "undefined" || typeof CATEGORIES === "undefined") return;
    const favorites = getFavorites().filter(getToolById);
    const recent = getRecentTools().filter(getToolById);
    const popular = TOOL_REGISTRY.filter(function(tool) { return tool.popular; }).map((tool) => tool.id);
    const favoriteBlock = renderCollectionBlock("favorites", "お気に入り", favorites, "星を押すと、よく使うツールをここに固定できます。");
    const recentBlock = renderCollectionBlock("recent", "最近使った", recent, "ツールを開くと、ここに最近使った順で表示されます。");
    const popularBlock = renderCollectionBlock("popular", "よく使うツール", popular, "よく使うツールを準備中です。");
    const categoryBlocks = CATEGORIES.map(function(category) {
      const tools = TOOL_REGISTRY.filter((tool) => tool.category === category.id);
      return '<section class="tool-group category-section" id="' + category.id + '" data-group="' + category.id + '">' +
        '<div class="section-heading"><h2>' + escapeHtml(category.name) + '</h2><span>' + tools.length + ' tools</span></div>' +
        '<div class="tool-list">' + tools.map(function(tool) { return renderToolRow(tool, category, false); }).join("") + '</div>' +
      '</section>';
    }).join("");
    directory.innerHTML = favoriteBlock + recentBlock + popularBlock + categoryBlocks;
    bindFavoriteButtons(() => {
      renderHomeDirectory();
      filter();
    });
    document.querySelectorAll("[data-track-tool]").forEach((link) => {
      link.addEventListener("click", () => trackToolUse(link.dataset.trackTool));
    });
    updateStoredCounts();
  }

  function visibleRows() {
    return [...document.querySelectorAll(".tool-row")].filter((row) => row.style.display !== "none");
  }

  function updateSelection() {
    document.querySelectorAll(".tool-row.is-selected").forEach((row) => row.classList.remove("is-selected"));
    const first = visibleRows().find((row) => row.querySelector(".row-link"));
    if (first && (document.activeElement === search || document.activeElement === stickySearch)) first.classList.add("is-selected");
  }

  function filter() {
    const query = ((search && search.value) || "").trim().toLowerCase();
    let visibleUnique = new Set();
    document.querySelectorAll(".tool-row").forEach((row) => {
      const group = row.closest(".tool-group")?.dataset.group || "";
      const haystack = [row.dataset.name, row.dataset.tags, row.textContent].join(" ").toLowerCase();
      const groupMatch = active === "all" ? true : active === group || row.dataset.category === active;
      const match = groupMatch && haystack.includes(query);
      row.style.display = match ? "" : "none";
      if (match && (active === "favorites" || active === "recent" || !row.classList.contains("is-compact"))) visibleUnique.add(row.dataset.toolId);
    });
    document.querySelectorAll(".tool-group").forEach((group) => {
      const hasVisibleRows = [...group.querySelectorAll(".tool-row")].some((row) => row.style.display !== "none");
      const emptyPanel = group.querySelector(".result-panel");
      group.style.display = hasVisibleRows || (emptyPanel && (active === "all" || active === group.dataset.group)) ? "" : "none";
    });
    if (resultCount) resultCount.textContent = visibleUnique.size + " tools";
    updateSelection();
  }

  function syncSearch(source, target) {
    if (!source || !target) return;
    target.value = source.value;
  }

  renderHomeDirectory();
  filter();

  if (search) {
    search.addEventListener("input", () => {
      syncSearch(search, stickySearch);
      filter();
    });
    search.addEventListener("focus", () => {
      commandHub?.classList.add("is-commanding");
      updateSelection();
    });
    search.addEventListener("blur", () => setTimeout(() => commandHub?.classList.remove("is-commanding"), 140));
  }
  if (stickySearch) {
    stickySearch.addEventListener("input", () => {
      syncSearch(stickySearch, search);
      filter();
    });
    stickySearch.addEventListener("focus", updateSelection);
  }
  if (mobileSearchButton && search) {
    mobileSearchButton.addEventListener("click", () => {
      search.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => { search.focus(); search.select(); }, 220);
    });
  }
  window.addEventListener("scroll", () => {
    if (!commandHub) return;
    const threshold = commandHub.offsetTop + commandHub.offsetHeight - 32;
    document.body.classList.toggle("search-docked", window.scrollY > threshold);
  }, { passive: true });
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const target = document.body.classList.contains("search-docked") && stickySearch ? stickySearch : search;
      target?.focus();
      target?.select();
      commandHub?.classList.add("is-commanding");
      updateSelection();
    }
    if (event.key === "Enter" && (document.activeElement === search || document.activeElement === stickySearch)) {
      const firstVisible = visibleRows().find((row) => row.querySelector(".row-link"));
      const link = firstVisible?.querySelector(".row-link");
      if (link) link.click();
    }
  });
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    active = tab.dataset.filter;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    filter();
  }));
  if (location.hash) {
    const hash = location.hash.slice(1);
    const matched = tabs.find((tab) => tab.dataset.filter === hash);
    if (matched) matched.click();
  }
}
`;

const toolsJs = fs.readFileSync(path.join(root, "tools-source.js"), "utf8");

function assets() {
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="13" fill="#d99b36"/><rect x="7" y="7" width="50" height="50" rx="9" fill="none" stroke="#f8e2ae" stroke-opacity=".5" stroke-width="2"/><text x="32" y="47" text-anchor="middle" font-family="Meiryo,'Yu Gothic UI','Yu Gothic',sans-serif" font-size="40" font-weight="900" fill="#202522">す</text><text x="49" y="53" text-anchor="middle" font-family="Meiryo,'Yu Gothic UI','Yu Gothic',sans-serif" font-size="12" font-weight="900" fill="#202522">ぐ</text></svg>`;
  const constellation = `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="600" viewBox="0 0 920 600" role="img" aria-label="WEBツールカテゴリ図"><rect width="920" height="600" rx="18" fill="#ffffff"/><g fill="none" stroke="#d9e2ea" stroke-width="2">${categories.map((_, i) => `<path d="M460 300 L${160 + (i % 4) * 200} ${120 + Math.floor(i / 4) * 290}"/>`).join("")}</g><circle cx="460" cy="300" r="74" fill="#0f766e"/><text x="460" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#fff">WEB</text>${categories.map((cat, i) => { const x = 160 + (i % 4) * 200; const y = 120 + Math.floor(i / 4) * 290; return `<g><rect x="${x - 70}" y="${y - 42}" width="140" height="84" rx="8" fill="${cat.color}"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="800" fill="#fff">${cat.name}</text></g>`; }).join("")}</svg>`;
  write("assets/img/favicon.svg", favicon);
  write("assets/img/tool-constellation.svg", constellation);
}

function miscFiles() {
  write("robots.txt", `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`);
  write("_config.yml", `title: すぐツール
description: 検索してすぐ使える無料オンラインツール集
exclude:
  - build-site.js
`);
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc></url>
${tools.map((tool) => `  <url><loc>${siteUrl}/${tool.url}</loc></url>`).join("\n")}
</urlset>
`);
  write("README.md", `# すぐツール

ブラウザだけで動く静的な無料オンラインツール集です。GitHub Pagesにそのまま配置できます。

## 内容

- トップページ: ツール検索、カテゴリフィルタ、動的カード表示
- ツールページ: ${tools.length}種類
- 共通機能: コピー、貼り付け、保存、AdSenseプレースホルダー、構造化データ、sitemap

## GitHub Pages

1. この \`web-tools/\` ディレクトリをリポジトリルートとして公開します。
2. 独自ドメインがある場合は \`build-site.js\` の \`siteUrl\` を置き換えて再生成します。
3. AdSense承認後、\`assets/css/ads.css\` の枠に合わせて各HTML内の広告コメントを \`ins.adsbygoogle\` に差し替えます。

## ローカル確認

\`\`\`bash
python -m http.server 8768
\`\`\`

`);
}

function build() {
  ["assets/css", "assets/js", "assets/img", ...categories.map((category) => `tools/${category.id}`)].forEach(ensureDir);
  write("assets/css/base.css", baseCss);
  write("assets/css/layout.css", layoutCss);
  write("assets/css/card.css", cardCss);
  write("assets/css/tool.css", toolCss);
  write("assets/css/ads.css", adsCss);
  write("assets/js/tool-registry.js", registryJs);
  write("assets/js/common.js", commonJs);
  write("assets/js/tools.js", toolsJs);
  assets();
  write("index.html", indexPage());
  tools.forEach((tool) => write(tool.url, toolPage(tool)));
  write("tools/text/word-count.html", wordCountAliasPage());
  miscFiles();
}

build();
console.log(`Generated ${tools.length} tools in ${root}`);

