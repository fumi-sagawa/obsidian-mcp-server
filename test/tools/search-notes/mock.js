/**
 * search_notes ツールのモックテストケース
 */

export const testCases = [
  {
    name: '検索結果が空の場合',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{"in": ["nonexistent-tag", {"var": "tags"}]}'
        }
      }
    },
    setup: (mockServer) => {
      mockServer.post('/search/', (req, res) => {
        res.json([]);
      });
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('No matches found')
    ]
  }
];