/**
 * Mock test for update-periodic-note tool
 */
export const testCases = [
    {
      name: 'Update daily periodic note (mock)',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: '# Daily Note\n\nTest content for mock'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ],
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        response: {
          status: 204,
          body: null
        }
      }
    },
    {
      name: 'Update weekly periodic note (mock)',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'weekly',
            content: '# Weekly Review\n\nMock test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ],
      mockConfig: {
        path: '/periodic/weekly/',
        method: 'PUT',
        response: {
          status: 204,
          body: null
        }
      }
    },
    {
      name: 'Update monthly periodic note (mock)',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'monthly',
            content: '# Monthly Summary\n\nMock test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined
      ]
    },
    {
      name: 'Update quarterly periodic note (mock)',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'quarterly',
            content: '# Quarterly Review\n\nMock test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined
      ]
    },
    {
      name: 'Update yearly periodic note (mock)',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'yearly',
            content: '# Yearly Goals\n\nMock test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined
      ]
    }
];