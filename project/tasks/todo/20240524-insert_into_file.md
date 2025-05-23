# タスク名: insert_into_file ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{filename}` エンドポイント（PATCH）に対応するMCPツール。指定したファイルの特定行にコンテンツを挿入する。

## 背景・目的
ファイルの任意の位置に精密にコンテンツを挿入できるようにし、既存ノートの部分的な編集や構造化された文書の管理を可能にする。

## To-Be（完了条件）
- [ ] 型定義ファイル：`src/features/insert-into-file/types.ts`
- [ ] InsertRequest型（filename: string, line: number, content: string）
- [ ] InsertResponse型（success: boolean, message: string）
- [ ] テストファイル `src/features/insert-into-file/tests/insert-into-file-handler.test.ts` を作成
- [ ] 型テスト：line番号の型と範囲検証
- [ ] 正常系テスト：中間行への挿入
- [ ] 境界値テスト：1行目、最終行、範囲外
- [ ] 空ファイルテスト：空ファイルへの挿入
- [ ] 大容量テスト：大きなファイルでの性能
- [ ] エラーテスト：負の行番号、浮動小数点
- [ ] 行番号検証テスト：0-indexed vs 1-indexed
- [ ] ハンドラー実装：`src/features/insert-into-file/insert-into-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/insert-into-file/schema.ts`
- [ ] 行番号処理実装：`src/features/insert-into-file/line-processor.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 行番号の仕様を明確化（1-indexed）
2. 範囲外の行番号への対応方針
3. insert_into_active_fileとの一貫性
4. ファイルの行数カウント最適化

## 関連情報
- APIエンドポイント: PATCH /vault/{filename}
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: append_to_file, create_or_update_file
- RequestBody型: `{ line: number, content: string }`
- 類似ツール: insert_into_active_file

## 作業ログ
### 作業開始時に記録
- 行指定挿入機能の実装
- 行番号処理の最適化