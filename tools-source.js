
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function field(id, label, value = "", type = "text") {
  return `<label class="control-group"><span class="control-label">${label}</span><input class="tool-input" id="${id}" type="${type}" value="${escapeHtml(value)}"></label>`;
}

function selectField(id, label, options, selected) {
  return `<label class="control-group"><span class="control-label">${label}</span><select class="tool-select" id="${id}">${options.map((item) => `<option value="${item.value}" ${item.value === selected ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>`;
}

function textareaBlock(id, label, placeholder = "", readonly = false) {
  return `<div class="${readonly ? "tool-output-area" : "tool-input-area"}">
    <div class="${readonly ? "output-header" : "input-header"}">
      <label for="${id}" class="${readonly ? "output-label" : "input-label"}">${label}</label>
      <div class="tool-actions">
        ${readonly ? `<button class="btn-icon" type="button" data-copy="${id}" title="コピー">コピー</button>` : `<button class="btn-icon" type="button" data-paste="${id}" title="貼り付け">貼り付け</button>`}
      </div>
    </div>
    <textarea id="${id}" class="tool-textarea ${readonly ? "output-readonly" : ""}" ${readonly ? "readonly" : ""} placeholder="${placeholder}"></textarea>
  </div>`;
}

function bindClipboard(root) {
  $$("[data-copy]", root).forEach((button) => button.addEventListener("click", () => copyToClipboard(button.dataset.copy)));
  $$("[data-paste]", root).forEach((button) => button.addEventListener("click", () => pasteFromClipboard(button.dataset.paste)));
}

function setOutput(id, value) {
  const output = document.getElementById(id);
  if (!output) return;
  if ("value" in output) output.value = value;
  else output.textContent = value;
}

function getInput(id) {
  const element = document.getElementById(id);
  return element ? element.value : "";
}

function textTool(root, transform, options = {}) {
  root.innerHTML = `<div class="tool-panel">
    <div class="tool-columns">${textareaBlock("input-text", options.inputLabel || "入力", options.placeholder || "テキストを入力してください")}${textareaBlock("output-text", "出力", "", true)}</div>
    <div class="tool-actions">
      <button class="btn-primary" id="run-tool" type="button">${options.button || "変換する"}</button>
      <button class="btn-secondary" id="swap-tool" type="button">入れ替え</button>
      <button class="btn-secondary" id="clear-tool" type="button">クリア</button>
      <button class="btn-secondary" id="download-tool" type="button">保存</button>
    </div>
  </div>`;
  const run = () => {
    Promise.resolve(transform(getInput("input-text"), root))
      .then((value) => setOutput("output-text", value ?? ""))
      .catch((error) => setOutput("output-text", `エラー:\n${error.message}`));
  };
  $("#input-text", root).addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  $("#swap-tool", root).addEventListener("click", () => swapInputOutput());
  $("#clear-tool", root).addEventListener("click", () => { $("#input-text", root).value = ""; $("#output-text", root).value = ""; });
  $("#download-tool", root).addEventListener("click", () => downloadText("web-tool-output.txt", getInput("output-text")));
  bindClipboard(root);
}

const toWords = (text) => text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
const toSentences = (text) => text.split(/[。.!?！？]+/).map((item) => item.trim()).filter(Boolean);

function initCharacterCount(root) {
  root.innerHTML = `<div class="tool-panel">
    ${textareaBlock("input-text", "入力", "文字数を数えたいテキストを入力してください")}
    <div class="stats-grid">
      ${["文字数","空白除外","UTF-8バイト","単語数","行数","段落数","原稿用紙","X投稿率"].map((label, index) => `<div class="stat-card"><span class="stat-num" id="stat-${index}">0</span><span class="stat-label">${label}</span></div>`).join("")}
    </div>
  </div>`;
  const update = () => {
    const text = getInput("input-text");
    const values = [
      text.length,
      text.replace(/\s/g, "").length,
      new TextEncoder().encode(text).length,
      toWords(text).length,
      text === "" ? 0 : text.split("\n").length,
      text.trim() ? text.trim().split(/\n\s*\n/).length : 0,
      Math.ceil(text.replace(/\s/g, "").length / 400),
      `${Math.min(100, Math.round((text.length / 280) * 100))}%`
    ];
    values.forEach((value, index) => $(`#stat-${index}`, root).textContent = value);
  };
  $("#input-text", root).addEventListener("input", update);
  bindClipboard(root);
  update();
}

