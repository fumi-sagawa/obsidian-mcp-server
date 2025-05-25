/**
 * list-directory ツールのモックテスト
 */

export const testCases = [
  {
    name: 'ルートディレクトリの一覧を取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: ''
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
          const data = JSON.parse(response.result.content[0].text);
          return data.directory === '(root)';
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '通常のディレクトリの一覧を取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: 'notes'
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
          const data = JSON.parse(response.result.content[0].text);
          return data.directory === 'notes';
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '深い階層のディレクトリを処理',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: 'projects/web/frontend'
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
          const data = JSON.parse(response.result.content[0].text);
          return data.directory === 'projects/web/frontend';
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '特殊文字を含むディレクトリパス',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: 'my notes/日本語フォルダ'
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
          const data = JSON.parse(response.result.content[0].text);
          return data.directory === 'my notes/日本語フォルダ';
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '存在しないディレクトリのエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: 'non-existent-directory'
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
          return response.result.content[0].text.includes('Error') && response.result.content[0].text.includes('Directory not found');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '無効なパス（パストラバーサル）',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: '../../../etc'
        }
      }
    },
    assertions: [
      // MCPレベルでバリデーションエラーが発生することを期待
      response => response.error !== undefined,
      response => response.error && response.error.code === -32602,
      response => response.error && response.error.message.includes('Path traversal not allowed')
    ]
  },
  {
    name: '先頭のスラッシュが正規化される',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: '/notes/daily'
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
          const data = JSON.parse(response.result.content[0].text);
          return data.directory === 'notes/daily';
        } catch (e) {
          return false;
        }
      }
    ]
  }
];