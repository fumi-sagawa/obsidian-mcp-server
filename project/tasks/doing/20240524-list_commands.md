# タスク名: list_commands ツールの実装

## 概要
Obsidian Local REST APIの `/commands/` エンドポイント（GET）に対応するMCPツール。利用可能なObsidianコマンドの一覧を取得する。

## 背景・目的
Obsidianで実行可能なコマンドの一覧を取得し、execute_commandツールと連携して様々な操作を自動化できるようにする。

## To-Be（完了条件）
- [ ] APIレスポンス型定義：`src/features/list-commands/types.ts`
- [ ] CommandInfo型の定義（id: string, name: string）
- [ ] テストファイル `src/features/list-commands/tests/list-commands-handler.test.ts` を作成
- [ ] 型テスト：CommandInfo配列の型検証
- [ ] 正常系テスト：コマンド一覧の取得と構造確認
- [ ] 空リストテスト：コマンドが存在しない場合
- [ ] フォーマットテスト：見やすい一覧表示
- [ ] フィルタリングテスト：特定のコマンドの検索（将来実装）
- [ ] ハンドラー実装：`src/features/list-commands/list-commands-handler.ts`
- [ ] Zodスキーマ定義：`src/features/list-commands/schema.ts`
- [ ] フォーマッター実装：`src/features/list-commands/format-commands.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. コマンド情報の型を明確に定義
2. 大量のコマンドに対応できる表示形式
3. execute_commandとの連携を考慮
4. コマンドのカテゴリ分けやフィルタリング機能の拡張性

## 関連情報
- APIエンドポイント: GET /commands/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: execute_command（コマンド実行用）
- ResponseBody型: `Array<{ id: string, name: string }>`

## 作業ログ
### 2025-05-24 16:30
- 作業開始：ブランチ作成とタスクファイル移動
- OpenAPI仕様書で /commands/ エンドポイントの仕様を確認
- 型定義作成：CommandInfo、ListCommandsResponse、ListCommandsToolResponse
- テスト作成：単体テスト（8件）を実装し、全て通過
- フォーマッター実装：コマンド一覧を見やすく表示する処理
- ハンドラー実装：ObsidianAPIClientを使用した実装
- app/index.tsへのツール登録
- 統合テスト作成：integration.js、mock.js
- モックサーバーに/commands/エンドポイントを追加
- モックテスト実行：成功を確認

### 実装完了時の状態
- ✅ 型定義作成完了
- ✅ 単体テスト作成・全て通過
- ✅ ハンドラー実装完了
- ✅ フォーマッター実装完了
- ✅ ツール登録完了
- ✅ 統合テスト作成完了
- ✅ モックテスト通過