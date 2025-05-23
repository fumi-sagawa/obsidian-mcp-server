# Weather MCP Server デバッグガイド

Weather MCP Serverのデバッグとトラブルシューティングのためのガイドです。

## 環境変数

### ロギング設定

- `LOG_LEVEL`: 最小ログレベルを設定（デフォルト: `info`）
  - 値: `trace`, `debug`, `info`, `warn`, `error`
  - 例: `LOG_LEVEL=debug npm run dev`

- `DEBUG_MODE`: 詳細なログ出力のためのデバッグモードを有効化（デフォルト: `false`）
  - 値: `true`, `false`
  - 例: `DEBUG_MODE=true npm run dev`

- `PRETTY_LOGS`: 人間が読みやすいログフォーマットを有効化（本番環境ではデフォルト: `false`）
  - 値: `true`, `false`
  - 開発モードでは自動的に有効化

- `LOG_TIMESTAMPS`: ログにタイムスタンプを含める（デフォルト: `true`）
  - 値: `true`, `false`

### API設定

- `API_TIMEOUT`: リクエストタイムアウト（ミリ秒）（デフォルト: `30000`）
- `API_RETRY_ATTEMPTS`: 失敗したリクエストのリトライ回数（デフォルト: `3`）
- `API_RETRY_DELAY`: リトライ間の基本遅延時間（ミリ秒）（デフォルト: `1000`）
- `NWS_API_BASE_URL`: NWS APIのベースURL（デフォルト: `https://api.weather.gov`）
- `NWS_USER_AGENT`: NWS APIリクエスト用のユーザーエージェント

## デバッグスクリプト

### 開発モード
```bash
npm run dev
```
デバッグログと読みやすい出力でサーバーを実行します。

### トレースモード
```bash
npm run dev:trace
```
トレースログとデバッグモードを含む最大限の詳細度で実行します。

### MCP Inspector
```bash
npm run inspector
```
インタラクティブなテストのためにMCP Inspectorでサーバーを実行します。

### MCP Inspector（デバッグ付き）
```bash
npm run inspector:debug
```
デバッグログを有効にしてMCP Inspectorを実行します。

### テストコマンド

気象警報のテスト:
```bash
npm run test:alerts
```

天気予報のテスト:
```bash
npm run test:forecast
```

エラーハンドリングのテスト:
```bash
npm run test:error
```

## エラータイプ

サーバーはより良いデバッグのために型付けされたエラーを使用します：

### APIエラー
- `API_REQUEST_FAILED`: 一般的なAPI障害
- `API_RESPONSE_INVALID`: 無効なAPIレスポンス形式
- `API_TIMEOUT`: リクエストタイムアウト
- `API_RATE_LIMIT`: レート制限超過

### 検証エラー
- `VALIDATION_FAILED`: 一般的な検証失敗
- `INVALID_COORDINATES`: 無効な緯度/経度
- `INVALID_STATE_CODE`: 無効な米国州コード

### ビジネスエラー
- `NO_ALERTS_FOUND`: 指定された州に気象警報なし
- `NO_FORECAST_AVAILABLE`: 予報データが利用不可
- `LOCATION_NOT_SUPPORTED`: 米国境界外の場所

### システムエラー
- `SYSTEM_ERROR`: 一般的なシステムエラー
- `CONFIGURATION_ERROR`: 設定の問題

## ログレベル

### Trace
最も詳細なレベル、以下を含む：
- HTTPリクエスト/レスポンスの詳細
- メモリ使用量情報
- 詳細な実行フロー

### Debug
開発情報：
- 操作のタイミング
- 設定の詳細
- リクエスト処理ステップ

### Info
一般情報：
- サーバー起動
- ツール登録
- 成功した操作

### Warn
警告条件：
- リトライ試行
- 機能の低下
- 非致命的なエラー

### Error
エラー条件：
- 失敗した操作
- 例外
- 致命的な問題

## デバッグのヒント

1. **最大限の可視性のためにトレースログを有効化**：
   ```bash
   LOG_LEVEL=trace DEBUG_MODE=true npm run dev
   ```

2. **インタラクティブなテストにMCP Inspectorを使用**：
   ```bash
   npm run inspector:debug
   ```

3. **エラーメタデータを確認** - すべてのエラーには文脈情報が含まれています：
   - トレース用のリクエストID
   - 操作名
   - 入力パラメータ
   - タイムスタンプ

4. **APIインタラクションを監視** - トレースログは以下を表示：
   - 完全なリクエストURL
   - レスポンスステータスコード
   - レスポンスサイズ
   - リトライ試行

5. **メモリデバッグ** - デバッグモードでは、メモリ使用量が定期的に記録されます

## よくある問題

### "場所がサポートされていません"
- 座標が米国境界外です
- 緯度/経度の値を確認してください
- NWSは米国の場所のみをサポートしています

### "無効な州コード"
- 州コードは有効な2文字の米国州略語である必要があります
- 領土も含まれます: PR, VI, GU, AS, MP

### APIタイムアウト
- デフォルトのタイムアウトは30秒です
- `API_TIMEOUT`環境変数で増加できます
- ネットワーク接続を確認してください

### レート制限
- NWS APIにはレート制限があります
- サーバーはバックオフ付きの自動リトライを実装しています
- ログで429ステータスコードを確認してください

## ヘルスチェック

サーバーの健康状態を確認：
```bash
npm run health-check
```

MCPツールとしてヘルスチェックを実行：
```json
{
  "method": "tools/call",
  "params": {
    "name": "health-check",
    "arguments": {}
  }
}
```

ヘルスチェックは以下を提供：
- システム全体のステータス
- 個別のヘルスチェック結果（メモリ、API接続性）
- システムメトリクス（CPU、メモリ、アップタイム）
- パフォーマンスメトリクス（リクエスト数、エラー率、レスポンス時間）