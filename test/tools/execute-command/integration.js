// execute-command統合テスト
export const testCases = [
  {
    name: '有効なコマンドIDでコマンドを実行',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute_command',
        arguments: {
          commandId: 'global-search:open'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: content配列が存在
      response => Array.isArray(response.result.content),
      // 期待される結果: 実行結果メッセージを含む
      response => response.result.content[0].text.includes('Command executed') || 
                 response.result.content[0].text.includes('successfully'),
      // 期待される結果: コマンドIDを含む
      response => response.result.content[0].text.includes('global-search:open')
    ]
  },
  {
    name: 'エディタ系コマンドを実行',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute_command',
        arguments: {
          commandId: 'editor:toggle-bold'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: エディタコマンドが実行される
      response => response.result.content[0].text.includes('editor:toggle-bold')
    ]
  },
  {
    name: 'コマンドIDなしでエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute_command',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス
      response => response.error !== undefined,
      // 期待される結果: 必須パラメータエラー
      response => response.error.message.includes('Required') || 
                 response.error.message.includes('commandId')
    ]
  },
  {
    name: '存在しないコマンドでエラー処理',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute_command',
        arguments: {
          commandId: 'non-existent-command-12345'
        }
      }
    },
    assertions: [
      // 期待される結果: レスポンスが存在（エラーまたは失敗結果）
      response => response.result !== undefined || response.error !== undefined,
      // 期待される結果: エラー情報を含む
      response => (response.error && response.error.message) || 
                 (response.result && response.result.content[0].text.includes('Error')) ||
                 (response.result && response.result.content[0].text.includes('failed'))
    ]
  },
  {
    name: '特殊文字を含むコマンドIDを処理',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute_command',
        arguments: {
          commandId: 'workspace:split-vertical'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: コマンドIDが正しく処理される
      response => response.result.content[0].text.includes('workspace:split-vertical')
    ]
  }
];