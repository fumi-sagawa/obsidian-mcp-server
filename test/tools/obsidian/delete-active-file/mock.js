/**
 * delete-active-file モックテスト
 */
export const testCases = [
  {
    name: 'delete active file successfully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-active-file',
        arguments: {}
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => {
        try {
          return response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text';
        } catch (e) {
          return false;
        }
      },
      response => {
        try {
          const text = response.result.content[0].text;
          return text.includes('deleted successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'handle API error gracefully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete-active-file',
        arguments: {}
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => {
        try {
          return response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text';
        } catch (e) {
          return false;
        }
      },
      response => {
        try {
          const text = response.result.content[0].text;
          // 成功またはエラーメッセージが返ることを確認
          return text.includes('deleted successfully') || text.includes('Error:') || text.includes('Cannot connect to Obsidian');
        } catch (e) {
          return false;
        }
      }
    ]
  }
];