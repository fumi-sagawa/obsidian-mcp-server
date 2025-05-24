# タスク名: execute_command ツールの実装

## 概要
Obsidian Local REST APIの `/commands/{commandId}/` エンドポイント（POST）に対応するMCPツール。指定したコマンドIDのコマンドを実行する。

## 背景・目的
list_commandsで取得したコマンドを実際に実行し、Obsidianの様々な機能を自動化・統合できるようにする。

## To-Be（完了条件）
- [ ] パラメータ型定義：`src/features/execute-command/types.ts`
- [ ] CommandExecutionRequest型（commandId: string）
- [ ] CommandExecutionResponse型（success: boolean, message?: string）
- [ ] テストファイル `src/features/execute-command/tests/execute-command-handler.test.ts` を作成
- [ ] 型テスト：commandIdパラメータの必須性検証
- [ ] 正常系テスト：有効なコマンドIDでの実行成功
- [ ] エラーテスト：存在しないコマンドID（404）
- [ ] エラーテスト：無効なコマンドID形式
- [ ] 非同期テスト：時間のかかるコマンドの処理
- [ ] ハンドラー実装：`src/features/execute-command/execute-command-handler.ts`
- [ ] Zodスキーマ定義：`src/features/execute-command/schema.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. commandIdの厳密な型チェック
2. エラー時の詳細なメッセージ提供
3. 非同期コマンドへの対応検討
4. list_commandsとの整合性確保

## 関連情報
- APIエンドポイント: POST /commands/{commandId}/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: list_commands（コマンド一覧取得）
- パスパラメータ: commandId（必須）
- 注意事項: コマンドIDはURLエンコードが必要

## 作業ログ
### 作業開始時に記録
- パスパラメータを含むAPI実装
- コマンド実行の安全性確保