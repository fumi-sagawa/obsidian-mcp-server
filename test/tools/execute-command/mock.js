// execute-commandモックテスト
export const testCases = [
  {
    name: '有効なコマンドIDでコマンドを実行',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute-command',
        arguments: {
          commandId: 'global-search:open'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 実行成功メッセージを含む
      response => response.result.content[0].text.includes('executed successfully'),
      // 期待される結果: コマンドIDを含む
      response => response.result.content[0].text.includes('global-search:open')
    ]
  },
  {
    name: 'コマンドIDなしでエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute-command',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス（スキーマエラーまたはresultエラー）
      response => response.error !== undefined || (response.result && response.result.content),
      // 期待される結果: エラーメッセージを含む
      response => (response.error && response.error.message.includes('Required')) || 
                  (response.result && response.result.content[0].text.includes('Error')),
      // 期待される結果: 必須エラーまたはスキーマエラー
      response => (response.error !== undefined) || 
                  (response.result && response.result.content[0].text.includes('Required'))
    ]
  },
  {
    name: '存在しないコマンドでエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'execute-command',
        arguments: {
          commandId: 'non-existent-command'
        }
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス
      response => response.result !== undefined,
      // 期待される結果: エラーメッセージを含む
      response => response.result.content[0].text.includes('Error'),
      // 期待される結果: 404エラーを含む
      response => response.result.content[0].text.includes('does not exist')
    ]
  }
];