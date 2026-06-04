const CATEGORIES = [
  {
    "id": "text",
    "name": "テキスト",
    "icon": "字",
    "color": "#3e6671"
  },
  {
    "id": "encode",
    "name": "エンコード",
    "icon": "符",
    "color": "#2f776f"
  },
  {
    "id": "color",
    "name": "カラー",
    "icon": "#",
    "color": "#bd7a2a"
  },
  {
    "id": "developer",
    "name": "開発者",
    "icon": "{ }",
    "color": "#4f6f52"
  },
  {
    "id": "converter",
    "name": "単位変換",
    "icon": "⇄",
    "color": "#8a6f45"
  },
  {
    "id": "generator",
    "name": "生成",
    "icon": "＋",
    "color": "#6b6259"
  },
  {
    "id": "image",
    "name": "画像",
    "icon": "□",
    "color": "#526f77"
  }
];
const TOOL_REGISTRY = [
  {
    "id": "character-count",
    "category": "text",
    "icon": "字",
    "name": "文字数・単語数カウント",
    "description": "文字数、単語数、行数、文数、読了時間、原稿用紙換算をリアルタイムに確認できます。",
    "tags": [
      "文字数",
      "単語数",
      "行数",
      "読了時間"
    ],
    "popular": true,
    "url": "tools/text/character-count.html"
  },
  {
    "id": "case-converter",
    "category": "text",
    "icon": "Aa",
    "name": "大文字・小文字変換",
    "description": "英文や識別子を大文字、小文字、タイトルケース、camelCaseなどに変換します。",
    "tags": [
      "大文字",
      "小文字",
      "camelCase"
    ],
    "url": "tools/text/case-converter.html"
  },
  {
    "id": "text-diff",
    "category": "text",
    "icon": "Δ",
    "name": "テキスト差分チェック",
    "description": "2つのテキストを行単位と単語単位で比較し、追加・削除・変更を見やすく表示します。",
    "tags": [
      "差分",
      "比較",
      "diff"
    ],
    "url": "tools/text/text-diff.html"
  },
  {
    "id": "markdown-preview",
    "category": "text",
    "icon": "MD",
    "name": "Markdownプレビュー",
    "description": "Markdownを安全にHTMLプレビューし、見出しやリストの確認に使えます。",
    "tags": [
      "Markdown",
      "HTML",
      "プレビュー"
    ],
    "external": [
      "marked"
    ],
    "url": "tools/text/markdown-preview.html"
  },
  {
    "id": "lorem-ipsum",
    "category": "text",
    "icon": "文",
    "name": "ダミーテキスト生成",
    "description": "日本語または英語のダミーテキストを段落数、文数、目標文字数に合わせて生成します。",
    "tags": [
      "Lorem ipsum",
      "ダミー",
      "文章生成"
    ],
    "url": "tools/text/lorem-ipsum.html"
  },
  {
    "id": "base64",
    "category": "encode",
    "icon": "64",
    "name": "Base64エンコード・デコード",
    "description": "テキストやファイルをBase64に変換し、Base64文字列やData URIを復元します。",
    "tags": [
      "Base64",
      "エンコード",
      "デコード"
    ],
    "popular": true,
    "url": "tools/encode/base64.html"
  },
  {
    "id": "url-encode",
    "category": "encode",
    "icon": "%",
    "name": "URLエンコード・デコード",
    "description": "URLパラメータ向けに文字列を安全にエンコード・デコードします。",
    "tags": [
      "URL",
      "encodeURIComponent",
      "パラメータ"
    ],
    "url": "tools/encode/url-encode.html"
  },
  {
    "id": "html-entity",
    "category": "encode",
    "icon": "&",
    "name": "HTMLエンティティ変換",
    "description": "HTML特殊文字や数値参照をエスケープし、エンティティ文字列を元に戻します。",
    "tags": [
      "HTML",
      "エスケープ",
      "エンティティ"
    ],
    "url": "tools/encode/html-entity.html"
  },
  {
    "id": "jwt-decoder",
    "category": "encode",
    "icon": "JWT",
    "name": "JWTデコーダー",
    "description": "JWTをヘッダー、ペイロード、署名に分解し、日時クレームも読みやすく表示します。",
    "tags": [
      "JWT",
      "JSON",
      "token"
    ],
    "url": "tools/encode/jwt-decoder.html"
  },
  {
    "id": "hash-generator",
    "category": "encode",
    "icon": "#=",
    "name": "ハッシュ生成",
    "description": "テキストやファイルからMD5、SHA-1、SHA-256、SHA-512のハッシュ値を生成します。",
    "tags": [
      "MD5",
      "SHA-256",
      "SHA-512",
      "ハッシュ"
    ],
    "url": "tools/encode/hash-generator.html"
  },
  {
    "id": "yaml-json",
    "category": "encode",
    "icon": "YJ",
    "name": "YAML ⇄ JSON変換",
    "description": "シンプルなYAMLとJSONを相互変換し、設定ファイルの下書きを整えます。",
    "tags": [
      "YAML",
      "JSON",
      "変換"
    ],
    "url": "tools/encode/yaml-json.html"
  },
  {
    "id": "csv-json",
    "category": "encode",
    "icon": "CSV",
    "name": "CSV ⇄ JSON変換",
    "description": "CSVをJSON配列へ変換し、JSON配列からCSVも生成できます。",
    "tags": [
      "CSV",
      "JSON",
      "表"
    ],
    "url": "tools/encode/csv-json.html"
  },
  {
    "id": "url-params",
    "category": "encode",
    "icon": "URL",
    "name": "URLパラメータ解析",
    "description": "URLのクエリパラメータを表形式で確認し、編集後のURLを生成できます。",
    "tags": [
      "URL",
      "query",
      "パラメータ"
    ],
    "url": "tools/encode/url-params.html"
  },
  {
    "id": "color-picker",
    "category": "color",
    "icon": "●",
    "name": "カラーピッカー",
    "description": "色を選択してHEX、RGB、HSLを即座に確認し、コピーできます。",
    "tags": [
      "色",
      "HEX",
      "RGB"
    ],
    "external": [
      "iro"
    ],
    "url": "tools/color/color-picker.html"
  },
  {
    "id": "color-converter",
    "category": "color",
    "icon": "#",
    "name": "カラーコード変換",
    "description": "HEX、RGB、HSL、RGBAのカラーコードを相互変換します。",
    "tags": [
      "HEX",
      "RGB",
      "HSL",
      "RGBA"
    ],
    "popular": true,
    "url": "tools/color/color-converter.html"
  },
  {
    "id": "contrast-checker",
    "category": "color",
    "icon": "AA",
    "name": "コントラスト比チェック",
    "description": "文字色と背景色のWCAGコントラスト比、AA/AAA判定、サンプル表示を確認します。",
    "tags": [
      "WCAG",
      "アクセシビリティ",
      "コントラスト"
    ],
    "url": "tools/color/contrast-checker.html"
  },
  {
    "id": "palette-generator",
    "category": "color",
    "icon": "▦",
    "name": "カラーパレット生成",
    "description": "ベースカラーから配色を生成し、PNG画像として保存できます。",
    "tags": [
      "配色",
      "パレット",
      "画像化",
      "デザイン"
    ],
    "url": "tools/color/palette-generator.html"
  },
  {
    "id": "json-formatter",
    "category": "developer",
    "icon": "{ }",
    "name": "JSONフォーマッター",
    "description": "JSONを整形、圧縮、検証し、構文エラー位置と行番号を確認できます。",
    "tags": [
      "JSON",
      "整形",
      "minify"
    ],
    "popular": true,
    "url": "tools/developer/json-formatter.html"
  },
  {
    "id": "regex-tester",
    "category": "developer",
    "icon": ".*",
    "name": "正規表現テスター",
    "description": "正規表現のマッチ、キャプチャ、置換結果をリアルタイムで確認できます。",
    "tags": [
      "Regex",
      "正規表現",
      "match",
      "replace"
    ],
    "url": "tools/developer/regex-tester.html"
  },
  {
    "id": "css-minifier",
    "category": "developer",
    "icon": "CSS",
    "name": "CSS圧縮",
    "description": "CSSのコメント、余分な空白、改行を取り除いて軽量化します。",
    "tags": [
      "CSS",
      "minify",
      "圧縮"
    ],
    "url": "tools/developer/css-minifier.html"
  },
  {
    "id": "html-minifier",
    "category": "developer",
    "icon": "HTML",
    "name": "HTML圧縮",
    "description": "HTMLのコメントと不要な空白を、preやtextareaを保護しながら減らします。",
    "tags": [
      "HTML",
      "minify",
      "圧縮"
    ],
    "url": "tools/developer/html-minifier.html"
  },
  {
    "id": "timestamp-converter",
    "category": "developer",
    "icon": "時",
    "name": "Unixタイムスタンプ変換",
    "description": "Unix秒・ミリ秒と日時を相互変換し、UTC/JST/ISO表示も確認できます。",
    "tags": [
      "Unix",
      "timestamp",
      "日時"
    ],
    "url": "tools/developer/timestamp-converter.html"
  },
  {
    "id": "svg-optimizer",
    "category": "developer",
    "icon": "SVG",
    "name": "SVG最適化・プレビュー",
    "description": "SVGの不要なコメントや空白を減らし、プレビューとサイズ削減率を確認できます。",
    "tags": [
      "SVG",
      "最適化",
      "プレビュー"
    ],
    "url": "tools/developer/svg-optimizer.html"
  },
  {
    "id": "cron-helper",
    "category": "developer",
    "icon": "CRON",
    "name": "Cron式ヘルパー",
    "description": "Cron式の説明と直近の実行予定を簡易確認できます。",
    "tags": [
      "Cron",
      "スケジュール",
      "日時"
    ],
    "url": "tools/developer/cron-helper.html"
  },
  {
    "id": "css-clamp",
    "category": "developer",
    "icon": "clamp",
    "name": "CSS clamp計算",
    "description": "最小/最大サイズと画面幅からレスポンシブなclamp()を生成します。",
    "tags": [
      "CSS",
      "clamp",
      "レスポンシブ"
    ],
    "url": "tools/developer/css-clamp.html"
  },
  {
    "id": "og-preview",
    "category": "developer",
    "icon": "OG",
    "name": "OG/metaタグプレビュー",
    "description": "タイトル、説明、画像URLからSNSカード風の見え方とmetaタグを作ります。",
    "tags": [
      "OGP",
      "meta",
      "SEO"
    ],
    "url": "tools/developer/og-preview.html"
  },
  {
    "id": "unit-length",
    "category": "converter",
    "icon": "m",
    "name": "長さの単位変換",
    "description": "mm、cm、m、km、inch、feet、yard、mileを相互変換します。",
    "tags": [
      "長さ",
      "メートル",
      "インチ"
    ],
    "url": "tools/converter/unit-length.html"
  },
  {
    "id": "unit-weight",
    "category": "converter",
    "icon": "kg",
    "name": "重さの単位変換",
    "description": "mg、g、kg、t、oz、lb、caratを相互変換します。",
    "tags": [
      "重さ",
      "kg",
      "lb"
    ],
    "url": "tools/converter/unit-weight.html"
  },
  {
    "id": "unit-temperature",
    "category": "converter",
    "icon": "℃",
    "name": "温度変換",
    "description": "摂氏、華氏、ケルビンをリアルタイムに相互変換します。",
    "tags": [
      "摂氏",
      "華氏",
      "ケルビン"
    ],
    "url": "tools/converter/unit-temperature.html"
  },
  {
    "id": "unit-data",
    "category": "converter",
    "icon": "GB",
    "name": "データ容量変換",
    "description": "bit、Byte、KB、MB、GB、TBを1000/1024基準で相互変換します。",
    "tags": [
      "容量",
      "Byte",
      "GB",
      "KiB"
    ],
    "url": "tools/converter/unit-data.html"
  },
  {
    "id": "number-base",
    "category": "converter",
    "icon": "2/16",
    "name": "進数変換",
    "description": "2進数、8進数、10進数、16進数を同時に変換し、接頭辞や負数にも対応します。",
    "tags": [
      "2進数",
      "16進数",
      "基数"
    ],
    "url": "tools/converter/number-base.html"
  },
  {
    "id": "date-calculator",
    "category": "converter",
    "icon": "日",
    "name": "日付差分・営業日計算",
    "description": "2つの日付の差分、加算日、土日を除いた営業日数を計算します。",
    "tags": [
      "日付",
      "営業日",
      "差分"
    ],
    "url": "tools/converter/date-calculator.html"
  },
  {
    "id": "qr-code",
    "category": "generator",
    "icon": "QR",
    "name": "QRコード生成",
    "description": "URL、メール、電話、Wi-FiなどからQRコードを生成し、PNGとして保存できます。",
    "tags": [
      "QRコード",
      "URL",
      "WiFi",
      "生成"
    ],
    "external": [
      "qrcode"
    ],
    "popular": true,
    "url": "tools/generator/qr-code.html"
  },
  {
    "id": "password",
    "category": "generator",
    "icon": "鍵",
    "name": "パスワード生成",
    "description": "crypto.getRandomValuesで強いパスワードを生成し、強度や曖昧文字除外も確認できます。",
    "tags": [
      "パスワード",
      "ランダム",
      "セキュリティ"
    ],
    "url": "tools/generator/password.html"
  },
  {
    "id": "uuid",
    "category": "generator",
    "icon": "ID",
    "name": "UUID生成",
    "description": "UUID v4を複数件生成し、引用符やカンマ付きでも出力できます。",
    "tags": [
      "UUID",
      "v4",
      "randomUUID"
    ],
    "url": "tools/generator/uuid.html"
  },
  {
    "id": "random-number",
    "category": "generator",
    "icon": "乱",
    "name": "乱数生成",
    "description": "範囲、件数、整数・小数、重複可否を指定して安全に乱数を生成します。",
    "tags": [
      "乱数",
      "ランダム",
      "抽選"
    ],
    "url": "tools/generator/random-number.html"
  },
  {
    "id": "placeholder-image",
    "category": "generator",
    "icon": "□＋",
    "name": "プレースホルダー画像生成",
    "description": "指定サイズ、背景色、文字入りの仮画像をCanvasで生成します。",
    "tags": [
      "画像",
      "プレースホルダー",
      "Canvas"
    ],
    "url": "tools/generator/placeholder-image.html"
  },
  {
    "id": "image-resize",
    "category": "image",
    "icon": "拡縮",
    "name": "画像リサイズ・変換",
    "description": "画像を読み込み、比率固定や品質指定でPNG/JPEG/WebPへ変換保存できます。",
    "tags": [
      "画像",
      "リサイズ",
      "WebP",
      "Canvas"
    ],
    "url": "tools/image/image-resize.html"
  },
  {
    "id": "image-compress",
    "category": "image",
    "icon": "圧縮",
    "name": "画像圧縮・WebP変換",
    "description": "JPEG/WebP品質を調整して画像容量を軽くし、変換後サイズを確認できます。",
    "tags": [
      "画像",
      "圧縮",
      "WebP"
    ],
    "url": "tools/image/image-compress.html"
  },
  {
    "id": "color-picker-image",
    "category": "image",
    "icon": "滴",
    "name": "画像からカラー抽出",
    "description": "画像を読み込んでクリックしたピクセルのHEX/RGB値を抽出し、履歴に保存します。",
    "tags": [
      "画像",
      "色抽出",
      "スポイト"
    ],
    "url": "tools/image/color-picker-image.html"
  }
];
