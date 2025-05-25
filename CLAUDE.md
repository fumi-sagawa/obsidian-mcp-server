# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) への指針を提供します。

## 言語設定

このプロジェクトでは**日本語**を基本言語として使用します。コメント、ドキュメント、コミットメッセージなどは日本語で記述してください。

## プロジェクト概要

これは **Obsidian Local REST API を MCP サーバーとしてラップする**プロジェクトです。Feature-Sliced Design (FSD) アーキテクチャに基づいた、拡張可能で保守しやすい構造を提供します。ObsidianのLocal REST APIプラグインを通じて、AIアシスタントやその他のアプリケーションからObsidianのノート管理機能を利用できるようになります。

### 🚨 重要な開発原則
**このプロジェクトの目的は、既存のObsidian Local REST APIの機能をMCPツールとして忠実にラップすることです。**
- 独自の機能を追加するのではなく、APIの仕様に従った実装を行う
- 新しいツールを実装する前に、必ず `/project/参考文献/openapi.yaml` を確認し、対応するAPIエンドポイントの仕様を理解する
- タスクファイルの要件がAPI仕様と異なる場合は、API仕様を優先し、タスクファイルを修正する

## コマンド

### ビルド
```bash
npm run build              # TypeScriptをコンパイル
```

### 開発
```bash
npm install                # 依存関係のインストール
npm run dev                # 開発モード（ログレベル: debug）
npm run dev:trace          # トレースモード（全ログ出力）
npm run inspector          # MCP Inspector での実行
npm run inspector:debug    # MCP Inspector（デバッグモード）
```

### テスト
```bash
# 単体テスト
npm test                   # 全テストをカバレッジ付きで実行
npm run test:unit          # カバレッジなしで高速実行
npm run test:watch         # ファイル変更を監視して自動実行

# 手動テスト（MCPプロトコル経由）
npm run test:tools         # 全ツールのモックテスト（安全・デフォルト）
npm run test:tools:dangerous  # 全ツールの実APIテスト（危険）
npm run test:tool          # 単一ツールのモックテスト（対話式・安全）

# 単一ツールのテスト例
# モックサーバー使用（デフォルト・安全）
./test/test-single.sh get-server-status '{}'
./test/test-single.sh mock get-file '{"filename":"test.md"}'

# 実際のAPI使用（危険）
./test/test-single.sh dangerous get-server-status '{}'

# ヘルスチェック
npm run health-check       # スタンドアロンのヘルスチェック実行
```

## アーキテクチャ哲学 - Feature-Sliced Design (FSD)

このプロジェクトは、保守可能なアーキテクチャのためにFeature-Sliced Designの原則に従っています：

### ディレクトリ構造の原則
```
src/
├── app/              # アプリケーション層
├── features/         # 機能層（各機能は独立したディレクトリ）
├── entities/         # エンティティ層（ドメインモデル）
├── shared/           # 共有層（共通ユーティリティ、API）
└── index.ts          # エントリーポイント
```

各層の内部構造：
- **最小限の階層**: 不要なネストは避け、フラットな構造を保つ
- **明確な命名**: `lib`や`model`のような汎用的な名前は避ける
- **index.ts**: 各モジュールのエクスポート管理

### 従うべきFSDの原則

1. **分離**: 各モジュールは独立している必要があります
   - 機能は互いに直接インポートしてはいけません
   - モジュール間の依存は明示的なエクスポートを通じて行います

2. **明示的な依存関係**: 下位層からのみインポートします
   - `app` → `features` → `entities` → `shared`
   - 同じ層や上位層からは決してインポートしません

3. **モジュールインターフェース**: 各モジュールは明確なインターフェースを定義します
   - 各モジュールのエクスポートは `index.ts` で管理
   - 内部実装の詳細は外部に公開しない
   - 必要な型、関数、定数のみを選択的にエクスポート

### リファクタリングのガイドライン

