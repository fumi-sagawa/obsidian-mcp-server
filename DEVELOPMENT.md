# 開発者ガイド

このドキュメントでは、Obsidian MCP Serverの開発に必要な情報を提供します。

## 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [アーキテクチャ](#アーキテクチャ)
3. [開発アプローチ](#開発アプローチ)
4. [コーディング規約](#コーディング規約)
5. [テスト戦略](#テスト戦略)
6. [デバッグ方法](#デバッグ方法)
7. [新機能の追加](#新機能の追加)
8. [プロジェクト管理](#プロジェクト管理)

## 開発環境のセットアップ

### 必要な環境

- Node.js 16以上
- npm 7以上
- TypeScript 5以上
- Git

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/obsidian-mcp-server.git
cd obsidian-mcp-server

# 依存関係のインストール
npm install

# ビルド
npm run build

# 開発サーバーの起動
npm run dev
```

### 環境変数の設定

#### 必須設定

```bash
# ObsidianのLocal REST APIプラグインから取得したAPIキー
export OBSIDIAN_API_KEY="your-api-key-here"
```

#### オプション設定

```bash
# Obsidian APIのURL（デフォルト: http://127.0.0.1:27123）
export OBSIDIAN_API_URL="http://127.0.0.1:27123"

# HTTPSを使用する場合の証明書パス
export OBSIDIAN_HTTPS_CERT="/path/to/cert.pem"

# ログレベル（trace, debug, info, warn, error）
export LOG_LEVEL="info"

# タイムアウト設定（ミリ秒）
export API_TIMEOUT="30000"

# デバッグモード
export DEBUG_MODE="false"

# 読みやすいログフォーマット
export PRETTY_LOGS="false"

# ログのタイムスタンプ
export LOG_TIMESTAMPS="true"

# スロークエリの閾値（ミリ秒）
export SLOW_OPERATION_THRESHOLD="1000"
```

#### .envファイルを使用する場合

```bash
# .env.exampleをコピー
cp .env.example .env

# .envファイルを編集
nano .env  # または任意のエディタで編集
```

`.env`ファイルの例：
```
OBSIDIAN_API_KEY=your-actual-api-key
OBSIDIAN_API_URL=http://127.0.0.1:27123
LOG_LEVEL=debug
PRETTY_LOGS=true
```

### 開発用コマンド

```bash
# 開発モード（ログレベル: debug）
npm run dev

# トレースモード（全ログ出力）
npm run dev:trace

# MCP Inspector での実行
OBSIDIAN_API_KEY=your-api-key npm run inspector

# MCP Inspector（デバッグモード）
OBSIDIAN_API_KEY=your-api-key npm run inspector:debug

# 環境変数を設定して開発モード実行
OBSIDIAN_API_KEY=your-api-key npm run dev

# 全てのログを出力（トレースモード）
OBSIDIAN_API_KEY=your-api-key LOG_LEVEL=trace npm run dev
```

## アーキテクチャ

### Feature-Sliced Design (FSD)

このプロジェクトは、保守可能なアーキテクチャのために[Feature-Sliced Design](https://feature-sliced.design/)の原則に従っています。

#### ディレクトリ構造

```
src/
├── app/              # アプリケーション層
├── features/         # 機能層（各機能は独立したディレクトリ）
├── entities/         # エンティティ層（ドメインモデル）
├── shared/           # 共有層（共通ユーティリティ、API）
└── index.ts          # エントリーポイント
```

#### 各層の責務

1. **`app/`** - アプリケーション層
   - MCPサーバーの初期化とセットアップ
   - 全MCPツールの登録
   - トップレベルのエラーハンドリング

2. **`features/`** - 機能層
   - 各MCPツールの実装（ハンドラー）
   - ツール固有のデータ変換・フォーマット処理
   - 入力値の検証スキーマ（Zod）
   - ツール固有の型定義

3. **`entities/`** - エンティティ層
   - ドメインモデルの型定義
   - ドメイン固有の定数や列挙型

4. **`shared/`** - 共有層
   - Obsidian REST APIクライアント
   - エラーハンドリングユーティリティ
   - ロギングシステム
   - メトリクス収集
   - 設定管理

#### FSDの原則

1. **分離**: 各モジュールは独立している
2. **明示的な依存関係**: 下位層からのみインポート（`app` → `features` → `entities` → `shared`）
3. **モジュールインターフェース**: 各モジュールは`index.ts`で明確なインターフェースを定義

## 開発アプローチ

### 🚨 重要な開発原則

**このプロジェクトの目的は、既存のObsidian Local REST APIの機能をMCPツールとして忠実にラップすることです。**

- 独自の機能を追加するのではなく、APIの仕様に従った実装を行う
- 新しいツールを実装する前に、必ず `/project/参考文献/openapi.yaml` を確認
- タスクファイルの要件がAPI仕様と異なる場合は、API仕様を優先

### 型定義駆動TDD

このプロジェクトでは型定義駆動のテスト駆動開発（Type-Driven TDD）を採用しています。

#### 開発フロー

1. **API仕様の確認** - OpenAPI仕様書で実装対象のエンドポイントを確認
2. **型定義の作成** - 仕様書から正確な型定義を作成
3. **テストの作成** - 型定義に基づいてテストケースを作成
4. **実装** - テストが通るように型安全な実装
5. **リファクタリング** - 型とテストを維持しながらコードを改善

#### 実践例

```typescript
// 1. 型定義を作成 (types.ts)
export interface GetServerStatusResponse {
  status: 'connected' | 'disconnected';
  version: string;
  vaultName: string;
}

// 2. 型に基づいてテストを作成
describe('get_server_status', () => {
  it('正常にサーバー状態を取得できる', async () => {
    const mockResponse: GetServerStatusResponse = {
      status: 'connected',
      version: '1.0.0',
      vaultName: 'MyVault'
    };
    
    const result = await handler({});
    expect(result).toMatchObject(mockResponse);
  });
});

// 3. テストが通るように実装
```

## コーディング規約

### 言語設定

- プロジェクト内では**日本語**を使用
- コメント、ドキュメント、コミットメッセージは日本語で記述

### TypeScript

- 厳密な型付けを使用
- ES modulesを使用（相対インポートには`.js`拡張子を追加）
- Zodによるスキーマ検証を活用
- エラーハンドリングは各層で適切に行う

### ファイル構成

各機能は以下の構造で実装：

```
features/get-file/
├── index.ts                 # エクスポート管理
├── get-file-handler.ts      # ハンドラー実装
├── schema.ts                # Zodスキーマ
├── types.ts                 # TypeScript型定義
└── tests/
    └── get-file-handler.test.ts
```

## テスト戦略

### テストレベル

1. **Unit Test** - 個別の関数やクラスのテスト
   - ファイル: `src/**/*.test.ts`
   - 実行: `npm test`

2. **Integration Test** - MCPプロトコル経由の統合テスト
   - ファイル: `test/tools/*/integration.js`
   - 実行: `npm run test:tools`

3. **Mock Test** - モックAPIを使用したテスト
   - ファイル: `test/tools/*/mock.js`
   - 実行: `npm run test:tools:mock`

### テストコマンド

```bash
# 単体テスト
npm test                   # 全テストをカバレッジ付きで実行
npm run test:unit          # カバレッジなしで高速実行
npm run test:watch         # ファイル変更を監視して自動実行

# 統合テスト
npm run test:tools         # 全ツールのモックテスト（安全）
npm run test:tools:dangerous  # 全ツールの実APIテスト（危険）
npm run test:tool          # 単一ツールの対話式テスト

# 単一ツールのテスト
./test/test-single.sh get-server-status '{}'
./test/test-single.sh mock get-file '{"filename":"test.md"}'
```

### 手動テスト（MCP Inspector）

1. **MCP Inspectorの起動**
   ```bash
   OBSIDIAN_API_KEY=your-api-key npm run inspector
   ```

2. **ツールのテスト**
   - 左側のツール一覧から実行したいツールを選択
   - パラメータを入力
   - 「Execute」をクリック

3. **よく使うテストケース**
   ```json
   // サーバーステータス確認
   {
     "tool": "get_server_status",
     "arguments": {}
   }

   // ファイル取得
   {
     "tool": "get_file",
     "arguments": {
       "filename": "test.md"
     }
   }

   // ノート検索
   {
     "tool": "simple_search",
     "arguments": {
       "query": "検索語"
     }
   }
   ```

## デバッグ方法

### デバッグコマンド

```bash
# デバッグログを有効にして実行
LOG_LEVEL=debug npm run dev

# 全てのログを出力
LOG_LEVEL=trace npm run dev:trace

# 読みやすいログフォーマット
PRETTY_LOGS=true npm run dev

# MCP Inspector でデバッグ
npm run inspector:debug
```

### トラブルシューティング

#### 接続エラー

```bash
# ポートの確認
lsof -i :27123

# APIキーの確認
echo $OBSIDIAN_API_KEY

# 手動でAPIをテスト
curl -H "Authorization: Bearer $OBSIDIAN_API_KEY" http://127.0.0.1:27123/
```

#### 型エラー

```bash
# TypeScriptの型チェック
npm run typecheck

# 特定のファイルの型チェック
npx tsc --noEmit src/features/get-file/get-file-handler.ts
```

## 新機能の追加

### 1. API仕様の確認

```bash
# OpenAPI仕様書を確認
cat project/参考文献/openapi.yaml | grep -A 20 "新しいエンドポイント"
```

### 2. 機能ディレクトリの作成

```bash
# 新機能のディレクトリを作成
mkdir -p src/features/new-feature/{tests}
```

### 3. 必要なファイルの作成

- `types.ts` - 型定義
- `schema.ts` - Zodスキーマ
- `new-feature-handler.ts` - ハンドラー実装
- `tests/new-feature-handler.test.ts` - テスト
- `index.ts` - エクスポート

### 4. テストの作成と実装

```bash
# テストの実行
npm run test:watch -- new-feature

# 統合テストの追加
mkdir -p test/tools/new-feature
# integration.js と mock.js を作成
```

### 5. ツールの登録

`src/app/index.ts` でツールを登録：

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... 既存のツール
    {
      name: "new_feature",
      description: "新機能の説明",
      inputSchema: zodToJsonSchema(NewFeatureArgsSchema)
    }
  ]
}));
```

## プロジェクト管理

### タスク管理

```
project/tasks/
├── todo/     # 未着手のタスク
├── doing/    # 作業中のタスク
└── done/     # 完了したタスク
```

### ブランチ戦略

- `main` - 安定版
- `develop` - 開発版
- `feature/*` - 新機能
- `fix/*` - バグ修正

### コミットメッセージ

```
feat: 新機能の追加
fix: バグの修正
docs: ドキュメントの更新
refactor: リファクタリング
test: テストの追加・修正
chore: ビルドプロセスやツールの変更
```

## 利用可能なツール

実装済みのツール一覧は、`src/features/` ディレクトリを参照してください。各ツールの詳細な仕様は `/project/参考文献/openapi.yaml` に記載されています。

### 主要なツール

- **ファイル操作**: get_file, create_or_update_file, delete_file, append_to_file
- **アクティブファイル**: get_active_file, update_active_file, append_to_active_file
- **検索**: simple_search, search_notes
- **コマンド**: list_commands, execute_command
- **定期ノート**: get_periodic_note, update_periodic_note, delete_periodic_note
- **その他**: get_server_status, list_vault_files, list_directory, open_file