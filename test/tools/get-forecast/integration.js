// get-forecast統合テスト
export const testCases = [
  {
    name: 'サンフランシスコの予報を取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-forecast',
        arguments: { latitude: 37.7749, longitude: -122.4194 }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 予報データを含む
      response => response.result.content[0].text.includes('Forecast for')
    ]
  },
  {
    name: '必須パラメータ欠落でエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-forecast',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス
      response => response.error !== undefined,
      // 期待される結果: パラメータエラー
      response => response.error.code === -32602
    ]
  }
];