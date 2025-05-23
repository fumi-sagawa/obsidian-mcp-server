# タスク名: insert_into_active_file ツールの実装

## 概要
Obsidian Local REST APIの `/active/` エンドポイント（PATCH）に対応するMCPツール。アクティブファイルの指定位置にコンテンツを挿入する。

## 背景・目的
ファイルの特定の行番号にコンテンツを挿入できるようにし、精密な編集操作を可能にする。コードの修正やドキュメントの部分的な更新に活用。

## To-Be（完了条件）
- [ ] OpenAPI仕様から型定義を生成：`src/features/insert-into-active-file/types.ts`
- [ ] テストファイル `src/features/insert-into-active-file/tests/insert-into-active-file-handler.test.ts` を作成
- [ ] 型テスト：line（必須）とcontent（必須）の型検証
- [ ] 正常系テスト：指定行への正確な挿入
- [ ] 境界値テスト：1行目への挿入、最終行への挿入、最終行を超えた位置
- [ ] エラーテスト：負の行番号、0行目、型エラー
- [ ] 空ファイルテスト：空のファイルへの挿入動作
- [ ] ハンドラー実装：`src/features/insert-into-active-file/insert-into-active-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/insert-into-active-file/schema.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 行番号の扱いを明確化（1-indexed vs 0-indexed）
2. 型定義で必須パラメータを厳密に定義
3. 行番号の境界値処理を慎重に実装
4. エラーメッセージを分かりやすく

## 関連情報
- APIエンドポイント: PATCH /active/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_active_file, append_to_active_file
- RequestBody型: `{ line: number, content: string }`
- 注意事項: 行番号は1から始まる（1-indexed）

## 作業ログ
### 作業開始時に記録
- 型定義に基づくTDDの実践
- 行番号処理の仕様確認