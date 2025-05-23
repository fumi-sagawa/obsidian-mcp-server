# タスク名: update_active_file ツールの実装

## 概要
Obsidian Local REST APIの `/active/` エンドポイント（PUT）に対応するMCPツール。アクティブファイルの内容を完全に置き換える。

## 背景・目的
MCPクライアントから現在編集中のファイルの内容を更新できるようにし、AIアシスタントによるコード修正やドキュメント改善を可能にする。

## To-Be（完了条件）
- [ ] 型定義ファイル作成：`src/features/update-active-file/types.ts`
  - [ ] UpdateActiveFileRequest型（content: string）
  - [ ] UpdateActiveFileResponse型（success: boolean, message: string）
  - [ ] UpdateError型（各種エラーケース）
- [ ] テストファイル `src/features/update-active-file/tests/update-active-file-handler.test.ts` を作成
  - [ ] 型に基づいたリクエスト/レスポンスの検証
  - [ ] 正常系テスト：UpdateActiveFileResponse型での成功確認
  - [ ] 検証テスト：空コンテンツでの更新
  - [ ] エラーテスト：UpdateError型での失敗ケース
  - [ ] 大容量テスト：大きなファイルの更新
- [ ] ハンドラー実装：`src/features/update-active-file/update-active-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/update-active-file/schema.ts`（型定義と整合）
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 型定義から始める（リクエスト/レスポンス/エラー）
2. 型に基づいてテストケースを設計（TDD）
3. 破壊的操作のため、慎重なバリデーション
4. 更新前の状態確認（get_active_fileとの連携を推奨）
5. 成功/失敗の明確なフィードバック

## 関連情報
- APIエンドポイント: PUT /active/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_active_file（更新前の確認用）
- 注意事項: ファイル全体を置き換える破壊的操作

## 作業ログ
### 作業開始時に記録
- TDDサイクルの開始
- 破壊的操作の安全性を重視した設計