function initCaseConverter(root) {
  textTool(root, (text) => {
    const mode = $("#case-mode", root).value;
    const words = text.trim().split(/[\s_-]+/).filter(Boolean);
    if (mode === "upper") return text.toUpperCase();
    if (mode === "lower") return text.toLowerCase();
    if (mode === "title") return text.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
    if (mode === "camel") return words.map((word, index) => index ? word[0]?.toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join("");
    if (mode === "snake") return words.map((word) => word.toLowerCase()).join("_");
    if (mode === "kebab") return words.map((word) => word.toLowerCase()).join("-");
    return text;
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("case-mode", "変換モード", [
    { value: "upper", label: "UPPERCASE" }, { value: "lower", label: "lowercase" }, { value: "title", label: "Title Case" },
    { value: "camel", label: "camelCase" }, { value: "snake", label: "snake_case" }, { value: "kebab", label: "kebab-case" }
  ], "upper"));
  $("#case-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function initTextDiff(root) {
  root.innerHTML = `<div class="tool-panel">
    <div class="tool-columns">${textareaBlock("left-text", "比較元", "元のテキスト")}${textareaBlock("right-text", "比較先", "変更後のテキスト")}</div>
    <div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">比較する</button><button class="btn-secondary" id="clear-tool" type="button">クリア</button></div>
    <div class="result-panel" id="diff-output" data-output></div>
  </div>`;
  const run = () => {
    const left = getInput("left-text").split("\n");
    const right = getInput("right-text").split("\n");
    const max = Math.max(left.length, right.length);
    $("#diff-output", root).innerHTML = Array.from({ length: max }, (_, index) => {
      if (left[index] === right[index]) return `<div class="diff-line diff-same">  ${escapeHtml(left[index] || "")}</div>`;
      return `${left[index] !== undefined ? `<div class="diff-line diff-removed">- ${escapeHtml(left[index])}</div>` : ""}${right[index] !== undefined ? `<div class="diff-line diff-added">+ ${escapeHtml(right[index])}</div>` : ""}`;
    }).join("");
  };
  ["left-text","right-text"].forEach((id) => $(`#${id}`, root).addEventListener("input", run));
  $("#run-tool", root).addEventListener("click", run);
  $("#clear-tool", root).addEventListener("click", () => { $("#left-text", root).value = ""; $("#right-text", root).value = ""; run(); });
  bindClipboard(root);
  run();
}

function initMarkdownPreview(root) {
  root.innerHTML = `<div class="tool-panel"><div class="tool-columns">${textareaBlock("input-text", "Markdown入力", "# 見出し\n\n- リスト\n- プレビュー") }<div class="tool-output-area"><div class="output-header"><span class="output-label">HTMLプレビュー</span><button class="btn-icon" id="copy-html" type="button">HTMLコピー</button></div><div class="preview-box" id="preview"></div></div></div></div>`;
  const render = () => {
    const source = getInput("input-text");
    $("#preview", root).innerHTML = window.marked ? marked.parse(source) : escapeHtml(source).replace(/\n/g, "<br>");
  };
  $("#input-text", root).addEventListener("input", render);
  $("#copy-html", root).addEventListener("click", () => copyText($("#preview", root).innerHTML));
  bindClipboard(root);
  $("#input-text", root).value = "# Markdownプレビュー\n\n**太字** やリストを確認できます。";
  render();
}

function initWordCount(root) {
  initCharacterCount(root);
}

function initLoremIpsum(root) {
  const ja = "これはデザイン確認や文章量の調整に使えるダミーテキストです。読みやすさと余白のバランスを確認しながら、実際のコンテンツに近い雰囲気でレイアウトを検証できます。";
  const en = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae sem at justo facilisis luctus.";
  root.innerHTML = `<div class="tool-panel">
    <div class="inline-controls">${selectField("lang", "言語", [{value:"ja",label:"日本語"},{value:"en",label:"English"}], "ja")}${field("paras", "段落数", "3", "number")}${field("repeat", "1段落の文数", "3", "number")}</div>
    ${textareaBlock("output-text", "生成結果", "", true)}
    <div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div>
  </div>`;
  const run = () => {
    const sentence = $("#lang", root).value === "ja" ? ja : en;
    const paras = Math.max(1, Math.min(20, Number($("#paras", root).value) || 1));
    const repeat = Math.max(1, Math.min(12, Number($("#repeat", root).value) || 1));
    setOutput("output-text", Array.from({ length: paras }, () => Array(repeat).fill(sentence).join($("#lang", root).value === "ja" ? "" : " ")).join("\n\n"));
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initBase64(root) {
  textTool(root, (text) => $("#base-mode", root).value === "encode" ? btoa(unescape(encodeURIComponent(text))) : decodeURIComponent(escape(atob(text.trim()))));
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", `${selectField("base-mode", "モード", [{value:"encode",label:"エンコード"},{value:"decode",label:"デコード"}], "encode")}<label class="drop-zone" id="drop-zone"><input type="file" id="file-input" class="sr-only">ファイルを選択またはドロップしてData URIへ変換</label>`);
  $("#base-mode", root).addEventListener("change", () => $("#run-tool", root).click());
  const convertFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => { $("#output-text", root).value = reader.result; };
    reader.readAsDataURL(file);
  };
  $("#file-input", root).addEventListener("change", (event) => event.target.files[0] && convertFile(event.target.files[0]));
  $("#drop-zone", root).addEventListener("dragover", (event) => { event.preventDefault(); });
  $("#drop-zone", root).addEventListener("drop", (event) => { event.preventDefault(); if (event.dataTransfer.files[0]) convertFile(event.dataTransfer.files[0]); });
}

function initUrlEncode(root) {
  textTool(root, (text) => $("#url-mode", root).value === "encode" ? encodeURIComponent(text) : decodeURIComponent(text));
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("url-mode", "モード", [{value:"encode",label:"エンコード"},{value:"decode",label:"デコード"}], "encode"));
  $("#url-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function initHtmlEntity(root) {
  textTool(root, (text) => {
    if ($("#html-mode", root).value === "encode") return escapeHtml(text);
    const doc = new DOMParser().parseFromString(text, "text/html");
    return doc.documentElement.textContent || "";
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("html-mode", "モード", [{value:"encode",label:"エンコード"},{value:"decode",label:"デコード"}], "encode"));
  $("#html-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function b64urlDecode(part) {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(base64)));
}

function initJwtDecoder(root) {
  textTool(root, (text) => {
    const parts = text.trim().split(".");
    if (parts.length < 2) return "JWTは header.payload.signature の形式で入力してください。";
    try {
      return JSON.stringify({ header: JSON.parse(b64urlDecode(parts[0])), payload: JSON.parse(b64urlDecode(parts[1])), signature: parts[2] || "" }, null, 2);
    } catch (error) {
      return `JWTデコードエラー:\n${error.message}`;
    }
  }, { button: "デコードする" });
}

async function digestText(text, algorithm) {
  const bytes = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function initHashGenerator(root) {
  textTool(root, async (text) => digestText(text, $("#hash-algo", root).value), { button: "生成する" });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("hash-algo", "アルゴリズム", ["SHA-1","SHA-256","SHA-512"].map((value) => ({ value, label: value })), "SHA-256"));
  $("#hash-algo", root).addEventListener("change", () => $("#run-tool", root).click());
}

function hexToRgb(hex) {
  const value = hex.replace("#", "").trim();
  const full = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((n) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, "0");
  }).join("");
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const [r,g,b] = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function initColorConverter(root) {
  root.innerHTML = `<div class="tool-panel">
    <div class="inline-controls">${field("hex", "HEX", "#0f766e")}${field("rgb", "RGB", "15, 118, 110")}${field("hsl", "HSL", "176, 77%, 26%")}</div>
    <div class="color-swatch" id="swatch"></div>
  </div>`;
  const updateFromRgb = (r, g, b) => {
    const hsl = rgbToHsl(r, g, b);
    $("#hex", root).value = rgbToHex(r, g, b);
    $("#rgb", root).value = `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
    $("#hsl", root).value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    $("#swatch", root).style.setProperty("--swatch", $("#hex", root).value);
  };
  $("#hex", root).addEventListener("input", () => { const rgb = hexToRgb($("#hex", root).value); if (rgb) updateFromRgb(rgb.r, rgb.g, rgb.b); });
  $("#rgb", root).addEventListener("input", () => { const [r,g,b] = $("#rgb", root).value.match(/\d+(\.\d+)?/g)?.map(Number) || []; if ([r,g,b].every((n) => Number.isFinite(n))) updateFromRgb(r,g,b); });
  $("#hsl", root).addEventListener("input", () => { const [h,s,l] = $("#hsl", root).value.match(/\d+(\.\d+)?/g)?.map(Number) || []; if ([h,s,l].every((n) => Number.isFinite(n))) { const rgb = hslToRgb(h,s,l); updateFromRgb(rgb.r,rgb.g,rgb.b); } });
}

function initColorPicker(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls"><label class="control-group"><span class="control-label">色を選択</span><input class="tool-input" id="picked" type="color" value="#0f766e"></label>${field("hex", "HEX", "#0f766e")}${field("rgb", "RGB", "")}${field("hsl", "HSL", "")}</div><div class="color-swatch" id="swatch"></div></div>`;
  const update = () => { const rgb = hexToRgb($("#picked", root).value); $("#hex", root).value = $("#picked", root).value; $("#rgb", root).value = `${rgb.r}, ${rgb.g}, ${rgb.b}`; const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b); $("#hsl", root).value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`; $("#swatch", root).style.setProperty("--swatch", $("#picked", root).value); };
  $("#picked", root).addEventListener("input", update);
  update();
}

function contrastRatio(a, b) {
  const lum = ({r,g,b}) => {
    const vals = [r,g,b].map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return vals[0] * .2126 + vals[1] * .7152 + vals[2] * .0722;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x,y) => y - x);
  return (l1 + .05) / (l2 + .05);
}
function initContrastChecker(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls"><label class="control-group"><span class="control-label">文字色</span><input class="tool-input" id="fg" type="color" value="#172033"></label><label class="control-group"><span class="control-label">背景色</span><input class="tool-input" id="bg" type="color" value="#ffffff"></label></div><div class="result-panel" id="contrast-result"></div></div>`;
  const update = () => {
    const ratio = contrastRatio(hexToRgb($("#fg", root).value), hexToRgb($("#bg", root).value));
    $("#contrast-result", root).style.color = $("#fg", root).value;
    $("#contrast-result", root).style.background = $("#bg", root).value;
    $("#contrast-result", root).innerHTML = `<strong>コントラスト比: ${ratio.toFixed(2)}:1</strong><br>通常文字 AA: ${ratio >= 4.5 ? "合格" : "不合格"} / AAA: ${ratio >= 7 ? "合格" : "不合格"}<br>大きな文字 AA: ${ratio >= 3 ? "合格" : "不合格"}`;
  };
  root.addEventListener("input", update);
  update();
}

function initPaletteGenerator(root) {
  root.innerHTML = `<div class="tool-panel"><label class="control-group"><span class="control-label">ベースカラー</span><input class="tool-input" id="base-color" type="color" value="#0f766e"></label><div class="palette" id="palette"></div></div>`;
  const update = () => {
    const base = hexToRgb($("#base-color", root).value);
    const hsl = rgbToHsl(base.r, base.g, base.b);
    const colors = [hsl.h, hsl.h + 30, hsl.h + 180, hsl.h + 120, hsl.h + 240].map((h) => { const rgb = hslToRgb((h + 360) % 360, hsl.s, hsl.l); return rgbToHex(rgb.r, rgb.g, rgb.b); });
    $("#palette", root).innerHTML = colors.map((color) => `<button style="background:${color}" type="button" data-color="${color}">${color}</button>`).join("");
    $$("[data-color]", root).forEach((button) => button.addEventListener("click", () => copyText(button.dataset.color)));
  };
  $("#base-color", root).addEventListener("input", update);
  update();
}

function initJsonFormatter(root) {
  textTool(root, (text) => {
    try { return $("#json-mode", root).value === "format" ? JSON.stringify(JSON.parse(text), null, 2) : JSON.stringify(JSON.parse(text)); }
    catch (error) { return `JSON構文エラー:\n${error.message}`; }
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("json-mode", "モード", [{value:"format",label:"整形"},{value:"minify",label:"圧縮"}], "format"));
  $("#json-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function initRegexTester(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("pattern", "正規表現", "\\\\w+")}${field("flags", "フラグ", "g")}</div>${textareaBlock("input-text", "テスト文字列", "abc 123 def") }<div class="result-panel" id="matches"></div></div>`;
  const run = () => {
    try {
      const regex = new RegExp($("#pattern", root).value, $("#flags", root).value);
      const matches = [...getInput("input-text").matchAll(regex)];
      $("#matches", root).innerHTML = matches.length ? `<ul class="result-list">${matches.map((m) => `<li><strong>${escapeHtml(m[0])}</strong> index ${m.index}</li>`).join("")}</ul>` : "一致なし";
    } catch (error) { $("#matches", root).textContent = error.message; }
  };
  root.addEventListener("input", run);
  bindClipboard(root);
  run();
}

function minifyCss(css) { return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,>+~])\s*/g, "$1").trim(); }
function minifyHtml(html) { return html.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim(); }

function initCssMinifier(root) { textTool(root, minifyCss, { button: "圧縮する" }); }
function initHtmlMinifier(root) { textTool(root, minifyHtml, { button: "圧縮する" }); }

function initTimestampConverter(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("timestamp", "Unix秒", Math.floor(Date.now()/1000), "number")}${field("datetime", "日時", new Date().toISOString().slice(0,16), "datetime-local")}</div><div class="tool-actions"><button class="btn-primary" id="now" type="button">現在時刻</button></div><div class="result-panel" id="time-result"></div></div>`;
  const fromTs = () => { const date = new Date(Number($("#timestamp", root).value) * 1000); $("#datetime", root).value = new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,16); $("#time-result", root).textContent = date.toString(); };
  const fromDate = () => { const date = new Date($("#datetime", root).value); $("#timestamp", root).value = Math.floor(date.getTime()/1000); $("#time-result", root).textContent = date.toString(); };
  $("#timestamp", root).addEventListener("input", fromTs);
  $("#datetime", root).addEventListener("input", fromDate);
  $("#now", root).addEventListener("click", () => { $("#timestamp", root).value = Math.floor(Date.now()/1000); fromTs(); });
  fromTs();
}

const unitTablesV2 = {
  "unit-length": { base: "m", units: { mm:.001, cm:.01, m:1, km:1000, inch:.0254, feet:.3048, yard:.9144, mile:1609.344 } },
  "unit-weight": { base: "g", units: { mg:.001, g:1, kg:1000, t:1000000, oz:28.349523125, lb:453.59237, carat:.2 } }
};
function initUnit(root, key) {
  const table = unitTablesV2[key];
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("amount", "値", "1", "number")}${selectField("unit", "入力単位", Object.keys(table.units).map((unit) => ({ value: unit, label: unit })), table.base)}${field("digits", "有効桁数", "10", "number")}</div><div class="stats-grid" id="unit-results"></div></div>`;
  const run = () => {
    const base = Number($("#amount", root).value) * table.units[$("#unit", root).value];
    const digits = clampNumber($("#digits", root).value, 2, 15, 10);
    $("#unit-results", root).innerHTML = Object.entries(table.units).map(([unit, factor]) => `<div class="stat-card"><span class="stat-num">${Number(base / factor).toLocaleString(undefined, { maximumSignificantDigits: digits })}</span><span class="stat-label">${unit}</span></div>`).join("");
  };
  root.addEventListener("input", run);
  run();
}
function initUnitData(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("amount", "値", "1", "number")}${selectField("unit", "入力単位", ["bit","Byte","KB","MB","GB","TB"].map((unit) => ({ value: unit, label: unit })), "MB")}${selectField("base", "基準", [{value:"1024",label:"1024 (KiB)"},{value:"1000",label:"1000 (KB)"}], "1024")}</div><div class="stats-grid" id="unit-results"></div></div>`;
  const run = () => {
    const baseN = Number($("#base", root).value);
    const units = { bit:1/8, Byte:1, KB:baseN, MB:baseN**2, GB:baseN**3, TB:baseN**4 };
    const bytes = Number($("#amount", root).value) * units[$("#unit", root).value];
    $("#unit-results", root).innerHTML = Object.entries(units).map(([unit, factor]) => `<div class="stat-card"><span class="stat-num">${Number(bytes / factor).toLocaleString(undefined, { maximumSignificantDigits: 10 })}</span><span class="stat-label">${unit}</span></div>`).join("");
  };
  root.addEventListener("input", run);
  run();
}
function initNumberBase(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("num", "値", "0xff")}${selectField("base", "入力進数", [{value:"auto",label:"自動判定"},2,8,10,16].map((n) => typeof n === "object" ? n : ({ value:String(n), label:`${n}進数` })), "auto")}</div><div class="stats-grid" id="base-results"></div></div>`;
  const run = () => {
    const raw = $("#num", root).value.trim().replace(/_/g, "");
    const base = $("#base", root).value === "auto" ? (raw.startsWith("0x") ? 16 : raw.startsWith("0b") ? 2 : raw.startsWith("0o") ? 8 : 10) : Number($("#base", root).value);
    const cleaned = raw.replace(/^[-+]?0[xbo]/i, raw.startsWith("-") ? "-" : "");
    const value = parseInt(cleaned, base);
    $("#base-results", root).innerHTML = Number.isNaN(value) ? "数値を確認してください。" : [2,8,10,16].map((b) => `<div class="stat-card"><span class="stat-num">${value.toString(b).toUpperCase()}</span><span class="stat-label">${b}進数</span></div>`).join("");
  };
  root.addEventListener("input", run);
  run();
}

function initQrCode(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${selectField("qr-type", "形式", [{value:"text",label:"テキスト/URL"},{value:"mail",label:"メール"},{value:"tel",label:"電話"},{value:"wifi",label:"Wi-Fi"}], "text")}${field("qr-size", "サイズ", "260", "number")}${field("qr-dark", "前景色", "#202522")}${field("qr-light", "背景色", "#ffffff")}${selectField("qr-ec", "誤り訂正", ["L","M","Q","H"].map(v => ({value:v,label:v})), "M")}</div>${textareaBlock("input-text", "内容", "https://example.com") }<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button><button class="btn-secondary" id="download-qr" type="button">PNG保存</button></div><div class="canvas-wrap"><canvas id="qr-canvas" width="260" height="260"></canvas></div><div class="result-panel" id="qr-status"></div></div>`;
  const payload = () => {
    const text = getInput("input-text");
    if ($("#qr-type", root).value === "mail") return `mailto:${text}`;
    if ($("#qr-type", root).value === "tel") return `tel:${text}`;
    if ($("#qr-type", root).value === "wifi") return `WIFI:T:WPA;S:${text.split(",")[0] || ""};P:${text.split(",")[1] || ""};;`;
    return text;
  };
  const run = () => {
    const canvas = $("#qr-canvas", root);
    const size = clampNumber($("#qr-size", root).value, 120, 1000, 260);
    canvas.width = size; canvas.height = size;
    if (!window.QRCode) { $("#qr-status", root).textContent = "QR生成ライブラリを読み込めませんでした。ネットワーク接続またはCDNを確認してください。"; return; }
    QRCode.toCanvas(canvas, payload(), { width: size, margin: 2, color: { dark: $("#qr-dark", root).value, light: $("#qr-light", root).value }, errorCorrectionLevel: $("#qr-ec", root).value }, (error) => { $("#qr-status", root).textContent = error ? error.message : "生成済み"; });
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  $("#download-qr", root).addEventListener("click", () => { const link = document.createElement("a"); link.download = "qr-code.png"; link.href = $("#qr-canvas", root).toDataURL("image/png"); link.click(); });
  bindClipboard(root);
  run();
}

function initPassword(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("length", "長さ", "16", "number")}${field("count", "生成数", "1", "number")}</div><div class="check-row"><label><input type="checkbox" id="upper" checked>大文字</label><label><input type="checkbox" id="lower" checked>小文字</label><label><input type="checkbox" id="number" checked>数字</label><label><input type="checkbox" id="symbol" checked>記号</label><label><input type="checkbox" id="ambiguous">曖昧文字を除外</label></div>${textareaBlock("output-text", "生成結果", "", true)}<div class="result-panel" id="strength"></div><div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const sets = { upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ", lower:"abcdefghijklmnopqrstuvwxyz", number:"0123456789", symbol:"!#$%&()*+,-./:;<=>?@[]^_{|}~" };
  const run = () => {
    let chars = Object.keys(sets).filter((id) => $(`#${id}`, root).checked).map((id) => sets[id]).join("") || sets.lower;
    if ($("#ambiguous", root).checked) chars = chars.replace(/[O0Il1|]/g, "");
    const len = clampNumber($("#length", root).value, 8, 128, 16);
    const count = clampNumber($("#count", root).value, 1, 50, 1);
    const output = Array.from({ length: count }, () => Array.from({ length: len }, () => chars[randomInt(chars.length)]).join(""));
    setOutput("output-text", output.join("\n"));
    const entropy = Math.round(Math.log2(chars.length) * len);
    $("#strength", root).textContent = `推定強度: ${entropy} bits / ${entropy >= 80 ? "強い" : entropy >= 60 ? "普通" : "弱い"}`;
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initUuid(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("count", "生成数", "5", "number")}${selectField("uuid-format", "形式", [{value:"plain",label:"そのまま"},{value:"quoted",label:"引用符付き"},{value:"csv",label:"カンマ区切り"}], "plain")}</div>${textareaBlock("output-text", "UUID", "", true)}<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const run = () => {
    const values = Array.from({ length: clampNumber($("#count", root).value, 1, 100, 5) }, () => crypto.randomUUID());
    const mode = $("#uuid-format", root).value;
    setOutput("output-text", mode === "quoted" ? values.map(v => `"${v}"`).join("\n") : mode === "csv" ? values.join(",") : values.join("\n"));
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initRandomNumber(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("min", "最小", "1", "number")}${field("max", "最大", "100", "number")}${field("count", "件数", "10", "number")}${field("decimals", "小数桁", "0", "number")}</div><div class="check-row"><label><input type="checkbox" id="unique">重複なし</label></div>${textareaBlock("output-text", "乱数", "", true)}<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const run = () => {
    const min = Number($("#min", root).value), max = Number($("#max", root).value), count = clampNumber($("#count", root).value, 1, 1000, 10), decimals = clampNumber($("#decimals", root).value, 0, 8, 0);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) { setOutput("output-text", "範囲を確認してください。"); return; }
    if ($("#unique", root).checked && decimals === 0 && count > Math.floor(max - min + 1)) { setOutput("output-text", "重複なしで生成できる件数を超えています。"); return; }
    const values = [];
    const used = new Set();
    let guard = 0;
    while (values.length < count && guard < count * 100) {
      guard += 1;
      const value = decimals === 0 ? String(Math.floor(min + randomInt(Math.floor(max - min + 1)))) : (min + (randomInt(1_000_000) / 999_999) * (max - min)).toFixed(decimals);
      if ($("#unique", root).checked && used.has(value)) continue;
      used.add(value); values.push(value);
    }
    setOutput("output-text", values.join("\n"));
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initImageResize(root) {
  root.innerHTML = `<div class="tool-panel"><label class="drop-zone"><input class="sr-only" id="file-input" type="file" accept="image/*">画像を選択</label><div class="inline-controls">${field("width", "幅", "800", "number")}${field("height", "高さ", "600", "number")}${field("quality", "品質(0.1-1)", "0.9", "number")}${selectField("format", "形式", [{value:"image/png",label:"PNG"},{value:"image/jpeg",label:"JPEG"},{value:"image/webp",label:"WebP"}], "image/webp")}</div><div class="check-row"><label><input type="checkbox" id="keep-ratio" checked>比率固定</label><span id="image-info"></span></div><div class="tool-actions"><button class="btn-primary" id="download-image" type="button">保存</button></div><div class="canvas-wrap"><canvas id="canvas"></canvas></div></div>`;
  let image = null, ratio = 1;
  const draw = () => {
    if (!image) return;
    const canvas = $("#canvas", root), ctx = canvas.getContext("2d");
    canvas.width = Math.max(1, Number($("#width", root).value) || image.width);
    canvas.height = Math.max(1, Number($("#height", root).value) || image.height);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    $("#image-info", root).textContent = `${image.width}x${image.height} → ${canvas.width}x${canvas.height}`;
  };
  $("#file-input", root).addEventListener("change", (event) => {
    const file = event.target.files[0]; if (!file) return;
    image = new Image(); image.onload = () => { ratio = image.width / image.height; $("#width", root).value = image.width; $("#height", root).value = image.height; draw(); };
    image.src = URL.createObjectURL(file);
  });
  $("#width", root).addEventListener("input", () => { if ($("#keep-ratio", root).checked && image) $("#height", root).value = Math.round(Number($("#width", root).value) / ratio); draw(); });
  $("#height", root).addEventListener("input", () => { if ($("#keep-ratio", root).checked && image) $("#width", root).value = Math.round(Number($("#height", root).value) * ratio); draw(); });
  $("#format", root).addEventListener("input", draw);
  $("#download-image", root).addEventListener("click", () => { const ext = $("#format", root).value.split("/")[1]; const link = document.createElement("a"); link.download = `converted-image.${ext}`; link.href = $("#canvas", root).toDataURL($("#format", root).value, clampNumber($("#quality", root).value, .1, 1, .9)); link.click(); });
}

function initImageCompress(root) {
  root.innerHTML = `<div class="tool-panel"><label class="drop-zone"><input class="sr-only" id="file-input" type="file" accept="image/*">画像を選択</label><div class="inline-controls">${field("quality", "品質(0.1-1)", "0.75", "number")}${selectField("format", "形式", [{value:"image/webp",label:"WebP"},{value:"image/jpeg",label:"JPEG"}], "image/webp")}</div><div class="tool-actions"><button class="btn-primary" id="download-image" type="button">保存</button></div><div class="result-panel" id="compress-info"></div><div class="canvas-wrap"><canvas id="canvas"></canvas></div></div>`;
  let fileName = "compressed";
  const canvas = $("#canvas", root), ctx = canvas.getContext("2d");
  const render = (file) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img,0,0);
      canvas.toBlob((blob) => { $("#compress-info", root).textContent = `元: ${formatBytes(file.size)} / 変換後目安: ${formatBytes(blob.size)}`; }, $("#format", root).value, clampNumber($("#quality", root).value, .1, 1, .75));
    };
    img.src = URL.createObjectURL(file);
  };
  let currentFile = null;
  $("#file-input", root).addEventListener("change", (event) => { currentFile = event.target.files[0]; if (!currentFile) return; fileName = currentFile.name.replace(/\.[^.]+$/, ""); render(currentFile); });
  root.addEventListener("input", () => currentFile && render(currentFile));
  $("#download-image", root).addEventListener("click", () => { const ext = $("#format", root).value.split("/")[1]; const link = document.createElement("a"); link.download = `${fileName}.${ext}`; link.href = canvas.toDataURL($("#format", root).value, clampNumber($("#quality", root).value, .1, 1, .75)); link.click(); });
}

function parseSimpleYaml(text) {
  const obj = {};
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf(":");
    if (idx < 0) return;
    const key = trimmed.slice(0, idx).trim();
    const raw = trimmed.slice(idx + 1).trim();
    obj[key] = raw === "true" ? true : raw === "false" ? false : raw === "" ? "" : Number.isFinite(Number(raw)) ? Number(raw) : raw.replace(/^["']|["']$/g, "");
  });
  return obj;
}
function toSimpleYaml(value) {
  return Object.entries(value).map(([key, val]) => `${key}: ${typeof val === "object" ? JSON.stringify(val) : val}`).join("\n");
}
function initYamlJson(root) {
  textTool(root, (text) => {
    if ($("#yaml-mode", root).value === "yaml-json") return JSON.stringify(parseSimpleYaml(text), null, 2);
    return toSimpleYaml(JSON.parse(text));
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("yaml-mode", "モード", [{value:"yaml-json",label:"YAML → JSON"},{value:"json-yaml",label:"JSON → YAML"}], "yaml-json"));
  $("#yaml-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (c === '"' && quoted && next === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && next === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.filter((r) => r.some((v) => v !== ""));
}
function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function initCsvJson(root) {
  textTool(root, (text) => {
    if ($("#csv-mode", root).value === "csv-json") {
      const [headers, ...rows] = parseCsv(text);
      return JSON.stringify(rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))), null, 2);
    }
    const data = JSON.parse(text);
    const headers = [...new Set(data.flatMap((row) => Object.keys(row)))];
    return [headers.map(csvEscape).join(","), ...data.map((row) => headers.map((h) => csvEscape(row[h])).join(","))].join("\n");
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("csv-mode", "モード", [{value:"csv-json",label:"CSV → JSON"},{value:"json-csv",label:"JSON → CSV"}], "csv-json"));
  $("#csv-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function initUrlParams(root) {
  root.innerHTML = `<div class="tool-panel">${textareaBlock("input-text", "URL", "https://example.com/?q=test&page=1")}<div class="result-panel" id="params-table"></div>${textareaBlock("output-text", "編集後URL", "", true)}</div>`;
  const run = () => {
    try {
      const url = new URL(getInput("input-text"), location.href);
      const rows = [...url.searchParams.entries()];
      $("#params-table", root).innerHTML = rows.length ? `<table class="mini-table"><thead><tr><th>key</th><th>value</th></tr></thead><tbody>${rows.map(([k,v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}</tbody></table>` : "パラメータなし";
      setOutput("output-text", url.toString());
    } catch (error) { $("#params-table", root).textContent = error.message; }
  };
  $("#input-text", root).addEventListener("input", run);
  bindClipboard(root);
  run();
}

function initSvgOptimizer(root) {
  textTool(root, (text) => text.replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim(), { button: "最適化する" });
  $(".tool-panel", root).insertAdjacentHTML("beforeend", `<div class="preview-box" id="svg-preview"></div>`);
  const updatePreview = () => {
    const svg = getInput("output-text") || getInput("input-text");
    $("#svg-preview", root).innerHTML = /^<svg[\s\S]*<\/svg>$/.test(svg.trim()) ? svg : "SVGを入力してください";
  };
  root.addEventListener("input", updatePreview);
  $("#run-tool", root).addEventListener("click", updatePreview);
}

function initCronHelper(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("cron", "Cron式", "0 9 * * 1-5")}</div><div class="tool-actions"><button class="btn-primary" id="run-cron" type="button">確認する</button><button class="btn-secondary" id="copy-cron" type="button">式をコピー</button></div><div class="result-panel" id="cron-result"></div></div>`;
  const run = () => {
    const parts = $("#cron", root).value.trim().split(/\s+/);
    if (parts.length !== 5) { $("#cron-result", root).textContent = "5フィールド形式で入力してください: 分 時 日 月 曜日"; return; }
    const [min,hour,day,month,week] = parts;
    $("#cron-result", root).innerHTML = `分: ${escapeHtml(min)} / 時: ${escapeHtml(hour)} / 日: ${escapeHtml(day)} / 月: ${escapeHtml(month)} / 曜日: ${escapeHtml(week)}<br>説明: ${hour === "*" ? "毎時" : `${hour}時`} ${min === "*" ? "毎分" : `${min}分`} に実行`;
  };
  root.addEventListener("input", run);
  $("#run-cron", root).addEventListener("click", run);
  $("#copy-cron", root).addEventListener("click", () => copyText($("#cron", root).value));
  run();
}

function initCssClamp(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("min-size", "最小px", "16", "number")}${field("max-size", "最大px", "32", "number")}${field("min-vw", "最小幅px", "375", "number")}${field("max-vw", "最大幅px", "1280", "number")}</div>${textareaBlock("output-text", "CSS", "", true)}</div>`;
  const run = () => {
    const min = Number($("#min-size", root).value), max = Number($("#max-size", root).value), minVw = Number($("#min-vw", root).value), maxVw = Number($("#max-vw", root).value);
    const slope = (max - min) / (maxVw - minVw) * 100;
    const intercept = min - (slope * minVw / 100);
    setOutput("output-text", `font-size: clamp(${min}px, ${intercept.toFixed(4)}px + ${slope.toFixed(4)}vw, ${max}px);`);
  };
  root.addEventListener("input", run);
  bindClipboard(root);
  run();
}

function initOgPreview(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("og-title", "タイトル", "WEBツール集")}${field("og-desc", "説明", "ブラウザで使える便利ツール集")}${field("og-image", "画像URL", "https://example.com/og.png")}</div><div class="result-panel og-card" id="og-card"></div>${textareaBlock("output-text", "metaタグ", "", true)}</div>`;
  const run = () => {
    const title = $("#og-title", root).value, desc = $("#og-desc", root).value, image = $("#og-image", root).value;
    $("#og-card", root).innerHTML = `<div class="og-thumb">${image ? `<img src="${escapeHtml(image)}" alt="">` : ""}</div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(desc)}</p>`;
    setOutput("output-text", `<meta property="og:title" content="${escapeHtml(title)}">\n<meta property="og:description" content="${escapeHtml(desc)}">\n<meta property="og:image" content="${escapeHtml(image)}">`);
  };
  root.addEventListener("input", run);
  bindClipboard(root);
  run();
}

function initDateCalculator(root) {
  const today = new Date().toISOString().slice(0,10);
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("start-date", "開始日", today, "date")}${field("end-date", "終了日", today, "date")}${field("add-days", "加算日数", "30", "number")}</div><div class="result-panel" id="date-result"></div></div>`;
  const run = () => {
    const s = new Date($("#start-date", root).value), e = new Date($("#end-date", root).value), add = Number($("#add-days", root).value) || 0;
    const diff = Math.round((e - s) / 86400000);
    let biz = 0, cur = new Date(s);
    while (cur <= e) { const d = cur.getDay(); if (d !== 0 && d !== 6) biz++; cur.setDate(cur.getDate() + 1); }
    const added = new Date(s); added.setDate(added.getDate() + add);
    $("#date-result", root).innerHTML = `差分: ${diff}日<br>営業日(土日除く): ${biz}日<br>${add}日後: ${added.toISOString().slice(0,10)}`;
  };
  root.addEventListener("input", run);
  run();
}