コードを変更する際は以下の構造を維持してください：

1. **`shared/` に配置するもの**:
   - Obsidian REST APIクライアント（外部API通信）
   - 共通の型とインターフェース
   - Obsidian APIのエラーマッピング
   - エラーハンドリングユーティリティ
   - ロギングシステム
   - メトリクス収集
   - ヘルスチェック機能
   - 設定管理（config）
   - MCPプロトコル関連のユーティリティ

2. **`entities/` に配置するもの**:
   - ドメインモデルの型定義
   - ドメイン固有の定数や列挙型

3. **`features/` に配置するもの**:
   - 各MCPツールの実装（ハンドラー）
   - Obsidian APIエンドポイントごとの機能実装
   - ツール固有のデータ変換・フォーマット処理
   - 入力値の検証スキーマ（Zod）
   - ツール固有の型定義（types.ts）
   - 各ツールのテスト

4. **`app/` に配置するもの**:
   - MCPサーバーの初期化とセットアップ
   - 全MCPツールの登録
   - トップレベルのエラーハンドリング
   - MCPプロトコルハンドラーの設定

## 開発アプローチ - 型定義駆動TDD

このプロジェクトでは型定義駆動のテスト駆動開発（Type-Driven TDD）を採用しています：

### 型定義駆動TDDのフロー
1. **API仕様の確認** - `/project/参考文献/openapi.yaml` で実装対象のエンドポイントの仕様を確認
2. **型定義の作成** - OpenAPI仕様書から正確な型定義を作成（APIの仕様に忠実に）
3. **型に基づくテスト設計** - 型定義に基づいてテストケースを作成
4. **実装** - テストが通るように型安全な実装（APIの仕様に従って）
5. **リファクタリング** - 型とテストを維持しながらコードを改善

### 実践例
```typescript
// 1. 型定義を作成 (types.ts)
export interface GetServerStatusResponse {
  status: 'connected' | 'disconnected';
  version: string;
  vaultName: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
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
    // 型安全なアサーション
    expect(result).toMatchObject(mockResponse);
  });
  
  it('接続エラー時は適切なエラー型を返す', async () => {
    const errorResponse: ErrorResponse = {
      error: 'Connection failed',
      code: 'CONNECTION_ERROR'
    };
    // エラーケースのテスト
  });
});

// 3. テストが通るように型安全な実装
// 4. リファクタリング（型を維持）
```

### テスト作成のガイドライン
- 型定義を必ず先に作成し、テストで活用する
- テストの説明は日本語で記述
- 型安全なモックデータを使用
- 正常系・異常系・エッジケースを網羅
- コンパイル時の型チェックを活用

### テスト構造

このプロジェクトは3層のテスト戦略を採用しています：

```
test/
├── tools/                      # 統合テスト
│   ├── get-alerts/
│   │   ├── integration.js      # 実際のAPIを使った統合テスト
│   │   └── mock.js             # モックAPIを使った統合テスト
│   ├── get-forecast/
│   ├── health-check/
│   ├── get-server-status/
│   ├── obsidian/               # Obsidian関連ツール
│   │   ├── update-active-file/
│   │   └── append-to-active-file/
│   └── shared/                 # 共通テスト機能
│       ├── test-runner.js      # テスト実行エンジン
│       └── mock-server.js      # モックAPIサーバー
├── test-all-tools.js           # 統合テスト実行
└── test-all-tools-mock.js      # モックテスト実行
```

**テストレベル：**
- **Unit Test**: 個別の関数やクラスの動作をテスト（`src/**/*.test.ts`）
- **Integration Test**: MCPプロトコル → ハンドラー → API連携の統合テスト
- **E2E Test**: ユーザーの実際の操作フローのテスト（将来実装）

**新しいツールのテスト追加方法：**
1. `test/tools/新機能名/` ディレクトリを作成
2. `integration.js` と `mock.js` ファイルを作成
3. メインのテストランナーファイル（`test-all-tools.js`, `test-all-tools-mock.js`）でインポートを追加

