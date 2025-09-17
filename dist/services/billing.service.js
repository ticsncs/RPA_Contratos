"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('contract-export');
class BillingService {
    /**
     * Apply filters and search criteria
     */
    async applyFilters(page, export_date) {
        logger.info('Applying filters and search criteria');
        if (!page)
            throw new Error('Page not initialized');
        try {
            // Clear search and apply saved filter
            await page.getByRole('searchbox', { name: 'Buscar registros' }).click();
            await page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
            await page.getByRole('button', { name: ' Favoritos' }).click();
            await page.getByRole('menuitemcheckbox', { name: 'Facturas_Mongo' }).click();
            await page.getByRole('button', { name: ' Favoritos' }).click();
            // Wait for filter to apply
            await page.waitForTimeout(2000);
            // Apply date filter
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('date');
            await page.getByRole('textbox').fill(export_date);
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await page.getByRole('button', { name: ' Filtros' }).click();
            logger.success('Filters applied successfully');
            return page;
        }
        catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }
}
exports.BillingService = BillingService;
