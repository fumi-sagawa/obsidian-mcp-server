# E2E テスト自動化ガイド

このドキュメントでは、Playwright を使用した MCP Inspector の自動 E2E テストについて説明します。

## 概要

E2E テストは MCP Inspector を通じて Weather MCP Server の全機能を自動的にテストします。これにより、手動テストの工数を削減し、リグレッションを防ぐことができます。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
npm run playwright:install
```

### 2. ディレクトリ構造

```
e2e/
├── fixtures/
│   └── mcp-inspector-page.ts    # MCP Inspector 操作用のページオブジェクト
├── tests/
│   ├── get-alerts.spec.ts       # 気象警報取得のテスト
│   ├── get-forecast.spec.ts     # 天気予報取得のテスト
│   ├── health-check.spec.ts     # ヘルスチェックのテスト
│   └── error-handling.spec.ts   # エラーハンドリングのテスト
└── screenshots/                  # スクリーンショット保存先（自動生成）
```

## テストの実行

### 基本的な実行方法

```bash
# すべての E2E テストを実行
npm run test:e2e

# UI モードで実行（インタラクティブ）
npm run test:e2e:ui

# デバッグモードで実行
npm run test:e2e:debug

# ブラウザを表示して実行
npm run test:e2e:headed
```

### 特定のテストファイルを実行

```bash
# 気象警報のテストのみ実行
npx playwright test e2e/tests/get-alerts.spec.ts

# 特定のテストケースのみ実行
npx playwright test -g "正常系: カリフォルニア州の警報を取得できる"
```

## テストの構造

### Page Object Pattern

`MCPInspectorPage` クラスを使用して、MCP Inspector の操作を抽象化しています：

```typescript
// ツールの選択
await inspector.selectTool('get-alerts');

// パラメータの設定
await inspector.setParameters({ state: 'CA' });

// リクエストの送信
await inspector.sendRequest();

// レスポンスの待機
await inspector.waitForResponse();

// レスポンスの取得
const responseText = await inspector.getResponseText();

// エラーチェック
const hasError = await inspector.checkForError();
```

### テストケースの例

```typescript
test('正常系: カリフォルニア州の警報を取得できる', async ({ page }) => {
  const inspector = new MCPInspectorPage(page);
  await page.goto('/');
  await inspector.waitForLoad();
  
  await inspector.selectTool('get-alerts');
  await inspector.setParameters({ state: 'CA' });
  await inspector.sendRequest();
  await inspector.waitForResponse();
  
  const responseText = await inspector.getResponseText();
  expect(responseText).toContain('California');
  
  const hasError = await inspector.checkForError();
  expect(hasError).toBe(false);
});
```

## テストカバレッジ

### 機能テスト
- ✅ 気象警報取得（get-alerts）
  - 正常系: 有効な州コード
  - 正常系: 警報がない州
  - エラー系: 無効な州コード
  - エラー系: パラメータ不足

- ✅ 天気予報取得（get-forecast）
  - 正常系: 主要都市の座標
  - 境界値: 最北端・最南端の座標
  - エラー系: 無効な緯度・経度
  - エラー系: 型の不一致

- ✅ ヘルスチェック（health-check）
  - 正常系: システム状態の確認
  - レスポンス構造の検証

### 非機能テスト
- ✅ エラーハンドリング
  - 不正な JSON 形式
  - 異常な値の入力
  - 連続リクエスト

## デバッグとトラブルシューティング

### スクリーンショットの確認

テスト失敗時は自動的にスクリーンショットが保存されます：

```bash
# スクリーンショットの場所
e2e/screenshots/
playwright-report/
```

### ログの確認

```bash
# 詳細なログを表示してテスト実行
DEBUG=pw:api npm run test:e2e
```

### よくある問題

1. **MCP Inspector が起動しない**
   - ポート 5173 が使用されていないか確認
   - `npm run inspector` が正常に動作するか確認

2. **タイムアウトエラー**
   - `playwright.config.ts` でタイムアウト設定を調整
   - ネットワーク接続を確認

3. **要素が見つからない**
   - MCP Inspector の UI が変更されていないか確認
   - セレクターを更新する必要がある場合がある

## CI/CD 統合

### GitHub Actions の例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## ベストプラクティス

1. **テストの独立性**
   - 各テストは独立して実行可能にする
   - テスト間で状態を共有しない

2. **待機戦略**
   - 固定の `waitForTimeout` より `waitForSelector` を使用
   - ネットワークアイドルを適切に待つ

3. **アサーション**
   - 複数の観点から検証する
   - エラーケースも必ずテストする

4. **メンテナンス**
   - Page Object を使用して変更に強い構造にする
   - セレクターは可能な限り安定したものを使用

## 拡張方法

### 新しいテストケースの追加

1. `e2e/tests/` に新しいテストファイルを作成
2. `MCPInspectorPage` を使用して操作を記述
3. 適切なアサーションを追加

### 新しいツールのテスト追加

```typescript
test('新機能: 新しいツールのテスト', async ({ page }) => {
  const inspector = new MCPInspectorPage(page);
  await page.goto('/');
  await inspector.waitForLoad();
  
  await inspector.selectTool('new-tool-name');
  await inspector.setParameters({ /* パラメータ */ });
  await inspector.sendRequest();
  await inspector.waitForResponse();
  
  // アサーションを追加
});
```