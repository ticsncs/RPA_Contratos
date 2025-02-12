const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('./src/config.js');
const sendSlackMessage = require('./src/alertSlack.js');
const csv = require('csv-parser');
const PDFDocument = require('pdfkit');
require('dotenv').config();

(async () => {
    await sendSlackMessage('🤖 Iniciando proceso de validación de campos...');

    try {
        // Crear carpeta de descargas si no existe
        if (!fs.existsSync(config.downloadPath)) {
            fs.mkdirSync(config.downloadPath, { recursive: true });
            console.log(`📁 Carpeta creada: ${config.downloadPath}`);
        }

        // Verificar sesión existente
        const sessionDir = './Session';
        const sessionFilePath = path.join(sessionDir, 'session.json');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        const hasSession = fs.existsSync(sessionFilePath);
        console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);

        const browser = await chromium.launch({ headless: false });
        const context = hasSession
            ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
            : await browser.newContext({ acceptDownloads: true });
        
        const page = await context.newPage();

        console.log(`🌍 Navegando a: ${config.baseUrl}`);
        await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Verificar sesión
        if (!hasSession) {
            await sendSlackMessage('🔑 No se detectó sesión activa, iniciando sesión...');
            await page.waitForSelector('input[name="login"]', { timeout: 15000 });
            await page.fill('input[name="login"]', config.user);
            await page.fill('input[name="password"]', config.pass);
            await page.click('button[type="submit"]');
            await page.waitForSelector('th.o_list_record_selector', { timeout: 30000 });
            await sendSlackMessage('✅ Inicio de sesión exitoso.');
            await context.storageState({ path: sessionFilePath });
        }

        // Esperar a que la interfaz cargue completamente antes de interactuar
        await page.waitForSelector('th.o_list_record_selector', { timeout: 15000 });
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.waitForTimeout(5000);
        await page.click('button:has-text("Añadir Filtro personalizado")');
        await page.waitForTimeout(5000);

        // Click para seleccionar campo de filtro de FECHA DE INICIO
        await page.getByRole('combobox').first().selectOption('date_start');

        // Click para seleccionar condición de filtro
        await page.getByRole('textbox').fill('01/02/2025');
        await page.getByRole('button', { name: ' Agregar condición' }).click();
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await sendSlackMessage('📌 Filtros aplicados correctamente.');

        // Seleccionar contratos y exportar
        await page.waitForSelector('th.o_list_record_selector', { timeout: 15000 });
        await page.click('th.o_list_record_selector');
        await page.getByRole('button', { name: ' Acción' }).click();
        await page.getByRole('menuitem', { name: 'Exportar' }).click();
        await page.click('label[for="o_radioCSV"]');
        await page.selectOption('select.o_exported_lists_select', { label: 'TICS_TEST' });
        await sendSlackMessage('📤 Preparando exportación...');

        // Descarga del archivo con reintentos
        let attempts = 0;
        let downloadedFilePath = '';
        while (attempts < 2) {
            try {
                const [download] = await Promise.all([
                    page.waitForEvent('download', { timeout: 60000 }),
                    page.click('.modal-footer > .btn-primary'),
                ]);
                const originalFilePath = path.join(config.downloadPath, download.suggestedFilename());
                await download.saveAs(originalFilePath);

                const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
                const newFileName = `validador_campos_${timestamp}.csv`;
                downloadedFilePath = path.join(config.downloadPath, newFileName);

                fs.renameSync(originalFilePath, downloadedFilePath);
                await sendSlackMessage(`✅ Archivo descargado y renombrado: ${downloadedFilePath}`);
                break;
            } catch (err) {
                attempts++;
                await sendSlackMessage(`⚠️ Reintentando descarga (${attempts}/2)...`);
                if (attempts === 2) {
                    throw new Error('No se pudo descargar el archivo después de dos intentos.');
                }
            }
        }

        // Leer el archivo CSV y generar reporte en PDF
        const emptyFieldsReport = [];
        fs.createReadStream(downloadedFilePath)
            .pipe(csv())
            .on('data', (row) => {
                const emptyFields = Object.keys(row).filter(key => !row[key].trim());
                if (emptyFields.length > 0) {
                    emptyFieldsReport.push({ codigo: row['codigo'], campos: emptyFields });
                }
            })
            .on('end', async () => {
                const pdfFilePath = path.join(config.downloadPath, `Reporte_Contratos_${new Date().toISOString().replace(/[-:.]/g, '_')}.pdf`);
                const doc = new PDFDocument();
                const stream = fs.createWriteStream(pdfFilePath);
                doc.pipe(stream);

                doc.fontSize(16).text('Reporte de Contratos con Campos Vacíos', { align: 'center' });
                doc.moveDown();
                emptyFieldsReport.forEach(item => {
                    doc.fontSize(12).text(`Contrato: ${item.codigo}`);
                    doc.fontSize(10).text(`Campos Vacíos: ${item.campos.join(', ')}`);
                    doc.moveDown();
                });
                
                doc.end();
                await sendSlackMessage(`📄 Reporte generado: ${pdfFilePath}`);
            });

        // Cierre del navegador
        await browser.close();
        await sendSlackMessage('🚀 Proceso finalizado con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        await sendSlackMessage(`❌ Error en la automatización: ${error.message}`);
    }
})();
