import { login } from './core/login';
import { downloadFile, generateReport } from './utils/handler-files';

(async () => {
    try {
        console.log('🤖 Iniciando proceso de validación de campos...');
       
        // Iniciar sesión en el sistema
        const { browser, page } = await login();

        // Esperar a que cargue la página principal
        console.log('🔍 Esperando a que cargue la página principal...');
        await page.waitForSelector('span.text-900:has-text("Contratos")');

        // Click sobre el Favoritos
        await page.click('button.dropdown-toggle:has-text("Favoritos")');

        // Click sobre el filtro de Seguimiento de Contratos
        await page.click('span.d-flex:has-text("Seg_Contratos")');
        
        // Click sobre el filtro de Año actual, Mes actual y Semana actual
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const weekNumber = Math.ceil((((currentDate.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        console.log(`📅 Año actual: ${currentYear}`);
        console.log(`📅 Mes actual: ${currentMonth}`);
        console.log(`📅 Semana actual del año: W${weekNumber}`);
        await page.click(`th.o_group_name:has-text("${currentYear}")`);
        await page.click(`th.o_group_name:has-text("${currentMonth} ${currentYear}")`);
        await page.click(`th.o_group_name:has-text("W${weekNumber} ${currentYear}")`);
        
        // Click sobre el botón de exportar y seleccionar contratos con filtros
        await page.waitForSelector('thead tr .o_list_record_selector', { timeout: 2000 });
        await page.click('thead tr .o_list_record_selector');

        // Click sobre el botón de Acción y seleccionar Exportar
        await page.click('span.o_dropdown_title:has-text("Acción")');
        await page.click('a.dropdown-item:has-text("Exportar")');

        // Seleccionar la opción de exportar a XLSX
        await page.click('label[for="o_radioXLSX"]');

        // Esperar a que cargue la lista de exportación y seleccionar la lista de campos RPA_CLEAR_FIELDS
        await page.waitForSelector('select.o_exported_lists_select', { timeout: 2000 });
        await page.selectOption('select.o_exported_lists_select', { label: 'RPA_CLEAR_FIELDS' });
        await page.waitForSelector('select.o_exported_lists_select', { timeout: 2000 });
        
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
