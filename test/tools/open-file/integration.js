/**
 * open-file ツールの統合テスト
 * 実際のObsidian APIに接続してテストする
 */

export const testCases = [
  {
    name: 'ファイルを開く（デフォルト）',
    toolName: 'open-file',
    params: {
      filename: 'test-note.md'
    },
    expectedResponse: {
      type: 'success',
      contentCheck: (content) => {
        return content[0].text.includes('opened successfully');
      }
    }
  },
  {
    name: 'ファイルを新しいリーフで開く',
    toolName: 'open-file',
    params: {
      filename: 'test-note.md',
      newLeaf: true
    },
    expectedResponse: {
      type: 'success',
      contentCheck: (content) => {
        return content[0].text.includes('opened successfully');
      }
    }
  },
  {
    name: '存在しないファイルを開く（新規作成）',
    toolName: 'open-file',
    params: {
      filename: `test-notes/new-note-${Date.now()}.md`
    },
    expectedResponse: {
      type: 'success',
      contentCheck: (content) => {
        return content[0].text.includes('opened successfully');
      }
    }
  }
];