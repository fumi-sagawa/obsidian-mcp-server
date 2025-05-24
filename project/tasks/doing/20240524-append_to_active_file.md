# タスク名: append_to_active_file ツールの実装

## 概要
Obsidian Local REST APIの `/active/` エンドポイント（POST）に対応するMCPツール。アクティブファイルの末尾にコンテンツを追記する。

## 背景・目的
現在編集中のファイルに対して、既存の内容を保持したまま新しいコンテンツを追加できるようにし、メモの追記やログの記録を効率化する。

## To-Be（完了条件）
- [x] OpenAPI仕様から型定義を生成/定義：`src/features/append-to-active-file/types.ts`
- [x] テストファイル `src/features/append-to-active-file/tests/append-to-active-file-handler.test.ts` を作成
- [x] 型安全性テスト：RequestBody型とResponseBody型の検証
- [x] 正常系テスト：テキストの正常な追記（改行の扱いを含む）
- [x] 境界値テスト：空文字列の追記、非常に長いテキストの追記
- [x] エラーテスト：アクティブファイルが存在しない場合（404エラー）
- [x] 日本語テスト：マルチバイト文字の正常な追記
- [x] ハンドラー実装：`src/features/append-to-active-file/append-to-active-file-handler.ts`
- [x] Zodスキーマ定義：`src/features/append-to-active-file/schema.ts`
- [x] index.tsでのエクスポート
- [x] app/index.tsへのツール登録
- [x] 全テストが通る
- [x] 統合テストで動作確認

## 実装方針
1. OpenAPI仕様から正確な型定義を作成
2. 型定義に基づいたテストケースの設計
3. Zodスキーマで実行時の型検証
4. 改行コードの扱いを明確に（追記時の改行制御）

## 関連情報
- APIエンドポイント: POST /active/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_active_file, update_active_file
- RequestBody型: `{ content: string, position?: 'end' }`
- ResponseBody型: `{ message: string }`

## 作業ログ
### 作業開始時に記録
- 型定義ファーストのTDD実践
- APIスキーマとの整合性確認

### 2025-05-24 13:10
- ブランチ作成: feature/20240524-append_to_active_file
- featureディレクトリ構造を作成
- 型定義ファイル (types.ts) を作成
  - AppendToActiveFileRequest, AppendToActiveFileResponse, ObsidianErrorResponse を定義
- テストファイルを作成（型安全性、正常系、境界値、エラー、日本語テスト）
- Zodスキーマを定義 (schema.ts)
- ハンドラー実装 (append-to-active-file-handler.ts)
  - ObsidianAPIClientを使用してPOSTリクエストを実装
  - エラーハンドリングを実装（404、API Error、ネットワークエラー）
- index.tsでエクスポート
- app/index.tsにツール登録
- 全テスト成功（13/13）
- 統合テスト成功（モックサーバーテスト）