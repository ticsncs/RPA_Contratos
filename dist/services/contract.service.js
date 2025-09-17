"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const logger_1 = require("../utils/logger");
const handler_elements_1 = require("../utils/handler-elements");
const logger = new logger_1.Logger('contract-export');
class ContractService {
    /**
       * Apply filters all contracts , discarding  the out service contracts
       */
    async applyFiltersContracts(page) {
        logger.info('Applying filters and search criteria');


        if (!page)
            throw new Error('Page not initialized');
        try {
            // Tomar screenshot antes de buscar el searchbox (guardar en carpeta con permisos)
            await page.screenshot({ path: '/app/src/Files/debug_searchbox.png', fullPage: true });
            // Intentar selector más flexible
            const searchboxes = await page.$$('input[placeholder], input[type="search"]');
            if (searchboxes.length > 0) {
                await searchboxes[0].click();
                await searchboxes[0].fill('');
            }
            else {
                // Fallback al selector original
                await page.getByRole('searchbox', { name: 'Buscar registros' }).click();
                await page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
            }
            await page.getByRole('button', { name: ' Favoritos' }).click();
            await page.getByRole('menuitemcheckbox', { name: 'RPA_Mongo' }).click();
            await page.getByRole('button', { name: ' Favoritos' }).click();
            // Wait for filter to apply
            await page.waitForTimeout(2000);
            logger.success('Filters applied successfully');
            return page;
        }
        catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }
    async applyFiltersContract(page, contractSearch) {
        logger.info('Applying filters and search criteria');
        if (!page)
            throw new Error('Page not initialized');
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
        }
        catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }
    async openContract(page, contractSearch) {
        logger.info('Opening contract');
        if (!page)
            throw new Error('Page not initialized');
        try {
            // 🔹 Esperar a que cargue el registro y abrirlo
            await page.locator('td').filter({ hasText: contractSearch }).waitFor({ state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, `td:has-text("${contractSearch}")`, 'doubleClick');
            await (0, handler_elements_1.interactWithElement)(page, `td:has-text("${contractSearch}")`, 'wait', { waitTime: 2000 });
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open contract failed');
        }
    }
    async openTicketPerContract(page) {
        logger.info('Opening And Editing ticket');
        if (!page)
            throw new Error('Page not initialized');
        try {
            // 🔹 Esperar a que cargue el registro y abrirlo
            await page.waitForSelector('button[name="action_create_helpdesk_ticket"]', { state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, 'button[name="action_create_helpdesk_ticket"]', 'doubleClick');
            await page.waitForSelector('button[name="action_create_helpdesk_ticket"]', { state: 'hidden' });
            // 🔹 Editar el Ticket
            await page.waitForSelector('button:has-text("Editar")', { state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, 'button:has-text("Editar")', 'doubleClick');
            await page.waitForSelector('button:has-text("Guardar")', { state: 'visible' });
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open ticket failed');
        }
    }
    async writeTicketPerContract(page, titleTicket, teamName, userAsigned, channelTicket, category, tagTicket) {
        logger.info('Write info ticket');
        if (!page)
            throw new Error('Page not initialized');
        try {
            // Interactuar con el campo "Título"
            await (0, handler_elements_1.interactWithElement)(page, 'input[name="name"]', 'wait', { waitTime: 2000 });
            await (0, handler_elements_1.interactWithElement)(page, 'input[name="name"]', 'fill', { text: titleTicket });
            // Interactuar con el campo "Equipo"
            await page.locator('.o_field_widget[name="team_id"] input.o_input').waitFor({ state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="team_id"] input.o_input', 'fill', { text: teamName });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="team_id"] input.o_input', 'doubleClick');
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="team_id"] input.o_input', 'wait', { waitTime: 2000 });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'ArrowDown' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="team_id"] input.o_input', 'press', { key: 'Enter' });
            ;
            // Interactuar con el campo "Usuario asignado"
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'wait', { waitTime: 2000 });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'fill', { text: userAsigned });
            await (0, handler_elements_1.interactWithElement)(page, `li.ui-menu-item:has-text("${userAsigned}")`, 'click');
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'wait', { waitTime: 5000 });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'ArrowDown' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'ArrowDown' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'press', { key: 'Enter' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="user_id"] input.o_input', 'wait', { waitTime: 5000 });
            // Interactuar con el campo "Canal"
            await page.locator('.o_field_widget[name="channel_id"] input.o_input').waitFor({ state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="channel_id"] input.o_input', 'fill', { text: channelTicket });
            await (0, handler_elements_1.interactWithElement)(page, `li.ui-menu-item:has-text("${channelTicket}")`, 'doubleClick');
            // Interactuar con el campo "Categoría"
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="category_id"] input.o_input', 'fill', { text: category });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="category_id"] input.o_input', 'press', { key: 'Enter' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="category_id"] input.o_input', 'wait', { waitTime: 2000 });
            await page.locator('.o_field_widget[name="tag_ids"] input.o_input').waitFor({ state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, '.o_field_widget[name="tag_ids"] input.o_input', 'fill', { text: tagTicket });
            await (0, handler_elements_1.interactWithElement)(page, `li.ui-menu-item:has-text("${tagTicket}")`, 'doubleClick');
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open ticket failed');
        }
    }
    async saveTicketPerContract(page) {
        logger.info('Save ticket');
        if (!page)
            throw new Error('Page not initialized');
        try {
            await page.waitForSelector('button.btn:has-text("Guardar")', { state: 'visible' });
            await (0, handler_elements_1.interactWithElement)(page, 'button.btn:has-text("Guardar")', 'doubleClick');
            await page.waitForSelector('button.btn:has-text("Guardar")', { state: 'hidden' });
            await page.waitForTimeout(2000); // Wait for the ticket to be saved
            return page;
        }
        catch (error) {
            logger.error('Failed to open contract', error);
            throw new Error('Open ticket failed');
        }
    }
    async applyFiltersStausContractDayly(page, status, date) {
        logger.info('Applying filters and search criteria');
        if (!page)
            throw new Error('Page not initialized');
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
            await (0, handler_elements_1.interactWithElement)(page, `label:has-text("${status}")`, 'wait', { waitTime: 2000 });
            await (0, handler_elements_1.interactWithElement)(page, `label:has-text("${status}")`, 'click');
            logger.success('Filters applied successfully');
            return page;
        }
        catch (error) {
            logger.error('Failed to apply filters', error);
            throw new Error('Filter application failed');
        }
    }
}
exports.ContractService = ContractService;
