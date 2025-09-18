
import { Page } from 'playwright';
import { Logger } from '../utils/logger';

const logger = new Logger('contract-export');

export class AccountingService {
    /**
     * Apply filters and search criteria
     */
    async applyFilters(page:Page, export_date:string): Promise<Page> {
        logger.info('Applying filters and search criteria');
        if (!page) throw new Error('Page not initialized');
        
        try {
            // Clear search and apply saved filter
            await page.getByRole('searchbox', { name: 'Buscar registros' }).click();
            await page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
            
            await page.getByRole('button', { name: ' Favoritos' }).click();
            await page.getByRole('menuitemcheckbox', { name: 'RPA_mongos_cont' }).click();
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
        } catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }
}