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
        const { browser, page } = await login(false);

        // Esperar a que cargue la página principal
        await interactWithElement(page, 'span.text-900:has-text("Contratos")', 'wait');


        // Filtros por fecha
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
        await page.getByRole('combobox').first().selectOption('date_cut');
        await page.getByRole('textbox').fill(fechaCorte);
        await page.getByRole('button', { name: 'Aplicar' }).click();
        
        // Seleccionar el estado dinámicamente
        await interactWithElement(page, `label:has-text("${status}")`, 'wait', { waitTime: 2000 });
        await interactWithElement(page, `label:has-text("${status}")`, 'click');

        // Seleccionar todos los clientes en ese estado
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'a.o_list_select_domain', 'click');


        // Click en Acción → Exportar
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
        await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');

        // Seleccionar formato CSV
        await interactWithElement(page, 'label[for="o_radioCSV"]', 'wait');
        await interactWithElement(page, 'label[for="o_radioCSV"]', 'click');
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Seleccionar la plantilla de exportación
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: exportTemplate });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Descargar el archivo
        const pathFile = await downloadFile(page, '.modal-footer > .btn-primary', fileName, 'csv');

        // Cierre del navegador
        await browser.close();
        console.log('✅ Automatización completada con éxito.');

        return pathFile;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Error en la automatización: ${error.message}`);
        } else {
            console.error('❌ Error en la automatización:', error);
        }
        return null;
    }
}


/*
// Ejemplo de uso:
(async () => {
    const filePath = await runClientExportAutomation('Cortado', 'RPA_Clientes_Cortados', 'clientes_cortados', '20/02/2025');
    console.log('📂 Archivo descargado en:', filePath);
})();
*/