import { interactWithElement } from './utils/handler-elements';
import { login } from './core/login';
import { downloadFile } from './utils/handler-files';
import { List } from '@slack/web-api/dist/types/response/ChatPostMessageResponse';

/**
 * Función para revisar clientes con estado cortado y exportar la lista.
 * @param {string} code - Codigo del cliente.
 * @param {string} dateStart - Fecha de inicio para filtrar los tickets ('01/03/2025 00:00:00').
 * @param {string} dateEnd - Fecha de fin para filtrar los tickets ('01/03/2025 00:00:00').
 * @returns {Promise<string[][]>} - Devuelve una lista de tickets.
 */
export async function runSearchTickets(code: string = 'CT-99999', dateStart: string = '01/03/2025 00:00:00', dateEnd: string = '10/03/2025 23:59:59'): Promise<string[][]> {
    try {
        console.log(`🤖 Buscando tickets asignados al ${code}`); 
        
        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            true, 
            'https://erp.nettplus.net/web#menu_id=444&cids=1&action=671&model=helpdesk.ticket&view_type=list');
        
            
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
        await dateInputs.nth(0).fill(dateStart);
        await dateInputs.nth(1).fill(dateEnd);
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
        // Esperar un buen tiempo para que se carguen los datos
        await page.waitForTimeout(10000); // Espera 10 segundos

        // Extraer los datos de la tabla y descartar filas y campos vacíos
        const tickets = await page.$$eval('table tbody tr', rows => {
            return rows.map(row => {
            const columns = Array.from(row.querySelectorAll('td'))
                .map(td => td.innerText.trim())
                .filter(text => text !== ''); // Filtrar campos vacíos
            return columns;
            }).filter(columns => columns.length > 0); // Filtrar filas vacías
        });

        console.log(tickets); // Muestra los datos en consola


        // Cierre del navegador
        await browser.close();
        console.log('✅ Automatización completada con éxito.');
        return tickets;

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
runClientExportAutomation('CT-99999', '01/03/2025 00:00:00', '10/03/2025 23:59:59'); // Ejecutar la automatización
*/