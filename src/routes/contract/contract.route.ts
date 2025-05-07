import { Page } from 'playwright';
import { Logger } from '../../utils/logger';
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('contract-export');
const CONTRACT_MODULE = 'https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list';

/**
 * Navigate to contract dashboard
 */
export async function navigateToContractDashboard(page: Page): Promise<Page> {
    
    await page.goto(CONTRACT_MODULE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    logger.info('Navigating to contract dashboard');
    if (!page) throw new Error('Page not initialized');

    try {
        await page.locator('span.text-900', { hasText: 'Contratos' })
            .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
        logger.success('Contract dashboard loaded');
        return page;
    } catch (error) {
        logger.error('Failed to load contract dashboard', error);
        throw new Error('Navigation to contract dashboard failed');
    }
}
