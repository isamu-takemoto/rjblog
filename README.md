# takeisa.dev

個人技術ブログ。Astro + Keystatic CMS で構築。

## 技術スタック

- [Astro](https://astro.build/) v5 — SSR モード
- [Keystatic](https://keystatic.com/) — ローカルファイルベース CMS
- [Tailwind CSS](https://tailwindcss.com/) v4
- [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/) — サーバーアダプター
- デプロイ: [Vercel](https://vercel.com/)

## プロジェクト構成

```
├── src/
│   ├── components/        # Astro/React コンポーネント
│   ├── content/
│   │   └── blog/          # 記事ファイル (.mdx)
│   ├── layouts/           # ページレイアウト
│   ├── pages/             # ルーティング
│   ├── styles/            # グローバル CSS
│   ├── content.config.ts  # Content Collections スキーマ
│   └── middleware.ts      # /keystatic の Basic 認証
├── keystatic.config.ts    # Keystatic CMS 設定
├── astro.config.mjs
└── .env                   # 環境変数（Git 管理外）
```

## 記事の書き方

記事は `src/content/blog/{slug}.mdx` に配置する。

```yaml
---
slug: my-article
title: 記事タイトル
description: 説明文
pubDate: "2026-01-01"
tags:
  - Astro
---

本文をここに書く
```

**CMS を使う場合：** `npm run dev` 後に `http://localhost:4321/keystatic` にアクセス。

## 環境変数

`.env` ファイルをプロジェクトルートに作成する（Git 管理外）。

```
CMS_USER=admin
CMS_PASSWORD=（任意のパスワード）
```

本番（Vercel）では Environment Variables に同じキーを設定する。

## コマンド

| コマンド | 内容 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動 (`localhost:4321`) |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルドのプレビュー |
