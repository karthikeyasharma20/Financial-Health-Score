// Frontend layout test spec using standard Playwright testing framework
import { test, expect } from '@playwright/test';

test.describe('AI Financial Health Score Portal UI tests', () => {
  
  test('should display login forms on initial hit', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Assert titles
    await expect(page).toHaveTitle(/AI Financial Health Score/);
    
    // Assert form structures
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should redirect unauthenticated guest traffic to login page', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Verify auto redirect route check
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show dashboards after successful auth', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', 'user@financialhealth.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify dashboard navigation completes
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Financial Dashboard')).toBeVisible();
    
    // Verify presence of interactive charts containers
    await expect(page.locator('canvas')).toHaveCount(2); // Spending and Cash flow canvases
  });
});