function initPlaceholderImage(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("ph-width", "幅", "1200", "number")}${field("ph-height", "高さ", "630", "number")}${field("ph-bg", "背景色", "#dfe7da")}${field("ph-fg", "文字色", "#202522")}${field("ph-text", "文字", "1200 x 630")}</div><div class="tool-actions"><button class="btn-primary" id="download-ph" type="button">PNG保存</button></div><div class="canvas-wrap"><canvas id="ph-canvas"></canvas></div></div>`;
  const draw = () => {
    const canvas = $("#ph-canvas", root), ctx = canvas.getContext("2d"), w = clampNumber($("#ph-width", root).value, 16, 4000, 1200), h = clampNumber($("#ph-height", root).value, 16, 4000, 630);
    canvas.width = w; canvas.height = h; ctx.fillStyle = $("#ph-bg", root).value; ctx.fillRect(0,0,w,h); ctx.strokeStyle = "#9aa895"; ctx.strokeRect(0,0,w,h); ctx.fillStyle = $("#ph-fg", root).value; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `${Math.max(18, Math.round(w / 16))}px sans-serif`; ctx.fillText($("#ph-text", root).value, w/2, h/2);
  };
  root.addEventListener("input", draw);
  $("#download-ph", root).addEventListener("click", () => { const link = document.createElement("a"); link.download = "placeholder.png"; link.href = $("#ph-canvas", root).toDataURL("image/png"); link.click(); });
  draw();
}

function initColorPickerImage(root) {
  root.innerHTML = `<div class="tool-panel"><label class="drop-zone"><input class="sr-only" id="file-input" type="file" accept="image/*">画像を選択してクリック</label><div class="canvas-wrap"><canvas id="canvas"></canvas></div><div class="stats-grid"><div class="stat-card"><span class="stat-num" id="picked-hex">-</span><span class="stat-label">HEX</span></div><div class="stat-card"><span class="stat-num" id="picked-rgb">-</span><span class="stat-label">RGB</span></div></div><div class="tool-actions"><button class="btn-secondary" id="copy-picked" type="button">色をコピー</button></div><div class="palette" id="picked-history"></div></div>`;
  const canvas = $("#canvas", root), ctx = canvas.getContext("2d"), history = [];
  $("#file-input", root).addEventListener("change", (event) => {
    const file = event.target.files[0]; if (!file) return;
    const image = new Image(); image.onload = () => { canvas.width = image.width; canvas.height = image.height; ctx.drawImage(image,0,0); };
    image.src = URL.createObjectURL(file);
  });
  canvas.addEventListener("click", (event) => {
    if (!canvas.width || !canvas.height) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * canvas.width / rect.width);
    const y = Math.floor((event.clientY - rect.top) * canvas.height / rect.height);
    const [r,g,b] = ctx.getImageData(x,y,1,1).data;
    const hex = rgbToHex(r,g,b);
    $("#picked-hex", root).textContent = hex;
    $("#picked-rgb", root).textContent = `${r}, ${g}, ${b}`;
    history.unshift(hex);
    $("#picked-history", root).innerHTML = history.slice(0, 10).map((color) => `<button style="background:${color}" type="button" data-color="${color}">${color}</button>`).join("");
    $$("[data-color]", root).forEach((button) => button.addEventListener("click", () => copyText(button.dataset.color)));
  });
  $("#copy-picked", root).addEventListener("click", () => copyText($("#picked-hex", root).textContent));
}

const unitTables = {
  "unit-length": { base: "m", units: { mm:.001, cm:.01, m:1, km:1000, inch:.0254, feet:.3048, yard:.9144, mile:1609.344 } },
  "unit-weight": { base: "g", units: { mg:.001, g:1, kg:1000, t:1000000, oz:28.349523125, lb:453.59237 } },
  "unit-data": { base: "Byte", units: { bit:.125, Byte:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 } }
};
function initUnit(root, key) {
  const table = unitTables[key];
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("amount", "値", "1", "number")}${selectField("unit", "入力単位", Object.keys(table.units).map((unit) => ({ value: unit, label: unit })), table.base)}</div><div class="stats-grid" id="unit-results"></div></div>`;
  const run = () => {
    const base = Number($("#amount", root).value) * table.units[$("#unit", root).value];
    $("#unit-results", root).innerHTML = Object.entries(table.units).map(([unit, factor], i) => `<div class="stat-card"><span class="stat-num">${Number(base / factor).toLocaleString(undefined, { maximumSignificantDigits: 10 })}</span><span class="stat-label">${unit}</span></div>`).join("");
  };
  root.addEventListener("input", run);
  run();
}
function initUnitTemperature(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("temp", "温度", "20", "number")}${selectField("unit", "入力単位", [{value:"c",label:"摂氏 C"},{value:"f",label:"華氏 F"},{value:"k",label:"ケルビン K"}], "c")}</div><div class="stats-grid" id="temp-results"></div></div>`;
  const run = () => {
    const v = Number($("#temp", root).value); const u = $("#unit", root).value;
    const c = u === "c" ? v : u === "f" ? (v - 32) * 5/9 : v - 273.15;
    const values = { "摂氏 C": c, "華氏 F": c * 9/5 + 32, "ケルビン K": c + 273.15 };
    $("#temp-results", root).innerHTML = Object.entries(values).map(([label, value]) => `<div class="stat-card"><span class="stat-num">${value.toFixed(2)}</span><span class="stat-label">${label}</span></div>`).join("");
  };
  root.addEventListener("input", run);
  run();
}
function initNumberBase(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("num", "値", "255")}${selectField("base", "入力進数", [2,8,10,16].map((n) => ({ value:String(n), label:`${n}進数` })), "10")}</div><div class="stats-grid" id="base-results"></div></div>`;
  const run = () => {
    const value = parseInt($("#num", root).value, Number($("#base", root).value));
    $("#base-results", root).innerHTML = Number.isNaN(value) ? "数値を確認してください。" : [2,8,10,16].map((base) => `<div class="stat-card"><span class="stat-num">${value.toString(base).toUpperCase()}</span><span class="stat-label">${base}進数</span></div>`).join("");
  };
  root.addEventListener("input", run);
  run();
}

