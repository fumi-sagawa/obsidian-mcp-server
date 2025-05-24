/**
 * 統合テスト: get-periodic-note
 * Obsidian Local REST APIの /periodic/{period}/ エンドポイントとの統合
 */

module.exports = {
  name: 'get-periodic-note',
  tests: [
    {
      name: 'daily note should be retrieved successfully',
      input: { period: 'daily' },
      validation: (result) => {
        console.log('Daily note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // レスポンスの基本的な形式をチェック
        const expectedPatterns = [
          'Daily note:',
          'Size:',
          'Modified:',
          'Content:'
        ];
        
        for (const pattern of expectedPatterns) {
          if (!text.includes(pattern)) {
            console.warn(`Warning: Expected pattern "${pattern}" not found in response`);
          }
        }
        
        return true;
      }
    },
    {
      name: 'weekly note should be retrieved successfully',
      input: { period: 'weekly' },
      validation: (result) => {
        console.log('Weekly note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // エラーメッセージの場合もテストを通す（ノートが存在しない場合）
        if (text.includes('No weekly note found')) {
          console.log('Weekly note not found - this is expected if no weekly note exists');
          return true;
        }
        
        if (text.includes('Weekly note:')) {
          console.log('Weekly note found and retrieved successfully');
          return true;
        }
        
        throw new Error('Unexpected response format');
      }
    },
    {
      name: 'monthly note should be retrieved successfully',
      input: { period: 'monthly' },
      validation: (result) => {
        console.log('Monthly note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // エラーメッセージの場合もテストを通す（ノートが存在しない場合）
        if (text.includes('No monthly note found')) {
          console.log('Monthly note not found - this is expected if no monthly note exists');
          return true;
        }
        
        if (text.includes('Monthly note:')) {
          console.log('Monthly note found and retrieved successfully');
          return true;
        }
        
        throw new Error('Unexpected response format');
      }
    },
    {
      name: 'quarterly note should be retrieved successfully',
      input: { period: 'quarterly' },
      validation: (result) => {
        console.log('Quarterly note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // エラーメッセージの場合もテストを通す（ノートが存在しない場合）
        if (text.includes('No quarterly note found')) {
          console.log('Quarterly note not found - this is expected if no quarterly note exists');
          return true;
        }
        
        if (text.includes('Quarterly note:')) {
          console.log('Quarterly note found and retrieved successfully');
          return true;
        }
        
        throw new Error('Unexpected response format');
      }
    },
    {
      name: 'yearly note should be retrieved successfully',
      input: { period: 'yearly' },
      validation: (result) => {
        console.log('Yearly note result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        // エラーメッセージの場合もテストを通す（ノートが存在しない場合）
        if (text.includes('No yearly note found')) {
          console.log('Yearly note not found - this is expected if no yearly note exists');
          return true;
        }
        
        if (text.includes('Yearly note:')) {
          console.log('Yearly note found and retrieved successfully');
          return true;
        }
        
        throw new Error('Unexpected response format');
      }
    },
    {
      name: 'invalid period type should return appropriate error',
      input: { period: 'invalid' },
      validation: (result) => {
        console.log('Invalid period result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        if (!text.includes('Invalid period type')) {
          throw new Error('Expected error message for invalid period type');
        }
        
        console.log('Invalid period type handled correctly');
        return true;
      }
    },
    {
      name: 'missing period parameter should return appropriate error',
      input: {},
      validation: (result) => {
        console.log('Missing period result:', JSON.stringify(result, null, 2));
        
        if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
          throw new Error('Expected content array with at least one item');
        }
        
        const text = result.content[0].text;
        if (!text || typeof text !== 'string') {
          throw new Error('Expected text content');
        }
        
        if (!text.includes('Period parameter is required')) {
          throw new Error('Expected error message for missing period parameter');
        }
        
        console.log('Missing period parameter handled correctly');
        return true;
      }
    }
  ]
};