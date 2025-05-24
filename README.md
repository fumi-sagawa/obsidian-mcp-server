# Obsidian MCP Server

Model Context Protocol (MCP) を使用して、Obsidian Local REST API と統合するサーバーです。AIアシスタントやその他のアプリケーションからObsidianのノート管理機能を利用できるようになります。

## 機能

- **ファイル操作**: Obsidian内のファイルの作成、読み取り、更新、削除
- **アクティブファイル管理**: 現在開いているファイルの操作
- **検索機能**: ノートの簡易検索と詳細検索
- **コマンド実行**: Obsidianコマンドの一覧表示と実行
- **定期ノート**: 日次・週次・月次・年次ノートの管理
- **MCP統合**: MCP互換のAIアシスタントとシームレスに統合

## 前提条件

- Obsidianがインストールされていること
- Local REST APIプラグインがインストール・有効化されていること
- APIキーが設定されていること

## インストール

```bash
npm install
npm run build
```

## 設定

環境変数で以下を設定してください：

```bash
# 必須
export OBSIDIAN_API_KEY="your-api-key-here"

# オプション
export OBSIDIAN_API_URL="http://127.0.0.1:27123"  # デフォルト
export OBSIDIAN_HTTPS_CERT="/path/to/cert.pem"    # HTTPS使用時
```

## 使用方法

このサーバーはMCPプロトコルを実装しており、MCP互換のクライアントで使用できます。

### 利用可能なツール（実装予定）

#### 基本的なファイル操作
- `get_server_status` - サーバー状態の取得
- `get_file` - ファイル内容の取得
- `create_or_update_file` - ファイルの作成・更新
- `delete_file` - ファイルの削除
- `list_vault_files` - ファイル一覧の取得

#### アクティブファイル操作
- `get_active_file` - アクティブファイルの取得
- `update_active_file` - アクティブファイルの更新
- `append_to_active_file` - アクティブファイルへの追記

#### 検索機能
- `simple_search` - テキストベースの簡易検索
- `search_notes` - 詳細な検索機能

## アーキテクチャ

このプロジェクトは、スケーラブルなアーキテクチャのために [Feature-Sliced Design (FSD)](https://feature-sliced.design/) の原則に従っています。

### プロジェクト構造

```
src/
├── app/              # アプリケーション初期化
├── features/         # 機能モジュール
│   ├── get-server-status/   # サーバー状態取得機能
│   └── [その他の機能]/      # 各Obsidian機能の実装
├── entities/         # ドメインモデル
│   └── obsidian/     # Obsidian関連の型定義
├── shared/           # 共有リソース
│   └── api/          # Obsidian API統合
└── index.ts          # エントリーポイント
```

### FSD レイヤーの責務

- **app/** - アプリケーションのブートストラップ、MCPサーバー設定
- **features/** - ビジネス機能の実装（ハンドラー、フォーマット、検証）
- **entities/** - ドメインモデルと型定義
- **shared/** - 共通ユーティリティ、外部APIクライアント

## 開発

### 開発手法 - テスト駆動開発（TDD）

このプロジェクトはテスト駆動開発（TDD）を採用しています：

1. **要件整理** - 新機能の要件を明確に定義
2. **テスト作成** - 要件を満たすテストコードを先に作成
3. **実装** - テストが通る最小限のコードを実装
4. **リファクタリング** - コードの品質を向上

### ビルド

```bash
npm run build
```

TypeScriptをJavaScriptにコンパイルし、適切な実行権限を設定します。

### テスト

```bash
npm test              # 単体テストをカバレッジ付きで実行
npm run test:unit     # カバレッジなしで高速実行
npm run test:watch    # ファイル変更を監視して自動実行
```

### 開発モード

```bash
npm run dev           # 開発モード（ログレベル: debug）
npm run dev:trace     # トレースモード（全ログ出力）
npm run inspector     # MCP Inspector での実行
```

## API統合

このサーバーは [Obsidian Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) を使用しています。

## 必要要件

- Node.js 16+
- TypeScript 5+
- Obsidian with Local REST API plugin

## ライセンス

MIT