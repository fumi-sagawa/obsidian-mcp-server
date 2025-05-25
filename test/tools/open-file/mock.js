/**
 * open-file ツールのモックテスト
 */

export const testCases = [
  {
    name: 'ファイルを開く（デフォルト）',
    request: {
      method: 'tools/call',
      params: {
        name: 'open_file',
        arguments: {
          filename: 'notes/test.md'
        }
      }
    },
    assertions: [
      (response) => {
        try {
          return response.result && response.result.content && response.result.content[0];
        } catch (e) {
          return false;
        }
      },
      (response) => {
        try {
          return response.result.content[0].text.includes('opened successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'ファイルを新しいリーフで開く',
    request: {
      method: 'tools/call',
      params: {
        name: 'open_file',
        arguments: {
          filename: 'notes/test.md',
          newLeaf: true
        }
      }
    },
    assertions: [
      (response) => {
        try {
          return response.result && response.result.content && response.result.content[0];
        } catch (e) {
          return false;
        }
      },
      (response) => {
        try {
          return response.result.content[0].text.includes('opened successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '特殊文字を含むファイルパス',
    request: {
      method: 'tools/call',
      params: {
        name: 'open_file',
        arguments: {
          filename: 'notes/テスト ノート (2024).md'
        }
      }
    },
    assertions: [
      (response) => {
        try {
          return response.result && response.result.content && response.result.content[0];
        } catch (e) {
          return false;
        }
      },
      (response) => {
        try {
          return response.result.content[0].text.includes('opened successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '無効なファイルパス（パストラバーサル）',
    request: {
      method: 'tools/call',
      params: {
        name: 'open_file',
        arguments: {
          filename: '../../../etc/passwd'
        }
      }
    },
    assertions: [
      (response) => {
        try {
          return response.result && response.result.content && response.result.content[0];
        } catch (e) {
          return false;
        }
      },
      (response) => {
        try {
          return response.result.content[0].text.includes('Error') && response.result.content[0].text.includes('Invalid file path');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '空のファイル名',
    request: {
      method: 'tools/call',
      params: {
        name: 'open_file',
        arguments: {
          filename: ''
        }
      }
    },
    assertions: [
      // MCPレベルでバリデーションエラーが発生することを期待
      response => response.error !== undefined,
      response => response.error && response.error.code === -32602,
      response => response.error && response.error.message.includes('Filename is required')
    ]
  }
];