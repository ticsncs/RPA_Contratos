"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToBilling = navigateToBilling;
const logger_1 = require("../../utils/logger");
const DEFAULT_TIMEOUT = 10000;
// Logger instance
const logger = new logger_1.Logger('contract-export');
async function navigateToBilling(page) {
    logger.info('Navigating to billing section');
    if (!page)
        throw new Error('Page not initialized');
    try {
        await page.getByRole('button', { name: 'Clientes' }).click();
        await page.getByRole('menuitem', { name: 'Facturas' }).click();
        await page.locator('span.text-900', { hasText: 'Facturas' })
            .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
        logger.success('Billing section loaded');
        return page;
    }
    catch (error) {
        logger.error('Failed to navigate to billing section', error);
        throw new Error('Navigation to billing failed');
    }
}
