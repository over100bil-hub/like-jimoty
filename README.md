# Machi-Chika - 地域のマーケットプレイス

Airbnb 風 UI のクラシファイドサービス（Next.js 14 + Supabase）

## 機能一覧

- 認証 (Supabase Auth + メール確認案内)
- 投稿: 出品 / 編集 / 取引終了 / 削除（deal_type: 売る/あげる/求む）
- 画像: 最大 8 枚 / 1 枚 5MB / 自動 WebP 変換 + 1600px リサイズ
- 検索: キーワード / カテゴリ / エリア / 取引タイプ / 価格帯
- お気に入り (favorites テーブル)
- アプリ内メッセージ (Supabase Realtime)
- プロフィール編集 (アバター / 自己紹介 / エリア)
- 管理者ダッシュボード (/admin) — 概要 / 投稿管理 / ユーザー管理 / お問い合わせ
- OGP / Twitter Card / 構造化メタタグ
- モバイルファーストレスポンシブ
- RLS (Row Level Security) 全テーブル
- Storage バケット public 設定済み (post-images / avatars)

## ローカル開発

```bash
cp .env.example .env.local  # キーを設定
npm install
npm run dev
```

`http://localhost:3000` でアクセス。

## ビルド

```bash
npm run build
npm run start
```

## 管理者ユーザーの設定

Supabase ダッシュボードで対象ユーザーの profiles レコードを更新：

```sql
UPDATE profiles SET is_admin = true WHERE id = '<user-uuid>';
```

## Railway デプロイ手順

> **重要**: 既存プロジェクトには触らず、新規 Railway プロジェクトを作成してください。

### 1. 新規プロジェクト作成

1. https://railway.app にログイン
2. **New Project** → **Deploy from GitHub repo** を選択
3. このリポジトリ（クラシファイド）を選択

### 2. 環境変数設定

Railway プロジェクトの **Variables** タブで以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://jjfddcngrewyxfycffrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<.env.local の値>
NODE_ENV=production
```

### 3. ビルド設定

`railway.json` が既に同梱されているので自動認識。
- Builder: NIXPACKS
- Build: `npm ci && npm run build`
- Start: `npm run start`

### 4. ドメイン設定

**Settings** → **Networking** → **Generate Domain** で公開 URL を発行。
独自ドメインを設定する場合は **Custom Domain** から追加。

### 5. Supabase 側の設定

Supabase ダッシュボード → **Authentication** → **URL Configuration**：
- Site URL: Railway のドメイン
- Redirect URLs: `https://<railway-domain>/auth/callback`

### 6. 動作確認

- [ ] トップページが表示される
- [ ] 新規登録 → メール確認 → ログイン
- [ ] 出品 → 画像アップロード → 詳細表示
- [ ] お気に入り追加 / 解除
- [ ] メッセージ送信 / Realtime 受信
- [ ] 管理者ダッシュボード /admin
- [ ] OGP プレビュー (例: https://www.opengraph.xyz/)

## DB スキーマ

主要テーブル:

| テーブル | 用途 |
|---|---|
| profiles | ユーザー情報 (is_admin フラグ含む) |
| posts | 投稿 (status, deal_type, condition) |
| categories | カテゴリ |
| prefectures | 都道府県 |
| favorites | お気に入り |
| conversations | メッセージスレッド |
| messages | メッセージ本体 (Realtime 配信) |
| contact_inquiries | サイトお問い合わせ |

トリガー:
- `on_auth_user_created`: signup 時に profiles を自動作成
- `trg_bump_conv`: messages INSERT で conversations.last_message_at 更新

RPC:
- `increment_view_count(post_id)`: 詳細閲覧時の view_count++

Storage:
- `post-images` (public, 5MB)
- `avatars` (public, 2MB)

## ディレクトリ構成

```
src/
├ app/
│  ├ page.tsx              # トップ (検索 + グリッド)
│  ├ layout.tsx            # 共通レイアウト
│  ├ auth/                 # signup / login / callback
│  ├ posts/[id]/           # 詳細 / 編集
│  ├ posts/new/            # 出品フォーム
│  ├ mypage/               # 自分の投稿管理
│  ├ favorites/            # お気に入り一覧
│  ├ messages/             # 一覧 + スレッド
│  ├ profile/edit/         # プロフィール編集
│  ├ admin/                # 管理者ダッシュボード
│  ├ contact / about / terms / privacy
├ components/
│  ├ Header.tsx, Footer.tsx
│  ├ CategoryTabs.tsx, FilterChips.tsx
│  ├ PostCard.tsx, PostForm.tsx
│  └ FavoriteButton.tsx
├ lib/
│  ├ supabase/{client,server,middleware}.ts
│  └ utils.ts
└ types/index.ts
```

## デザインシステム

- アクセントカラー: `#FF385C` (Airbnb Red)
- 角丸: card 16px / pill 9999px
- タイポ: Circular / Inter / Hiragino Sans 系
- シャドウ: `0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)`
