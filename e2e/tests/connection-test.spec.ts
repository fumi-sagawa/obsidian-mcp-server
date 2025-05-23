import { test, expect } from '@playwright/test';
import { MCPInspectorPage } from '../fixtures/mcp-inspector-page';

test.describe('MCP Inspector 接続テスト', () => {
  test('基本的なページ読み込み確認', async ({ page }) => {
    await page.goto('/');
    
    // ページが読み込まれるまで待つ
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 初期画面のスクリーンショット
    await page.screenshot({ 
      path: 'e2e/screenshots/initial-page.png',
      fullPage: true 
    });
    
    // 基本的なUI要素の存在確認
    const buttons = await page.locator('button').all();
    console.log(`ボタン数: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const text = await buttons[i].textContent();
      console.log(`ボタン ${i}: "${text}"`);
    }
    
    // Transport Type コンボボックスの存在確認
    const transportCombo = page.getByRole('combobox', { name: 'Transport Type' });
    const comboExists = await transportCombo.count() > 0;
    console.log(`Transport Type コンボボックス存在: ${comboExists}`);
    
    if (comboExists) {
      // STDIO オプションの選択を試行
      try {
        await transportCombo.selectOption('stdio');
        console.log('STDIO選択成功');
        
        await page.waitForTimeout(2000);
        
        // STDIO選択後のスクリーンショット
        await page.screenshot({ 
          path: 'e2e/screenshots/stdio-selected.png',
          fullPage: true 
        });
        
      } catch (error) {
        console.log('STDIO選択エラー:', error);
      }
    }
  });
  
  test('STDIO接続の試行（エラー許容）', async ({ page }) => {
    const inspector = new MCPInspectorPage(page);
    await page.goto('/');
    await inspector.waitForLoad();
    
    try {
      await inspector.connectToSTDIO();
      console.log('接続試行完了');
      
      // 接続後のスクリーンショット
      await page.screenshot({ 
        path: 'e2e/screenshots/connection-attempt.png',
        fullPage: true 
      });
      
      // エラーチェック
      const hasError = await inspector.checkForError();
      console.log(`エラー検出: ${hasError}`);
      
    } catch (error) {
      console.log('接続エラー（予期される）:', error);
      
      // エラー時のスクリーンショット
      await page.screenshot({ 
        path: 'e2e/screenshots/connection-error.png',
        fullPage: true 
      });
    }
  });
});