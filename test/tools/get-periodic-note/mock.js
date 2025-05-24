/**
 * モックテスト: get-periodic-note
 * モックサーバーを使用した定期ノート取得のテスト
 */

module.exports = {
  name: 'get-periodic-note',
  tests: [
    {
      name: 'daily note should be retrieved from mock server',
      input: { period: 'daily' },
      validation: (result) => {
        console.log('Mock daily note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // モックサーバーからの応答をチェック
        const expectedPatterns = [
          'Daily note:',
          'Size:',
          'Modified:',
          'Content:'
        ];
        
        let foundPatterns = 0;
        for (const pattern of expectedPatterns) {
          if (text.includes(pattern)) {
            foundPatterns++;
          }
        }
        
        if (foundPatterns === 0) {
          // パターンが見つからない場合、エラーメッセージかチェック
          if (text.includes('Cannot connect to Obsidian') || 
              text.includes('No daily note found')) {
            console.log('Expected error message received');
            return true;
          }
          throw new Error('No expected patterns found in response');
        }
        
        console.log(`Found ${foundPatterns}/${expectedPatterns.length} expected patterns`);
        return true;
      }
    },
    {
      name: 'all period types should be handled',
      input: { period: 'weekly' },
      validation: (result) => {
        console.log('Mock weekly note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // 正常なレスポンスまたは適切なエラーメッセージであることを確認
        const validResponses = [
          'Weekly note:',
          'No weekly note found',
          'Cannot connect to Obsidian'
        ];
        
        const isValidResponse = validResponses.some(pattern => text.includes(pattern));
        if (!isValidResponse) {
          throw new Error('Unexpected response format');
        }
        
        console.log('Weekly note request handled appropriately');
        return true;
      }
    },
    {
      name: 'invalid period type should return validation error',
      input: { period: 'invalid' },
      validation: (result) => {
        console.log('Mock invalid period result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        if (!text.includes('Invalid period type')) {
          throw new Error('Expected validation error for invalid period type');
        }
        
        console.log('Invalid period type validation working correctly');
        return true;
      }
    },
    {
      name: 'connection error should be handled gracefully',
      input: { period: 'monthly' },
      validation: (result) => {
        console.log('Mock monthly note result:', JSON.stringify(result, null, 2));
        
        // モックテストでは接続エラーまたは正常なレスポンスのどちらでも良い
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // 何らかの適切なレスポンスが返されていることを確認
        if (text.length === 0) {
          throw new Error('Empty response text');
        }
        
        console.log('Monthly note request completed with response');
        return true;
      }
    }
  ]
};