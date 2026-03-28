# Vercel デプロイガイド

## 概要

このアプリケーションは Vercel にデプロイされます：
- **フロントエンド**: Vercel Static Hosting
- **API**: Vercel Serverless Functions
- **データベース**: Firebase Firestore

---

## デプロイ手順

### Step 1: Vercel にサインアップ

1. https://vercel.com にアクセス
2. GitHub アカウントでサインアップ / ログイン

### Step 2: GitHub リポジトリを接続

1. Vercel ダッシュボード → **Add New** → **Project**
2. **Import Git Repository** → `blog-article` を選択
3. **Root Directory**: `inventory-management-tool` を設定

### Step 3: 環境変数を設定

Vercel の **Environment Variables** セクションで以下を追加：

```
FIREBASE_TYPE = service_account
FIREBASE_PROJECT_ID = pdca-tool
FIREBASE_PRIVATE_KEY_ID = 7fada20038ad2dc1639997a60909619a5ebb92c2
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@pdca-tool.iam.gserviceaccount.com
FIREBASE_CLIENT_ID = 118258951157648264255
FIREBASE_AUTH_URI = https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI = https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL = https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pdca-tool.iam.gserviceaccount.com
MOCK_MODE = false
```

**重要**: 秘密鍵（`FIREBASE_PRIVATE_KEY`）は改行が必要な場合があります。Vercel は自動的に処理します。

### Step 4: デプロイ

1. **Deploy** ボタンをクリック
2. デプロイが完了するまで待機（3-5 分）
3. デプロイ完了後、**Visit** でライブサイトを確認

---

## デプロイ後の確認

### スマホからのアクセス

```
https://[PROJECT-NAME].vercel.app
```

例:
```
https://inventory-management-tool.vercel.app
```

### API の動作確認

```bash
# ヘルスチェック
curl https://[PROJECT-NAME].vercel.app/health

# 商品一覧
curl https://[PROJECT-NAME].vercel.app/api/products
```

---

## ローカル開発

### フロントエンド のみ開発

```bash
cd frontend
npm start
# http://localhost:3000
```

### バックエンド のみ開発（Firebase 本番環境）

```bash
cd backend
npm start
# http://localhost:5000
```

### フルスタック開発（Mock モード）

```bash
# .env を修正
cd backend
echo "MOCK_MODE=true" > .env
npm start
```

---

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドログを確認**
   - Vercel ダッシュボード → Deployments → ログを確認

2. **環境変数を確認**
   - `FIREBASE_PRIVATE_KEY` が正しくエスケープされているか確認
   - 改行は `\n` として設定

3. **Node.js バージョンを確認**
   - Vercel の設定で Node.js 18+ を指定

### API エラーが出る場合

1. **Firebase クレデンシャルを確認**
   ```bash
   curl https://[PROJECT-NAME].vercel.app/api/status
   ```

2. **Firestore セキュリティルールを確認**
   - Firebase Console → Firestore → ルール
   - テスト モードが有効か確認

---

## 本番環境セキュリティ

### 推奨事項

1. **Firestore セキュリティルールを設定**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false; // デフォルトは拒否
       }
       match /products/{document=**} {
         allow read: if true;
         allow write: if false; // 管理画面から API 経由のみ
       }
     }
   }
   ```

2. **認証を追加**（将来的に Firebase Authentication を統合）

3. **レート制限を設定**
   - API Gateway または Vercel Middleware で設定

---

## 参考リンク

- [Vercel ドキュメント](https://vercel.com/docs)
- [Firebase 本番環境チェックリスト](https://firebase.google.com/docs/projects/learn-more#best_practices)
