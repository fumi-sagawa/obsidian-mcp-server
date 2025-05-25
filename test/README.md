# Obsidian MCP Server テストガイド

このディレクトリには、Obsidian MCP Serverの統合テストとモックテストが含まれています。

## テスト構造

```
test/
├── tools/                      # 各ツールのテスト
│   ├── get-file/
│   │   ├── integration.js      # 実際のAPIを使用した統合テスト
│   │   └── mock.js             # モックAPIを使用したテスト
│   ├── create-or-update-file/
│   ├── search-notes/
│   └── ...その他のツール
├── shared/                     # 共通テストユーティリティ
│   ├── test-runner.js          # テスト実行エンジン
│   └── mock-server.js          # モックAPIサーバー
├── test-all-tools.js           # 全統合テストの実行
└── test-all-tools-mock.js      # 全モックテストの実行
```

## テストの実行

### 全てのツールをテスト

```bash
# モックAPIを使用（安全・推奨）
npm run test:tools

# 実際のObsidian APIを使用（要：Obsidian起動）
npm run test:tools:dangerous
```

### 単一ツールをテスト

```bash
# 対話式でツールを選択
npm run test:tool

# 直接指定
./test/test-single.sh get-file '{"filename":"test.md"}'
./test/test-single.sh mock create-or-update-file '{"filename":"new.md","content":"# New File"}'
```

## テストケースの追加

新しいツールのテストを追加する場合：

1. `test/tools/新機能名/` ディレクトリを作成
2. `integration.js` と `mock.js` を作成
3. 各ファイルで以下をエクスポート：
   - `toolName`: ツール名
   - `testCases`: テストケースの配列

### テストケースの例

```javascript
// test/tools/get-file/mock.js
export const toolName = 'get_file';

export const testCases = [
  {
    name: 'ファイルの取得に成功',
    params: { filename: 'test.md' },
    expected: {
      content: '# Test File\n\nThis is a test file.',
      path: 'test.md'
    }
  },
  {
    name: 'ファイルが見つからない場合',
    params: { filename: 'nonexistent.md' },
    expectedError: /File not found/
  }
];
```

## モックサーバー

モックサーバーは `test/shared/mock-server.js` で定義されています。新しいエンドポイントを追加する場合は、このファイルを編集してください。

### モックレスポンスの例

```javascript
// Obsidian REST APIのレスポンスを模倣
app.get('/vault/:filename', (req, res) => {
  const { filename } = req.params;
  
  if (filename === 'test.md') {
    res.json({
      content: '# Test File\n\nThis is a test file.',
      path: 'test.md',
      tags: ['test'],
      frontmatter: {},
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: 35
      }
    });
  } else {
    res.status(404).json({
      error: 'File not found',
      errorCode: 40104
    });
  }
});
```

## テストのベストプラクティス

1. **モックテストを優先**: 開発中はモックテストを使用して高速にイテレーション
2. **実APIテストは慎重に**: データの変更を伴うテストは十分注意して実行
3. **エラーケースも網羅**: 正常系だけでなく、異常系のテストも必ず追加
4. **テストの独立性**: 各テストケースは他のテストに依存しないように設計