import { login } from '../core/login';
import { interactWithElement } from '../utils/handler-elements';
import { downloadFile } from '../utils/f_dowload';
import path from 'path';
import axios from 'axios';
import { config } from '../core/config';
import { debug } from 'console';
import fs from 'fs';
import csvParser from 'csv-parser';
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
        await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: 'Rpa_contratos_ppe' });
        await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });

        // Descarga del archivo CSV y obtiene la ruta del archivo descargado
        const downloadedFilePath = await downloadFile(page, '.modal-footer > .btn-primary', 'Rpa_contratos_ppe', 'csv');

        // Leer el archivo CSV descargado y extraer la información

        const csvData: Record<string, string>[] = [];

        try {
            await new Promise<void>((resolve, reject) => {
                if (downloadedFilePath) {
                    fs.createReadStream(downloadedFilePath)
                        .pipe(csvParser())
                        .on('data', (row: Record<string, string>) => {
                            csvData.push(row);
                        })
                        .on('end', () => {
                            console.log('✅ Datos extraídos del CSV:', csvData);
                            resolve();
                        })
                        .on('error', (error: Error) => {
                            console.error('❌ Error al leer el archivo CSV:', error);
                            reject(error);
                        });
                } else {
                    reject(new Error('❌ Ruta del archivo descargado no definida.'));
                }
            });

            // Comparar los datos extraídos con la API
            //const apiComparisonUrl = 'http://190.96.96.20:3050/api/data/compare';
            //console.log(`🔄 Enviando datos para comparación a la API: ${apiComparisonUrl}`);

            //const comparisonResponse = await axios.post(apiComparisonUrl, { data: csvData });
            //console.log('✅ Respuesta de la API de comparación:', comparisonResponse.data);
            console.log("Datos extraídos del CSV:", csvData);

            // Filtrar contratos según la respuesta de la API
            for (const row of csvData) {
                const contractMatch = row['Contrato']?.match(/CT-\d+/);
                if (contractMatch) {
                    const contractId = contractMatch[0];
                    try {
                        const apiResponse = await axios.get(`${config.apiMongoUrl}/getPuntual/${contractId}`);
                        if (apiResponse.data === false) {
                            console.log(`❌ Contrato ${contractId} no es puntual. Eliminando de la tabla.`);
                            await page.locator(`tr:has-text("${contractId}")`).locator('input[type="checkbox"]').click();
                        } else {
                            console.log(`✅ Contrato ${contractId} es puntual. Se mantiene en la tabla.`);
                        }
                    } catch (apiError) {
                        console.error(`❌ Error al consultar la API para el contrato ${contractId}:`, apiError);
                    }
                } else {
                    console.warn('⚠️ No se encontró un contrato válido en la fila:', row);
                }
            }

            // Eliminar los contratos no puntuales seleccionados
            await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
            await interactWithElement(page, 'a.dropdown-item:has-text("Eliminar")', 'click');
            await interactWithElement(page, '.modal-footer > .btn-primary', 'click');



        } catch (csvError) {
            console.error('❌ Error al procesar el archivo CSV o al comparar con la API:', csvError);
        }

        await page.pause();

        // Cierre del navegador
        await browser.close();

       

        console.log('🚀 Proceso finalizado con éxito.');
        console.log('✅ Automatización completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        console.log(`❌ Error en la automatización: ${(error as Error).message}`);
    }
})();
