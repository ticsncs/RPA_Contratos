import { Page } from "playwright";
import { Logger } from "../../utils/logger";
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('ticket-export');

export async function navigateToTickets(page: Page): Promise<Page> {
    logger.info('Navigating to tickets section');
    if (!page) throw new Error('Page not initialized');

    try {
        await page.getByRole('menuitem', { name: 'Tickets' }).click();

        await page.locator('span.text-900', { hasText: 'Tickets' })
            .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
        logger.success('tickets section loaded');
        return page;
    } catch (error) {
        logger.error('Failed to navigate to tickets section', error);
        throw new Error('Navigation to tickets failed');
    }
}