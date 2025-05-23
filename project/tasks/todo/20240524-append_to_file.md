# タスク名: append_to_file ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{filename}` エンドポイント（POST）に対応するMCPツール。指定したファイルの末尾にコンテンツを追記する。

## 背景・目的
既存のファイルに新しい情報を追加できるようにし、ログの記録や段階的なノート作成を効率化する。

## To-Be（完了条件）
- [ ] 型定義ファイル：`src/features/append-to-file/types.ts`
- [ ] AppendRequest型（filename: string, content: string）
- [ ] AppendResponse型（success: boolean, message: string）
- [ ] テストファイル `src/features/append-to-file/tests/append-to-file-handler.test.ts` を作成
- [ ] 型テスト：パラメータの必須性と形式
- [ ] 正常系テスト：既存ファイルへの追記
- [ ] 新規ファイルテスト：存在しないファイルへの追記動作
- [ ] 改行テスト：追記時の改行処理
- [ ] 空文字テスト：空のコンテンツ追記
- [ ] エラーテスト：無効なファイルパス
- [ ] 日本語テスト：マルチバイト文字の追記
- [ ] ハンドラー実装：`src/features/append-to-file/append-to-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/append-to-file/schema.ts`
- [ ] 改行処理実装：`src/features/append-to-file/line-handler.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 改行の扱いを明確化（自動改行の有無）
2. ファイルが存在しない場合の動作定義
3. append_to_active_fileとの一貫性
4. パフォーマンスを考慮した実装

## 関連情報
- APIエンドポイント: POST /vault/{filename}
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: create_or_update_file, insert_into_file
- RequestBody型: `{ content: string }`
- 類似ツール: append_to_active_file

## 作業ログ
### 作業開始時に記録
- ファイル追記機能の実装
- 改行処理の仕様確認