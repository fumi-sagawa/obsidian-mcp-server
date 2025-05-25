/**
 * delete-file ツールのモックテスト
 */

export const testCases = [
  {
    name: '既存ファイルを削除',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: 'test-file.md'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // 成功メッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('File deleted successfully: test-file.md');
      }
    ]
  },
  {
    name: '存在しないファイルのエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: 'non-existent.md'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // エラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('Error: File not found: non-existent.md');
      }
    ]
  },
  {
    name: '空のファイル名でエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: ''
        }
      }
    },
    assertions: [
      // エラーレスポンスが存在すること
      response => response.error !== undefined,
      // バリデーションエラーメッセージが含まれること
      response => {
        return response.error?.message?.includes('Filename is required');
      }
    ]
  },
  {
    name: '親ディレクトリ参照のエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: '../dangerous.md'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // エラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('Error: Invalid file path');
      }
    ]
  },
  {
    name: '絶対パスのエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: '/etc/passwd'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // エラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('Error: Invalid file path');
      }
    ]
  },
  {
    name: 'ディレクトリパスのエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: 'folder/'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // エラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('Error: Cannot delete directory');
      }
    ]
  },
  {
    name: 'システムファイルのエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-file',
        arguments: {
          filename: '.obsidian/config'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // エラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('Error: Cannot delete system file');
      }
    ]
  }
];