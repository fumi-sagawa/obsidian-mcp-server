# タスク名: 出力フォーマットの修正

## 概要
Obsidian Local REST APIから返される値を不必要にフォーマットしている部分を特定し、構造化されたJSON形式で返すように修正する

## 背景・目的
MCPサーバーとして最適な出力形式を提供するため、以下の問題に対処する必要がある：
- 現在、一部のツールでAPIレスポンスを文字列形式にフォーマットしている
- MCPクライアント（AIアシスタント）は構造化されたJSON形式の方が理解・処理しやすい
- APIから返される元のデータ構造を保持することで、より柔軟な利用が可能

## MCPサーバーの出力形式原則
1. **構造化データの保持**: APIから返されるJSON構造をそのまま返す
2. **不要な文字列変換の削除**: 人間向けのフォーマットではなく、機械可読性を優先
3. **メタデータの保持**: ファイルパス、タイムスタンプなどの有用な情報を構造化して提供

## To-Be（完了条件）
- [ ] 全ツールの出力形式を調査
  - [ ] フォーマット関数（format-*.ts）の使用状況確認
  - [ ] ハンドラーでの出力変換処理の確認
- [ ] 不適切なフォーマット処理を特定
  - [ ] 文字列連結で出力を生成している箇所
  - [ ] APIレスポンスの構造を破壊している箇所
  - [ ] 必要なメタデータを削除している箇所
- [ ] 構造化された出力形式に修正
  - [ ] APIレスポンスをそのまま返すように変更
  - [ ] 必要に応じて最小限の構造化ラッパーを追加
- [ ] テストの更新
  - [ ] 新しい出力形式に合わせてテストを修正
  - [ ] 構造化データの検証を追加

## 実装方針
### フェーズ1: 現状分析
1. 各ツールの出力を確認し、問題のあるフォーマットを特定
2. 特に以下のツールに注目：
   - list系ツール（list-commands, list-directory, list-vault-files）
   - search系ツール（simple-search, search-notes）
   - get系ツール（各種ファイル取得系）

### フェーズ2: 出力形式の設計
1. 基本的な出力構造:
   ```typescript
   {
     data: any,           // APIレスポンスそのまま
     metadata?: {         // 必要に応じて追加情報
       timestamp?: string,
       source?: string
     }
   }
   ```

2. エラー時の出力構造:
   ```typescript
   {
     error: {
       message: string,
       code: string,
       details?: any
     }
   }
   ```

### フェーズ3: 実装
1. フォーマット関数の削除または簡素化
2. ハンドラーでAPIレスポンスを直接返すように修正
3. MCPのcontent配列に構造化データを含める

### フェーズ4: テスト更新
1. 文字列比較から構造化データの検証に変更
2. JSONスキーマによる出力形式の検証追加

## 影響を受ける可能性のあるファイル
- src/features/*/format-*.ts
- src/features/*/*-handler.ts
- test/tools/*/integration.js
- test/tools/*/mock.js

## 関連情報
- MCP仕様: https://modelcontextprotocol.io/docs
- 出力確認: `npm run test:tools`
- モックテスト: `npm run test:tools:mock`

## 作業ログ
### 2025-05-25 19:05
- タスクを開始し、ブランチ feature/20250125-fix-output-formatting を作成
- 全ツールの出力形式を調査し、以下のフォーマット関数を特定：
  - get-active-file: formatActiveFileResponse
  - list-commands: formatCommands
  - list-vault-files: formatFileList
  - simple-search: formatSearchResults

### 2025-05-25 19:14
- 全ての不適切なフォーマット処理を修正完了：
  1. get-active-file: フォーマット関数を削除し、JSON.stringifyでAPIレスポンスをそのまま返すよう修正
  2. list-commands: format-commands.tsを削除し、APIレスポンスの構造を保持
  3. list-vault-files: format-file-list.tsを削除し、filesとitemsの構造を保持して返す
  4. simple-search: format-results.tsを削除し、検索結果の構造をそのまま返す
- 全てのテストを新しい出力形式に合わせて更新
- 全ての単体テストが成功することを確認（268 tests passed）

### 2025-05-25 19:23
- 追加修正：list-directoryツールのフォーマット処理も発見し、修正
  - formatDirectoryListingとformatListingText関数による文字列フォーマットを削除
  - JSON.stringifyでAPIレスポンスの構造を保持して返すよう修正
  - テストも新しい出力形式に合わせて更新
- 全ての単体テストが成功することを確認（273 tests passed）
- カバレッジ: 79.42%