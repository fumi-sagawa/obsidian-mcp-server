import { test, expect } from '@playwright/test';
import { MCPInspectorPage } from '../fixtures/mcp-inspector-page';

test.describe('天気予報取得機能', () => {
  let inspector: MCPInspectorPage;

  test.beforeEach(async ({ page }) => {
    inspector = new MCPInspectorPage(page);
    await page.goto('/');
    await inspector.waitForLoad();
    await inspector.connectToSTDIO();
  });

  test('正常系: ニューヨークの天気予報を取得できる', async ({ page }) => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 40.7128,
      longitude: -74.0060
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const responseText = await inspector.getResponseText();
    
    // 予報情報が含まれることを確認
    expect(responseText.toLowerCase()).toMatch(/forecast|temperature|weather/);
    
    // エラーが発生していないことを確認
    const hasError = await inspector.checkForError();
    expect(hasError).toBe(false);
  });

  test('正常系: アラスカの天気予報を取得できる', async ({ page }) => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 64.8378,
      longitude: -147.7164
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const responseText = await inspector.getResponseText();
    const hasError = await inspector.checkForError();
    
    expect(hasError).toBe(false);
    expect(responseText).toBeTruthy();
  });

  test('エラー系: 無効な緯度でエラーが返される', async ({ page }) => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 91, // 無効な緯度（90度を超える）
      longitude: 0
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
  });

  test('エラー系: 無効な経度でエラーが返される', async ({ page }) => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 0,
      longitude: 181 // 無効な経度（180度を超える）
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
  });

  test('境界値: 最北端の座標で正常に動作する', async ({ page }) => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 71.3875,  // アラスカ最北端
      longitude: -156.4811
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(false);
  });

  test('境界値: 最南端の座標で正常に動作する', async ({ page }) => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 18.9110,  // ハワイ最南端
      longitude: -155.6813
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(false);
  });
});