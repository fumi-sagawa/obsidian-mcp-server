export const testCases = [
  {
    name: 'Daily note',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'daily',
          content: '\n\n## Test Entry (Mock Test)\n\nThis is a mock test entry for the daily note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') && text.includes('daily');
      }
    ]
  },
  {
    name: 'Weekly note',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'weekly',
          content: '\n\n## Weekly Summary (Mock Test)\n\nThis is a mock test entry for the weekly note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') && text.includes('weekly');
      }
    ]
  },
  {
    name: 'Monthly note',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'monthly',
          content: '\n\n## Monthly Review (Mock Test)\n\nThis is a mock test entry for the monthly note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') && text.includes('monthly');
      }
    ]
  },
  {
    name: 'Invalid period',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'invalid-period',
          content: 'This should fail'
        }
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
    name: 'Empty content',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'daily',
          content: ''
        }
      }
    },
    assertions: [
      // MCPレベルでバリデーションエラーが発生することを期待
      response => response.error !== undefined,
      response => response.error && response.error.code === -32602,
      response => response.error && response.error.message.includes('Content cannot be empty')
    ]
  }
];

export function setupMockResponses(mockServer) {
  // Successful appends to periodic notes
  mockServer.post('/periodic/:period/', (req, res) => {
    const { period } = req.params;
    const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: 'Invalid period type' });
    }
    
    // Simulate successful append (204 No Content)
    res.sendStatus(204);
  });
  
  // GET periodic note to get path
  mockServer.get('/periodic/:period/', (req, res) => {
    const { period } = req.params;
    const periodPaths = {
      daily: 'Daily Notes/2024-05-24.md',
      weekly: 'Weekly Notes/2024-W21.md',
      monthly: 'Monthly Notes/2024-05.md',
      quarterly: 'Quarterly Notes/2024-Q2.md',
      yearly: 'Yearly Notes/2024.md'
    };
    
    res.json({
      path: periodPaths[period] || `${period} notes/current.md`,
      content: 'Mock periodic note content',
      tags: [],
      frontmatter: {},
      stat: {
        ctime: Date.now() - 86400000,
        mtime: Date.now(),
        size: 100
      }
    });
  });
}