### テスト実行コマンド
```bash
# 単体テスト（Unit Test）
npm test              # カバレッジレポート付きで実行
npm run test:unit     # 高速実行（カバレッジなし）
npm run test:watch    # 開発中の自動テスト

# 統合テスト（Integration Test）
npm run test:tools              # 全ツールの統合テスト
npm run test:tools:mock         # 全ツールのモックテスト
npm run test:tools get-alerts   # 特定ツールの統合テスト
npm run test:tool               # 単一ツールの対話式テスト
```

### テストカバレッジ
- 目標カバレッジ: 90%以上
- 重要なビジネスロジックは100%カバー
- エラーケースとエッジケースを網羅

## コードスタイル

- TypeScriptの厳密な型付けを使用する
- ES modulesを使用（相対インポートには`.js`拡張子を追加）
- Zodによるスキーマ検証を活用する
- エラーハンドリングは各層で適切に行う

## ロギングとデバッグ

### ロギング
- すべてのログは構造化ログ（JSON形式）で出力
- ログレベル: trace, debug, info, warn, error
- 環境変数 `LOG_LEVEL` で制御
- リクエストIDによるトレース追跡

### デバッグ
- `DEBUG_MODE=true` で詳細なデバッグ情報を出力
- `PRETTY_LOGS=true` で読みやすいログフォーマット
- MCP Inspector統合でインタラクティブなデバッグ

### 監視
- メトリクス収集（リクエスト数、エラー率、レスポンス時間）
- ヘルスチェック機能（メモリ使用量、外部API接続性）
- スロークエリの検出（`SLOW_OPERATION_THRESHOLD`で設定）

## 環境変数

| 変数名 | デフォルト値 | 説明 |
|--------|------------|------|
| LOG_LEVEL | info | ログレベル（trace/debug/info/warn/error） |
| DEBUG_MODE | false | デバッグモードの有効化 |
| PRETTY_LOGS | false | 読みやすいログフォーマット |
| LOG_TIMESTAMPS | true | ログにタイムスタンプを含める |
| SLOW_OPERATION_THRESHOLD | 1000 | スロークエリの閾値（ミリ秒） |
| API_TIMEOUT | 30000 | APIタイムアウト（ミリ秒） |
| API_RETRY_ATTEMPTS | 3 | APIリトライ回数 |
| OBSIDIAN_API_KEY | - | Obsidian Local REST APIのAPIキー（必須） |
| OBSIDIAN_API_URL | http://127.0.0.1:27123 | Obsidian APIのエンドポイント |
| OBSIDIAN_HTTPS_CERT | - | カスタム証明書パス |

## プロジェクト管理

### プロジェクトフォルダ構造
```
project/
├── 要件定義.md          # プロジェクトの要件定義書
├── 参考文献/            # 外部仕様書やAPIドキュメントなど
└── tasks/               # タスク管理フォルダ
    ├── todo/            # 未着手のタスク
    ├── doing/           # 作業中のタスク
    └── done/            # 完了したタスク
```

### タスク管理フロー
1. **新規タスク作成**: `project/tasks/todo/` に新しいタスクファイルを作成
2. **作業開始**: タスクファイルを `doing/` フォルダに移動し、対応するブランチを作成
3. **作業完了**: タスクファイルを `done/` フォルダに移動

### タスクチケットテンプレート
```markdown
# タスク名: [わかりやすいタスク名]

## 概要
[このタスクで実現したいことの概要]

## 背景・目的
[なぜこのタスクが必要なのか]

## To-Be（完了条件）
- [ ] 実装完了条件1
- [ ] 実装完了条件2
- [ ] テストが全て通る
- [ ] ドキュメント更新完了

## 実装方針
[どのように実装するかの方針]

## 関連情報
- 関連Issue: #XX
- 参考資料: [リンク]

## 作業ログ
### YYYY-MM-DD HH:MM
- 作業内容の記録
- 発生した問題と解決方法
- 次回の作業予定

### YYYY-MM-DD HH:MM
- 進捗状況
- 実装した内容の詳細
- レビュー結果とフィードバック
```

