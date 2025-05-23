# タスク名: list_directory ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{pathToDirectory}/` エンドポイント（GET）に対応するMCPツール。指定したディレクトリ内のファイル一覧を取得する。

## 背景・目的
Vault内の特定のディレクトリの内容を確認し、階層的なファイル管理とナビゲーションを可能にする。

## To-Be（完了条件）
- [ ] パラメータ型定義：`src/features/list-directory/types.ts`
- [ ] DirectoryPath型（パスの妥当性検証を含む）
- [ ] DirectoryListing型（files: string[]）
- [ ] テストファイル `src/features/list-directory/tests/list-directory-handler.test.ts` を作成
- [ ] 型テスト：パスパラメータの形式検証
- [ ] 正常系テスト：ディレクトリ内容の取得
- [ ] ネストテスト：深い階層のディレクトリ
- [ ] 空ディレクトリテスト：ファイルがない場合
- [ ] エラーテスト：存在しないディレクトリ（404）
- [ ] エラーテスト：無効なパス形式
- [ ] 特殊パステスト：スペースや日本語を含むパス
- [ ] ハンドラー実装：`src/features/list-directory/list-directory-handler.ts`
- [ ] Zodスキーマ定義：`src/features/list-directory/schema.ts`
- [ ] パス正規化実装：`src/features/list-directory/normalize-path.ts`
- [ ] フォーマッター実装：`src/features/list-directory/format-listing.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. パスの正規化と安全性検証
2. ファイル/フォルダの視覚的区別
3. list_vault_filesとの一貫性
4. パストラバーサル攻撃への対策

## 関連情報
- APIエンドポイント: GET /vault/{pathToDirectory}/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: list_vault_files（ルート用）
- パスパラメータ: pathToDirectory（URLエンコード必須）
- 注意事項: セキュリティを考慮したパス処理

## 作業ログ
### 作業開始時に記録
- ディレクトリ操作の型安全な実装
- パス処理のベストプラクティス適用