function initQrCode(root) {
  root.innerHTML = `<div class="tool-panel">${textareaBlock("input-text", "QRにするテキスト", "https://example.com") }<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button><button class="btn-secondary" id="download-qr" type="button">PNG保存</button></div><div class="canvas-wrap"><canvas id="qr-canvas" width="260" height="260"></canvas></div></div>`;
  const drawFallback = (text) => {
    const canvas = $("#qr-canvas", root), ctx = canvas.getContext("2d"), size = 260, cells = 29, cell = size / cells;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,size,size); ctx.fillStyle = "#111827";
    let seed = [...text].reduce((a,c) => a + c.charCodeAt(0), 0);
    for (let y=0; y<cells; y++) for (let x=0; x<cells; x++) { seed = (seed * 1664525 + 1013904223) >>> 0; if (seed % 3 === 0) ctx.fillRect(Math.floor(x*cell), Math.floor(y*cell), Math.ceil(cell), Math.ceil(cell)); }
  };
  const run = () => {
    if (window.QRCode) QRCode.toCanvas($("#qr-canvas", root), getInput("input-text"), { width: 260, margin: 2 }, () => {});
    else drawFallback(getInput("input-text"));
  };
  $("#run-tool", root).addEventListener("click", run);
  $("#input-text", root).addEventListener("input", run);
  $("#download-qr", root).addEventListener("click", () => { const link = document.createElement("a"); link.download = "qr-code.png"; link.href = $("#qr-canvas", root).toDataURL("image/png"); link.click(); });
  bindClipboard(root);
  run();
}

