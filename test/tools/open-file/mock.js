/**
 * open-file ツールのモックテスト
 */

export const testCases = [
  {
    name: 'ファイルを開く（デフォルト）',
    request: {
      method: 'tools/call',
      params: {
        name: 'open-file',
        arguments: {
          filename: 'notes/test.md'
        }
      }
    },
    assertions: [
      (response) => response.result && response.result.content,
      (response) => response.result.content[0].text.includes('opened successfully')
    ]
  },
  {
    name: 'ファイルを新しいリーフで開く',
    request: {
      method: 'tools/call',
      params: {
        name: 'open-file',
        arguments: {
          filename: 'notes/test.md',
          newLeaf: true
        }
      }
    },
    assertions: [
      (response) => response.result && response.result.content,
      (response) => response.result.content[0].text.includes('opened successfully')
    ]
  },
  {
    name: '特殊文字を含むファイルパス',
    request: {
      method: 'tools/call',
      params: {
        name: 'open-file',
        arguments: {
          filename: 'notes/テスト ノート (2024).md'
        }
      }
    },
    assertions: [
      (response) => response.result && response.result.content,
      (response) => response.result.content[0].text.includes('opened successfully')
    ]
  },
  {
    name: '無効なファイルパス（パストラバーサル）',
    request: {
      method: 'tools/call',
      params: {
        name: 'open-file',
        arguments: {
          filename: '../../../etc/passwd'
        }
      }
    },
    assertions: [
      (response) => response.result && response.result.content,
      (response) => response.result.content[0].text.includes('Error') && response.result.content[0].text.includes('Invalid file path')
    ]
  },
  {
    name: '空のファイル名',
    request: {
      method: 'tools/call',
      params: {
        name: 'open-file',
        arguments: {
          filename: ''
        }
      }
    },
    assertions: [
      (response) => response.result && response.result.content,
      (response) => response.result.content[0].text.includes('Error')
    ]
  }
];