# タスク名: delete_file ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{filename}` エンドポイント（DELETE）に対応するMCPツール。指定したファイルを削除する。

## 背景・目的
不要になったファイルを安全に削除できるようにし、Vault内の整理整頓を支援する。破壊的操作のため慎重な実装が必要。

## To-Be（完了条件）
- [ ] 型定義ファイル：`src/features/delete-file/types.ts`
- [ ] DeleteRequest型（filename: string）
- [ ] DeleteResponse型（success: boolean, message: string）
- [ ] テストファイル `src/features/delete-file/tests/delete-file-handler.test.ts` を作成
- [ ] 型テスト：ファイルパスの形式検証
- [ ] 正常系テスト：ファイルの正常削除
- [ ] エラーテスト：存在しないファイル（404）
- [ ] エラーテスト：削除権限なし（403）
- [ ] エラーテスト：ディレクトリの削除試行
- [ ] 確認テスト：削除前の確認メカニズム
- [ ] ゴミ箱テスト：削除ファイルの復元可能性
- [ ] ハンドラー実装：`src/features/delete-file/delete-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/delete-file/schema.ts`
- [ ] 安全性チェック実装：`src/features/delete-file/safety-check.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 破壊的操作の安全性を最優先
2. 削除前の確認プロセス
3. エラー時の詳細な情報提供
4. delete_active_fileとの一貫性

## 関連情報
- APIエンドポイント: DELETE /vault/{filename}
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_file（削除前の確認用）
- 類似ツール: delete_active_file
- 警告: 復元不可能な破壊的操作

## 作業ログ
### 作業開始時に記録
- 安全な削除機能の実装
- エラーハンドリングの充実