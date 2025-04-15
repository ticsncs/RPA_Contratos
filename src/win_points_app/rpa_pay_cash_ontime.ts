import { login } from '../core/login';
import { interactWithElement } from '../utils/handler-elements';
import { downloadFile } from '../utils/f_dowload';
import path from 'path';
import axios from 'axios';
import { config } from '../core/config';
import { debug } from 'console';

(async () => {
    try {
        console.log('🤖 Iniciando proceso de exportación de todos los contratos...');

        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            false,
            'https://erp.nettplus.net/web#cids=1&action=308&model=account.journal&view_type=kanban&menu_id=258'
        );

        

        await page.waitForSelector('button:has-text("Clientes")', { state: 'visible' });
        await page.getByRole('button', { name: 'Clientes' }).click();
        await page.getByRole('menuitem', { name: 'Pagos' }).click();
        await page.waitForTimeout(5000);

        // Aplicar filtros
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
        await page.getByRole('menuitemcheckbox', { name: 'Publicado' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.waitForTimeout(5000);

        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
        await page.getByRole('combobox').first().selectOption('journal_id');
        await page.getByRole('textbox').fill('Efectivo');
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.waitForTimeout(5000);

        
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
        await page.getByRole('combobox').first().selectOption('date');
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).replace(/\//g, '-');
        await page.getByRole('textbox').fill(formattedDate);
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.waitForTimeout(5000);


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

        // Esperar a que cargue la lista de exportación y seleccionar la lista de campos
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'PLANTILLA_API_CLIENTS_v2' });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Descarga del archivo CSV y obtiene la ruta del archivo descargado
        const downloadedFilePath = await downloadFile(page, '.modal-footer > .btn-primary', 'clientes_nettplus', 'csv');

        // Cierre del navegador
        await browser.close();

        if (downloadedFilePath) {
            console.log(`✅ Archivo descargado correctamente: ${downloadedFilePath}`);

            // Extraer el nombre de archivo del path completo
            const fileName = path.basename(downloadedFilePath);

            // Llamar a la API con el nombre del archivo
            try {
                const apiUrl = `http://190.96.96.20:3050/api/csv/process-optimized/${fileName}`;
                console.log(`🔄 Enviando archivo a API: ${apiUrl}`);

                const response = await axios.get(apiUrl);
                console.log('✅ Respuesta de la API:', response.data);

                //Borrar el archivo descargado
                const fs = require('fs');
                fs.unlinkSync(downloadedFilePath);
                console.log(`✅ Archivo eliminado: ${downloadedFilePath}`);

            } catch (apiError) {
                console.error('❌ Error al llamar a la API:', apiError);
            }
        } else {
            console.log('❌ No se pudo descargar el archivo.');
        }

        console.log('🚀 Proceso finalizado con éxito.');
        console.log('✅ Automatización completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        console.log(`❌ Error en la automatización: ${(error as Error).message}`);
    }
})();
