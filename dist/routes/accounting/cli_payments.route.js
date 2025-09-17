"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToPayments = navigateToPayments;
const logger_1 = require("../../utils/logger");
const DEFAULT_TIMEOUT = 10000;
// Logger instance
const logger = new logger_1.Logger('contract-export');
async function navigateToPayments(page) {
    logger.info('Navigating to payments section');
    if (!page)
        throw new Error('Page not initialized');
    try {
        await page.getByRole('button', { name: 'Clientes' }).click();
        await page.getByRole('menuitem', { name: 'Pagos' }).click();
        await page.locator('span.text-900', { hasText: 'Pagos' })
            .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
        logger.success('Payments section loaded');
        return page;
    }
    catch (error) {
        logger.error('Failed to navigate to payments section', error);
        throw new Error('Navigation to payments failed');
    }
}
