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
            //await page.pause();
            await page.waitForTimeout(2000);
            // Seleccionar el primer menuitemcheckbox que contenga 'RPA_Mongo' o 'RPA_mongo', ignorando case y símbolos
            await page.getByRole('menuitemcheckbox', { name: 'RPA_Mongo' }).click();
            
            await page.waitForTimeout(2000);
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
            await page.locator('td').filter({ hasText: contractSearch }).waitFor({ state: 'visible' });
            await interactWithElement(page, `td:has-text("${contractSearch}")`, 'doubleClick');
            await interactWithElement(page, `td:has-text("${contractSearch}")`, 'wait', { waitTime: 2000 });
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open contract failed');
        }
    }


    async openTicketPerContract(page:Page): Promise<Page> {
        logger.info('Opening And Editing ticket');
        if (!page) throw new Error('Page not initialized');
        try {
            // 🔹 Esperar a que cargue el registro y abrirlo
            await page.waitForSelector('button[name="action_create_helpdesk_ticket"]', { state: 'visible' });
            await interactWithElement(page, 'button[name="action_create_helpdesk_ticket"]', 'doubleClick');
            await page.waitForSelector('button[name="action_create_helpdesk_ticket"]', { state: 'hidden' });
        
            // 🔹 Editar el Ticket
            await page.waitForSelector('button:has-text("Editar")', { state: 'visible' });
            await interactWithElement(page, 'button:has-text("Editar")', 'doubleClick');
            await page.waitForSelector('button:has-text("Guardar")', { state: 'visible' });
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open ticket failed');
        }
    }

    async writeTicketPerContract(page:Page, titleTicket:string, teamName:string, userAsigned:string,channelTicket:string, category:string,tagTicket:string ): Promise<Page> {
        logger.info('Write info ticket');
        if (!page) throw new Error('Page not initialized');
        try {
            // Interactuar con el campo "Título"
            await interactWithElement(page, 'input[name="name"]', 'wait', { waitTime: 2000 });
            await interactWithElement(page, 'input[name="name"]', 'fill', { text: titleTicket });

            // Interactuar con el campo "Equipo"
            await page.locator('.o_field_widget[name="team_id"] input.o_input').waitFor({ state: 'visible' });
            await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'fill', { text: teamName });
            await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'doubleClick');    
            await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'wait', { waitTime: 2000 });
            await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'ArrowDown' });
            await interactWithElement(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'Enter' });
            ;


            // Interactuar con el campo "Usuario asignado"
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'wait', { waitTime: 2000 });
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'fill', { text: userAsigned });
            await interactWithElement(page, `li.ui-menu-item:has-text("${userAsigned}")`, 'click');
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input',  'wait', { waitTime: 5000 });
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'ArrowDown' });
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'ArrowDown' });
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'Enter' });
            await interactWithElement(page, '.o_field_widget[name="user_id"] input.o_input',  'wait', { waitTime: 5000 });
         
            // Interactuar con el campo "Canal"
            await page.locator('.o_field_widget[name="channel_id"] input.o_input').waitFor({ state: 'visible' });
            await interactWithElement(page, '.o_field_widget[name="channel_id"] input.o_input', 'fill', { text: channelTicket });
            await interactWithElement(page, `li.ui-menu-item:has-text("${channelTicket}")`, 'doubleClick');
    
            // Interactuar con el campo "Categoría"
            await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
            await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'fill', { text: category });
            await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
            await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'press', { key: 'Enter' });
            await interactWithElement(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
            
            await page.locator('.o_field_widget[name="tag_ids"] input.o_input').waitFor({ state: 'visible' });
            await interactWithElement(page, '.o_field_widget[name="tag_ids"] input.o_input', 'fill', { text: tagTicket });
            await interactWithElement(page, `li.ui-menu-item:has-text("${tagTicket}")`, 'doubleClick');
            

            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open ticket failed');
        }
    }

    async saveTicketPerContract(page:Page ): Promise<Page> {
        logger.info('Save ticket');
        if (!page) throw new Error('Page not initialized');
        try {
          await page.waitForSelector('button.btn:has-text("Guardar")', { state: 'visible' });
          await interactWithElement(page, 'button.btn:has-text("Guardar")', 'doubleClick');
           await page.waitForSelector('button.btn:has-text("Guardar")', { state: 'hidden' });
          await page.waitForTimeout(2000); // Wait for the ticket to be saved

            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open ticket failed');
        }
    }
    

    async applyFiltersStausContractDayly(page:Page, status:string, date:string): Promise<Page> {
        logger.info('Applying filters and search criteria');
        if (!page) throw new Error('Page not initialized');
        
        try {
         // Filtros por fecha
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('date_cut');
            await page.getByRole('textbox').fill(date);
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await page.getByRole('button', { name: ' Filtros' }).click();

            
            // Seleccionar el estado dinámicamente
            await page.getByRole('button', { name: ' Filtros' }).click();
            await interactWithElement(page, `label:has-text("${status}")`, 'wait', { waitTime: 2000 });
            await interactWithElement(page, `label:has-text("${status}")`, 'click');
           
            logger.success('Filters applied successfully');

            return page;
        } catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }

}