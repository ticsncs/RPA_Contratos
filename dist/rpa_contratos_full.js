"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./core/config");
const alertSlack_1 = require("./core/alertSlack");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(async () => {
    await (0, alertSlack_1.sendSlackMessage)('🤖 Iniciando proceso de automatización...');
    await (0, alertSlack_1.sendSlackMessage)('📄 Empezando a trabajar con la exportación de todos los contratos...');
    try {
        // Crear carpeta de descargas si no existe
        if (!fs_1.default.existsSync(config_1.config.downloadPath)) {
            fs_1.default.mkdirSync(config_1.config.downloadPath, { recursive: true });
            console.log(`📁 Carpeta creada: ${config_1.config.downloadPath}`);
        }
        // Verificar si existe la sesión antes de iniciar el contexto del navegador
        const sessionDir = './Session';
        const sessionFilePath = path_1.default.join(sessionDir, 'session.json');
        if (!fs_1.default.existsSync(sessionDir)) {
            fs_1.default.mkdirSync(sessionDir, { recursive: true });
        }
        const hasSession = fs_1.default.existsSync(sessionFilePath);
        console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);
        const browser = await playwright_1.chromium.launch({ headless: true }); // Se ejecuta en modo headless para mayor velocidad
        const context = hasSession
            ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
            : await browser.newContext({ acceptDownloads: true });
        const page = await context.newPage();
        console.log(`🌍 Navegando a: ${config_1.config.baseUrl}`);
        await page.goto(config_1.config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // Verificar si ya hay sesión activa
        if (!hasSession) {
            await (0, alertSlack_1.sendSlackMessage)('🔑 No se detectó sesión activa, iniciando sesión...');
            await (0, alertSlack_1.sendSlackMessage)('🔑 Ingresando credenciales...');
            let attempts = 0;
            while (attempts < 2) {
                try {
                    await page.waitForSelector('#login', { timeout: 10000 });
                    await page.fill('#login', config_1.config.user);
                    await page.fill('#password', config_1.config.pass);
                    await page.click('button[type="submit"]');
                    // Esperar que la autenticación se complete
                    await page.waitForSelector('th.o_list_record_selector', { timeout: 30000 });
                    await (0, alertSlack_1.sendSlackMessage)('✅ Inicio de sesión exitoso.');
                    // Guardar estado de sesión
                    await context.storageState({ path: sessionFilePath });
                    break;
                }
                catch (err) {
                    attempts++;
                    await (0, alertSlack_1.sendSlackMessage)(`⚠️ Reintentando inicio de sesión (${attempts}/2)...`);
                    if (attempts === 2) {
                        throw new Error('No se pudo iniciar sesión después de dos intentos.');
                    }
                }
            }
        }
        // Selección de contratos
        await page.waitForSelector('th.o_list_record_selector', { timeout: 10000 });
        await page.click('th.o_list_record_selector');
        await (0, alertSlack_1.sendSlackMessage)('📌 Contratos seleccionados.');
        // Aplicar filtros
        await page.waitForSelector('a.o_list_select_domain.btn-info', { timeout: 10000 });
        await page.click('a.o_list_select_domain.btn-info');
        await (0, alertSlack_1.sendSlackMessage)('🎯 Filtros aplicados.');
        // Click en botón de Acciones
        await page.waitForSelector('div.o_cp_action_menus > div:nth-child(2) > button', { timeout: 10000 });
        await page.click('div.o_cp_action_menus > div:nth-child(2) > button');
        // Click en Exportar
        await page.waitForSelector('div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a', { timeout: 10000 });
        await page.click('div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a');
        await (0, alertSlack_1.sendSlackMessage)('📤 Preparando exportación...');
        // Seleccionar formato CSV
        await page.waitForSelector('label[for="o_radioCSV"]', { timeout: 10000 });
        await page.click('label[for="o_radioCSV"]');
        await page.selectOption('select.o_exported_lists_select', { label: 'TICS_TEST' });
        await (0, alertSlack_1.sendSlackMessage)('📑 Formato CSV seleccionado. Iniciando descarga...');
        // Descarga del archivo
        let attempts = 0;
        while (attempts < 2) {
            try {
                const [download] = await Promise.all([
                    page.waitForEvent('download', { timeout: 60000 }),
                    page.click('.modal-footer > .btn-primary'),
                ]);
                // Manejo del archivo descargado
                const originalFilePath = path_1.default.join(config_1.config.downloadPath, download.suggestedFilename());
                await download.saveAs(originalFilePath);
                const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
                const newFileName = `backup_info_${timestamp}.csv`;
                const newFilePath = path_1.default.join(config_1.config.downloadPath, newFileName);
                fs_1.default.renameSync(originalFilePath, newFilePath);
                await (0, alertSlack_1.sendSlackMessage)(`✅ Archivo descargado y renombrado: ${newFilePath}`);
                await (0, alertSlack_1.sendSlackMessage)(`📂 Archivo disponible: ${newFileName}`);
                break;
            }
            catch (err) {
                attempts++;
                await (0, alertSlack_1.sendSlackMessage)(`⚠️ Reintentando descarga (${attempts}/2)...`);
                if (attempts === 2) {
                    throw new Error('No se pudo descargar el archivo después de dos intentos.');
                }
            }
        }
        // Cierre del navegador
        await browser.close();
        await (0, alertSlack_1.sendSlackMessage)('🚀 Proceso finalizado con éxito.');
        await (0, alertSlack_1.sendSlackMessage)('✅ Automatización completada con éxito.');
    }
    catch (error) {
        console.error('❌ Error durante la automatización:', error);
        await (0, alertSlack_1.sendSlackMessage)(`❌ Error en la automatización: ${error.message}`);
    }
})();
