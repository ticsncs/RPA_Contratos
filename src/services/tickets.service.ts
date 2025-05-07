import { Page } from 'playwright';
import { Logger } from '../utils/logger';

const logger = new Logger('contract-export');

export class TicketService {
  /**
     * Apply filters all contracts , discarding  the out service contracts
     */
    async applyFiltersTicketsUnattended(page:Page, stage:string ,dateStart:string ,dateEnd:string): Promise<Page> {
        logger.info('Applying filters and search criteria');
        if (!page) throw new Error('Page not initialized');
        
        try {
            // Clear search and apply saved filter
            await page.getByLabel('Remove').click();
            await page.getByPlaceholder('Búsqueda...').click();
            
                    // Filtros por Equipo
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('team_id');
            await page.getByRole('textbox').fill("PAGOS Y COBRANZAS");
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await page.getByRole('button', { name: ' Filtros' }).click();
            
            // Filtros por Etapa
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('stage_id');
            await page.getByRole('textbox').fill(stage);
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await page.getByRole('button', { name: ' Filtros' }).click();


            // Filtros por Rango de Fechas
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('create_date');
            const dateInputs = page.locator('.o_datepicker_input');
            await dateInputs.nth(0).fill(dateStart);
            await dateInputs.nth(1).fill(dateEnd);
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


    async applyFiltersTicketsPerContract(page:Page, code:string ,dateStart:string ,dateEnd:string): Promise<Page> {
        try {
            
        // Limpiar el campo de búsqueda    
        await page.getByLabel('Remove').click();
        await page.getByPlaceholder('Búsqueda...').click();


         // Filtros por Contrato
         await page.getByRole('button', { name: ' Filtros' }).click();
         await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
         await page.getByRole('combobox').first().selectOption('contract_id');
         await page.getByRole('textbox').fill(code);
         await page.getByRole('button', { name: 'Aplicar' }).click();
         await page.getByRole('button', { name: ' Filtros' }).click();

        // Filtros por Equipo
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
        await page.getByRole('combobox').first().selectOption('team_id');
        await page.getByRole('textbox').fill("PAGOS Y COBRANZAS");
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
        
        // Filtros por Rango de Fechas
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
        await page.getByRole('combobox').first().selectOption('create_date');
        const dateInputs = page.locator('.o_datepicker_input');
        await dateInputs.nth(0).fill(dateStart+'00:00:00');
        await dateInputs.nth(1).fill(dateEnd+'23:59:59');
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
        // Esperar un buen tiempo para que se carguen los datos
        await page.waitForTimeout(10000); // Espera 10 segundos
        return page;
        }
        catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    } 

        

}