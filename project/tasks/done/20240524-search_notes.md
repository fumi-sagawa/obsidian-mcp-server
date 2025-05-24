# タスク名: search_notes ツールの実装

## 概要
Obsidian Local REST APIの `/search/` エンドポイント（POST）に対応するMCPツール。JsonLogicクエリを使用した高度な検索を実行する。

## 背景・目的
JsonLogicクエリを使用してObsidianのノートを論理的に検索し、構造化されたデータとして結果を取得する。simple_searchとの差別化として、glob、regexp、論理演算子を活用した複雑で強力な検索機能を提供する。

## To-Be（完了条件）
- [ ] 型定義ファイル作成：`src/features/search-notes/types.ts`
  - [ ] SearchNotesRequest型（jsonLogicQuery: JsonLogicQuery）
  - [ ] JsonLogicQuery型（JsonLogic仕様に基づく）
  - [ ] SearchNotesResponse型（filename, result配列）
  - [ ] SearchResult型（filename: string, result: any）
- [ ] テストファイル `src/features/search-notes/tests/search-notes-handler.test.ts` を作成
  - [ ] 型定義に基づいたテストデータ構築
  - [ ] 正常系テスト：JsonLogicクエリでの検索結果検証
  - [ ] タグ検索テスト：in演算子でのタグマッチング確認
  - [ ] glob検索テスト：ファイル名パターンマッチング確認
  - [ ] regexp検索テスト：正規表現マッチング確認
  - [ ] エラーケーステスト：不正なクエリでのハンドリング
  - [ ] 結果フォーマットテスト：検索結果の整形
- [ ] ハンドラー実装：`src/features/search-notes/search-notes-handler.ts`
- [ ] Zodスキーマ定義：`src/features/search-notes/schema.ts`（型定義と整合）
- [ ] フォーマッター実装：`src/features/search-notes/format-search-results.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. OpenAPI仕様に忠実に従い、JsonLogicクエリのみをサポート（MCPとして扱いやすい）
2. Content-type: application/vnd.olrapi.jsonlogic+json で固定
3. 型定義に基づいてJsonLogicクエリをテスト（TDD）
4. Zodでの型安全なクエリ検証
5. LLMが生成しやすいJSON構造のクエリインターフェース
6. simple_searchとの差別化：論理演算・glob・regexp機能

## 関連情報
- APIエンドポイント: POST /search/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: simple_search（簡易版）
- サポートクエリ: JsonLogic のみ
- Content-type: application/vnd.olrapi.jsonlogic+json
- JsonLogic演算子: ==, in, glob, regexp, or, and など

## 作業ログ
### 2025-05-24 12:30 作業開始
- OpenAPI仕様確認、JsonLogicクエリに特化
- TDDサイクルでの開発開始

### 2025-05-24 13:00 重要なアーキテクチャ判断
**JsonLogicクエリの文字列ベース実装**

当初、JsonLogicの複雑な再帰構造をZodで型定義しようとしたが、以下の理由で文字列ベースのアプローチに変更：

#### 問題点
- JsonLogicの動的で再帰的な構造をZodで完全に表現するのは現実的でない
- 複雑なunion型と再帰型でZodスキーマが非常に冗長になる
- 型安全性を追求しすぎて実用性が損なわれる

#### 解決策：GraphQLライクなアプローチ
- **文字列として受け取り、サービス側でパース**する方式を採用
- この手法はGraphQLなどでも一般的に使用される
- `jsonLogicQuery: string` として受け取り、ハンドラー内で `JSON.parse()` してオブジェクトに変換

#### メリット
- **実装の単純化**: Zodスキーマが大幅に簡略化
- **保守性向上**: 複雑な型定義の管理が不要
- **LLMフレンドリー**: 文字列なのでLLMが生成しやすい
- **機能性維持**: JsonLogicの全機能を活用可能
- **エラーハンドリング**: JSON解析エラーも適切に処理

#### 他の選択肢
- 通常のAPIサーバーのように複数のエンドポイントを用意する方法もあったが、JsonLogic検索APIの自由度が下がってしまうため採用せず

#### 結果
- 全7つのテストケースが成功
- ビルド成功
- 実用的で保守しやすい実装を実現

この判断により、search_notesツールは実装の複雑さを避けながら、JsonLogicの強力な検索機能を提供できるようになった。