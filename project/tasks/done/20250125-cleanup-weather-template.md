# タスク名: weather関連テンプレートのクリーンナップ

## 概要
テンプレートから持ち込まれたweather関連のコード（entities/weather、get-alerts、get-forecast）を削除し、コードベースをクリーンにする

## 背景・目的
現在のコードベースにはObsidian MCPサーバーとは関係のないweather関連のテンプレートコードが残っている。これらは以下の問題を引き起こす：
- 不要なコードによる混乱
- 実際の機能と無関係なテストの存在
- プロジェクトの目的と合わないコード
- 不要な依存関係やインポートによるビルドサイズの増加

## To-Be（完了条件）
- [ ] entities/weather ディレクトリを削除
- [ ] features/get-alerts を削除
- [ ] features/get-forecast を削除
- [ ] app/index.ts から関連する登録を削除
- [ ] shared/api/nws ディレクトリを削除（NWS API関連）
- [ ] shared/lib/health/checks/nws-api-check.ts を削除
- [ ] test/tools/ から関連テストを削除
- [ ] test-all-tools*.js から関連インポートを削除
- [ ] 残存する参照（import文）がないことを確認
- [ ] 全テストが通ることを確認
- [ ] ビルドが成功することを確認
- [ ] 型チェックが通ることを確認（npm run typecheck）

## 実装方針
1. 削除対象ファイルの依存関係を確認（grepでimport文を検索）
2. app/index.tsから登録を削除
3. health checkerからNWS API関連のチェックを削除
4. テストファイルから関連部分を削除
5. ソースコードを削除（entities、features、api）
6. 残存する参照がないことを確認（再度grepで検索）
7. ビルド・テスト・型チェックを実行

## 関連情報
- 削除対象:
  - src/entities/weather/
  - src/features/get-alerts/
  - src/features/get-forecast/
  - src/shared/api/nws/
  - src/shared/lib/health/checks/nws-api-check.ts
  - test/tools/get-alerts/
  - test/tools/get-forecast/
- 影響を受ける可能性のあるファイル:
  - src/app/index.ts（ツール登録）
  - src/shared/lib/health/health-checker.ts（NWSチェックの登録）
  - test/test-all-tools.js
  - test/test-all-tools-mock.js

## 作業ログ
### 2025-01-25 18:50
- タスクの内容を精査し、削除対象を拡張：
  - NWS API関連のコード（`src/shared/api/nws/`）
  - ヘルスチェックのNWS APIチェック（`nws-api-check.ts`）
  - 型チェックを完了条件に追加
- ブランチを作成：`feature/20250125-cleanup-weather-template`
- 依存関係を確認し、以下のファイルに参照を発見：
  - app/index.ts（既にコメントアウト）
  - shared/api/index.ts
  - shared/lib/health/health-checker.ts
  - shared/lib/errors/business-error.ts
  - shared/lib/errors/types.ts
  - shared/config/types.tsとconfig.ts
  - shared/lib/metrics/metrics-registry.ts
  - shared/lib/middleware/metrics-middleware.ts
  - scripts/metrics-dashboard.ts
  - test/tools/shared/mock-server.js

### 2025-01-25 18:55
- 全ての参照を削除完了：
  - ✅ app/index.tsからインポートを削除
  - ✅ shared/api/index.tsからNWS APIエクスポートを削除
  - ✅ health-checker.tsからNWS APIチェックを削除
  - ✅ business-error.tsからweather関連メソッドを削除
  - ✅ types.tsからweather関連エラーコードを削除
  - ✅ configからNWS API設定を削除
  - ✅ metrics-registry.tsからweatherメトリクスを削除
  - ✅ metrics-middleware.tsからweather関連メソッドを削除
  - ✅ metrics-dashboard.tsからweatherセクションを削除
  - ✅ mock-server.jsからweatherエンドポイントを削除
- ディレクトリとファイルを物理的に削除
- ビルド成功、型チェック成功、単体テスト成功を確認
- 統合テストで一部エラーがあるが、weather関連ではない既存の問題