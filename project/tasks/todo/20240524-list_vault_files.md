# タスク名: list_vault_files ツールの実装

## 概要
Obsidian Local REST APIの `/vault/` エンドポイント（GET）に対応するMCPツール。Vaultルートディレクトリのファイル一覧を取得する。

## 背景・目的
Obsidian Vaultのルートディレクトリにあるファイルとフォルダの一覧を取得し、Vault構造の把握やファイル操作の基盤を提供する。

## To-Be（完了条件）
- [ ] 型定義ファイル作成：`src/features/list-vault-files/types.ts`
  - [ ] VaultItem型（name: string, type: 'file' | 'directory'）
  - [ ] VaultFileListResponse型（items: VaultItem[]）
- [ ] テストファイル `src/features/list-vault-files/tests/list-vault-files-handler.test.ts` を作成
  - [ ] 型定義に基づいたモックデータ作成
  - [ ] 正常系テスト：VaultFileListResponse型での一覧取得
  - [ ] 空ディレクトリテスト：空配列の型安全な処理
  - [ ] 大量ファイルテスト：多数のVaultItemの処理
  - [ ] ファイルタイプテスト：型の判別ロジック
  - [ ] エラーテスト：Vault接続エラー時の処理
- [ ] ハンドラー実装：`src/features/list-vault-files/list-vault-files-handler.ts`
- [ ] Zodスキーマ定義：`src/features/list-vault-files/schema.ts`（型定義と整合）
- [ ] フォーマッター実装：`src/features/list-vault-files/format-file-list.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. VaultItem型でファイル/ディレクトリを明確に区別
2. 型定義に基づいてテストケースを作成（TDD）
3. ファイルとフォルダを視覚的に区別する表示
4. ソート順序の考慮（アルファベット順など）
5. list_directoryツールとの一貫性を保つ

## 関連情報
- APIエンドポイント: GET /vault/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: list_directory（サブディレクトリ用）
- レスポンス例: ["Note.md", "Daily/", "Projects/"]

## 作業ログ
### 作業開始時に記録
- TDDサイクルの開始
- ファイルシステム操作の基盤実装