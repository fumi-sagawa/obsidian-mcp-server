import { test, expect } from '@playwright/test';

test.describe('MCP Inspector UI 探索', () => {
  test('UIの構造を確認', async ({ page }) => {
    await page.goto('/');
    
    // ページが読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // ページ全体のスクリーンショットを撮る
    await page.screenshot({ 
      path: 'e2e/screenshots/ui-structure.png',
      fullPage: true 
    });
    
    // すべてのボタンとリンクを出力
    const buttons = await page.locator('button').all();
    console.log(`ボタン数: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`ボタン ${i}: "${text}"`);
    }
    
    // すべてのセレクタを出力
    const selects = await page.locator('select').all();
    console.log(`セレクト数: ${selects.length}`);
    
    // すべてのテキストエリアを出力
    const textareas = await page.locator('textarea').all();
    console.log(`テキストエリア数: ${textareas.length}`);
    
    // ページのHTMLを確認
    const html = await page.content();
    console.log('ページタイトル:', await page.title());
    
    // 主要な要素の存在を確認
    const hasToolList = await page.locator('text=/tool|Tool/i').count() > 0;
    const hasParameters = await page.locator('text=/parameter|Parameter/i').count() > 0;
    const hasSendButton = await page.locator('text=/send|Send/i').count() > 0;
    
    console.log(`ツール関連要素: ${hasToolList}`);
    console.log(`パラメータ関連要素: ${hasParameters}`);
    console.log(`送信ボタン: ${hasSendButton}`);
  });
});