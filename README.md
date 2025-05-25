# Obsidian MCP Server

[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

Model Context Protocol (MCP) を使用して、Obsidian Local REST API と統合するサーバーです。AIアシスタントやその他のアプリケーションからObsidianのノート管理機能を利用できるようになります。

## 🚀 クイックスタート

```bash
# 1. 依存関係をインストール
npm install

# 2. ビルド
npm run build

# 3. 環境変数を設定してMCP Inspectorで実行
OBSIDIAN_API_KEY=your-api-key npm run inspector
```

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を、開発者向け情報は [DEVELOPMENT.md](./DEVELOPMENT.md) をご覧ください。

## 📋 主な機能

- **ファイル操作**: Obsidian内のファイルの作成、読み取り、更新、削除
- **アクティブファイル管理**: 現在開いているファイルの操作
- **検索機能**: ノートの簡易検索と詳細検索
- **コマンド実行**: Obsidianコマンドの一覧表示と実行
- **定期ノート**: 日次・週次・月次・年次ノートの管理
- **MCP統合**: MCP互換のAIアシスタントとシームレスに統合

## 📚 ドキュメント

- [SETUP.md](./SETUP.md) - 詳細なインストールと設定ガイド
- [DEVELOPMENT.md](./DEVELOPMENT.md) - アーキテクチャ、開発手法、コントリビューション方法
- [CLAUDE.md](./CLAUDE.md) - Claude Code向け開発ガイドライン

## 🛠 前提条件

- Node.js 16+
- Obsidian with [Local REST API plugin](https://github.com/coddingtonbear/obsidian-local-rest-api)
- APIキー（Obsidianプラグイン設定から取得）

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照してください。