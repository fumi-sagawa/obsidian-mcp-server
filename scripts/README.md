# スクリプトディレクトリ

このディレクトリには、開発とメンテナンスに使用する各種スクリプトが含まれています。

## inspector-wrapper.js

MCP Inspectorの起動を管理するラッパースクリプトです。

### 機能
- ポートの使用状況を自動的にチェック
- 使用中のポートを自動的に解放
- ビルドを自動実行
- エラーハンドリングとクリーンアップ

### 使用方法
```bash
npm run inspector       # 通常起動
npm run inspector:debug # デバッグモードで起動
```

## kill-inspector-ports.sh

MCP Inspectorが使用するポートを手動で解放するスクリプトです。

### 使用方法
```bash
npm run inspector:clean
# または
./scripts/kill-inspector-ports.sh
```

### 対象ポート
- 6274: MCP Inspector UI
- 6277: プロキシサーバー

## health-check.js

サーバーのヘルスチェックを実行するスタンドアロンスクリプトです。

### 使用方法
```bash
npm run health-check
```

## metrics-dashboard.js

メトリクスダッシュボードを表示するスクリプトです。

### 使用方法
```bash
npm run metrics        # 一回実行
npm run metrics:watch  # 監視モード
```