function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}
function initPassword(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("length", "長さ", "16", "number")}</div><div class="check-row"><label><input type="checkbox" id="upper" checked>大文字</label><label><input type="checkbox" id="lower" checked>小文字</label><label><input type="checkbox" id="number" checked>数字</label><label><input type="checkbox" id="symbol" checked>記号</label></div>${textareaBlock("output-text", "生成結果", "", true)}<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const sets = { upper:"ABCDEFGHIJKLMNOPQRSTUVWXYZ", lower:"abcdefghijklmnopqrstuvwxyz", number:"0123456789", symbol:"!#$%&()*+,-./:;<=>?@[]^_{|}~" };
  const run = () => {
    const chars = Object.keys(sets).filter((id) => $(`#${id}`, root).checked).map((id) => sets[id]).join("") || sets.lower;
    const len = Math.max(4, Math.min(128, Number($("#length", root).value) || 16));
    setOutput("output-text", Array.from({ length: len }, () => chars[randomInt(chars.length)]).join(""));
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}
function initUuid(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("count", "生成数", "5", "number")}</div>${textareaBlock("output-text", "UUID", "", true)}<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const run = () => setOutput("output-text", Array.from({ length: Math.max(1, Math.min(100, Number($("#count", root).value) || 1)) }, () => crypto.randomUUID()).join("\n"));
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}
function initRandomNumber(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("min", "最小", "1", "number")}${field("max", "最大", "100", "number")}${field("count", "件数", "10", "number")}${field("decimals", "小数桁", "0", "number")}</div><div class="check-row"><label><input type="checkbox" id="unique">重複なし</label></div>${textareaBlock("output-text", "乱数", "", true)}<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const run = () => {
    const min = Number($("#min", root).value), max = Number($("#max", root).value), count = Math.max(1, Math.min(1000, Number($("#count", root).value) || 1)), decimals = Math.max(0, Math.min(8, Number($("#decimals", root).value) || 0));
    const values = new Set();
    while (values.size < count) {
      const value = (min + (randomInt(1_000_000) / 999_999) * (max - min)).toFixed(decimals);
      values.add(value);
      if (!$("#unique", root).checked && values.size < count) values.add(value + "");
      if (values.size > 10000) break;
    }
    setOutput("output-text", [...values].slice(0, count).join("\n"));
  };
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initImageResize(root) {
  root.innerHTML = `<div class="tool-panel"><label class="drop-zone"><input class="sr-only" id="file-input" type="file" accept="image/*">画像を選択</label><div class="inline-controls">${field("width", "幅", "800", "number")}${field("height", "高さ", "600", "number")}${selectField("format", "形式", [{value:"image/png",label:"PNG"},{value:"image/jpeg",label:"JPEG"},{value:"image/webp",label:"WebP"}], "image/png")}</div><div class="tool-actions"><button class="btn-primary" id="download-image" type="button">保存</button></div><div class="canvas-wrap"><canvas id="canvas"></canvas></div></div>`;
  let image = null;
  const draw = () => {
    if (!image) return;
    const canvas = $("#canvas", root), ctx = canvas.getContext("2d");
    canvas.width = Math.max(1, Number($("#width", root).value) || image.width);
    canvas.height = Math.max(1, Number($("#height", root).value) || image.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };
  $("#file-input", root).addEventListener("change", (event) => {
    const file = event.target.files[0]; if (!file) return;
    image = new Image(); image.onload = () => { $("#width", root).value = image.width; $("#height", root).value = image.height; draw(); };
    image.src = URL.createObjectURL(file);
  });
  root.addEventListener("input", draw);
  $("#download-image", root).addEventListener("click", () => { const link = document.createElement("a"); link.download = "resized-image"; link.href = $("#canvas", root).toDataURL($("#format", root).value, .9); link.click(); });
}

function initColorPicker(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls"><label class="control-group"><span class="control-label">色を選択</span><input class="tool-input" id="picked" type="color" value="#557b65"></label>${field("hex", "HEX", "#557b65")}${field("rgb", "RGB", "")}${field("hsl", "HSL", "")}</div><div class="color-swatch" id="swatch"></div><div class="tool-actions"><button class="btn-secondary" id="copy-color" type="button">HEXコピー</button></div></div>`;
  const update = () => { const rgb = hexToRgb($("#picked", root).value); $("#hex", root).value = $("#picked", root).value; $("#rgb", root).value = `${rgb.r}, ${rgb.g}, ${rgb.b}`; const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b); $("#hsl", root).value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`; $("#swatch", root).style.setProperty("--swatch", $("#picked", root).value); };
  $("#picked", root).addEventListener("input", update);
  $("#copy-color", root).addEventListener("click", () => copyText($("#hex", root).value));
  update();
}

function initColorConverter(root) {
  root.innerHTML = `<div class="tool-panel">
    <div class="inline-controls">${field("hex", "HEX", "#557b65")}${field("rgb", "RGB/RGBA", "85, 123, 101, 1")}${field("hsl", "HSL", "137, 18%, 41%")}</div>
    <div class="color-swatch" id="swatch"></div>
  </div>`;
  const updateFromRgb = (r, g, b, a = 1) => {
    const hsl = rgbToHsl(r, g, b);
    $("#hex", root).value = rgbToHex(r, g, b);
    $("#rgb", root).value = `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.max(0, Math.min(1, a))}`;
    $("#hsl", root).value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    $("#swatch", root).style.setProperty("--swatch", `rgba(${r},${g},${b},${a})`);
  };
  $("#hex", root).addEventListener("input", () => { const rgb = hexToRgb($("#hex", root).value); if (rgb) updateFromRgb(rgb.r, rgb.g, rgb.b); });
  $("#rgb", root).addEventListener("input", () => { const [r,g,b,a=1] = $("#rgb", root).value.match(/\d+(\.\d+)?/g)?.map(Number) || []; if ([r,g,b].every((n) => Number.isFinite(n))) updateFromRgb(r,g,b,a); });
  $("#hsl", root).addEventListener("input", () => { const [h,s,l] = $("#hsl", root).value.match(/\d+(\.\d+)?/g)?.map(Number) || []; if ([h,s,l].every((n) => Number.isFinite(n))) { const rgb = hslToRgb(h,s,l); updateFromRgb(rgb.r,rgb.g,rgb.b); } });
}

function initContrastChecker(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls"><label class="control-group"><span class="control-label">文字色</span><input class="tool-input" id="fg" type="color" value="#202522"></label><label class="control-group"><span class="control-label">背景色</span><input class="tool-input" id="bg" type="color" value="#eef1e8"></label>${selectField("text-size", "文字サイズ", [{value:"normal",label:"通常"},{value:"large",label:"大きな文字"}], "normal")}</div><div class="result-panel" id="contrast-result"></div></div>`;
  const update = () => {
    const ratio = contrastRatio(hexToRgb($("#fg", root).value), hexToRgb($("#bg", root).value));
    const large = $("#text-size", root).value === "large";
    $("#contrast-result", root).style.color = $("#fg", root).value;
    $("#contrast-result", root).style.background = $("#bg", root).value;
    $("#contrast-result", root).style.fontSize = large ? "1.5rem" : "1rem";
    $("#contrast-result", root).innerHTML = `<strong>サンプル文字 ABC あいう</strong><br>コントラスト比: ${ratio.toFixed(2)}:1<br>AA: ${ratio >= (large ? 3 : 4.5) ? "合格" : "不合格"} / AAA: ${ratio >= (large ? 4.5 : 7) ? "合格" : "不合格"}`;
  };
  root.addEventListener("input", update);
  update();
}

function initPaletteGenerator(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls"><label class="control-group"><span class="control-label">ベースカラー</span><input class="tool-input" id="base-color" type="color" value="#557b65"></label>${selectField("palette-mode", "配色", [{value:"mixed",label:"基本セット"},{value:"analogous",label:"類似色"},{value:"triad",label:"3色"},{value:"quad",label:"4色"}], "mixed")}</div><div class="palette" id="palette"></div><canvas id="palette-canvas" width="900" height="260" class="sr-only"></canvas><div class="tool-actions"><button class="btn-primary" id="download-palette" type="button">PNG画像保存</button><button class="btn-secondary" id="copy-palette" type="button">カラー一覧コピー</button></div></div>`;
  let currentColors = [];
  const makeColors = () => {
    const base = hexToRgb($("#base-color", root).value);
    const hsl = rgbToHsl(base.r, base.g, base.b);
    const mode = $("#palette-mode", root).value;
    const hues = mode === "analogous" ? [-40,-20,0,20,40] : mode === "triad" ? [0,120,240,0,120] : mode === "quad" ? [0,90,180,270,45] : [0,30,180,120,240];
    return hues.map((offset, i) => {
      const rgb = hslToRgb((hsl.h + offset + 360) % 360, Math.max(20, Math.min(90, hsl.s + (i - 2) * 4)), Math.max(18, Math.min(82, hsl.l + (i - 2) * 5)));
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    });
  };
  const drawCanvas = () => {
    const canvas = $("#palette-canvas", root), ctx = canvas.getContext("2d"), w = canvas.width / currentColors.length;
    ctx.fillStyle = "#fbfbf5"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    currentColors.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(i * w, 0, w, 190); ctx.fillStyle = "#202522"; ctx.font = "24px sans-serif"; ctx.fillText(color, i * w + 18, 232); });
  };
  const update = () => {
    currentColors = makeColors();
    $("#palette", root).innerHTML = currentColors.map((color) => `<button style="background:${color}" type="button" data-color="${color}">${color}</button>`).join("");
    $$("[data-color]", root).forEach((button) => button.addEventListener("click", () => copyText(button.dataset.color)));
    drawCanvas();
  };
  root.addEventListener("input", update);
  $("#download-palette", root).addEventListener("click", () => { const link = document.createElement("a"); link.download = "color-palette.png"; link.href = $("#palette-canvas", root).toDataURL("image/png"); link.click(); });
  $("#copy-palette", root).addEventListener("click", () => copyText(currentColors.join("\n")));
  update();
}

