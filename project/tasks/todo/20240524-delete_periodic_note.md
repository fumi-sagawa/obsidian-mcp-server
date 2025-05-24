# タスク名: delete_periodic_noteツールの実装

## 概要
Obsidian Local REST APIの定期ノート削除機能（DELETE /periodic/{period}/）をMCPツールとしてラップし、定期ノート（日次・週次・月次・四半期・年次ノート）を削除できる機能を実装する。

## 背景・目的
- 定期ノートの管理において、不要になったノートや誤って作成されたノートを削除する機能が必要
- APIを通じて定期ノートを削除できることで、AIアシスタントや外部アプリケーションから定期ノートの整理・管理が可能になる
- 削除操作は慎重に行う必要があるため、適切なエラーハンドリングが重要

## To-Be（完了条件）
- [ ] `delete-periodic-note`フィーチャーディレクトリの作成
- [ ] 型定義（types.ts）の作成
  - [ ] 入力パラメータの型定義（period）
  - [ ] レスポンスの型定義（成功時は空）
  - [ ] エラー型の定義
- [ ] Zodスキーマ（schema.ts）の作成
  - [ ] periodの検証（"daily" | "weekly" | "monthly" | "quarterly" | "yearly"）
- [ ] ハンドラー実装（delete-periodic-note-handler.ts）
  - [ ] MCPリクエストの受信と検証
  - [ ] Obsidian APIへのDELETEリクエスト実装
  - [ ] エラーハンドリング（404、405）
  - [ ] 成功時のレスポンス処理（204 No Content）
- [ ] 単体テストの作成（delete-periodic-note-handler.test.ts）
  - [ ] 正常系：各期間タイプでの削除成功
  - [ ] 異常系：存在しないノートの削除
  - [ ] 異常系：ディレクトリを削除しようとした場合
  - [ ] 異常系：API接続エラー
- [ ] 統合テスト用ファイルの作成（test/tools/delete-periodic-note/）
  - [ ] integration.js
  - [ ] mock.js
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通ることの確認

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
### YYYY-MM-DD HH:MM
- 作業内容の記録
- 発生した問題と解決方法
- 次回の作業予定