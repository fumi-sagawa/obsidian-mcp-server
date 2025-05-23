# タスク名: search_notes ツールの実装

## 概要
Obsidian Local REST APIの `/search/` エンドポイント（POST）に対応するMCPツール。詳細な検索条件でノートを検索する。

## 背景・目的
複雑な検索条件（正規表現、大文字小文字の区別など）を使用してObsidianのノートを検索し、知識ベースから必要な情報を効率的に取得する。

## To-Be（完了条件）
- [ ] 型定義ファイル作成：`src/features/search-notes/types.ts`
  - [ ] SearchNotesRequest型（query: string, contextMatches?: boolean, ignoreCase?: boolean）
  - [ ] SearchResult型（filename: string, matches: Match[]）
  - [ ] Match型（line: number, context: string）
- [ ] テストファイル `src/features/search-notes/tests/search-notes-handler.test.ts` を作成
  - [ ] 型定義に基づいたテストデータ構築
  - [ ] 正常系テスト：SearchResult[]型での結果検証
  - [ ] 正規表現テスト：contextMatchesオプションの型安全な動作確認
  - [ ] 大文字小文字テスト：ignoreCaseオプションの型安全な動作確認
  - [ ] 空クエリテスト：適切なエラー型でのハンドリング
  - [ ] 結果フォーマットテスト：検索結果の整形
- [ ] ハンドラー実装：`src/features/search-notes/search-notes-handler.ts`
- [ ] Zodスキーマ定義：`src/features/search-notes/schema.ts`（型定義と整合）
- [ ] フォーマッター実装：`src/features/search-notes/format-search-results.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 検索オプションを含む詳細な型定義から開始
2. 型定義に基づいて複雑な検索オプションをテスト（TDD）
3. 検索結果の見やすいフォーマット処理
4. パフォーマンスを考慮（大量の検索結果への対応）
5. simple_searchとの差別化を明確に

## 関連情報
- APIエンドポイント: POST /search/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: simple_search（簡易版）
- 検索オプション: query, contextMatches, ignoreCase

## 作業ログ
### 作業開始時に記録
- TDDサイクルの開始
- 高度な検索機能の実装