# タスク名: get_server_status ツールの実装

## 概要
Obsidian Local REST APIの `/` エンドポイントに対応するMCPツール。サーバーの状態を取得する機能を実装する。

## 背景・目的
Obsidianサーバーの接続状態や基本情報を確認できるようにし、MCPクライアントからサーバーの健全性を確認可能にする。

## To-Be（完了条件）
- [ ] 型定義ファイル作成：`src/features/get-server-status/types.ts`
  - [ ] ServerStatusResponse型（APIレスポンスの型）
  - [ ] エラーレスポンス型の定義
- [ ] テストファイル `src/features/get-server-status/tests/get-server-status-handler.test.ts` を作成
  - [ ] 型定義に基づいたモックデータの作成
  - [ ] 正常系テスト：ServerStatusResponse型に準拠した応答
  - [ ] 異常系テスト：エラー型に準拠したエラーハンドリング
  - [ ] タイムアウトテスト：API応答が遅い場合の処理
- [ ] ハンドラー実装：`src/features/get-server-status/get-server-status-handler.ts`
- [ ] Zodスキーマ定義：`src/features/get-server-status/schema.ts`（型定義と整合）
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. OpenAPI仕様から正確な型定義を作成（型駆動開発）
2. 型定義に基づいてテストを作成（TDD）
3. テストが型安全であることを確認
4. エラーハンドリングを含む堅牢な実装
5. 既存のHTTPクライアント（shared/api）を活用

## 関連情報
- APIエンドポイント: GET /
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: なし（独立した機能）

## 作業ログ
### 作業開始時に記録
- TDDサイクルの開始
- テストケースの設計