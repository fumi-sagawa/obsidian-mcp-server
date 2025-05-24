// health-check統合テスト
export const testCases = [
  {
    name: 'ヘルスチェックを実行',
    request: {
      method: 'tools/call',
      params: {
        name: 'health-check',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: ヘルスチェックレポートを含む
      response => response.result.content[0].text.includes('Health Check Report'),
      // 期待される結果: ステータス情報を含む
      response => response.result.content[0].text.includes('Overall Status')
    ]
  }
];