import { login } from './core/login';
import { interactWithElement } from './utils/handler-elements';
import { downloadFile } from './utils/handler-files';
(async () => {

    try {
        console.log('🤖 Iniciando proceso de  exportación de todos los contratos...');


        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            true,
            'https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list'
        );
        
        // Esperar a que cargue la página principal
        await interactWithElement(page, 'span.text-900:has-text("Contratos")', 'wait');
        
        // Selección de contratos
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'a.o_list_select_domain', 'click');


        // Click sobre el botón de Acción y seleccionar Exportar
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
        await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');
        
        // Seleccionar formato CSV
        await interactWithElement(page, 'label[for="o_radioCSV"]', 'click');
        
        // Esperar a que cargue la lista de exportación y seleccionar la lista de campos  TICS_2025
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'PLANTILLA_API_CLIENTS' });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
        

      

        // Descarga del archivo CSV
        await downloadFile(page, '.modal-footer > .btn-primary', 'clientes_nettplus', 'csv');
      
        // Cierre del navegador
        await browser.close();
        console.log('🚀 Proceso finalizado con éxito.');
        console.log('✅ Automatización completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        console.log(`❌ Error en la automatización: ${(error as Error).message}`);
    }
})();
