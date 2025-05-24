# タスク名: simple_search ツールの実装

## 概要
Obsidian Local REST APIの `/search/simple/` エンドポイント（POST）に対応するMCPツール。シンプルなクエリでノートを検索する。

## 背景・目的
基本的な検索機能を提供し、複雑なオプションを必要としない日常的な検索を高速に実行できるようにする。

## To-Be（完了条件）
- [ ] リクエスト/レスポンス型定義：`src/features/simple-search/types.ts`
- [ ] SimpleSearchRequest型（query: string）
- [ ] SimpleSearchResponse型（results: SearchResult[]）
- [ ] テストファイル `src/features/simple-search/tests/simple-search-handler.test.ts` を作成
- [ ] 型テスト：必須パラメータqueryの検証
- [ ] 正常系テスト：基本的なキーワード検索
- [ ] 日本語テスト：日本語クエリでの検索
- [ ] 特殊文字テスト：記号を含むクエリの処理
- [ ] 空クエリテスト：適切なエラーハンドリング
- [ ] 結果なしテスト：マッチしない場合の処理
- [ ] ハンドラー実装：`src/features/simple-search/simple-search-handler.ts`
- [ ] Zodスキーマ定義：`src/features/simple-search/schema.ts`
- [ ] フォーマッター実装：`src/features/simple-search/format-results.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. シンプルで使いやすいインターフェース
2. search_notesとの差別化（簡易版として）
3. 高速なレスポンスを重視
4. 結果の見やすいフォーマット

## 関連情報
- APIエンドポイント: POST /search/simple/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: search_notes（詳細検索版）
- RequestBody型: `{ query: string }`
- 特徴: 正規表現や大文字小文字の区別なし

## 作業ログ
### 作業開始時に記録
- シンプルな検索機能の実装
- ユーザビリティ重視の設計

### 2025-05-24 00:40
- 実装作業開始
- API仕様書を確認（POST /search/simple/）
- 型定義の作成完了（types.ts）
- Zodスキーマの定義完了（schema.ts）
- テストファイルの作成完了（18テストケース）
- ハンドラーの実装完了
- フォーマッターの実装完了
- Obsidian APIクライアントにsearchSimpleメソッドを追加
- app/index.tsにツール登録
- 統合テストファイルの作成完了
- モックテストファイルの作成完了
- 全ユニットテスト合格
- ビルド成功