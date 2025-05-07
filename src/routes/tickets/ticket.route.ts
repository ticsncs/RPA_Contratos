import { Page } from 'playwright';
import { Logger } from '../../utils/logger';
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('ticket-export');
const TICKET_MODULE = 'https://erp.nettplus.net/web#menu_id=444&cids=1&action=670&model=helpdesk.ticket.team&view_type=kanban';

/**
 * Navigate to ticket dashboard
 */
export async function navigateToTicketDashboard(page: Page): Promise<Page> {
    
    await page.goto(TICKET_MODULE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    logger.info('Navigating to ticket dashboard');
    if (!page) throw new Error('Page not initialized');

    try {
        await page.locator('span.text-900', { hasText: 'Tablero' })
            .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
        logger.success('ticket dashboard loaded');
        return page;
    } catch (error) {
        logger.error('Failed to load ticket dashboard', error);
        throw new Error('Navigation to ticket dashboard failed');
    }
}
