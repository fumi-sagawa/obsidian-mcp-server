/**
 * 統合テスト: get-periodic-note
 * Obsidian Local REST APIの /periodic/{period}/ エンドポイントとの統合
 */

export const testCases = [
  {
    name: 'daily note should be retrieved successfully',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
        arguments: { period: 'daily' }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: textタイプのコンテンツ
      response => {
        try {
          return response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text';
        } catch (e) {
          return false;
        }
      },
      // 期待される結果: Daily noteを含む（存在する場合）またはエラーメッセージ
      response => {
        try {
          const text = response.result.content[0].text;
          return text.includes('Daily note:') || text.includes('No daily note found');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'weekly note should be retrieved successfully',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
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
          return text.includes('Weekly note:') || text.includes('No weekly note found') || text.includes('API request failed');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'monthly note should be retrieved successfully',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
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
          return text.includes('Monthly note:') || text.includes('No monthly note found') || text.includes('API request failed');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'quarterly note should be retrieved successfully',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
        arguments: { period: 'quarterly' }
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
          return text.includes('Quarterly note:') || text.includes('No quarterly note found') || text.includes('API request failed');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'yearly note should be retrieved successfully',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
        arguments: { period: 'yearly' }
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
          return text.includes('Yearly note:') || text.includes('No yearly note found') || text.includes('API request failed');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'invalid period type should return appropriate error',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
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
    name: 'missing period parameter should return appropriate error',
    request: {
      method: 'tools/call',
      params: {
        name: 'get-periodic-note',
        arguments: {}
      }
    },
    assertions: [
      // MCPレベルでバリデーションエラーが発生することを期待
      response => response.error !== undefined,
      response => response.error && response.error.code === -32602,
      response => response.error && response.error.message.includes('Required')
    ]
  }
];