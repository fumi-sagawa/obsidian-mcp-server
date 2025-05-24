# タスク名: delete_active_file ツールの実装

## 概要
Obsidian Local REST APIの `/active/` エンドポイント（DELETE）に対応するMCPツール。現在アクティブなファイルを削除する。

## 背景・目的
不要になったファイルを安全に削除できるようにする。破壊的操作のため、慎重な実装と明確な警告が必要。

## To-Be（完了条件）
- [ ] API仕様の型定義：`src/features/delete-active-file/types.ts`
- [ ] テストファイル `src/features/delete-active-file/tests/delete-active-file-handler.test.ts` を作成
- [ ] 型テスト：レスポンス型の検証（成功/エラー）
- [ ] 正常系テスト：ファイルの正常な削除と確認メッセージ
- [ ] エラーテスト：アクティブファイルが存在しない場合（404）
- [ ] エラーテスト：削除権限がない場合（403）
- [ ] 確認テスト：削除前の確認プロンプト実装の検討
- [ ] ハンドラー実装：`src/features/delete-active-file/delete-active-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/delete-active-file/schema.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 破壊的操作の安全性を最優先
2. 明確なエラーメッセージと型定義
3. 削除前の状態確認を推奨（get_active_fileとの連携）
4. 成功時の確認メッセージを分かりやすく

## 関連情報
- APIエンドポイント: DELETE /active/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_active_file（削除前の確認用）
- ResponseBody: 204 No Content（ボディなし）
- 警告: 復元不可能な操作
- 注意: API仕様に基づき、削除成功時はレスポンスボディがないため、MCPツールとしては成功メッセージを内部で生成する

## 作業ログ
### 2025-05-24 16:15
- OpenAPI仕様書を確認し、DELETE /active/ は204 No Contentを返すことを確認
- タスクファイルを修正（API仕様に合わせてResponseBody型を修正）
- ブランチ作成とタスクファイル移動完了
- 型定義ファイル作成（types.ts）- API仕様に基づく正確な型定義
- テストファイル作成 - 正常系、404エラー、405エラー、ネットワークエラーをカバー
- ハンドラー実装 - obsidianApi.deleteActiveFile()メソッドを追加
- Zodスキーマ定義 - パラメータなしのスキーマ
- index.tsでのエクスポート設定完了
- app/index.tsへのツール登録完了（警告メッセージ付き）
- 単体テスト修正とすべて合格確認
- 統合テストファイル作成（integration.js, mock.js）
- テストランナーへの追加完了
- モックサーバーにDELETE /active/エンドポイント追加
- 全ての実装が完了し、テストが通過することを確認