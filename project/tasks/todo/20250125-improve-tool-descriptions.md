# タスク名: MCPツールの命名・description・並び順改善

## 概要
app/index.tsに登録されている各ツールの命名規則統一、descriptionの改善、そして論理的な並び順への再配置を行う

## 背景・目的
MCPサーバーにおいて、ツールの命名とdescriptionは非常に重要な要素である：
- AIアシスタントがツールを選択する際の判断材料
- ユーザーがツールの機能を理解するための情報源
- 適切な命名とdescriptionにより、ツールの誤用を防ぎ、正確な使用を促進
- 論理的な並び順により、ツールの発見性と理解度が向上

## To-Be（完了条件）
- [ ] 全ツールの命名を統一的な規則に従って修正
- [ ] 全ツールのdescriptionを要件定義に従って改善
- [ ] ツールの登録順序を論理的に再配置
- [ ] app/index.tsのみを編集して上記を実現
- [ ] 全テストが通ることを確認
- [ ] 統合テストで動作確認

## MCPツール命名・Description要件定義

### 命名規則（name）
#### 基本原則
- 動詞_対象_修飾子 の形式を推奨
- 全て小文字、単語間はアンダースコア区切り
- 最大30文字以内を目標

#### 命名パターン例
✅ 良い例:
- get_weather_forecast
- create_github_issue
- search_documents
- send_email
- calculate_sum

❌ 悪い例:
- weather (何をするか不明)
- github_thing (曖昧)
- process_data (汎用的すぎる)

#### 動詞の選択指針
- 取得系: get_, fetch_, retrieve_, search_, list_
- 作成系: create_, add_, generate_, build_
- 更新系: update_, modify_, edit_, set_
- 削除系: delete_, remove_, clear_
- 実行系: execute_, run_, calculate_, process_

### Description要件
#### 基本要件
- 1行以内: 80文字以下を推奨
- 動詞で始める: "Get weather data" ではなく "Get weather data for specified location"
- 具体的な動作を記述: 何を、どうするのかを明確かつ簡潔に

#### Description テンプレート
[動詞] [対象] [条件・制約があれば簡潔に]

例:
- "Add two numbers together"
- "Search documents by keyword and date range"
- "Create GitHub issue with title and description"
- "Get current weather for specified city"
- "Send email to recipient with subject and body"

#### 書き方ガイドライン
✅ 推奨
- 能動態を使用
- 現在形で記述
- 専門用語は必要最小限
- 結果ではなく動作を記述

❌ 避けるべき
- 受動態の多用
- "This tool will..." などの冗長な前置き
- 技術仕様の詳細説明
- 曖昧な表現（"process data", "handle request"）

### 品質チェックリスト
#### 命名チェック
- [ ] 動作が名前から推測できるか
- [ ] 他のツールと区別できるか
- [ ] スネークケースで統一されているか
- [ ] 30文字以内か

#### Description チェック
- [ ] 80文字以内か
- [ ] 動詞で始まっているか
- [ ] 何をするツールか1回読めば理解できるか
- [ ] 専門用語を避けて一般的な言葉を使っているか

## 実装方針
1. 現在のツール一覧を作成し、カテゴリ分けする
2. 各ツールの新しい命名を決定（要件定義に従う）
3. 各ツールの新しいdescriptionを作成（要件定義に従う）
4. 論理的な並び順を決定（例：基本操作→ファイル操作→検索→管理系）
5. **app/index.tsのみを編集して**、新しい命名、description、並び順を反映
   - 各フィーチャーモジュールのファイルは編集しない
   - server.tool()の呼び出し時に直接新しい名前とdescriptionを指定

## 制約事項
- **編集対象はapp/index.tsのみ**
- 各フィーチャーモジュールのファイルは変更しない
- ハンドラー関数やスキーマのインポートはそのまま維持
- server.tool()の第1引数（name）と第2引数（description）のみを変更

## 現在のツール一覧と改善案

### 削除対象（weather関連）
- get-alerts → 削除
- get-forecast → 削除

### サーバー管理系
- health-check → check_service_health "Check health status of Obsidian service and connections"
- get-server-status → get_server_status "Get Obsidian server connection status and version info"

### アクティブファイル操作系
- get-active-file → get_active_file "Get content and metadata of currently active file"
- update-active-file → update_active_file "Replace entire content of currently active file"
- append-to-active-file → append_to_active_file "Append text to end of currently active file"
- insert-into-active-file → insert_to_active_file "Insert text at specific location in active file"
- delete-active-file → delete_active_file "Delete currently active file permanently"

### ファイル操作系
- get-file → get_file_content "Get content and metadata of specified file"
- create-or-update-file → create_or_update_file "Create new file or replace content of existing file"
- append-to-file → append_to_file "Append text to end of specified file"
- insert-into-file → insert_to_file "Insert text at specific location in file"
- delete-file → delete_file "Delete specified file permanently"
- open-file → open_file "Open specified file in Obsidian editor"

### 周期ノート系
- get-periodic-note → get_periodic_note "Get content of daily, weekly, monthly, quarterly or yearly note"
- append-to-periodic-note → append_to_periodic_note "Append text to periodic note for specified date"
- update-periodic-note → update_periodic_note "Replace content of periodic note for specified date"
- delete-periodic-note → delete_periodic_note "Delete periodic note for specified date"

### 検索・一覧系
- simple-search → search_notes "Search notes by text query across entire vault"
- list-directory → list_directory "List files and folders in specified directory"
- list-vault-files → list_vault_files "List all files in vault with optional path filter"

### コマンド実行系
- list-commands → list_commands "List all available Obsidian commands"
- execute-command → execute_command "Execute Obsidian command by ID"

### 提案する並び順
1. サーバー管理系（基本的な接続確認）
2. アクティブファイル操作系（最もよく使う）
3. ファイル操作系（一般的なファイル操作）
4. 周期ノート系（特殊なファイル操作）
5. 検索・一覧系（情報取得）
6. コマンド実行系（高度な操作）

## 関連情報
- MCP仕様のベストプラクティス
- OpenAPI仕様書の説明も参考にする

## 作業ログ
### 作業開始時
- 未実装