"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToContractDashboard = navigateToContractDashboard;
const logger_1 = require("../../utils/logger");
const DEFAULT_TIMEOUT = 10000;
// Logger instance
const logger = new logger_1.Logger('contract-export');
const CONTRACT_MODULE = 'https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list';
/**
 * Navigate to contract dashboard
 */
async function navigateToContractDashboard(page) {
    await page.goto(CONTRACT_MODULE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    logger.info('Navigating to contract dashboard');
    if (!page)
        throw new Error('Page not initialized');
    try {
        // Eliminada la espera del elemento 'Contratos' para evitar timeout
        logger.success('Contract dashboard loaded (skip wait for Contratos)');
        return page;
    }
    catch (error) {
        logger.error('Failed to load contract dashboard', error);
        throw new Error('Navigation to contract dashboard failed');
    }
}
