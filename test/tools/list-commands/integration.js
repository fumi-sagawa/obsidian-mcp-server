// list-commands統合テスト
export const testCases = [
  {
    name: 'Obsidianで利用可能なコマンド一覧を取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_commands',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: タイトルを含む
      response => response.result.content[0].text.includes('利用可能なコマンド一覧'),
      // 期待される結果: execute_commandへの言及
      response => response.result.content[0].text.includes('execute_command')
    ]
  }
];