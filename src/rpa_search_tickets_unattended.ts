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
            false, 
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
        // Aquí en lugar de un wait fijo, esperamos las filas o el mensaje de "No datos".
        try {
            // Esperamos a que aparezcan filas en la tabla (máx. 10 seg).
            await page.waitForSelector('table.o_list_table tbody tr', { timeout: 10000 });
            await page.waitForTimeout(1500); // Asegura un tiempo mínimo de recarga
            const rowsCount = await page.$$eval('table.o_list_table tbody tr', rows => rows.length);
            console.log('Filas tras filtrar equipo:', rowsCount);

        } catch (error) {
            // Si no aparece la tabla, comprobamos si está la pantalla de "sin información"
            const noDataLocator = page.locator('text=No se encontraron resultados'); 
            // ↑ Ajusta este selector al mensaje que aparece cuando no hay datos.
            
            if (await noDataLocator.isVisible()) {
            console.log('No se encontró información en la tabla.');
            await browser.close();
            return [];
            } else {
            // En caso de que no sea un tema de "sin información", arrojamos el error.
            throw new Error('Error esperando los datos de la tabla: ' + error);
            }
        }

        await page.waitForLoadState('networkidle');

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


// Ejecutar la automatización
runSearchTickets('Nuevo', '06/03/2025 00:00:00', '13/03/2025 23:59:59');