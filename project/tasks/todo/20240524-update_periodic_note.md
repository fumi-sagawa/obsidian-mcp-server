# タスク名: update_periodic_noteツールの実装

## 概要
Obsidian Local REST APIの定期ノート更新機能（PUT /periodic/{period}/）をMCPツールとしてラップし、定期ノート（日次・週次・月次・四半期・年次ノート）の内容を完全に置き換える機能を実装する。

## 背景・目的
- 定期ノートの内容を完全に書き換えたい場合に使用する機能
- APIを通じて定期ノートの内容を更新できることで、AIアシスタントや外部アプリケーションから定期ノートのテンプレート適用や大幅な再構成が可能になる
- 追記（append）とは異なり、既存の内容を完全に置き換える操作

## To-Be（完了条件）
- [ ] `update-periodic-note`フィーチャーディレクトリの作成
- [ ] 型定義（types.ts）の作成
  - [ ] 入力パラメータの型定義（period, content）
  - [ ] レスポンスの型定義（成功時は空）
  - [ ] エラー型の定義
- [ ] Zodスキーマ（schema.ts）の作成
  - [ ] periodの検証（"daily" | "weekly" | "monthly" | "quarterly" | "yearly"）
  - [ ] contentの検証（必須、文字列）
- [ ] ハンドラー実装（update-periodic-note-handler.ts）
  - [ ] MCPリクエストの受信と検証
  - [ ] Obsidian APIへのPUTリクエスト実装
  - [ ] Content-Typeヘッダーの設定（text/markdown）
  - [ ] エラーハンドリング（400、405）
  - [ ] 成功時のレスポンス処理（204 No Content）
- [ ] 単体テストの作成（update-periodic-note-handler.test.ts）
  - [ ] 正常系：各期間タイプでの更新成功
  - [ ] 正常系：Markdown形式のコンテンツ更新
  - [ ] 異常系：無効な期間タイプ
  - [ ] 異常系：不正なコンテンツ形式
  - [ ] 異常系：API接続エラー
- [ ] 統合テスト用ファイルの作成（test/tools/update-periodic-note/）
  - [ ] integration.js
  - [ ] mock.js
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通ることの確認

## 実装方針
1. OpenAPI仕様（PUT /periodic/{period}/）に基づいて実装
2. Feature-Sliced Design (FSD)に従ったディレクトリ構造
3. 型定義駆動のTDDアプローチ
4. Content-Typeの適切な設定（text/markdown）
5. 既存内容の完全置換であることを考慮した実装

## 関連情報
- OpenAPI仕様: `/project/参考文献/openapi.yaml` - PUT /periodic/{period}/
- 参考実装: `update-active-file` の実装
- 関連ツール: `get_periodic_note`, `append_to_periodic_note`, `delete_periodic_note`
- 要件定義: `/project/要件定義.md` セクション 2.1.6

## 作業ログ
### YYYY-MM-DD HH:MM
- 作業内容の記録
- 発生した問題と解決方法
- 次回の作業予定