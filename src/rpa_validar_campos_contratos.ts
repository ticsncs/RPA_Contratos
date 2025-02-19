
import { interactWithElement } from './utils/handler-error';

import { login } from './core/login';
import { downloadFile, generateReport } from './utils/handler-files';

(async () => {

    try {
        console.log('🤖 Iniciando proceso de validación de campos...');
        // Iniciar sesión en el sistema
        const { browser, page } = await login();

        //Voy a leer la página principal con un console.log
        await page.screenshot({ path: 'screenshot.png' });

        // Esperar a que cargue la página principal
        console.log('🔍 Esperando a que cargue la página principal...');
        await interactWithElement(page, 'span.text-900:has-text("Contratos")', 'wait');

        // Click sobre el Favoritos
        await interactWithElement(page, 'button.dropdown-toggle:has-text("Favoritos")', 'click'); 

        // Click sobre el filtro de Seguimiento de Contratos
        await interactWithElement(page, 'span.d-flex:has-text("Seg_Contratos")', 'click');
        
        // Click sobre el filtro de  Año actual, Mes actual y Semana actual
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const weekNumber = Math.ceil((((currentDate.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        console.log(`📅 Año actual: ${currentYear}`);
        console.log(`📅 Mes actual: ${currentMonth}`);
        console.log(`📅 Semana actual del año: W${weekNumber}`);
        await interactWithElement(page, `th.o_group_name:has-text("${currentYear}")`, 'click');
        await interactWithElement(page, `th.o_group_name:has-text("${currentMonth} ${currentYear}")`, 'click'); 
        await interactWithElement(page, `th.o_group_name:has-text("W${weekNumber} ${currentYear}")`, 'click');
        
        // Click sobre el botón de exportar y seleccionar contratos con filtros
        await interactWithElement(page, 'thead tr .o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'thead tr .o_list_record_selector', 'click');

        // Click sobre el botón de Acción y seleccionar Exportar
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
        await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');

        // Seleccionar la opción de exportar a XLSX
        await interactWithElement(page, 'label[for="o_radioXLSX"]', 'click');

        // Esperar a que cargue la lista de exportación y seleccionar la lista de campos  RPA_CLEAR_FIELDS
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait' , { waitTime: 2000 });
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'RPA_CLEAR_FIELDS' });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait' , { waitTime: 2000 });
        
        // Empieza el proceso de descarga del archivo
        const downloadedFilePath = await downloadFile(page, '.modal-footer > .btn-primary', 'validador_campos');

        // Generar el reporte de contratos con campos vacíos si se descargó el archivo
        if (downloadedFilePath) {
            await generateReport(downloadedFilePath, 'Reporte de Contratos con Campos Vacíos', 'Reporte_Contratos');
        }

        // Cerrar el navegador
        await browser.close();
        console.log('🚀 Proceso finalizado con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        console.log(`❌ Error en la automatización: ${(error as any).message}`);
    }
})();