# タスク名: get_periodic_note ツールの実装

## 概要
Obsidian Local REST APIの `/periodic/{period}/` エンドポイント（GET）に対応するMCPツール。デイリーノートなどの定期ノートの内容を取得する。

## 背景・目的
Obsidianの定期ノート機能（デイリー、ウィークリー、マンスリーノート）にアクセスし、日記や定期的な記録の管理を自動化する。

## To-Be（完了条件）
- [ ] 型定義ファイル：`src/features/get-periodic-note/types.ts`
- [ ] PeriodType型（'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'）
- [ ] PeriodicNoteContent型（content: string, date: string, exists: boolean）
- [ ] テストファイル `src/features/get-periodic-note/tests/get-periodic-note-handler.test.ts` を作成
- [ ] 型テスト：period列挙型の検証
- [ ] 正常系テスト：各期間タイプでの取得
- [ ] 日付テスト：今日、過去、未来の日付
- [ ] 存在確認テスト：ノートが存在しない場合
- [ ] フォーマットテスト：日付形式の違い
- [ ] エラーテスト：無効なperiodタイプ
- [ ] ハンドラー実装：`src/features/get-periodic-note/get-periodic-note-handler.ts`
- [ ] Zodスキーマ定義：`src/features/get-periodic-note/schema.ts`
- [ ] 日付処理実装：`src/features/get-periodic-note/date-handler.ts`
- [ ] index.tsでのエクスポート
- [ ] app/index.tsへのツール登録
- [ ] 全テストが通る
- [ ] 統合テストで動作確認

## 実装方針
1. 期間タイプの厳密な型定義を最初に作成
2. 型定義に基づいてテストを設計（TDD）
3. 日付指定オプションの実装
4. 存在しないノートへの対応
5. タイムゾーンの考慮

## 関連情報
- APIエンドポイント: GET /periodic/{period}/
- 参考資料: /project/参考文献/openapi.yaml
- 関連ツール: update_periodic_note, append_to_periodic_note
- パスパラメータ: period（daily/weekly/monthly等）
- クエリパラメータ: date（オプション）

## 作業ログ
### 作業開始時に記録
- 定期ノート機能の基盤実装
- 日付処理の仕様確認