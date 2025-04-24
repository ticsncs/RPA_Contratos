import { Page } from 'playwright';
import { Logger } from '../utils/logger';
import { interactWithElement } from '../utils/handler-elements';


const logger = new Logger('contract-export');

export class ContractService {
  /**
     * Apply filters all contracts , discarding  the out service contracts
     */
    async applyFiltersContracts(page:Page): Promise<Page> {
        logger.info('Applying filters and search criteria');
        if (!page) throw new Error('Page not initialized');
        
        try {
            // Clear search and apply saved filter
            await page.getByRole('searchbox', { name: 'Buscar registros' }).click();
            await page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
            
            await page.getByRole('button', { name: ' Favoritos' }).click();
            await page.getByRole('menuitemcheckbox', { name: 'RPA_mongo' }).click();
            await page.getByRole('button', { name: ' Favoritos' }).click();
            
            // Wait for filter to apply
            await page.waitForTimeout(2000);
            
            logger.success('Filters applied successfully');

            return page;
        } catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }

    async applyFiltersContract(page:Page,contractSearch:string): Promise<Page> {
        logger.info('Applying filters and search criteria');
        if (!page) throw new Error('Page not initialized');
        
        try {
            // Clear search and apply saved filter
            await page.getByRole('searchbox', { name: 'Buscar registros' }).click();
            await page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
            
            // Filtros por fecha
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('name');
            await page.getByRole('textbox').fill(contractSearch);
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await page.getByRole('button', { name: ' Filtros' }).click();
            
            // Wait for filter to apply
            await page.waitForTimeout(2000);
            
            logger.success('Filters applied successfully');

            return page;
        } catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }


    async openContract(page:Page,contractSearch:string): Promise<Page> {
        logger.info('Opening contract');
        if (!page) throw new Error('Page not initialized');
        try {
        // 🔹 Esperar a que cargue el registro y abrirlo
            await interactWithElement(page, `td:has-text("${contractSearch}")`, 'wait', { waitTime: 2000 });
            await interactWithElement(page, `td:has-text("${contractSearch}")`, 'doubleClick');
            await interactWithElement(page, `td:has-text("${contractSearch}")`, 'wait', { waitTime: 2000 });
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open contract failed');
        }
    }


    

}