# MCPツールテストスクリプト

このディレクトリには、MCPサーバーのツールをテストするためのスクリプトが含まれています。

## test-tools.js

実際のNWS APIを使用した統合テストを実行します。各テストケースには期待される結果のアサーションが含まれています。

### 使用方法

```bash
# すべてのツールをテスト
npm run test:tools

# 特定のツールのみテスト
npm run test:tools get-alerts
npm run test:tools get-forecast
npm run test:tools health-check

# 詳細モード（レスポンスの詳細を表示）
npm run test:tools -- --verbose
```

### 注意事項

- 実際のAPIを使用するため、ネットワーク接続が必要です
- APIレスポンスは時間によって変わる可能性があります

## test-tools-mock.js

モックAPIサーバーを使用した決定的なテストを実行します。外部APIに依存せず、常に同じ結果を返します。

### 使用方法

```bash
# すべてのツールをモックテスト
npm run test:tools:mock

# 特定のツールのみモックテスト
npm run test:tools:mock get-alerts
npm run test:tools:mock get-forecast
```

### モックデータ

- **CA州の警報**: 固定の「Test Alert」を返す
- **HI州の警報**: 警報なしを返す
- **XX州の警報**: バリデーションエラー
- **サンフランシスコの予報**: 固定の晴れ/65°Fを返す

### 利点

- 常に同じ結果を返すため、CIパイプラインに最適
- ネットワーク接続不要
- 高速実行
- エッジケースのテストが容易

### テストケース

各ツールには以下のテストケースが定義されています：

- **get-alerts**
  - 正常な州コードで警報を取得
  - 無効な州コードでエラー

- **get-forecast**
  - サンフランシスコの予報を取得
  - 必須パラメータ欠落でエラー

- **health-check**
  - ヘルスチェックを実行

## test-single.sh

単一のMCPツールコマンドを手動で実行するためのヘルパースクリプトです。

### 使用方法

```bash
# 直接実行
./scripts/test-single.sh get-alerts '{"state":"CA"}'
./scripts/test-single.sh get-forecast '{"latitude":37.7749,"longitude":-122.4194}'
./scripts/test-single.sh health-check '{}'

# npmスクリプト経由
npm run test:tool get-alerts '{"state":"CA"}'
```

## 新しいツールの追加

新しいツールをテストに追加する場合：

1. `test-tools.js`の`testCases`オブジェクトに新しいツールのテストケースを追加
2. 各テストケースに以下を定義：
   - `name`: テストケースの説明
   - `request`: MCPリクエストのパラメータ
   - `assertions`: 期待される結果を検証する関数の配列

例：
```javascript
'new-tool': [
  {
    name: '正常系のテスト',
    request: {
      method: 'tools/call',
      params: {
        name: 'new-tool',
        arguments: { param: 'value' }
      }
    },
    assertions: [
      // 成功レスポンスを確認
      response => response.result !== undefined,
      // 特定の内容を確認
      response => response.result.content[0].text.includes('expected text')
    ]
  }
]
```