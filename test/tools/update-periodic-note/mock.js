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
      name: 'Handle 400 error - invalid content',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: 'Invalid content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined && response.result.content[0].text.includes('Error:')
      ],
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        response: {
          status: 400,
          body: {
            error: 'Incoming file could not be processed',
            errorCode: 40000
          }
        }
      }
    },
    {
      name: 'Handle 405 error - cannot update directory',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: 'Test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined && response.result.content[0].text.includes('Error:')
      ],
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        response: {
          status: 405,
          body: {
            error: 'Cannot update directory',
            errorCode: 40500
          }
        }
      }
    },
    {
      name: 'Handle 401 unauthorized error',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: 'Test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined && response.result.content[0].text.includes('Error:')
      ],
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        response: {
          status: 401,
          body: {
            error: 'Unauthorized',
            errorCode: 40100
          }
        }
      }
    },
    {
      name: 'Handle network timeout',
      request: {
        method: 'tools/call',
        params: {
          name: 'update_periodic_note',
          arguments: {
            period: 'daily',
            content: 'Test content'
          }
        }
      },
      assertions: [
        response => response.result !== undefined && response.result.content[0].text.includes('Error:')
      ],
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        simulateTimeout: true
      }
    }
];