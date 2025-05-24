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
### 2025-01-24 12:27
- 作業開始: ブランチ feature/20240524-update_active_file を作成
- 型定義ファイル作成: `src/features/update-active-file/types.ts`
  - UpdateActiveFileRequest, UpdateActiveFileResponse, UpdateError型を定義
  - 破壊的操作の安全性を考慮したエラー型設計

### 2025-01-24 12:29
- テストファイル作成: `src/features/update-active-file/tests/update-active-file-handler.test.ts`
  - 型定義に基づいたテストケースを作成
  - 正常系: 通常更新、空コンテンツ、大容量、特殊文字
  - エラー系: ファイル不在、更新失敗、ディレクトリ、ネットワークエラー、タイムアウト
  - バリデーション: 型チェック、必須項目

### 2025-01-24 12:30
- ハンドラー実装: `src/features/update-active-file/update-active-file-handler.ts`
  - MCPツールハンドラーの形式に準拠
  - 内部処理用のCore関数とMCPハンドラーを分離
  - 詳細なエラーハンドリング実装
- ObsidianAPIClientクラスに updateActiveFile メソッドを追加
  - PUT /active/ エンドポイントの実装
  - 204 No Content レスポンスの処理

### 2025-01-24 12:31
- テスト実行: 全12件のテストが成功
  - エラー処理の修正（ApiError.details -> metadata）
  - ValidationErrorの引数修正
  - モックエラー処理の追加
- ビルド成功: TypeScriptコンパイルエラーをすべて解決
- 統合テスト: モックサーバーでの動作確認
  - test-tools-mock.jsにupdate_active_fileのテストケースを追加
  - PUT /active/ エンドポイントのモック処理を追加
  - 全7件のテストが成功（既存5件 + 新規2件）

### 完了事項
- [x] 型定義ファイル作成
- [x] テストファイル作成（全テストケース網羅）
- [x] ハンドラー実装
- [x] Zodスキーマ定義
- [x] index.tsでのエクスポート
- [x] app/index.tsへのツール登録
- [x] 全テストが通る
- [x] 統合テストで動作確認