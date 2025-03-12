import { interactWithElement } from './utils/handler-elements';
import { login } from './core/login';
import { downloadFile } from './utils/handler-files';
import { List } from '@slack/web-api/dist/types/response/ChatPostMessageResponse';

/**
 * Función para revisar clientes con estado cortado y exportar la lista.
 * @param {string} Etapa - Etapa del ticket.
 * @param {string} dateStart - Fecha de inicio para filtrar los tickets ('01/03/2025 00:00:00').
 * @param {string} dateEnd - Fecha de fin para filtrar los tickets ('01/03/2025 00:00:00').
 * @returns {Promise<string[]>} - Devuelve una lista de tickets.
 */
export async function runSearchTickets(Etapa: string = 'Nuevo', dateStart: string = '01/03/2025 00:00:00', dateEnd: string = '10/03/2025 23:59:59'): Promise<string[]> {
    try {
        console.log(`🤖 Buscando tickets asignados al ${Etapa}`); 
        
        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            true, 
            'https://erp.nettplus.net/web#menu_id=444&cids=1&action=671&model=helpdesk.ticket&view_type=list');
        
            
        // Limpiar el campo de búsqueda    
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
        await page.getByRole('textbox').fill(Etapa);
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
        // Esperar un buen tiempo para que se carguen los datos
        await page.waitForTimeout(10000); // Espera 10 segundos



        // Extraer los datos de la tabla
        const tickets = await page.$$eval('table tbody tr', rows => {
            return rows.map(row => {
            const columns = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
            return columns;
            }).filter(columns => columns.some(column => column !== '')); // Filtrar filas vacías
        });

        console.log(tickets); // Muestra los datos en consola


        // Cierre del navegador
        await browser.close();
        console.log('✅ Automatización completada con éxito.');
        return tickets.flat();

    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Error en la automatización: ${error.message}`);
        } else {
            console.error('❌ Error en la automatización:', error);
        }
        return [];
    }
}

/**
runClientExportAutomation('Nuevo', '01/03/2025 00:00:00', '10/03/2025 23:59:59'); // Ejecutar la automatización
*/