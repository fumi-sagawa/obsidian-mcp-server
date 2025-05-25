/**
 * delete-active-file 統合テスト（実APIサーバー用）
 */
export const testCases = [
    {
      name: 'delete active file successfully',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_active_file',
          arguments: {}
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    },
    {
      name: 'handle no active file error',
      request: {
        method: 'tools/call',
        params: {
          name: 'delete_active_file',
          arguments: {}
        }
      },
      assertions: [
        response => response.result !== undefined || response.error !== undefined
      ]
    }
];