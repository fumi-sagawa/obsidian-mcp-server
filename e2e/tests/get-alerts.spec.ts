import { test, expect } from '@playwright/test';
import { MCPInspectorPage } from '../fixtures/mcp-inspector-page';

test.describe('気象警報取得機能', () => {
  let inspector: MCPInspectorPage;

  test.beforeEach(async ({ page }) => {
    inspector = new MCPInspectorPage(page);
    await page.goto('/');
    await inspector.waitForLoad();
    await inspector.connectToSTDIO();
  });

  test('正常系: カリフォルニア州の警報を取得できる', async ({ page }) => {
    await inspector.selectTool('get-alerts');
    await inspector.setParameters({ state: 'CA' });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const responseText = await inspector.getResponseText();
    
    // レスポンスに州名が含まれることを確認
    expect(responseText).toContain('California');
    
    // エラーが発生していないことを確認
    const hasError = await inspector.checkForError();
    expect(hasError).toBe(false);
  });

  test('正常系: 警報がない州でも正常に処理される', async ({ page }) => {
    await inspector.selectTool('get-alerts');
    await inspector.setParameters({ state: 'HI' }); // ハワイ州
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const responseText = await inspector.getResponseText();
    
    // "No active alerts" または警報情報が表示される
    expect(responseText.toLowerCase()).toMatch(/hawaii|no active alerts/);
    
    const hasError = await inspector.checkForError();
    expect(hasError).toBe(false);
  });

  test('エラー系: 無効な州コードでエラーが返される', async ({ page }) => {
    await inspector.selectTool('get-alerts');
    await inspector.setParameters({ state: 'XX' });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
    
    const responseText = await inspector.getResponseText();
    expect(responseText.toLowerCase()).toContain('error');
  });

  test('エラー系: パラメータが空の場合エラーが返される', async ({ page }) => {
    await inspector.selectTool('get-alerts');
    await inspector.setParameters({});
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
  });
});