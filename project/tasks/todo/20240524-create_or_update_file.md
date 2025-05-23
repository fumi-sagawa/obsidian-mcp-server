# タスク名: create_or_update_file ツールの実装

## 概要
Obsidian Local REST APIの `/vault/{filename}` エンドポイント（PUT）に対応するMCPツール。ファイルを新規作成または既存ファイルを更新する。

## 背景・目的
Vault内に新しいノートを作成したり、既存のノートを完全に書き換えたりできるようにし、プログラムからのコンテンツ管理を実現する。

## To-Be（完了条件）
- [ ] 型定義ファイル：`src/features/create-or-update-file/types.ts`
- [ ] CreateUpdateRequest型（filename: string, content: string）
- [ ] CreateUpdateResponse型（created: boolean, message: string）
- [ ] テストファイル `src/features/create-or-update-file/tests/create-or-update-file-handler.test.ts` を作成
- [ ] 型テスト：必須パラメータの検証
- [ ] 新規作成テスト：存在しないファイルの作成
- [ ] 更新テスト：既存ファイルの上書き
- [ ] ディレクトリ作成テスト：親ディレクトリの自動作成
- [ ] 空コンテンツテスト：空ファイルの作成
- [ ] パス検証テスト：無効なパスの拒否
- [ ] 大容量テスト：大きなコンテンツの処理
- [ ] ハンドラー実装：`src/features/create-or-update-file/create-or-update-file-handler.ts`
- [ ] Zodスキーマ定義：`src/features/create-or-update-file/schema.ts`
- [ ] パス処理実装：`src/features/create-or-update-file/path-handler.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 新規作成と更新を区別したレスポンス
2. ディレクトリの自動作成オプション
3. ファイルパスの安全性検証
4. 原子性を考慮した更新処理

## 関連情報
- APIエンドポイント: PUT /vault/{filename}
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: get_file, append_to_file, delete_file
- RequestBody型: `{ content: string }`
- 注意事項: 既存ファイルは完全に上書きされる

## 作業ログ
### 作業開始時に記録
- ファイル作成/更新の統合実装
- 型安全性とエラーハンドリング