// get-alerts統合テスト
export const testCases = [
  {
    name: '正常な州コードで警報を取得',
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
      // 期待される結果: textタイプのコンテンツ
      response => response.result.content[0].type === 'text',
      // 期待される結果: CA州の警報情報を含む
      response => response.result.content[0].text.includes('Active alerts for CA')
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
      // 期待される結果: エラーメッセージを含む
      response => response.result.content[0].text.includes('Invalid state code')
    ]
  }
];