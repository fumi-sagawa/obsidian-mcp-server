# タスク名: weather関連テンプレートのクリーンナップ

## 概要
テンプレートから持ち込まれたweather関連のコード（entities/weather、get-alerts、get-forecast）を削除し、コードベースをクリーンにする

## 背景・目的
現在のコードベースにはObsidian MCPサーバーとは関係のないweather関連のテンプレートコードが残っている。これらは以下の問題を引き起こす：
- 不要なコードによる混乱
- 実際の機能と無関係なテストの存在
- プロジェクトの目的と合わないコード

## To-Be（完了条件）
- [ ] entities/weather ディレクトリを削除
- [ ] features/get-alerts を削除
- [ ] features/get-forecast を削除
- [ ] app/index.ts から関連する登録を削除
- [ ] test/tools/ から関連テストを削除
- [ ] test-all-tools*.js から関連インポートを削除
- [ ] 全テストが通ることを確認
- [ ] ビルドが成功することを確認

## 実装方針
1. 削除対象ファイルの依存関係を確認
2. app/index.tsから登録を削除
3. テストファイルから関連部分を削除
4. ソースコードを削除
5. 残存する参照がないことを確認

## 関連情報
- 削除対象:
  - src/entities/weather/
  - src/features/get-alerts/
  - src/features/get-forecast/
  - test/tools/get-alerts/
  - test/tools/get-forecast/

## 作業ログ
### 作業開始時
- 未実装