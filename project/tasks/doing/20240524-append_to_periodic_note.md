# タスク名: append_to_periodic_noteツールの実装

## 概要
Obsidian Local REST APIの定期ノート追記機能（POST /periodic/{period}/）をMCPツールとしてラップし、定期ノート（日次・週次・月次・四半期・年次ノート）に内容を追記できる機能を実装する。

## 背景・目的
- 定期ノート（Daily Note、Weekly Noteなど）は、Obsidianでの日記や定期的な記録に広く使われている
- APIを通じて定期ノートに内容を追記できることで、AIアシスタントや外部アプリケーションから定期的な記録の自動化が可能になる
- 該当する期間のノートが存在しない場合は、Periodic Notesプラグインの設定に従って自動的に作成される

## To-Be（完了条件）
- [ ] `append-to-periodic-note`フィーチャーディレクトリの作成
- [ ] 型定義（types.ts）の作成
  - [ ] 入力パラメータの型定義（period, content）
  - [ ] レスポンスの型定義
  - [ ] エラー型の定義
- [ ] Zodスキーマ（schema.ts）の作成
  - [ ] periodの検証（"daily" | "weekly" | "monthly" | "quarterly" | "yearly"）
  - [ ] contentの検証（必須、文字列）
- [ ] ハンドラー実装（append-to-periodic-note-handler.ts）
  - [ ] MCPリクエストの受信と検証
  - [ ] Obsidian APIへのPOSTリクエスト実装
  - [ ] エラーハンドリング（404、400、405）
  - [ ] 成功時のレスポンス処理
- [ ] 単体テストの作成（append-to-periodic-note-handler.test.ts）
  - [ ] 正常系：各期間タイプでの追記成功
  - [ ] 異常系：存在しない期間タイプ
  - [ ] 異常系：API接続エラー
  - [ ] 異常系：バリデーションエラー
- [ ] 統合テスト用ファイルの作成（test/tools/append-to-periodic-note/）
  - [ ] integration.js
  - [ ] mock.js
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通ることの確認

## 実装方針
1. OpenAPI仕様（POST /periodic/{period}/）に基づいて実装
2. Feature-Sliced Design (FSD)に従ったディレクトリ構造
3. 型定義駆動のTDDアプローチ
4. エラーケースの適切なハンドリング（APIエラーをMCPエラーに変換）

## 関連情報
- OpenAPI仕様: `/project/参考文献/openapi.yaml` - POST /periodic/{period}/
- 参考実装: `append-to-active-file` の実装
- 関連ツール: `get_periodic_note`, `update_periodic_note`
- 要件定義: `/project/要件定義.md` セクション 2.1.6

## 作業ログ
### 2025-05-25 09:15
- OpenAPI仕様書の確認完了（POST /periodic/{period}/)
- 型定義の作成完了（types.ts）
- Zodスキーマの作成完了（schema.ts）
- ハンドラー実装完了（append-to-periodic-note-handler.ts）
- ObsidianAPIClientにappendToPeriodicNoteメソッドを追加
- 単体テストの作成完了（全パス、カバレッジ良好）
- 統合テスト用ファイルの作成完了
- app/index.tsへのツール登録完了
- テストランナーファイルへの追加完了
- モックサーバーへのエンドポイント追加完了
- ビルド成功確認済み