import { login } from './core/login';
import { interactWithElement } from './utils/handler-elements';
import { downloadFile } from './utils/f_dowload';
import path from 'path';
import axios from 'axios';
import { config } from './core/config';
import fs from 'fs';
import FormData from 'form-data';

const FECHA_EXPORTACION = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

(async () => {
    try {
        console.log('🤖 Iniciando proceso de exportación de todos los contratos...');
        
        // Iniciar sesión en el sistema
        const { browser, page } = await login(
            false,
            'https://erp.nettplus.net/web#cids=1&action=308&model=account.journal&view_type=kanban&menu_id=258'
        );


        // Localiza la barra de búsqueda y limpia el campo de búsqueda
        //Tablero contable
        try {
          await page.locator('span.text-900', { hasText: 'Tablero contable' }).waitFor({ state: 'visible', timeout: 10000 }); // Espera máximo 10s
          await page.getByRole('button', { name: 'Clientes' }).click();
          await page.getByRole('menuitem', { name: 'Pagos' }).click();
          try {
            await page.locator('span.text-900', { hasText: 'Pagos' }).waitFor({ state: 'visible', timeout: 10000 }); // Espera máximo 10s
            // Si aparece "Pagos", ejecuta el resto
            await page.getByRole('searchbox', { name: 'Buscar registros' }).click();
            await page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
            await page.getByRole('button', { name: ' Favoritos' }).click();
            await page.getByRole('menuitemcheckbox', { name: 'RPA_mongo_cont' }).click();
            await page.getByRole('button', { name: ' Favoritos' }).click();
            await page.waitForTimeout(10000);
            await page.getByRole('button', { name: ' Filtros' }).click();
            await page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
            await page.getByRole('combobox').first().selectOption('date');
            await page.getByRole('textbox').fill(FECHA_EXPORTACION);
            await page.getByRole('button', { name: 'Aplicar' }).click();
            await page.getByRole('button', { name: ' Filtros' }).click();
            // Selección de contratos
            await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
            await interactWithElement(page, 'th.o_list_record_selector', 'click');
            try{
                await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
                await interactWithElement(page, 'a.o_list_select_domain', 'click');        
                // Click sobre el botón de Acción y seleccionar Exportar
                await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
                await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');
                try {
                  await page.locator('h4.modal-title', { hasText: 'Exportar Datos' }).waitFor({ state: 'visible', timeout: 10000 });
                  // Seleccionar formato CSV
                  await interactWithElement(page, 'label[for="o_radioCSV"]', 'click');

                  // Esperar a que cargue la lista de exportación y seleccionar la lista de campos
                  await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
                  await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'RPA_pagos_ct' });
                  await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
              
                } catch (e) {
                    console.log('❌ No se encontró el elemento "Exportar Datos", no se ejecuta la acción.');
                }
            } catch (e) {
                console.log('❌ No se encontró el elemento "a.o_list_select_domain", no se ejecuta la acción.');
            }
          } catch (e) {
            console.log('❌ No se encontró el elemento "Pagos", no se ejecuta la acción.');
          }
          

        }catch (e) {
            console.log('❌ No se encontró el elemento "Tablero contable", no se ejecuta la acción.');
        }


        // Descarga del archivo CSV y obtiene la ruta del archivo descargado
        const downloadedFilePath = await downloadFile(page, '.modal-footer > .btn-primary', 'clientes_nettplus', 'csv');

        // Cierre del navegador
        await browser.close();

        if (downloadedFilePath) {
            const fileName = path.basename(downloadedFilePath);
            console.log(`✅ Archivo descargado correctamente: ${fileName}`);
      
            const apiUrl= config.apiMongoUrl+'1.0/odoo/contracts';
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
