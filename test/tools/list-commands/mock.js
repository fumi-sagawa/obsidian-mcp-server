// list_commandsモックテスト
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
      // 期待される結果: JSON形式のレスポンス
      response => {
        try {
          JSON.parse(response.result.content[0].text);
          return true;
        } catch {
          return false;
        }
      },
      // 期待される結果: コマンド配列を含む
      response => {
        const data = JSON.parse(response.result.content[0].text);
        return data.commands && Array.isArray(data.commands);
      },
      // 期待される結果: 特定のコマンドを含む
      response => response.result.content[0].text.includes('global-search:open')
    ]
  }
];