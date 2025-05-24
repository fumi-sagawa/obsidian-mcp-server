// get-server-statusモックテスト
export const testCases = [
  {
    name: 'Obsidianサーバーステータスを取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-server-status',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: Obsidian Server Statusを含む
      response => response.result.content[0].text.includes('Obsidian Server Status'),
      // 期待される結果: 認証状態を含む
      response => response.result.content[0].text.includes('Authenticated: Yes'),
      // 期待される結果: バージョン情報を含む
      response => response.result.content[0].text.includes('Obsidian Version: 1.5.0')
    ]
  }
];