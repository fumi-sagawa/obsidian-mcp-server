/**
 * delete-periodic-note 統合テスト（実APIサーバー用）
 */
export const testCases = {
  name: 'delete_periodic_note',
  tests: [
    {
      name: 'delete daily note successfully',
      test: async (runTool) => {
        // 注意: このテストは破壊的操作のため、実行には注意が必要
        // 削除対象の日次ノートが存在することを前提とする
        const result = await runTool('delete-periodic-note', { period: 'daily' });
        
        // 成功メッセージが返ることを確認
        if (!result.content[0].text.includes('daily note deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'delete weekly note successfully',
      test: async (runTool) => {
        const result = await runTool('delete-periodic-note', { period: 'weekly' });
        
        if (!result.content[0].text.includes('weekly note deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'delete monthly note successfully',
      test: async (runTool) => {
        const result = await runTool('delete-periodic-note', { period: 'monthly' });
        
        if (!result.content[0].text.includes('monthly note deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'delete quarterly note successfully',
      test: async (runTool) => {
        const result = await runTool('delete-periodic-note', { period: 'quarterly' });
        
        if (!result.content[0].text.includes('quarterly note deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'delete yearly note successfully',
      test: async (runTool) => {
        const result = await runTool('delete-periodic-note', { period: 'yearly' });
        
        if (!result.content[0].text.includes('yearly note deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'handle no periodic note error',
      test: async (runTool) => {
        // すでに削除済みまたは存在しない定期ノートを削除しようとする
        const result = await runTool('delete-periodic-note', { period: 'daily' });
        
        // エラーメッセージまたは成功メッセージが返ることを確認
        const text = result.content[0].text;
        if (!text.includes('Error:') && !text.includes('deleted successfully')) {
          throw new Error(`Expected error or success message but got: ${text}`);
        }
      }
    },
    {
      name: 'validate period parameter',
      test: async (runTool) => {
        try {
          // 無効な期間を指定
          await runTool('delete-periodic-note', { period: 'invalid' });
          throw new Error('Should have thrown validation error');
        } catch (error) {
          // バリデーションエラーが発生することを期待
          if (!error.message.includes('validation') && !error.message.includes('enum')) {
            throw new Error(`Expected validation error but got: ${error.message}`);
          }
        }
      }
    }
  ]
};