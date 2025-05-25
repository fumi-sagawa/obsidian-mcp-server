export const testCases = [
  {
    name: '基本的なファイル追記（モック）',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'mock-test.md',
          content: '\n## モックセクション\nモックで追記されたコンテンツ'
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('追記しました')
        );
      }
    ]
  },
  {
    name: 'ネストしたディレクトリのファイル',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'notes/daily/2024-05-24.md',
          content: '\n## 今日のまとめ\n- タスク完了\n- 次の計画'
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('notes/daily/2024-05-24.md') &&
          item.text.includes('追記しました')
        );
      }
    ]
  },
  {
    name: '長いコンテンツの追記',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'long-content.md',
          content: 'Lorem ipsum dolor sit amet, '.repeat(100)
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('追記しました')
        );
      }
    ]
  }
];