# タスク名: insert_into_active_file ツールの実装

## 概要
Obsidian Local REST APIの `/active/` エンドポイント（PATCH）に対応するMCPツール。アクティブファイルの見出し、ブロック参照、またはfrontmatterフィールドを基準にコンテンツを挿入する。

## 背景・目的
ファイルの特定の見出しやブロック参照を基準にコンテンツを挿入・編集できるようにし、構造化されたドキュメントの部分的な更新を可能にする。

## To-Be（完了条件）
- [ ] OpenAPI仕様から型定義を生成：`src/features/insert-into-active-file/types.ts`
- [ ] テストファイル `src/features/insert-into-active-file/tests/insert-into-active-file-handler.test.ts` を作成
- [ ] 型テスト：operation、targetType、target、contentの型検証
- [ ] 正常系テスト：見出しへのappend/prepend/replace
- [ ] 正常系テスト：ブロック参照へのappend/prepend/replace
- [ ] 正常系テスト：frontmatterフィールドのreplace
- [ ] エラーテスト：存在しない見出し/ブロック/フィールド
- [ ] エラーテスト：不正なoperation/targetType
- [ ] ハンドラー実装：`src/features/insert-into-active-file/insert-into-active-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/insert-into-active-file/schema.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. PATCH APIのヘッダーベースのパラメータをMCPツールのパラメータに変換
2. operation（append/prepend/replace）の型安全性を確保
3. targetType（heading/block/frontmatter）ごとの処理を実装
4. ネストした見出しの区切り文字（::）のサポート
5. エラーメッセージを分かりやすく

## 関連情報
- APIエンドポイント: PATCH /active/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_active_file, append_to_active_file, update_active_file
- Headers: Operation, Target-Type, Target, Target-Delimiter, Trim-Target-Whitespace
- RequestBody: text/markdown または application/json
- 注意事項: ヘッダーベースのパラメータ指定、Target値のURLエンコード必要

## 作業ログ
### 2025-05-24 14:22
- タスクファイルを確認し、ブランチを作成
- OpenAPI仕様を確認、行番号ベースではなくPATCH APIの仕様を誤解していたことが判明

### 2025-05-24 14:35
- 実装方針の誤りに気づき、最初からやり直すことを決定
- PATCH APIは見出し、ブロック参照、frontmatterを基準にした挿入であることを確認
- タスクファイルの要件を正しいAPI仕様に合わせて修正

### 2025-05-24 14:52
- 正しいPATCH API仕様に基づいて型定義を作成
  - Operation: append/prepend/replace
  - TargetType: heading/block/frontmatter
  - ヘッダーベースのパラメータ設計
- 包括的なテストケース作成（15ケース）
  - 見出し、ブロック参照、frontmatterへの操作
  - カスタム区切り文字、JSON形式、特殊文字処理
- ObsidianAPIClientにpatchActiveFileメソッドを追加
- ハンドラー実装：ヘッダー構築とエラーハンドリング
- Zodスキーマでパラメータバリデーション実装
- 単体テスト: 15/15 成功
- 統合テスト: 5/5 成功

### 完了状況
- [x] 型定義の生成
- [x] テストファイルの作成（15ケース）
- [x] ObsidianAPIClientの拡張
- [x] ハンドラー実装
- [x] Zodスキーマ定義
- [x] index.tsでのエクスポート
- [x] app/index.tsへのツール登録
- [x] 全テストが通る
- [x] 統合テストで動作確認

### 実装の特記事項
- Obsidian Local REST APIのPATCH仕様を正確にラップ
- ヘッダーベースのパラメータをMCPツールのパラメータに変換
- 非ASCII文字と特殊文字の自動URLエンコード対応
- JSON形式でのテーブル操作サポート