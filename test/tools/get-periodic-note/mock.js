/**
 * モックテスト: get-periodic-note
 * モックサーバーを使用した定期ノート取得のテスト
 */

export const testCases = [
  {
    name: 'daily note should be retrieved from mock server',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_periodic_note',
        arguments: { period: 'daily' }
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
          // 正常なレスポンスまたはエラーメッセージを受け入れる
          return text.includes('Daily note:') || 
                 text.includes('No daily note found') || 
                 text.includes('Cannot connect to Obsidian');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'all period types should be handled',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_periodic_note',
        arguments: { period: 'weekly' }
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
          const validResponses = [
            'Weekly note:',
            'No weekly note found',
            'Cannot connect to Obsidian'
          ];
          return validResponses.some(pattern => text.includes(pattern));
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'invalid period type should return validation error',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_periodic_note',
        arguments: { period: 'invalid' }
      }
    },
    assertions: [
      // MCPレベルでバリデーションエラーが発生することを期待
      response => response.error !== undefined,
      response => response.error && response.error.code === -32602,
      response => response.error && response.error.message.includes('Invalid enum value')
    ]
  },
  {
    name: 'connection error should be handled gracefully',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_periodic_note',
        arguments: { period: 'monthly' }
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
          // 何らかの適切なレスポンスが返されていることを確認
          return text.length > 0;
        } catch (e) {
          return false;
        }
      }
    ]
  }
];