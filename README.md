# すぐツール

ブラウザだけで動く静的な無料オンラインツール集です。GitHub Pagesにそのまま配置できます。

## 内容

- トップページ: ツール検索、カテゴリフィルタ、動的カード表示
- ツールページ: 40種類
- 共通機能: コピー、貼り付け、保存、AdSenseプレースホルダー、構造化データ、sitemap

## GitHub Pages

1. この `web-tools/` ディレクトリをリポジトリルートとして公開します。
2. 独自ドメインがある場合は `build-site.js` の `siteUrl` を置き換えて再生成します。
3. AdSense承認後、`assets/css/ads.css` の枠に合わせて各HTML内の広告コメントを `ins.adsbygoogle` に差し替えます。

## ローカル確認

```bash
python -m http.server 8768
```

