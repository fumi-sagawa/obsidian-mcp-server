# タスク名: get_active_file ツールの実装

## 概要
Obsidian Local REST APIの `/active/` エンドポイント（GET）に対応するMCPツール。現在アクティブなファイルの内容を取得する。

## 背景・目的
ユーザーが現在編集中のファイルの内容をMCPクライアントから取得できるようにし、コンテキストに応じた支援を可能にする。

## To-Be（完了条件）
- [ ] 型定義ファイル作成：`src/features/get-active-file/types.ts`
  - [ ] ActiveFileResponse型（content: string, filepath: string）
  - [ ] NoActiveFileError型（アクティブファイルなし）
- [ ] テストファイル `src/features/get-active-file/tests/get-active-file-handler.test.ts` を作成
  - [ ] 型定義に基づいたテストデータ準備
  - [ ] 正常系テスト：ActiveFileResponse型での検証
  - [ ] エッジケース：NoActiveFileError型での検証
  - [ ] エラーテスト：API接続エラー時の処理
  - [ ] エンコーディングテスト：日本語コンテンツの正常取得
- [ ] ハンドラー実装：`src/features/get-active-file/get-active-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/get-active-file/schema.ts`
- [ ] フォーマッター実装：`src/features/get-active-file/format-active-file.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. APIレスポンスの型定義を最初に作成（型駆動開発）
2. 型定義に基づいてテストを設計（TDD）
3. ファイル内容のフォーマット処理を分離
4. エラー時のユーザーフレンドリーなメッセージ

## 関連情報
- APIエンドポイント: GET /active/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: update_active_file, append_to_active_file, insert_into_active_file, delete_active_file

## 作業ログ
### 作業開始時に記録
- TDDサイクルの開始
- アクティブファイル操作系ツールの基盤として設計