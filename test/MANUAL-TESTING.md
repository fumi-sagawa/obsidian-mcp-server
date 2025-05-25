# Obsidian MCP Server 手動テストガイド

このドキュメントでは、MCP Inspectorを使用してObsidian MCP Serverの機能を手動でテストする方法を説明します。

## MCP Inspectorのセットアップ

### 1. MCP Inspectorの起動

```bash
# 環境変数を設定して起動
OBSIDIAN_API_KEY=your-api-key npm run inspector

# デバッグモードで起動（詳細なログ出力）
OBSIDIAN_API_KEY=your-api-key npm run inspector:debug
```

### 2. 接続確認

MCP Inspectorが起動したら、ブラウザで自動的に開きます。左側のサイドバーに利用可能なツールの一覧が表示されることを確認してください。

## 基本的なテスト手順

### サーバーステータスの確認

1. 左側のツール一覧から `get_server_status` を選択
2. パラメータは不要（`{}`のまま）
3. 「Execute」をクリック

期待される結果：
```json
{
  "status": "connected",
  "version": "1.0.0",
  "vaultName": "Your Vault Name"
}
```

### ファイル操作のテスト

#### ファイルの作成

1. `create_or_update_file` を選択
2. パラメータを入力：
   ```json
   {
     "filename": "test-note.md",
     "content": "# テストノート\n\nこれはMCP経由で作成されたノートです。"
   }
   ```
3. 「Execute」をクリック

#### ファイルの読み取り

1. `get_file` を選択
2. パラメータを入力：
   ```json
   {
     "filename": "test-note.md"
   }
   ```
3. 「Execute」をクリック

#### ファイルへの追記

1. `append_to_file` を選択
2. パラメータを入力：
   ```json
   {
     "filename": "test-note.md",
     "content": "\n## 追記されたセクション\n\n追加のコンテンツです。"
   }
   ```
3. 「Execute」をクリック

### 検索機能のテスト

#### 簡易検索

1. `simple_search` を選択
2. パラメータを入力：
   ```json
   {
     "query": "テスト",
     "contextLength": 50
   }
   ```
3. 「Execute」をクリック

#### 詳細検索

1. `search_notes` を選択
2. Dataview DQL形式で検索：
   ```json
   {
     "query": "TABLE file.name FROM \"\" WHERE contains(file.content, \"テスト\")",
     "queryType": "dataview"
   }
   ```
3. 「Execute」をクリック

### アクティブファイル操作

#### アクティブファイルの取得

1. Obsidianで任意のファイルを開く
2. `get_active_file` を選択
3. パラメータは不要（`{}`）
4. 「Execute」をクリック

#### アクティブファイルの更新

1. `update_active_file` を選択
2. パラメータを入力：
   ```json
   {
     "content": "# 更新されたコンテンツ\n\n完全に新しい内容です。"
   }
   ```
3. 「Execute」をクリック

### コマンド実行

#### コマンド一覧の取得

1. `list_commands` を選択
2. パラメータは不要（`{}`）
3. 「Execute」をクリック

#### コマンドの実行

1. `execute_command` を選択
2. パラメータを入力（例：グラフビューを開く）：
   ```json
   {
     "commandId": "graph:open"
   }
   ```
3. 「Execute」をクリック

## 高度なテストシナリオ

### 定期ノートの操作

#### 今日のデイリーノートを取得

1. `get_periodic_note` を選択
2. パラメータを入力：
   ```json
   {
     "period": "daily"
   }
   ```
3. 「Execute」をクリック

#### 週次ノートに追記

1. `append_to_periodic_note` を選択
2. パラメータを入力：
   ```json
   {
     "period": "weekly",
     "content": "\n## 今週の振り返り\n\n- タスク1完了\n- タスク2進行中"
   }
   ```
3. 「Execute」をクリック

### ディレクトリ操作

#### Vault内のファイル一覧

1. `list_vault_files` を選択
2. パラメータを入力：
   ```json
   {
     "path": "/"
   }
   ```
3. 「Execute」をクリック

#### 特定ディレクトリの内容

1. `list_directory` を選択
2. パラメータを入力：
   ```json
   {
     "path": "/Projects"
   }
   ```
3. 「Execute」をクリック

## トラブルシューティング

### エラーが発生した場合

1. **認証エラー (401)**
   - APIキーが正しく設定されているか確認
   - Obsidianの設定でLocal REST APIプラグインが有効になっているか確認

2. **接続エラー**
   - Obsidianが起動しているか確認
   - Local REST APIのポート（デフォルト: 27123）が使用可能か確認

3. **ファイルが見つからない (404)**
   - ファイルパスが正しいか確認（Vaultルートからの相対パス）
   - ファイル名の大文字小文字が正確か確認

### デバッグ情報の確認

MCP Inspectorの右側のペインで以下を確認できます：
- リクエストの詳細
- レスポンスの内容
- エラーメッセージ
- 実行時間

## パフォーマンステスト

大量のファイルがあるVaultでのテスト：

1. `list_vault_files` で1000件以上のファイルを取得
2. レスポンス時間を確認
3. メモリ使用量をモニタリング（開発者ツールで確認）

## セキュリティテスト

1. 無効なAPIキーでの接続試行
2. 存在しないファイルへのアクセス
3. 特殊文字を含むファイル名の処理
4. 大きなコンテンツ（1MB以上）の処理