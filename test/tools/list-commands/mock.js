// list-commandsモックテスト
export const testCases = [
  {
    name: 'Obsidianで利用可能なコマンド一覧を取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'list-commands',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: タイトルを含む
      response => response.result.content[0].text.includes('利用可能なコマンド一覧'),
      // 期待される結果: コマンド数の表示
      response => response.result.content[0].text.includes('個のコマンドが見つかりました'),
      // 期待される結果: 特定のコマンドを含む
      response => response.result.content[0].text.includes('global-search:open'),
      // 期待される結果: execute_commandへの言及
      response => response.result.content[0].text.includes('execute_command')
    ]
  }
];