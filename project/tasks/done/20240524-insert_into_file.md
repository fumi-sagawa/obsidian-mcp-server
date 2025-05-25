# タスク名: insert_into_file ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{filename}` エンドポイント（PATCH）に対応するMCPツール。ヘッダーベースで指定したファイルのheading/block/frontmatterの相対的な位置にコンテンツを挿入する。

## 背景・目的  
既存ノートの特定の見出し、ブロック参照、またはfrontmatterフィールドに相対的にコンテンツを挿入することで、構造化された文書の管理を可能にする。

## API仕様確認結果
OpenAPI仕様書確認により、「特定行への挿入」ではなく以下の機能が正しい：
- **heading**: 見出しに対する append/prepend/replace
- **block**: ブロック参照に対する append/prepend/replace  
- **frontmatter**: frontmatterフィールドに対する append/prepend/replace

## To-Be（完了条件）
- [ ] 型定義ファイル：`src/features/insert-into-file/types.ts`
- [ ] InsertRequest型（filename: string, operation: 'append'|'prepend'|'replace', targetType: 'heading'|'block'|'frontmatter', target: string, content: string）
- [ ] InsertResponse型（success: boolean, message?: string）
- [ ] テストファイル `src/features/insert-into-file/tests/insert-into-file-handler.test.ts` を作成
- [ ] 正常系テスト：見出しへの挿入
- [ ] 正常系テスト：ブロック参照への挿入
- [ ] 正常系テスト：frontmatterフィールドへの挿入
- [ ] エラーテスト：存在しない見出し/ブロック/フィールド
- [ ] パラメータ検証テスト：不正なoperation/targetType
- [ ] ハンドラー実装：`src/features/insert-into-file/insert-into-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/insert-into-file/schema.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. API仕様に忠実に、PATCH /vault/{filename} エンドポイントを使用
2. 必要なヘッダー（Operation, Target-Type, Target）を正しく設定
3. insert_into_active_fileとの一貫性を保つ
4. エラーハンドリングの充実

## 関連情報
- APIエンドポイント: PATCH /vault/{filename}
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: append_to_file, create_or_update_file
- 必須ヘッダー: Operation, Target-Type, Target
- 類似ツール: insert_into_active_file

## 作業ログ
### 2024-05-24 作業開始
- OpenAPI仕様書確認により、タスク要件をAPI仕様に合わせて修正
- 「特定行への挿入」ではなく「相対的位置への挿入」が正しい仕様と判明