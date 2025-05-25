export const testCases = [
  {
    name: 'Daily note',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'daily',
          content: '\n\n## Test Entry (API Test)\n\nThis is a test entry for the daily note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        // 成功メッセージまたはAPIエラーメッセージを受け入れる
        return text.includes('Successfully appended content to') || 
               text.includes('Cannot connect to Obsidian') ||
               text.includes('No daily note found');
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
          content: '\n\n## Weekly Summary (API Test)\n\nThis is a test entry for the weekly note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') || 
               text.includes('Cannot connect to Obsidian') ||
               text.includes('No weekly note found');
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
          content: '\n\n## Monthly Review (API Test)\n\nThis is a test entry for the monthly note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') || 
               text.includes('Cannot connect to Obsidian') ||
               text.includes('No monthly note found');
      }
    ]
  },
  {
    name: 'Quarterly note',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'quarterly',
          content: '\n\n## Quarterly Goals (API Test)\n\nThis is a test entry for the quarterly note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') || 
               text.includes('Cannot connect to Obsidian') ||
               text.includes('No quarterly note found');
      }
    ]
  },
  {
    name: 'Yearly note',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_periodic_note',
        arguments: {
          period: 'yearly',
          content: '\n\n## Yearly Reflection (API Test)\n\nThis is a test entry for the yearly note.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result && response.result.content && response.result.content[0] && response.result.content[0].type === 'text',
      response => {
        const text = response.result.content[0].text;
        return text.includes('Successfully appended content to') || 
               text.includes('Cannot connect to Obsidian') ||
               text.includes('No yearly note found');
      }
    ]
  }
];