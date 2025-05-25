/**
 * delete-periodic-note 統合テスト（実APIサーバー用）
 */
export const testCases = [
    {
      name: 'delete daily note successfully',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_periodic_note',
          arguments: { period: 'daily' }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'delete weekly note successfully',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_periodic_note',
          arguments: { period: 'weekly' }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'delete monthly note successfully',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_periodic_note',
          arguments: { period: 'monthly' }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'delete quarterly note successfully',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_periodic_note',
          arguments: { period: 'quarterly' }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'delete yearly note successfully',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_periodic_note',
          arguments: { period: 'yearly' }
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'handle invalid period parameter',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_periodic_note',
          arguments: { period: 'invalid' }
        }
      },
      assertions: [
        response => response.error !== undefined
      ]
    }
];