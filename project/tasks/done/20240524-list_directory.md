# タスク名: list_directory ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{pathToDirectory}/` エンドポイント（GET）に対応するMCPツール。指定したディレクトリ内のファイル一覧を取得する。

## 背景・目的
Vault内の特定のディレクトリの内容を確認し、階層的なファイル管理とナビゲーションを可能にする。

## To-Be（完了条件）
- [x] パラメータ型定義：`src/features/list-directory/types.ts`
- [x] DirectoryPath型（パスの妥当性検証を含む）
- [x] DirectoryListing型（files: string[]）
- [x] テストファイル `src/features/list-directory/tests/list-directory-handler.test.ts` を作成
- [x] 型テスト：パスパラメータの形式検証
- [x] 正常系テスト：ディレクトリ内容の取得
- [x] ネストテスト：深い階層のディレクトリ
- [x] 空ディレクトリテスト：ファイルがない場合
- [x] エラーテスト：存在しないディレクトリ（404）
- [x] エラーテスト：無効なパス形式
- [x] 特殊パステスト：スペースや日本語を含むパス
- [x] ハンドラー実装：`src/features/list-directory/list-directory-handler.ts`
- [x] Zodスキーマ定義：`src/features/list-directory/schema.ts`
- [x] パス正規化実装（ハンドラー内で実装）
- [x] フォーマッター実装（ハンドラー内で実装）
- [x] index.tsでのエクスポート
- [x] app/index.tsへのツール登録
- [x] 全テストが通る
- [x] 統合テストで動作確認

## 実装方針
1. パスの正規化と安全性検証
2. ファイル/フォルダの視覚的区別
3. list_vault_filesとの一貫性
4. パストラバーサル攻撃への対策

## 関連情報
- APIエンドポイント: GET /vault/{pathToDirectory}/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: list_vault_files（ルート用）
- パスパラメータ: pathToDirectory（URLエンコード必須）
- 注意事項: セキュリティを考慮したパス処理

## 作業ログ
### 2025-05-25 10:52 作業開始
- ブランチ作成とタスクファイル移動
- OpenAPI仕様書確認（GET /vault/{pathToDirectory}/）
- ディレクトリ操作の型安全な実装
- パス処理のベストプラクティス適用

### 2025-05-25 10:53 型定義とスキーマ作成
- `src/features/list-directory/types.ts` 作成
  - ListDirectoryRequest, ListDirectoryResponse 型定義
  - ListDirectoryFormattedResponse 型定義
  - HandlerDependencies, ErrorResponse 型定義
- `src/features/list-directory/schema.ts` 作成
  - Zodスキーマ定義（パストラバーサル防止含む）
  - 空文字列の場合はルートディレクトリとして処理

### 2025-05-25 10:54 テスト作成
- `src/features/list-directory/tests/list-directory-handler.test.ts` 作成
- 型定義テスト（必須パラメータ、有効なリクエスト型）
- 正常系テスト（ディレクトリ内容取得、空ディレクトリ、ルートディレクトリ）
- ネストディレクトリテスト（深い階層）
- 特殊パステスト（スペース、日本語、先頭スラッシュ）
- エラーテスト（存在しないディレクトリ、無効なパス、API エラー）
- フォーマットテスト（ファイル・ディレクトリ区別、統計情報）

### 2025-05-25 10:55 ハンドラー実装
- `src/features/list-directory/list-directory-handler.ts` 作成
- パス検証とパストラバーサル攻撃防止
- パス正規化（先頭スラッシュ削除、Windows対応）
- ディレクトリリストのフォーマット（ファイル・ディレクトリ分類）
- フォーマット済みテキスト生成（視覚的区別、統計情報）
- エラーハンドリング（ValidationError, APIError）

### 2025-05-25 10:56 エクスポートとツール登録
- `src/features/list-directory/index.ts` 作成（エクスポート管理）
- `src/app/index.ts` にツール登録（"list-directory"）
- Obsidian APIクライアントに `listDirectory` メソッド追加
  - `src/shared/api/obsidian/obsidian-api.ts` 更新
  - GET /vault/{pathToDirectory}/ エンドポイント実装

### 2025-05-25 10:57 テスト実行と動作確認
- 単体テスト実行: 17テスト中16テスト成功（1つルートディレクトリで失敗）
- Zodスキーマ修正（空文字列を許可、ルートディレクトリ対応）
- 単体テスト再実行: 17テスト全て成功

### 2025-05-25 10:58 統合テスト追加
- `test/tools/list-directory/mock.js` 作成（統合テストケース）
- `test/tools/shared/mock-server.js` 更新
  - GET /vault/ エンドポイント追加（ルートディレクトリ）
  - GET /vault/{pathToDirectory}/ エンドポイント追加
  - パストラバーサル攻撃テスト、存在しないディレクトリテスト
  - 特殊文字（日本語、スペース）対応
- `test/test-all-tools-mock.js` にlist-directoryテスト追加

### 2025-05-25 10:59 統合テスト成功
- 統合テスト初回実行でエラー（モックサーバーの条件順序問題）
- モックサーバー修正（より具体的な条件を先に評価）
- 統合テスト再実行: 7テスト全て成功
- デバッグログ削除とクリーンアップ

## 実装完了
✅ **list_directory ツールの実装が完了しました**

### 実装内容
- OpenAPI仕様（GET /vault/{pathToDirectory}/）に忠実な実装
- 型安全なディレクトリ一覧取得機能
- パストラバーサル攻撃防止
- 特殊文字（日本語、スペース）対応
- ファイル・ディレクトリの視覚的区別
- 統計情報表示（総数、ファイル数、ディレクトリ数）
- 包括的なテストカバレッジ（単体テスト17個、統合テスト7個）

### 動作確認
- 単体テスト: 全て成功
- 統合テスト: 全て成功
- MCPプロトコル経由での動作確認済み