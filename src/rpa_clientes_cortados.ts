import { interactWithElement } from './utils/handler-error';
import { login } from './core/login';
import { downloadFile } from './utils/handler-files';

(async () => {

    try {
        console.log('🤖 Iniciando proceso de revision de clientes con estado cortado...');
        
        // Iniciar sesión en el sistema
        const { browser, page } = await login(false);
        // Esperar a que cargue la página principal
        await interactWithElement(page, 'span.text-900:has-text("Contratos")', 'wait');

        // Esperar a que cargue la página principal y hacer click en Cortado
        await interactWithElement(page, 'label:has-text("Cortado")', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'label:has-text("Cortado")', 'click');

        // Esperar a que cargue la lista de  clientes con estado cortado y seleccionar todos
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'a.o_list_select_domain', 'click');


        // Click sobre el botón de Acción y seleccionar Exportar
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
        await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');
        
        // Seleccionar formato CSV
        await interactWithElement(page, 'label[for="o_radioCSV"]', 'wait');
        await interactWithElement(page, 'label[for="o_radioCSV"]', 'click');
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Seleccionar la plantilla de exportación
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'TIC_CORTADOS' });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Empieza el proceso de descarga del archivo
        await downloadFile(page, '.modal-footer > .btn-primary', 'cortados' , 'csv');

        // Cierre del navegador
        await browser.close();
        console.log('✅ Automatización completada con éxito.');
    } catch (error) {
        console.log(`❌ Error en la automatización: ${(error as Error).message}`);
    }
})();
