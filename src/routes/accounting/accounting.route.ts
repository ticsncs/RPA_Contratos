import { Page } from 'playwright';
import { Logger } from '../../utils/logger';
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('accounting-export');
const ACCOUNTIG_MODULE = 'https://erp.nettplus.net/web#cids=1&action=308&model=account.journal&view_type=kanban&menu_id=258';

/**
 * Navigate to accounting dashboard
 */
export async function navigateToAccountingDashboard(page: Page): Promise<Page> {
    
    await page.goto(ACCOUNTIG_MODULE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    logger.info('Navigating to accounting dashboard');
    if (!page) throw new Error('Page not initialized');

    try {
        await page.locator('span.text-900', { hasText: 'Tablero contable' })
            .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
        logger.success('Accounting dashboard loaded');
        return page;
    } catch (error) {
        logger.error('Failed to load accounting dashboard', error);
        throw new Error('Navigation to accounting dashboard failed');
    }
}
