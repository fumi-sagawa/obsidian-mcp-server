# タスク名: delete_periodic_noteツールの実装

## 概要
Obsidian Local REST APIの定期ノート削除機能（DELETE /periodic/{period}/）をMCPツールとしてラップし、定期ノート（日次・週次・月次・四半期・年次ノート）を削除できる機能を実装する。

## 背景・目的
- 定期ノートの管理において、不要になったノートや誤って作成されたノートを削除する機能が必要
- APIを通じて定期ノートを削除できることで、AIアシスタントや外部アプリケーションから定期ノートの整理・管理が可能になる
- 削除操作は慎重に行う必要があるため、適切なエラーハンドリングが重要

## To-Be（完了条件）
- [x] `delete-periodic-note`フィーチャーディレクトリの作成
- [x] 型定義（types.ts）の作成
  - [x] 入力パラメータの型定義（period）
  - [x] レスポンスの型定義（成功時は空）
  - [x] エラー型の定義
- [x] Zodスキーマ（schema.ts）の作成
  - [x] periodの検証（"daily" | "weekly" | "monthly" | "quarterly" | "yearly"）
- [x] ハンドラー実装（delete-periodic-note-handler.ts）
  - [x] MCPリクエストの受信と検証
  - [x] Obsidian APIへのDELETEリクエスト実装
  - [x] エラーハンドリング（404、405）
  - [x] 成功時のレスポンス処理（204 No Content）
- [x] 単体テストの作成（delete-periodic-note-handler.test.ts）
  - [x] 正常系：各期間タイプでの削除成功
  - [x] 異常系：存在しないノートの削除
  - [x] 異常系：ディレクトリを削除しようとした場合
  - [x] 異常系：API接続エラー
- [x] 統合テスト用ファイルの作成（test/tools/delete-periodic-note/）
  - [x] integration.js
  - [x] mock.js
- [x] app/index.tsへのツール登録
- [x] 全テストが通ることの確認

## 実装方針
1. OpenAPI仕様（DELETE /periodic/{period}/）に基づいて実装
2. Feature-Sliced Design (FSD)に従ったディレクトリ構造
3. 型定義駆動のTDDアプローチ
4. 削除操作の安全性を考慮したエラーハンドリング
5. 成功時は内容を返さない（204 No Content）

## 関連情報
- OpenAPI仕様: `/project/参考文献/openapi.yaml` - DELETE /periodic/{period}/
- 参考実装: `delete-active-file` の実装
- 関連ツール: `get_periodic_note`, `update_periodic_note`, `append_to_periodic_note`
- 要件定義: `/project/要件定義.md` セクション 2.1.6

## 作業ログ
### 2025-05-25 10:13
- delete_periodic_noteツールの実装完了
- 型定義駆動のTDDアプローチで開発
- OpenAPI仕様（DELETE /periodic/{period}/）に完全対応
- 以下のファイルを実装：
  - src/features/delete-periodic-note/types.ts（型定義）
  - src/features/delete-periodic-note/schema.ts（Zodスキーマ）
  - src/features/delete-periodic-note/delete-periodic-note-handler.ts（ハンドラー）
  - src/features/delete-periodic-note/index.ts（エクスポート管理）
  - src/features/delete-periodic-note/tests/delete-periodic-note-handler.test.ts（単体テスト）
  - test/tools/delete-periodic-note/integration.js（統合テスト）
  - test/tools/delete-periodic-note/mock.js（モックテスト）
- ObsidianAPIClient.deletePeriodicNote()メソッドを追加
- app/index.tsにツールを登録
- テストランナーに統合テストを追加
- モックサーバーにDELETE /periodic/{period}/エンドポイントを追加
- 全てのテスト（単体・統合・モック）が正常に通過することを確認
- Feature-Sliced Design (FSD)アーキテクチャに準拠
- 削除操作の安全性を考慮したエラーハンドリングを実装