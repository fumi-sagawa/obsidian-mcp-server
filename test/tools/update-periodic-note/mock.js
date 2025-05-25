/**
 * Mock test for update-periodic-note tool
 */
export const updatePeriodicNoteMockTests = {
  name: 'update_periodic_note',
  tests: [
    {
      name: 'Update daily periodic note (mock)',
      params: {
        period: 'daily',
        content: '# Daily Note\n\nTest content for mock'
      },
      expectedSuccess: true,
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        response: {
          status: 204,
          body: null
        }
      },
      validate: (result) => {
        if (!result.content || !Array.isArray(result.content)) {
          throw new Error('Expected result.content to be an array');
        }
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated daily periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Update weekly periodic note (mock)',
      params: {
        period: 'weekly',
        content: '# Weekly Review\n\nMock test content'
      },
      expectedSuccess: true,
      mockConfig: {
        path: '/periodic/weekly/',
        method: 'PUT',
        response: {
          status: 204,
          body: null
        }
      },
      validate: (result) => {
        const text = result.content[0]?.text;
        if (!text || !text.includes('Successfully updated weekly periodic note')) {
          throw new Error('Unexpected success message');
        }
      }
    },
    {
      name: 'Handle 400 error - invalid content',
      params: {
        period: 'daily',
        content: 'Invalid content'
      },
      expectedSuccess: false,
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
      },
      expectedError: 'Incoming file could not be processed'
    },
    {
      name: 'Handle 405 error - cannot update directory',
      params: {
        period: 'daily',
        content: 'Test content'
      },
      expectedSuccess: false,
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
      },
      expectedError: 'Cannot update directory'
    },
    {
      name: 'Handle 401 unauthorized error',
      params: {
        period: 'daily',
        content: 'Test content'
      },
      expectedSuccess: false,
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
      },
      expectedError: 'Unauthorized'
    },
    {
      name: 'Handle network timeout',
      params: {
        period: 'daily',
        content: 'Test content'
      },
      expectedSuccess: false,
      mockConfig: {
        path: '/periodic/daily/',
        method: 'PUT',
        simulateTimeout: true
      },
      expectedError: 'timeout'
    }
  ]
};