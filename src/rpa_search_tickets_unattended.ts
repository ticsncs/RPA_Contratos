import { interactWithElement } from './utils/handler-elements';
import { login } from './core/login';
import { downloadFile } from './utils/handler-files';
import { enviarCorreo } from './utils/handler-mail';
const fs = require('fs');

/**
 * Función para revisar clientes con estado cortado y exportar la lista.
 * @param {string} Etapa - Etapa del ticket.
 * @param {string} dateStart - Fecha de inicio para filtrar los tickets ('01/03/2025 00:00:00').
 * @param {string} dateEnd - Fecha de fin para filtrar los tickets ('01/03/2025 00:00:00').
 * @returns {Promise<string[]>} - Devuelve una lista de tickets.
 */
export async function runSearchTickets(Etapa: string = 'Nuevo', dateStart: string = '01/03/2025 00:00:00', dateEnd: string = '10/03/2025 23:59:59', exportTemplate:string='', fileName:string='',ext:string ="CSV"): Promise<string[]> {
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
        // Aquí en lugar de un wait fijo, esperamos las filas o el mensaje de "No datos".
        
        // Esperar 10 segundos
        await page.waitForTimeout(10000);

        // Seleccionar todos los clientes en ese estado
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'a.o_list_select_domain', 'click');
        

        // Click en Acción → Exportar
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
        await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');

        // Seleccionar formato CSV
        await interactWithElement(page, `label[for="o_radio${ext.toUpperCase()}"]`, 'wait');
        await interactWithElement(page, `label[for="o_radio${ext.toUpperCase()}"]`, 'click');
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Seleccionar la plantilla de exportación
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: exportTemplate });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Descargar el archivo
        const pathFile = await downloadFile(page, '.modal-footer > .btn-primary', fileName, ext.toLowerCase()) || '';

        enviarCorreo(
            'djimenez@nettplus.net', // Destinatario
            [], // Correos con copia cc
            ['bherrera@nettplus.net', 'kyaruqui@nettplus.net'], // Correos con copia oculta cco
            pathFile, // Archivo adjunto
            'Se adjunta el reporte de tickets abandonados por mas de 10 días', // Mensaje
            'Reporte de tickets abandonados' // Asunto
        );
        
        // Borrar el archivo después de enviar el mensaje
        if (pathFile) {
            fs.unlink(pathFile, (err: NodeJS.ErrnoException | null) => {
            if (err) {
                console.error(`❌ Error al borrar el archivo: ${err.message}`);
            } else {
                console.log('✅ Archivo borrado con éxito.');
            }
            });
        }

        // Cierre del navegador
        await browser.close();
        console.log('✅ Automatización completada con éxito.');
        return [];

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
const currentDate = new Date();
const dateEnd = new Date(currentDate.setDate(currentDate.getDate() - 10)).toLocaleDateString('en-GB') + ' 23:59:59';
const dateStart = new Date(currentDate.setMonth(currentDate.getMonth() - 3)).toLocaleDateString('en-GB') + ' 00:00:00';

runSearchTickets('Nuevo', dateStart, dateEnd, 'RPA_Inf_Cobranzas2', 'Reporte_Tickets_abandonados', 'XLSX');