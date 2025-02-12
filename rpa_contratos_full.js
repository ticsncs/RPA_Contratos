const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('./src/config.js');
const sendSlackMessage = require('./src/alertSlack.js');
require('dotenv').config();

(async () => {
    await sendSlackMessage('🤖 Iniciando proceso de automatización...');
    await sendSlackMessage('📄 Empezando a trabajar con la exportación de todos los contratos...');

    try {
        // Crear carpeta de descargas si no existe
        if (!fs.existsSync(config.downloadPath)) {
            fs.mkdirSync(config.downloadPath, { recursive: true });
            console.log(`📁 Carpeta creada: ${config.downloadPath}`);
        }

        // Verificar si existe la sesión antes de iniciar el contexto del navegador
        const sessionDir = './Session';
        const sessionFilePath = path.join(sessionDir, 'session.json');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        const hasSession = fs.existsSync(sessionFilePath);
        console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);

        const browser = await chromium.launch({ headless: true }); // Se ejecuta en modo headless para mayor velocidad
        const context = hasSession
            ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
            : await browser.newContext({ acceptDownloads: true });
        
        const page = await context.newPage();

        console.log(`🌍 Navegando a: ${config.baseUrl}`);
        await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Verificar si ya hay sesión activa

        if (!hasSession) {
            await sendSlackMessage('🔑 No se detectó sesión activa, iniciando sesión...');
            await sendSlackMessage('🔑 Ingresando credenciales...');
            let attempts = 0;
            while (attempts < 2) {
                try {
                    await page.waitForSelector('#login', { timeout: 10000 });
                    await page.fill('#login', config.user);
                    await page.fill('#password', config.pass);
                    await page.click('button[type="submit"]');

                    // Esperar que la autenticación se complete
                    await page.waitForSelector('th.o_list_record_selector', { timeout: 30000 });
                    await sendSlackMessage('✅ Inicio de sesión exitoso.');
                    // Guardar estado de sesión
                    await context.storageState({ path: sessionFilePath });
                    break;
                } catch (err) {
                    attempts++;
                    await sendSlackMessage(`⚠️ Reintentando inicio de sesión (${attempts}/2)...`);
                    if (attempts === 2) {
                        throw new Error('No se pudo iniciar sesión después de dos intentos.');
                    }
                }
            }
        }

        // Selección de contratos
        await page.waitForSelector('th.o_list_record_selector', { timeout: 10000 });
        await page.click('th.o_list_record_selector');
        await sendSlackMessage('📌 Contratos seleccionados.');

        // Aplicar filtros
        await page.waitForSelector('a.o_list_select_domain.btn-info', { timeout: 10000 });
        await page.click('a.o_list_select_domain.btn-info');
        await sendSlackMessage('🎯 Filtros aplicados.');

        // Click en botón de Acciones
        await page.waitForSelector('div.o_cp_action_menus > div:nth-child(2) > button', { timeout: 10000 });
        await page.click('div.o_cp_action_menus > div:nth-child(2) > button');
        
        // Click en Exportar
        await page.waitForSelector('div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a', { timeout: 10000 });
        await page.click('div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a');
        await sendSlackMessage('📤 Preparando exportación...');

        // Seleccionar formato CSV
        await page.waitForSelector('label[for="o_radioCSV"]', { timeout: 10000 });
        await page.click('label[for="o_radioCSV"]');
        await page.selectOption('select.o_exported_lists_select', { label: 'TICS_TEST' });
        await sendSlackMessage('📑 Formato CSV seleccionado. Iniciando descarga...');

        // Descarga del archivo
        let attempts = 0;
        while (attempts < 2) {
            try {
                const [download] = await Promise.all([
                    page.waitForEvent('download', { timeout: 60000 }),
                    page.click('.modal-footer > .btn-primary'),
                ]);

                // Manejo del archivo descargado
                const originalFilePath = path.join(config.downloadPath, download.suggestedFilename());
                await download.saveAs(originalFilePath);

                const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
                const newFileName = `backup_info_${timestamp}.csv`;
                const newFilePath = path.join(config.downloadPath, newFileName);

                fs.renameSync(originalFilePath, newFilePath);
                await sendSlackMessage(`✅ Archivo descargado y renombrado: ${newFilePath}`);
                await sendSlackMessage(`📂 Archivo disponible: ${newFileName}`);
                break;
            } catch (err) {
                attempts++;
                await sendSlackMessage(`⚠️ Reintentando descarga (${attempts}/2)...`);
                if (attempts === 2) {
                    throw new Error('No se pudo descargar el archivo después de dos intentos.');
                }
            }
        }

        // Cierre del navegador
        await browser.close();
        await sendSlackMessage('🚀 Proceso finalizado con éxito.');
        await sendSlackMessage('✅ Automatización completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la automatización:', error);
        await sendSlackMessage(`❌ Error en la automatización: ${error.message}`);
    }
})();
