# Obsidian MCP Server セットアップガイド

このガイドでは、Obsidian MCP Serverを使用するための詳細な手順を説明します。

## 📋 前提条件

### 1. Obsidianのインストール

[Obsidian](https://obsidian.md/) をインストールしてください。

### 2. Local REST APIプラグインのインストール

1. Obsidianを開き、設定（歯車アイコン）をクリック
2. 「コミュニティプラグイン」→「ブラウズ」をクリック
3. 「Local REST API」を検索してインストール
4. プラグインを有効化
5. Enable Non-encrypted(HTTP) Serverをオン

### 3. APIキーの取得

1. Obsidianの設定を開く
2. 「プラグイン」→「Local REST API」を選択
3. 表示されたAPIキーをコピー（後で使用します）

## 🔧 インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/obsidian-mcp-server.git
cd obsidian-mcp-server
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ビルド

```bash
npm run build
```

## 🚀 基本的な使用方法

### Claude Desktopでの使用

1. Claude Desktopの設定ファイル（`claude_desktop_config.json`）を編集：

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/path/to/obsidian-mcp-server/build/index.js"],
      "env": {
        "OBSIDIAN_API_KEY": "your-api-key"
      }
    }
  }
}
```

2. Claude Desktopを再起動

3. Claudeで「Obsidianのノートを読んで」「新しいノートを作成して」などのリクエストが可能に



## 🧪 動作確認

### 1. サーバーステータスの確認

MCP Inspectorで以下のツールを実行：

```json
{
  "tool": "get_server_status",
  "arguments": {}
}
```

正常な応答：
```json
{
  "status": "connected",
  "version": "1.0.0",
  "vaultName": "Your Vault Name"
}
```

### 2. ファイル一覧の取得

```json
{
  "tool": "list_vault_files",
  "arguments": {
    "path": "/"
  }
}
```

## 🔍 トラブルシューティング

### 接続できない場合

1. **Obsidianが起動しているか確認**
   - Obsidianが起動していないとAPIに接続できません

2. **Local REST APIプラグインが有効か確認**
   - 設定 → プラグイン → Local REST APIが有効になっているか確認

3. **APIキーが正しいか確認**
   ```bash
   echo $OBSIDIAN_API_KEY
   ```

4. **ポートが使用されているか確認**
   ```bash
   # macOS/Linux
   lsof -i :27123
   
   # Windows
   netstat -ano | findstr :27123
   ```

### APIキーエラーの場合

```
Error: Authentication failed
```

このエラーが出る場合：
1. APIキーが正しくコピーされているか確認
2. APIキーに余分なスペースが含まれていないか確認
3. Obsidianでプラグインを無効化→有効化して新しいAPIキーを生成

## 🔗 その他のMCP統合

### カスタムMCPクライアント

MCP仕様に準拠したクライアントであれば、同様の設定で使用できます。

### 設定例

```json
{
  "server": {
    "command": "node",
    "args": ["/path/to/obsidian-mcp-server/build/index.js"],
    "env": {
      "OBSIDIAN_API_KEY": "your-api-key",
      "OBSIDIAN_API_URL": "http://127.0.0.1:27123"
    }
  }
}
```

## 📚 次のステップ

- [利用可能なツール一覧](./DEVELOPMENT.md#利用可能なツール)
- [開発者向けドキュメント](./DEVELOPMENT.md)
- [API仕様](./project/参考文献/openapi.yaml)