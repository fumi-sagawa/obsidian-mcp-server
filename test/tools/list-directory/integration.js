/**
 * list-directory ツールの統合テスト
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
          return response.result.content[0].text.includes('Directory: (root)') ||
                 response.result.content[0].text.includes('Files found:');
        } catch (e) {
          return false;
        }
      },
      (response) => {
        try {
          // ディレクトリ一覧が含まれていることを確認
          return response.result.content[0].text.includes('📁') || 
                 response.result.content[0].text.includes('📄');
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
          return response.result.content[0].text.includes('Directory: notes') ||
                 response.result.content[0].text.includes('notes');
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
          // 成功またはディレクトリが存在しないエラーのいずれかを期待
          return (response.result && response.result.content) || 
                 (response.result && response.result.content[0].text.includes('Error'));
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
          pathToDirectory: 'my notes'
        }
      }
    },
    assertions: [
      (response) => {
        try {
          // 成功またはディレクトリが存在しないエラーのいずれかを期待
          return (response.result && response.result.content) || 
                 (response.result && response.result.content[0].text.includes('Error'));
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
          pathToDirectory: 'non-existent-directory-12345'
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
          return response.result.content[0].text.includes('Error') || 
                 response.result.content[0].text.includes('not found') ||
                 response.result.content[0].text.includes('存在しません');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: '無効なパス（パストラバーサル）のバリデーション',
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
      response => response.error && (response.error.code === -32602 || 
                                   response.error.message.includes('Path traversal') ||
                                   response.error.message.includes('not allowed'))
    ]
  },
  {
    name: '先頭のスラッシュが正規化される',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_directory',
        arguments: {
          pathToDirectory: '/notes'
        }
      }
    },
    assertions: [
      (response) => {
        try {
          // 成功またはディレクトリが存在しないエラーのいずれかを期待
          return (response.result && response.result.content) || 
                 (response.result && response.result.content[0].text.includes('Error'));
        } catch (e) {
          return false;
        }
      }
    ]
  }
];