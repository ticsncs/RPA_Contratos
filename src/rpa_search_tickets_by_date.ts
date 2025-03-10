import { interactWithElement } from './utils/handler-elements';
import { login } from './core/login';
import { downloadFile } from './utils/handler-files';

/**
 * Función para revisar clientes con estado cortado y exportar la lista.
 * @param {string} status - Estado de los clientes a buscar (ej: "Cortado").
 * @param {string} exportTemplate - Nombre de la plantilla de exportación (ej: "TIC_CORTADOS").
 * @param {string} fileName - Nombre del archivo exportado (ej: "clientes_cortados").
 * @param {string} fechaCorte - Fecha de corte para filtrar los clientes.
 * @returns {Promise<string>} - Devuelve la ruta del archivo exportado.
 */
export async function runClientExportAutomation(status = 'Cortado', exportTemplate = 'RPA_Clientes_Cortados', fileName = 'clientes_cortados', fechaCorte = '25/02/2025') {
    try {
        console.log(`🤖 Iniciando proceso de revisión de clientes con estado: ${status}...`);
        
        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            false, 
            'https://erp.nettplus.net/web#menu_id=444&cids=1&action=671&model=helpdesk.ticket&view_type=list');
                    
        await page.getByLabel('Remove').click();
        await page.getByPlaceholder('Búsqueda...').click();


         // Filtros por Contrato
         await page.getByRole('button', { name: ' Filtros' }).click();
         await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
         await page.getByRole('combobox').first().selectOption('contract_id');
         await page.getByRole('textbox').fill("CT-99999");
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
        await page.locator('#o_datepicker_2').getByRole('textbox').fill('01/01/2025 00:00:00');
        await page.locator('#o_datepicker_3').getByRole('textbox').fill('10/01/2025 23:59:59');
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
                
        // Esperar a que cargue la página principal
        await page.pause();

        // Cierre del navegador
        await browser.close();
        console.log('✅ Automatización completada con éxito.');

    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Error en la automatización: ${error.message}`);
        } else {
            console.error('❌ Error en la automatización:', error);
        }
        return null;
    }
}


runClientExportAutomation();