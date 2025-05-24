// get-alertsモックテスト
export const testCases = [
  {
    name: '正常な州コードで固定の警報を取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-alerts',
        arguments: { state: 'CA' }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: テスト用の固定警報を含む
      response => response.result.content[0].text.includes('Test Alert for CA'),
      // 期待される結果: 正確なエリア情報
      response => response.result.content[0].text.includes('Test Area, CA')
    ]
  },
  {
    name: '警報がない州で空の結果',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-alerts',
        arguments: { state: 'HI' }
      }
    },
    assertions: [
      // 期待される結果: 警報なしメッセージ
      response => response.result.content[0].text === 'No active alerts for HI'
    ]
  },
  {
    name: '無効な州コードでエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-alerts',
        arguments: { state: 'XX' }
      }
    },
    assertions: [
      // 期待される結果: バリデーションエラー
      response => response.result.content[0].text.includes('Invalid state code: XX')
    ]
  }
];