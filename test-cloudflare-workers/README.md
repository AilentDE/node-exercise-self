# Cloudflare Workers 專案管理工具

這是一個用於管理多個 Cloudflare Workers 專案的工具。

## 專案結構

```
test-cloudflare-workers/
├── hello/                 # Hello Worker 專案
│   ├── src/
│   │   └── index.ts      # Worker 主要檔案
│   ├── package.json      # Hello 專案依賴
│   ├── wrangler.toml     # Hello 專案設定
│   ├── tsconfig.json     # TypeScript 設定
│   └── README.md         # Hello 專案說明
├── basic-sample/          # 基本範例專案
├── package.json          # 管理工具依賴
└── README.md             # 本檔案
```

## 管理指令

### 建立新專案

```bash
# 使用 wrangler init 建立新專案
npm run init

# 初始化 hello 專案依賴
npm run init:hello
```

### 開發

```bash
# 啟動 hello 專案開發伺服器
npm run dev:hello
```

### 部署

```bash
# 部署 hello 專案
npm run deploy:hello
```

### 類型檢查

```bash
# 檢查 hello 專案類型
npm run type-check:hello
```

## 新增專案

1. 使用 `npm run init` 建立新專案
2. 將新專案移動到對應的資料夾
3. 在根目錄的 `package.json` 中新增管理腳本

## 各專案說明

### hello/

- 基本的 Cloudflare Worker 專案
- 提供 `/` 和 `/api/hello` 端點
- 使用 TypeScript 開發

### basic-sample/

- 基本範例專案（已存在）
- 包含任務管理功能
- 提供完整的 CRUD 操作

## 快速開始

1. 安裝管理工具依賴：

   ```bash
   npm install
   ```

2. 初始化 hello 專案：

   ```bash
   npm run init:hello
   ```

3. 啟動開發伺服器：

   ```bash
   npm run dev:hello
   ```

4. 部署到 Cloudflare：
   ```bash
   npm run deploy:hello
   ```