function initJsonFormatter(root) {
  textTool(root, (text) => {
    try {
      const parsed = JSON.parse(text);
      return $("#json-mode", root).value === "format" ? JSON.stringify(parsed, null, 2).split("\n").map((line, i) => `${String(i + 1).padStart(3, " ")}  ${line}`).join("\n") : JSON.stringify(parsed);
    } catch (error) {
      const pos = /position (\d+)/.exec(error.message)?.[1];
      let lineInfo = "";
      if (pos) {
        const before = text.slice(0, Number(pos));
        lineInfo = `\n推定位置: ${before.split("\n").length}行目 ${before.split("\n").pop().length + 1}文字目`;
      }
      return `JSON構文エラー:\n${error.message}${lineInfo}`;
    }
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("json-mode", "モード", [{value:"format",label:"整形+行番号"},{value:"minify",label:"圧縮"}], "format"));
  $("#json-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function initRegexTester(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("pattern", "正規表現", "\\\\w+")}${field("flags", "フラグ", "g")}${field("replacement", "置換文字列", "[$&]")}</div>${textareaBlock("input-text", "テスト文字列", "abc 123 def") }<div class="result-panel" id="matches"></div></div>`;
  const run = () => {
    try {
      const flags = $("#flags", root).value.replace(/[^gimsuy]/g, "");
      const regex = new RegExp($("#pattern", root).value, flags.includes("g") ? flags : flags + "g");
      const text = getInput("input-text");
      const matches = [...text.matchAll(regex)];
      const replaced = text.replace(regex, $("#replacement", root).value);
      $("#matches", root).innerHTML = matches.length ? `<ul class="result-list">${matches.map((m) => `<li><strong>${escapeHtml(m[0])}</strong> index ${m.index}${m.length > 1 ? ` / groups: ${m.slice(1).map(escapeHtml).join(", ")}` : ""}</li>`).join("")}</ul><hr><strong>置換結果</strong><pre>${escapeHtml(replaced)}</pre>` : `一致なし<hr><strong>置換結果</strong><pre>${escapeHtml(replaced)}</pre>`;
    } catch (error) { $("#matches", root).textContent = error.message; }
  };
  root.addEventListener("input", run);
  bindClipboard(root);
  run();
}

function minifyCss(css) {
  const strings = [];
  const protectedCss = css.replace(/(["'])(?:\\.|(?!\1).)*\1/g, (match) => `___STR${strings.push(match) - 1}___`);
  return protectedCss.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,>+~])\s*/g, "$1").trim().replace(/___STR(\d+)___/g, (_, i) => strings[i]);
}
function minifyHtml(html) {
  const blocks = [];
  const protectedHtml = html.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi, (match) => `___BLOCK${blocks.push(match) - 1}___`);
  return protectedHtml.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim().replace(/___BLOCK(\d+)___/g, (_, i) => blocks[i]);
}

function initTimestampConverter(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("timestamp", "Unix秒/ミリ秒", Date.now(), "number")}${field("datetime", "日時", new Date().toISOString().slice(0,16), "datetime-local")}</div><div class="tool-actions"><button class="btn-primary" id="now" type="button">現在時刻</button></div><div class="result-panel" id="time-result"></div></div>`;
  const render = (date) => { $("#time-result", root).innerHTML = `<strong>Unix秒</strong>: ${Math.floor(date.getTime()/1000)}<br><strong>Unixミリ秒</strong>: ${date.getTime()}<br><strong>ISO/UTC</strong>: ${date.toISOString()}<br><strong>ローカル</strong>: ${date.toString()}<br><strong>JST</strong>: ${date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`; };
  const fromTs = () => { const raw = Number($("#timestamp", root).value); const date = new Date(String(Math.trunc(raw)).length > 10 ? raw : raw * 1000); $("#datetime", root).value = new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,16); render(date); };
  const fromDate = () => { const date = new Date($("#datetime", root).value); $("#timestamp", root).value = date.getTime(); render(date); };
  $("#timestamp", root).addEventListener("input", fromTs);
  $("#datetime", root).addEventListener("input", fromDate);
  $("#now", root).addEventListener("click", () => { $("#timestamp", root).value = Date.now(); fromTs(); });
  fromTs();
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit ? 2 : 0)} ${units[unit]}`;
}

function safeMarkedSource(source) {
  return source.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function initCharacterCount(root) {
  root.innerHTML = `<div class="tool-panel">
    ${textareaBlock("input-text", "入力", "文字数、単語数、行数を数えたいテキストを入力してください")}
    <div class="stats-grid">
      ${["文字数","空白除外","UTF-8バイト","英単語数","文数","行数","段落数","読了時間","原稿用紙","X投稿率"].map((label, index) => `<div class="stat-card"><span class="stat-num" id="stat-${index}">0</span><span class="stat-label">${label}</span></div>`).join("")}
    </div>
  </div>`;
  const update = () => {
    const text = getInput("input-text");
    const noSpace = text.replace(/\s/g, "");
    const words = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g) || [];
    const sentences = toSentences(text);
    const values = [
      text.length,
      noSpace.length,
      new TextEncoder().encode(text).length,
      words.length,
      sentences.length,
      text === "" ? 0 : text.split("\n").length,
      text.trim() ? text.trim().split(/\n\s*\n/).length : 0,
      `${Math.max(0, Math.ceil((words.length || noSpace.length / 400) / 250))}分`,
      Math.ceil(noSpace.length / 400),
      `${Math.min(100, Math.round((text.length / 280) * 100))}%`
    ];
    values.forEach((value, index) => $(`#stat-${index}`, root).textContent = value);
  };
  $("#input-text", root).addEventListener("input", update);
  bindClipboard(root);
  update();
}

function initWordCount(root) {
  root.innerHTML = `<div class="result-panel">単語数・行数カウントは「文字数・単語数カウント」に統合しました。<br><a href="character-count.html">統合版を開く</a></div>`;
}

function initTextDiff(root) {
  root.innerHTML = `<div class="tool-panel">
    <div class="tool-columns">${textareaBlock("left-text", "比較元", "元のテキスト")}${textareaBlock("right-text", "比較先", "変更後のテキスト")}</div>
    <div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">比較する</button><button class="btn-secondary" id="clear-tool" type="button">クリア</button></div>
    <div class="stats-grid"><div class="stat-card"><span class="stat-num" id="added-count">0</span><span class="stat-label">追加行</span></div><div class="stat-card"><span class="stat-num" id="removed-count">0</span><span class="stat-label">削除行</span></div><div class="stat-card"><span class="stat-num" id="changed-count">0</span><span class="stat-label">変更行</span></div></div>
    <div class="result-panel" id="diff-output" data-output></div>
  </div>`;
  const run = () => {
    const left = getInput("left-text").split("\n");
    const right = getInput("right-text").split("\n");
    const max = Math.max(left.length, right.length);
    let added = 0, removed = 0, changed = 0;
    $("#diff-output", root).innerHTML = Array.from({ length: max }, (_, index) => {
      if ((left[index] || "") === (right[index] || "")) return `<div class="diff-line diff-same">  ${escapeHtml(left[index] || "")}</div>`;
      if (left[index] === undefined) { added += 1; return `<div class="diff-line diff-added">+ ${escapeHtml(right[index])}</div>`; }
      if (right[index] === undefined) { removed += 1; return `<div class="diff-line diff-removed">- ${escapeHtml(left[index])}</div>`; }
      changed += 1;
      return `<div class="diff-line diff-removed">- ${escapeHtml(left[index])}</div><div class="diff-line diff-added">+ ${escapeHtml(right[index])}</div>`;
    }).join("");
    $("#added-count", root).textContent = added;
    $("#removed-count", root).textContent = removed;
    $("#changed-count", root).textContent = changed;
  };
  ["left-text","right-text"].forEach((id) => $(`#${id}`, root).addEventListener("input", run));
  $("#run-tool", root).addEventListener("click", run);
  $("#clear-tool", root).addEventListener("click", () => { $("#left-text", root).value = ""; $("#right-text", root).value = ""; run(); });
  bindClipboard(root);
  run();
}

function initMarkdownPreview(root) {
  root.innerHTML = `<div class="tool-panel"><div class="tool-columns">${textareaBlock("input-text", "Markdown入力", "# 見出し\n\n- リスト\n- プレビュー") }<div class="tool-output-area"><div class="output-header"><span class="output-label">HTMLプレビュー</span><button class="btn-icon" id="copy-html" type="button">HTMLコピー</button></div><div class="preview-box" id="preview"></div></div></div><p class="tool-note">安全のため入力内のHTMLタグは文字として扱います。</p></div>`;
  const render = () => {
    const source = safeMarkedSource(getInput("input-text"));
    $("#preview", root).innerHTML = window.marked ? marked.parse(source) : source.replace(/\n/g, "<br>");
  };
  $("#input-text", root).addEventListener("input", render);
  $("#copy-html", root).addEventListener("click", () => copyText($("#preview", root).innerHTML));
  bindClipboard(root);
  $("#input-text", root).value = "# Markdownプレビュー\n\n**太字** やリストを確認できます。";
  render();
}

function initLoremIpsum(root) {
  const ja = ["これはデザイン確認に使えるダミーテキストです。", "余白や行間、文字量の見え方を自然な文章で検証できます。", "実際のコンテンツに近い密度で、画面のバランスを整えられます。"];
  const en = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "Integer vitae sem at justo facilisis luctus.", "Praesent commodo nibh sed arcu volutpat, non dictum neque porta."];
  root.innerHTML = `<div class="tool-panel">
    <div class="inline-controls">${selectField("lang", "言語", [{value:"ja",label:"日本語"},{value:"en",label:"English"}], "ja")}${field("paras", "段落数", "3", "number")}${field("repeat", "1段落の文数", "3", "number")}${field("target-chars", "目標文字数", "", "number")}</div>
    ${textareaBlock("output-text", "生成結果", "", true)}
    <div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div>
  </div>`;
  const run = () => {
    const pool = $("#lang", root).value === "ja" ? ja : en;
    const paras = clampNumber($("#paras", root).value, 1, 20, 3);
    const repeat = clampNumber($("#repeat", root).value, 1, 20, 3);
    const target = Number($("#target-chars", root).value);
    let output = Array.from({ length: paras }, (_, p) => Array.from({ length: repeat }, (_, i) => pool[(p + i) % pool.length]).join($("#lang", root).value === "ja" ? "" : " ")).join("\n\n");
    if (Number.isFinite(target) && target > 0) {
      while (output.replace(/\s/g, "").length < target) output += "\n\n" + pool.join($("#lang", root).value === "ja" ? "" : " ");
      output = output.slice(0, target);
    }
    setOutput("output-text", output);
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initBase64(root) {
  textTool(root, (text) => {
    if ($("#base-mode", root).value === "encode") return btoa(unescape(encodeURIComponent(text)));
    const cleaned = text.trim().replace(/^data:[^,]+,/, "");
    return decodeURIComponent(escape(atob(cleaned)));
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", `${selectField("base-mode", "モード", [{value:"encode",label:"エンコード"},{value:"decode",label:"デコード"},{value:"strip",label:"Data URI部分を除去"}], "encode")}<label class="drop-zone" id="drop-zone"><input type="file" id="file-input" class="sr-only">ファイルを選択またはドロップしてData URIへ変換</label><div id="file-preview" class="result-panel"></div>`);
  $("#base-mode", root).addEventListener("change", () => {
    if ($("#base-mode", root).value === "strip") setOutput("output-text", getInput("input-text").trim().replace(/^data:[^,]+,/, ""));
    else $("#run-tool", root).click();
  });
  const convertFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      $("#output-text", root).value = reader.result;
      $("#file-preview", root).innerHTML = file.type.startsWith("image/") ? `<img alt="preview" src="${reader.result}" style="max-width:220px;max-height:160px">` : `${escapeHtml(file.name)} / ${formatBytes(file.size)}`;
    };
    reader.readAsDataURL(file);
  };
  $("#file-input", root).addEventListener("change", (event) => event.target.files[0] && convertFile(event.target.files[0]));
  $("#drop-zone", root).addEventListener("dragover", (event) => { event.preventDefault(); });
  $("#drop-zone", root).addEventListener("drop", (event) => { event.preventDefault(); if (event.dataTransfer.files[0]) convertFile(event.dataTransfer.files[0]); });
}

function initHtmlEntity(root) {
  textTool(root, (text) => {
    const mode = $("#html-mode", root).value;
    if (mode === "encode") return escapeHtml(text);
    if (mode === "numeric") return [...text].map((char) => `&#${char.codePointAt(0)};`).join("");
    const doc = new DOMParser().parseFromString(text, "text/html");
    return doc.documentElement.textContent || "";
  });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", selectField("html-mode", "モード", [{value:"encode",label:"名前付きエンコード"},{value:"numeric",label:"数値参照"},{value:"decode",label:"デコード"}], "encode"));
  $(".tool-panel", root).insertAdjacentHTML("beforeend", `<div class="result-panel">よく使う文字: &amp;amp; &amp;lt; &amp;gt; &amp;quot; &amp;#39;</div>`);
  $("#html-mode", root).addEventListener("change", () => $("#run-tool", root).click());
}

function initJwtDecoder(root) {
  textTool(root, (text) => {
    const parts = text.trim().split(".");
    if (parts.length < 2) return "JWTは header.payload.signature の形式で入力してください。\n注意: このツールはデコードのみで、署名検証は行いません。";
    try {
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const readable = {};
      ["iat","nbf","exp"].forEach((key) => { if (payload[key]) readable[key] = new Date(payload[key] * 1000).toISOString(); });
      return JSON.stringify({ notice: "デコードのみ。署名検証は行っていません。", header: JSON.parse(b64urlDecode(parts[0])), payload, readableDates: readable, signature: parts[2] || "" }, null, 2);
    } catch (error) {
      return `JWTデコードエラー:\n${error.message}`;
    }
  }, { button: "デコードする" });
}

async function md5Text(text) {
  function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
  function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
  function ff(a,b,c,d,x,s,t){ return cmn((b & c) | ((~b) & d), a,b,x,s,t); }
  function gg(a,b,c,d,x,s,t){ return cmn((b & d) | (c & (~d)), a,b,x,s,t); }
  function hh(a,b,c,d,x,s,t){ return cmn(b ^ c ^ d, a,b,x,s,t); }
  function ii(a,b,c,d,x,s,t){ return cmn(c ^ (b | (~d)), a,b,x,s,t); }
  const bytes = new TextEncoder().encode(text);
  const words = [];
  for (let i = 0; i < bytes.length; i++) words[i >> 2] = (words[i >> 2] || 0) | (bytes[i] << ((i % 4) * 8));
  words[bytes.length >> 2] = (words[bytes.length >> 2] || 0) | (0x80 << ((bytes.length % 4) * 8));
  words[(((bytes.length + 8) >> 6) + 1) * 16 - 2] = bytes.length * 8;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a=ff(a,b,c,d,words[i+0]||0,7,-680876936); d=ff(d,a,b,c,words[i+1]||0,12,-389564586); c=ff(c,d,a,b,words[i+2]||0,17,606105819); b=ff(b,c,d,a,words[i+3]||0,22,-1044525330);
    a=ff(a,b,c,d,words[i+4]||0,7,-176418897); d=ff(d,a,b,c,words[i+5]||0,12,1200080426); c=ff(c,d,a,b,words[i+6]||0,17,-1473231341); b=ff(b,c,d,a,words[i+7]||0,22,-45705983);
    a=ff(a,b,c,d,words[i+8]||0,7,1770035416); d=ff(d,a,b,c,words[i+9]||0,12,-1958414417); c=ff(c,d,a,b,words[i+10]||0,17,-42063); b=ff(b,c,d,a,words[i+11]||0,22,-1990404162);
    a=ff(a,b,c,d,words[i+12]||0,7,1804603682); d=ff(d,a,b,c,words[i+13]||0,12,-40341101); c=ff(c,d,a,b,words[i+14]||0,17,-1502002290); b=ff(b,c,d,a,words[i+15]||0,22,1236535329);
    a=gg(a,b,c,d,words[i+1]||0,5,-165796510); d=gg(d,a,b,c,words[i+6]||0,9,-1069501632); c=gg(c,d,a,b,words[i+11]||0,14,643717713); b=gg(b,c,d,a,words[i+0]||0,20,-373897302);
    a=gg(a,b,c,d,words[i+5]||0,5,-701558691); d=gg(d,a,b,c,words[i+10]||0,9,38016083); c=gg(c,d,a,b,words[i+15]||0,14,-660478335); b=gg(b,c,d,a,words[i+4]||0,20,-405537848);
    a=gg(a,b,c,d,words[i+9]||0,5,568446438); d=gg(d,a,b,c,words[i+14]||0,9,-1019803690); c=gg(c,d,a,b,words[i+3]||0,14,-187363961); b=gg(b,c,d,a,words[i+8]||0,20,1163531501);
    a=gg(a,b,c,d,words[i+13]||0,5,-1444681467); d=gg(d,a,b,c,words[i+2]||0,9,-51403784); c=gg(c,d,a,b,words[i+7]||0,14,1735328473); b=gg(b,c,d,a,words[i+12]||0,20,-1926607734);
    a=hh(a,b,c,d,words[i+5]||0,4,-378558); d=hh(d,a,b,c,words[i+8]||0,11,-2022574463); c=hh(c,d,a,b,words[i+11]||0,16,1839030562); b=hh(b,c,d,a,words[i+14]||0,23,-35309556);
    a=hh(a,b,c,d,words[i+1]||0,4,-1530992060); d=hh(d,a,b,c,words[i+4]||0,11,1272893353); c=hh(c,d,a,b,words[i+7]||0,16,-155497632); b=hh(b,c,d,a,words[i+10]||0,23,-1094730640);
    a=hh(a,b,c,d,words[i+13]||0,4,681279174); d=hh(d,a,b,c,words[i+0]||0,11,-358537222); c=hh(c,d,a,b,words[i+3]||0,16,-722521979); b=hh(b,c,d,a,words[i+6]||0,23,76029189);
    a=hh(a,b,c,d,words[i+9]||0,4,-640364487); d=hh(d,a,b,c,words[i+12]||0,11,-421815835); c=hh(c,d,a,b,words[i+15]||0,16,530742520); b=hh(b,c,d,a,words[i+2]||0,23,-995338651);
    a=ii(a,b,c,d,words[i+0]||0,6,-198630844); d=ii(d,a,b,c,words[i+7]||0,10,1126891415); c=ii(c,d,a,b,words[i+14]||0,15,-1416354905); b=ii(b,c,d,a,words[i+5]||0,21,-57434055);
    a=ii(a,b,c,d,words[i+12]||0,6,1700485571); d=ii(d,a,b,c,words[i+3]||0,10,-1894986606); c=ii(c,d,a,b,words[i+10]||0,15,-1051523); b=ii(b,c,d,a,words[i+1]||0,21,-2054922799);
    a=ii(a,b,c,d,words[i+8]||0,6,1873313359); d=ii(d,a,b,c,words[i+15]||0,10,-30611744); c=ii(c,d,a,b,words[i+6]||0,15,-1560198380); b=ii(b,c,d,a,words[i+13]||0,21,1309151649);
    a=ii(a,b,c,d,words[i+4]||0,6,-145523070); d=ii(d,a,b,c,words[i+11]||0,10,-1120210379); c=ii(c,d,a,b,words[i+2]||0,15,718787259); b=ii(b,c,d,a,words[i+9]||0,21,-343485551);
    a = add32(a, oa); b = add32(b, ob); c = add32(c, oc); d = add32(d, od);
  }
  return [a,b,c,d].map((n) => Array.from({length:4}, (_, i) => ((n >> (i * 8)) & 255).toString(16).padStart(2,"0")).join("")).join("");
}

function initHashGenerator(root) {
  textTool(root, async (text) => $("#hash-algo", root).value === "MD5" ? md5Text(text) : digestText(text, $("#hash-algo", root).value), { button: "生成する" });
  $(".tool-panel", root).insertAdjacentHTML("afterbegin", `${selectField("hash-algo", "アルゴリズム", ["MD5","SHA-1","SHA-256","SHA-512"].map((value) => ({ value, label: value })), "SHA-256")}<label class="drop-zone"><input type="file" id="hash-file" class="sr-only">ファイルを選択してハッシュ生成</label>`);
  $("#hash-algo", root).addEventListener("change", () => $("#run-tool", root).click());
  $("#hash-file", root).addEventListener("change", async (event) => {
    const file = event.target.files[0]; if (!file) return;
    const algo = $("#hash-algo", root).value;
    if (algo === "MD5") { $("#output-text", root).value = "MD5のファイルハッシュは未対応です。SHA系を選択してください。"; return; }
    const hash = await crypto.subtle.digest(algo, await file.arrayBuffer());
    $("#output-text", root).value = [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  });
}

function initRandomNumber(root) {
  root.innerHTML = `<div class="tool-panel"><div class="inline-controls">${field("min", "最小", "1", "number")}${field("max", "最大", "100", "number")}${field("count", "件数", "10", "number")}${field("decimals", "小数桁", "0", "number")}</div><div class="check-row"><label><input type="checkbox" id="unique">重複なし</label></div>${textareaBlock("output-text", "乱数", "", true)}<div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div></div>`;
  const run = () => {
    const min = Number($("#min", root).value), max = Number($("#max", root).value), count = clampNumber($("#count", root).value, 1, 1000, 10), decimals = clampNumber($("#decimals", root).value, 0, 8, 0);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) { setOutput("output-text", "範囲を確認してください。"); return; }
    if ($("#unique", root).checked && decimals === 0 && count > Math.floor(max - min + 1)) { setOutput("output-text", "重複なしで生成できる件数を超えています。"); return; }
    const values = [], used = new Set();
    let guard = 0;
    while (values.length < count && guard < count * 100) {
      guard += 1;
      const value = decimals === 0 ? String(Math.floor(min + randomInt(Math.floor(max - min + 1)))) : (min + (randomInt(1_000_000) / 999_999) * (max - min)).toFixed(decimals);
      if ($("#unique", root).checked && used.has(value)) continue;
      used.add(value); values.push(value);
    }
    setOutput("output-text", values.join("\n"));
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initImageResize(root) {
  root.innerHTML = `<div class="tool-panel"><label class="drop-zone"><input class="sr-only" id="file-input" type="file" accept="image/*">画像を選択</label><div class="inline-controls">${field("width", "幅", "800", "number")}${field("height", "高さ", "600", "number")}${field("quality", "品質(0.1-1)", "0.9", "number")}${selectField("format", "形式", [{value:"image/png",label:"PNG"},{value:"image/jpeg",label:"JPEG"},{value:"image/webp",label:"WebP"}], "image/webp")}</div><div class="check-row"><label><input type="checkbox" id="keep-ratio" checked>比率固定</label><span id="image-info"></span></div><div class="tool-actions"><button class="btn-primary" id="download-image" type="button">保存</button></div><div class="canvas-wrap"><canvas id="canvas"></canvas></div></div>`;
  let image = null, ratio = 1;
  const draw = () => {
    if (!image) return;
    const canvas = $("#canvas", root), ctx = canvas.getContext("2d");
    canvas.width = Math.max(1, Number($("#width", root).value) || image.width);
    canvas.height = Math.max(1, Number($("#height", root).value) || image.height);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    $("#image-info", root).textContent = `${image.width}x${image.height} → ${canvas.width}x${canvas.height}`;
  };
  $("#file-input", root).addEventListener("change", (event) => {
    const file = event.target.files[0]; if (!file) return;
    image = new Image(); image.onload = () => { ratio = image.width / image.height; $("#width", root).value = image.width; $("#height", root).value = image.height; draw(); };
    image.src = URL.createObjectURL(file);
  });
  $("#width", root).addEventListener("input", () => { if ($("#keep-ratio", root).checked && image) $("#height", root).value = Math.round(Number($("#width", root).value) / ratio); draw(); });
  $("#height", root).addEventListener("input", () => { if ($("#keep-ratio", root).checked && image) $("#width", root).value = Math.round(Number($("#height", root).value) * ratio); draw(); });
  $("#format", root).addEventListener("input", draw);
  $("#download-image", root).addEventListener("click", () => { const ext = $("#format", root).value.split("/")[1]; const link = document.createElement("a"); link.download = `converted-image.${ext}`; link.href = $("#canvas", root).toDataURL($("#format", root).value, clampNumber($("#quality", root).value, .1, 1, .9)); link.click(); });
}

function initColorPickerImage(root) {
  root.innerHTML = `<div class="tool-panel"><label class="drop-zone"><input class="sr-only" id="file-input" type="file" accept="image/*">画像を選択してクリック</label><div class="canvas-wrap"><canvas id="canvas"></canvas></div><div class="stats-grid"><div class="stat-card"><span class="stat-num" id="picked-hex">-</span><span class="stat-label">HEX</span></div><div class="stat-card"><span class="stat-num" id="picked-rgb">-</span><span class="stat-label">RGB</span></div></div><div class="tool-actions"><button class="btn-secondary" id="copy-picked" type="button">色をコピー</button></div><div class="palette" id="picked-history"></div></div>`;
  const canvas = $("#canvas", root), ctx = canvas.getContext("2d"), history = [];
  $("#file-input", root).addEventListener("change", (event) => {
    const file = event.target.files[0]; if (!file) return;
    const image = new Image(); image.onload = () => { canvas.width = image.width; canvas.height = image.height; ctx.drawImage(image,0,0); };
    image.src = URL.createObjectURL(file);
  });
  canvas.addEventListener("click", (event) => {
    if (!canvas.width || !canvas.height) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * canvas.width / rect.width);
    const y = Math.floor((event.clientY - rect.top) * canvas.height / rect.height);
    const [r,g,b] = ctx.getImageData(x,y,1,1).data;
    const hex = rgbToHex(r,g,b);
    $("#picked-hex", root).textContent = hex;
    $("#picked-rgb", root).textContent = `${r}, ${g}, ${b}`;
    history.unshift(hex);
    $("#picked-history", root).innerHTML = history.slice(0, 10).map((color) => `<button style="background:${color}" type="button" data-color="${color}">${color}</button>`).join("");
    $$("[data-color]", root).forEach((button) => button.addEventListener("click", () => copyText(button.dataset.color)));
  });
  $("#copy-picked", root).addEventListener("click", () => copyText($("#picked-hex", root).textContent));
}

function initUuid(root) {
  root.innerHTML = `<div class="tool-panel">
    <p class="tool-note">UUID v4をまとめて生成します。JSONやCSVへ貼り付けやすい形式も選べます。</p>
    <div class="inline-controls">${field("count", "生成数", "5", "number")}${selectField("uuid-format", "出力形式", [{value:"plain",label:"1行ずつ"},{value:"quoted",label:"引用符付き"},{value:"csv",label:"CSV 1行"}], "plain")}</div>
    ${textareaBlock("output-text", "UUID", "", true)}
    <div class="tool-actions"><button class="btn-primary" id="run-tool" type="button">生成する</button></div>
  </div>`;
  const run = () => {
    const count = clampNumber($("#count", root).value, 1, 100, 5);
    const values = Array.from({ length: count }, () => crypto.randomUUID());
    const format = $("#uuid-format", root).value;
    setOutput("output-text", format === "quoted" ? values.map((value) => `"${value}"`).join("\n") : format === "csv" ? values.join(",") : values.join("\n"));
  };
  root.addEventListener("input", run);
  $("#run-tool", root).addEventListener("click", run);
  bindClipboard(root);
  run();
}

function initColorConverter(root) {
  root.innerHTML = `<div class="tool-panel">
    <p class="tool-note">HEX、RGB/RGBA、HSLのどれかを編集すると、他の形式へ即時変換します。</p>
    <div class="inline-controls">${field("hex", "HEX", "#557b65")}${field("rgb", "RGB/RGBA", "85, 123, 101, 1")}${field("hsl", "HSL", "137, 18%, 41%")}</div>
    <div class="color-swatch" id="swatch"></div>
    <div class="tool-actions"><button class="btn-secondary" id="copy-hex" type="button">HEXコピー</button><button class="btn-secondary" id="copy-rgb" type="button">RGBコピー</button></div>
  </div>`;
  const updateFromRgb = (r, g, b, a = 1) => {
    const rr = clampNumber(r, 0, 255, 0), gg = clampNumber(g, 0, 255, 0), bb = clampNumber(b, 0, 255, 0), aa = clampNumber(a, 0, 1, 1);
    const hsl = rgbToHsl(rr, gg, bb);
    $("#hex", root).value = rgbToHex(rr, gg, bb);
    $("#rgb", root).value = `${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)}, ${aa}`;
    $("#hsl", root).value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    $("#swatch", root).style.setProperty("--swatch", `rgba(${rr},${gg},${bb},${aa})`);
  };
  $("#hex", root).addEventListener("input", () => { const rgb = hexToRgb($("#hex", root).value); if (rgb) updateFromRgb(rgb.r, rgb.g, rgb.b); });
  $("#rgb", root).addEventListener("input", () => { const [r,g,b,a=1] = $("#rgb", root).value.match(/\d+(\.\d+)?/g)?.map(Number) || []; if ([r,g,b].every((n) => Number.isFinite(n))) updateFromRgb(r,g,b,a); });
  $("#hsl", root).addEventListener("input", () => { const [h,s,l] = $("#hsl", root).value.match(/\d+(\.\d+)?/g)?.map(Number) || []; if ([h,s,l].every((n) => Number.isFinite(n))) { const rgb = hslToRgb(h,s,l); updateFromRgb(rgb.r,rgb.g,rgb.b); } });
  $("#copy-hex", root).addEventListener("click", () => copyText($("#hex", root).value));
  $("#copy-rgb", root).addEventListener("click", () => copyText($("#rgb", root).value));
  updateFromRgb(85, 123, 101, 1);
}

const handlers = {
  "character-count": initCharacterCount,
  "case-converter": initCaseConverter,
  "text-diff": initTextDiff,
  "markdown-preview": initMarkdownPreview,
  "word-count": initWordCount,
  "lorem-ipsum": initLoremIpsum,
  "base64": initBase64,
  "url-encode": initUrlEncode,
  "html-entity": initHtmlEntity,
  "jwt-decoder": initJwtDecoder,
  "hash-generator": initHashGenerator,
  "yaml-json": initYamlJson,
  "csv-json": initCsvJson,
  "url-params": initUrlParams,
  "color-picker": initColorPicker,
  "color-converter": initColorConverter,
  "contrast-checker": initContrastChecker,
  "palette-generator": initPaletteGenerator,
  "json-formatter": initJsonFormatter,
  "regex-tester": initRegexTester,
  "css-minifier": initCssMinifier,
  "html-minifier": initHtmlMinifier,
  "timestamp-converter": initTimestampConverter,
  "svg-optimizer": initSvgOptimizer,
  "cron-helper": initCronHelper,
  "css-clamp": initCssClamp,
  "og-preview": initOgPreview,
  "unit-length": (root) => initUnit(root, "unit-length"),
  "unit-weight": (root) => initUnit(root, "unit-weight"),
  "unit-temperature": initUnitTemperature,
  "unit-data": initUnitData,
  "number-base": initNumberBase,
  "date-calculator": initDateCalculator,
  "qr-code": initQrCode,
  "password": initPassword,
  "uuid": initUuid,
  "random-number": initRandomNumber,
  "placeholder-image": initPlaceholderImage,
  "image-resize": initImageResize,
  "image-compress": initImageCompress,
  "color-picker-image": initColorPickerImage
};

function initToolPage(id) {
  const root = document.getElementById("tool-root");
  try {
    (handlers[id] || (() => { root.textContent = "このツールは準備中です。"; }))(root);
  } catch (error) {
    root.innerHTML = `<div class="result-panel">初期化エラー: ${escapeHtml(error.message)}</div>`;
    console.error(error);
  }
}
