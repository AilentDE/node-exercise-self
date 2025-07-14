# Hello Cloudflare Worker

這是一個基本的 Cloudflare Workers 專案，使用 TypeScript 開發。

## 安裝

```bash
npm install
```

## 開發

啟動本地開發伺服器：

```bash
npm run dev
```

這會在 `http://localhost:8787` 啟動開發伺服器。

## 部署

部署到 Cloudflare Workers：

```bash
# 部署到預設環境
npm run deploy

# 部署到 staging 環境
npm run deploy:staging

# 部署到 production 環境
npm run deploy:production
```

## 類型檢查

執行 TypeScript 類型檢查：

```bash
npm run type-check
```

## 專案結構

```
src/
  └── index.ts          # 主要的 Worker 檔案
wrangler.toml           # Wrangler 設定檔案
tsconfig.json           # TypeScript 設定檔案
package.json            # 專案依賴和腳本
```

## API 端點

- `GET /` - 顯示歡迎訊息
- `GET /api/hello` - 回傳 JSON 格式的問候訊息

## 環境變數

在 `src/index.ts` 中的 `Env` 介面定義您的環境變數。
