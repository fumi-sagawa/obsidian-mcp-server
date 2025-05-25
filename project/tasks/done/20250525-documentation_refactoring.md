# タスク名: ドキュメント構成の再編成とWeather MCP Server由来の内容の削除

## 概要
プロジェクトのドキュメントが整理されておらず、一部は別プロジェクト（Weather MCP Server）の内容が残っているため、適切な構成に再編成する。ユーザー向けと開発者向けのドキュメントを明確に分離し、保守性を向上させる。

## 背景・目的
- 現在のドキュメントは情報が混在しており、ユーザーと開発者のどちらにとっても使いにくい
- DEBUG.md、test/README.md、test/MANUAL-TESTING.md がWeather MCP Serverの内容になっている
- セットアップ情報と開発情報が分離されていない
- テストとデバッグの情報が分散している

## To-Be（完了条件）
- [x] 以下の新しいドキュメント構成を実装：
  - [x] README.md - プロジェクト概要とクイックスタート（簡潔に）
  - [x] SETUP.md - 詳細なセットアップガイド（ユーザー向け）
  - [x] DEVELOPMENT.md - 開発者向け統合ドキュメント（開発環境、テスト、デバッグを含む）
- [x] 既存のドキュメントから適切な内容を移行
- [x] Weather MCP Server由来の内容を削除
- [x] test/README.mdとtest/MANUAL-TESTING.mdの内容をDEVELOPMENT.mdに統合
- [x] DEBUG.mdの内容をObsidian MCP Server用に書き直してDEVELOPMENT.mdに統合
- [x] 各ドキュメントの役割が明確で、重複がない状態を実現

## 実装方針

### 1. README.mdの簡潔化
- プロジェクトの概要と価値提案を冒頭に
- 最小限のクイックスタートセクション（3ステップ程度）
- 詳細はSETUP.mdとDEVELOPMENT.mdへのリンク
- バッジ（ライセンス、バージョンなど）の追加

### 2. SETUP.mdの作成
- 前提条件の詳細説明
- Obsidian Local REST APIプラグインの設定手順
- 環境変数の設定方法
- 基本的な使用方法とMCP統合の説明
- トラブルシューティング（ユーザー向け）

### 3. DEVELOPMENT.mdの作成
- 開発環境のセットアップ
- アーキテクチャ（FSD）の詳細説明
- 開発ワークフロー（TDD、タスク管理）
- テスト戦略と実行方法（単体・統合・手動テスト）
- デバッグ方法（環境変数、ログレベル、MCP Inspector）
- 新機能の追加方法
- コーディング規約

### 4. 既存ドキュメントの処理
- DEBUG.md → Obsidian MCP Server用に書き直してDEVELOPMENT.mdに統合後、削除
- test/README.md → DEVELOPMENT.mdのテストセクションに統合後、削除
- test/MANUAL-TESTING.md → DEVELOPMENT.mdの手動テストセクションに統合後、削除

## 関連情報
- 現在のCLAUDE.mdには開発者向けの詳細情報が含まれているため、これも参考にする
- プロジェクトの要件定義.mdとの整合性を保つ

## 作業ログ
### 2025-05-25 作成
- タスクチケットを作成
- 現在のドキュメント構成の問題点を分析
- 新しいドキュメント構成を設計

### 2025-05-26 完了
- README.mdを簡潔化（バッジ追加、3ステップのクイックスタート）
- SETUP.mdを作成（詳細なセットアップ手順、トラブルシューティング含む）
- DEVELOPMENT.mdを作成（FSD、TDD、テスト戦略、デバッグ方法を統合）
- Weather MCP Server由来の内容を削除：
  - DEBUG.mdを削除（内容はDEVELOPMENT.mdに統合）
  - test/README.mdをObsidian用に書き換え
  - test/MANUAL-TESTING.mdをObsidian用に書き換え
- 全体の整合性を確認し、ドキュメント間の参照が正しいことを検証