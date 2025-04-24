import { Page } from "playwright";
import { Logger } from "../../utils/logger";
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('contract-export');

export async function navigateToBilling(page:Page): Promise<Page> {
    logger.info('Navigating to billing section');
    if (!page) throw new Error('Page not initialized');
    
    try {
      await page.getByRole('button', { name: 'Clientes' }).click();
      await page.getByRole('menuitem', { name: 'Facturas' }).click();
      
      await page.locator('span.text-900', { hasText: 'Facturas' })
        .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
      logger.success('Billing section loaded');
      return page;
    } catch (error) {
      logger.error('Failed to navigate to billing section', error);
      throw new Error('Navigation to billing failed');
    }
}