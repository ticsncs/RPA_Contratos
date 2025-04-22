import { login } from './core/login';
import { interactWithElement } from './utils/handler-elements';
import { downloadFile } from './utils/f_dowload';
import path from 'path';
import axios from 'axios';
import { config } from './core/config';
import fs from 'fs';
import FormData from 'form-data';

(async () => {
    try {
        console.log('🤖 Iniciando proceso de exportación de todos los contratos...');

        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            true,
            'https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list'
        );

        // Esperar a que cargue la página principal
        await interactWithElement(page, 'span.text-900:has-text("Contratos")', 'wait');

        // Aplicar filtros
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Filtros")', 'click');
        await interactWithElement(page, 'div.o-dropdown-menu', 'wait', { waitTime: 1000 });

        await interactWithElement(page, 'span.dropdown-item.o_menu_item:has-text("Activos")', 'click'); 
        //await interactWithElement(page, 'span.dropdown-item.o_menu_item:has-text("Cortados")', 'click'); 
        //await interactWithElement(page, 'span.dropdown-item.o_menu_item:has-text("En Lista de Retiro")', 'click'); 
        await interactWithElement(page, 'span.dropdown-item.o_menu_item:has-text("En Proceso")', 'click');

        // Pausa para depuración
       // await page.pause();

        // Selección de contratos
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'a.o_list_select_domain', 'click');


        //await page.pause();

        // Click sobre el botón de Acción y seleccionar Exportar
        await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
        await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');

        // Seleccionar formato CSV
        await interactWithElement(page, 'label[for="o_radioCSV"]', 'click');

        // Esperar a que cargue la lista de exportación y seleccionar la lista de campos
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'PLANTILLA_API_CLIENTS_V2' });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Descarga del archivo CSV y obtiene la ruta del archivo descargado
        const downloadedFilePath = await downloadFile(page, '.modal-footer > .btn-primary', 'clientes_nettplus', 'csv');

        // Cierre del navegador
        await browser.close();

        if (downloadedFilePath) {
            const fileName = path.basename(downloadedFilePath);
            console.log(`✅ Archivo descargado correctamente: ${fileName}`);
      
            const apiUrl = 'http://127.0.0.1:3040/api/1.0/odoo/contracts';
            const form = new FormData();
      
            form.append('file', fs.createReadStream(downloadedFilePath));
            form.append('file_name', fileName);
      
            const response = await axios.post(apiUrl, form, {
              headers: form.getHeaders(),
            });
      
            console.log('✅ Respuesta de la API:', response.data);
      
            fs.unlinkSync(downloadedFilePath);
            console.log(`🧹 Archivo eliminado: ${downloadedFilePath}`);
          } else {
            console.log('❌ No se pudo descargar el archivo.');
          }
      
          console.log('🚀 Proceso finalizado con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        console.log(`❌ Error en la automatización: ${(error as Error).message}`);
    }
})();
