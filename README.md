# すぐツール

ブラウザだけで動く静的な無料オンラインツール集です。GitHub Pagesにそのまま配置できます。

## 内容

- トップページ: ツール検索、カテゴリフィルタ、動的カード表示
- ツールページ: 40種類
- 共通機能: コピー、貼り付け、保存、AdSense広告枠、構造化データ、sitemap、ads.txt

## GitHub Pages

1. この `web-tools/` ディレクトリをリポジトリルートとして公開します。
2. 独自ドメインがある場合は `build-site.js` の `siteUrl` を置き換えて再生成します。
3. AdSense広告コードは `build-site.js` の `adsenseClient` と `adsenseSlot` で管理します。
4. AdSenseのads.txt確認でルートURLを求められる場合は、ユーザーページ `https://sdev-tools.github.io/ads.txt` 側にも同じads.txtを配置してください。

## ローカル確認

```bash
python -m http.server 8768
```

