# MCP Inspector を使った手動テスト手順

このドキュメントでは、MCP Inspector を使用して Weather MCP Server の機能を手動でテストする手順を説明します。

## 前提条件

- Node.js 18以上がインストールされていること
- プロジェクトの依存関係がインストールされていること（`npm install`）
- MCP Inspector が利用可能であること

## MCP Inspector の起動

```bash
npm run inspector
```

デバッグモードで起動する場合：
```bash
npm run inspector:debug
```

## テスト手順

### 1. 気象警報の取得テスト

#### 1.1 正常系テスト

1. MCP Inspector のツール一覧から `get-alerts` を選択
2. パラメータに以下を入力：
   ```json
   {
     "state": "CA"
   }
   ```
3. "Send" ボタンをクリック
4. 期待される結果：
   - カリフォルニア州の気象警報情報が表示される
   - 警報がない場合は "No active alerts" というメッセージが表示される

#### 1.2 エラー系テスト

1. 無効な州コードでテスト：
   ```json
   {
     "state": "XX"
   }
   ```
2. 期待される結果：
   - エラーメッセージが表示される
   - ステータスコード 400 エラー

### 2. 天気予報の取得テスト

#### 2.1 正常系テスト

1. MCP Inspector のツール一覧から `get-forecast` を選択
2. パラメータに以下を入力：
   ```json
   {
     "latitude": 40.7128,
     "longitude": -74.0060
   }
   ```
3. "Send" ボタンをクリック
4. 期待される結果：
   - ニューヨーク市の7日間の天気予報が表示される
   - 各日の気温、天気の説明が含まれる

#### 2.2 境界値テスト

1. 最北端の座標：
   ```json
   {
     "latitude": 71.3875,
     "longitude": -156.4811
   }
   ```

2. 最南端の座標：
   ```json
   {
     "latitude": 18.9110,
     "longitude": -155.6813
   }
   ```

### 3. ヘルスチェックテスト

1. MCP Inspector のツール一覧から `health-check` を選択
2. パラメータは不要（空のまま）
3. "Send" ボタンをクリック
4. 期待される結果：
   ```json
   {
     "status": "healthy",
     "checks": {
       "memory": {
         "status": "healthy",
         "details": { ... }
       },
       "nws_api": {
         "status": "healthy",
         "details": { ... }
       }
     }
   }
   ```

### 4. エラーハンドリングのテスト

#### 4.1 ネットワークエラーのシミュレーション

1. インターネット接続を切断
2. 任意のツールを実行
3. 期待される結果：
   - 適切なエラーメッセージが表示される
   - サーバーがクラッシュしない

#### 4.2 レート制限のテスト

1. 同じリクエストを連続で10回以上送信
2. 期待される結果：
   - リトライメカニズムが動作する
   - 最終的にレスポンスが返される

## 検証項目チェックリスト

### 基本機能
- [ ] `get-alerts` が正常に動作する
- [ ] `get-forecast` が正常に動作する
- [ ] `health-check` が正常に動作する

### エラーハンドリング
- [ ] 無効なパラメータでエラーが返される
- [ ] ネットワークエラー時に適切なメッセージが表示される
- [ ] サーバーがクラッシュしない

### パフォーマンス
- [ ] レスポンスが30秒以内に返される
- [ ] メモリ使用量が異常に増加しない

### ログ出力
- [ ] リクエストIDが生成される
- [ ] エラー時にスタックトレースが記録される
- [ ] スロークエリが検出される（1秒以上）

## トラブルシューティング

### MCP Inspector が起動しない場合
1. ポートが使用されていないか確認
2. `node_modules` を削除して再インストール
3. Node.js のバージョンを確認

### レスポンスが返ってこない場合
1. ログレベルを `debug` に設定して実行
2. ネットワーク接続を確認
3. NWS API のステータスを確認

### エラーの詳細を確認したい場合
```bash
DEBUG_MODE=true npm run inspector:debug
```

## 参考情報

- [NWS API Documentation](https://www.weather.gov/documentation/services-web-api)
- [MCP Protocol Specification](https://github.com/modelcontextprotocol/specification)