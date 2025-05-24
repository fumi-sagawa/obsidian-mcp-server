// get-forecastモックテスト  
export const testCases = [
  {
    name: 'サンフランシスコの固定予報を取得',
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
      // 期待される結果: 固定の予報データ
      response => response.result.content[0].text.includes('Today'),
      response => response.result.content[0].text.includes('65°F'),
      response => response.result.content[0].text.includes('Sunny')
    ]
  }
];