### タスク管理のベストプラクティス
- タスクファイル名は `YYYYMMDD-タスク名.md` の形式で作成
- 作業ログは時系列で追記し、後から見返せるようにする
- ブランチ名はタスクファイル名と対応させる（例: `feature/20240524-add-new-tool`）
- 完了したタスクも削除せず、`done/` フォルダに保管して知識として蓄積

## 機能実装時の作業フロー

**重要**: ユーザーからタスクファイルパス（例: `project/tasks/todo/20240524-get_active_file.md`）が指定されたら、以下の手順を順番通りに実行すること。

### 0. 作業開始前の自動実行事項
タスクファイルパスが指定されたら、即座に以下を実行：
1. タスクファイルを読み込み、内容を確認
2. **OpenAPI仕様書（`/project/参考文献/openapi.yaml`）で対応するAPIエンドポイントを確認**
3. **タスクの要件がAPI仕様と一致しているか検証し、必要に応じてタスクファイルを修正**
4. ファイル名からブランチ名を決定（例: `feature/20240524-get_active_file`）
5. ブランチを作成・切り替え
6. タスクファイルをdoingフォルダに移動
7. 作業開始を宣言

1. **チケット選択とブランチ作成**
   ```bash
   # todoフォルダから作業するチケットを選択
   # 例: 20240524-get_server_status.md を選択した場合
   
   # ブランチを作成して移動
   git checkout -b feature/20240524-get_server_status
   
   # チケットをdoingフォルダに移動
   mv project/tasks/todo/20240524-get_server_status.md project/tasks/doing/
   ```

2. **作業中のログ記録**
   - 大きな実装ステップ完了時に、チケットの作業ログを更新
   - 以下のタイミングでログ更新を実施：
     - 型定義の作成完了時
     - テストの作成完了時
     - 主要な機能の実装完了時
     - 重要な問題の解決時
   - 細かい修正や調整では更新不要（自立的に作業を進める）

3. **作業完了時**
   ```bash
   # 全テストが通ることを確認
   npm test
   npm run test:tools:mock  # 統合テストも実行
   
   # PRを作成（mainブランチへ）
   gh pr create
   
   # マージ後、チケットをdoneフォルダに移動
   mv project/tasks/doing/20240524-get_server_status.md project/tasks/done/
   ```

## 🚨 重要：機能実装完了時の報告ルール

**機能追加やコード変更が完了し、コミットする前は必ずユーザーに報告してください。**

### 報告すべき内容
1. **実装した機能の概要**
2. **変更されたファイル一覧**
3. **テスト結果（全て通過していることを確認）**
4. **動作確認の結果**
5. **コミットメッセージの提案**

### 報告のタイミング
- 新機能の実装が完了した時
- 既存機能の修正・改善が完了した時
- ドキュメントの更新が完了した時
- リファクタリングが完了した時

### 報告後の流れ
1. ユーザーの確認・承認を得る
2. 承認後にコミット・プッシュを実行
3. 必要に応じてプルリクエストを作成

**注意**: ユーザーの明示的な承認なしに、勝手にコミット・プッシュは行わないでください。

## 実装の優先順位

1. **型定義** - 最初に作成、IN/OUTを明確化
2. **テスト** - 型定義に基づいて作成
3. **実装** - テストが通るように実装
4. **ドキュメント** - 実装と同時に更新

## コード品質の維持

- 型定義は `src/features/[feature-name]/types.ts` に配置
- テストは型定義を直接インポートして使用
- 実装は型定義に厳密に従う
- Zodスキーマは型定義と整合性を保つ