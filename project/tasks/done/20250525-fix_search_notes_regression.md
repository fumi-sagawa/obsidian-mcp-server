# タスク名: search_notes ツールのデグレーション修正

## 概要
search_notesツールが実装されているが、app/index.tsで正しくimportおよび登録されていないため、機能が利用できない状態になっている。

## 背景・目的
project/tasks/done/20240524-search_notes.mdによると、search_notesツールは完了済みだが、現在app/index.tsで以下の問題が発生：
1. search-notesモジュールがimportされていない
2. ツール登録で間違ったハンドラー（simpleSearchHandler）を使用している
3. 結果として、JsonLogicクエリによる高度検索機能が利用できない

## To-Be（完了条件）
- [ ] app/index.tsでsearch-notesモジュールを正しくimport
- [ ] search_notesツールの登録でsearchNotesHandlerを使用（JsonLogic検索）
- [ ] 正しいスキーマ（searchNotesSchema）を使用
- [ ] simple_searchツールを`simple_search`として別途登録（文字列検索）
- [ ] 両方のツールが競合せずに正常動作することを確認
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. app/index.tsに`searchNotesHandler, searchNotesSchema`をimport追加
2. 225-230行目の`search_notes`ツール登録を修正：
   - `simpleSearchHandler` → `searchNotesHandler`
   - `simpleSearchRequestSchema` → `searchNotesSchema`
3. simple_searchツールを`simple_search`として新規追加登録
4. 両ツールの差別化を明確化：
   - `search_notes`: JsonLogicクエリによる高度検索
   - `simple_search`: 文字列による簡易検索

## 関連情報
- 完了済みタスク: project/tasks/done/20240524-search_notes.md
- 影響範囲: /src/app/index.ts（225-230行目）
- 実装済み: /src/features/search-notes/ 全ファイル
- 差別化: search_notes（JsonLogic）vs simple_search（文字列検索）

## 修正内容詳細
### 現在の問題箇所（225-230行目）
```typescript
server.tool(
  "search_notes",
  "Search notes by text query across entire vault",
  simpleSearchRequestSchema.shape,
  wrapHandler(simpleSearchHandler, 'search_notes')  // ← 間違い
);
```

### 修正後
```typescript
// search_notes: JsonLogicクエリによる高度検索
server.tool(
  "search_notes", 
  "Search notes using JsonLogic queries with advanced filtering",
  searchNotesSchema.shape,
  wrapHandler(searchNotesHandler, 'search_notes')
);

// simple_search: 文字列による簡易検索として追加
server.tool(
  "simple_search",
  "Search notes by simple text query across entire vault", 
  simpleSearchRequestSchema.shape,
  wrapHandler(simpleSearchHandler, 'simple_search')
);
```

## 作業ログ
### 2025-05-25 開始
- デグレーション問題を特定
- search_notesツールの実装は完了済みだが、app/index.tsの登録が間違っている
- 修正方針を決定