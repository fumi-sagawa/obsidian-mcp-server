/**
 * delete-periodic-note モックテスト
 */
export const testCases = [
  {
    name: 'delete daily note successfully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_periodic_note',
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
          return text.includes('daily note deleted successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'delete weekly note successfully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_periodic_note',
        arguments: { period: 'weekly' }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => {
        try {
          const text = response.result.content[0].text;
          return text.includes('weekly note deleted successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'delete monthly note successfully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_periodic_note',
        arguments: { period: 'monthly' }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => {
        try {
          const text = response.result.content[0].text;
          return text.includes('monthly note deleted successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'delete quarterly note successfully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_periodic_note',
        arguments: { period: 'quarterly' }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => {
        try {
          const text = response.result.content[0].text;
          return text.includes('quarterly note deleted successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'delete yearly note successfully (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_periodic_note',
        arguments: { period: 'yearly' }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => {
        try {
          const text = response.result.content[0].text;
          return text.includes('yearly note deleted successfully');
        } catch (e) {
          return false;
        }
      }
    ]
  },
  {
    name: 'handle invalid period (mock)',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_periodic_note',
        arguments: { period: 'invalid' }
      }
    },
    assertions: [
      response => response.error !== undefined || (response.result && response.result.content[0].text.includes('Error:')),
      response => {
        if (response.error) {
          return response.error.message.includes('validation') || response.error.message.includes('Invalid');
        }
        try {
          const text = response.result.content[0].text;
          return text.includes('Error:');
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
        name: 'delete_periodic_note',
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
          // 成功またはエラーメッセージが返ることを確認
          return text.includes('deleted successfully') || text.includes('Error:') || text.includes('Cannot connect to Obsidian');
        } catch (e) {
          return false;
        }
      }
    ]
  }
];