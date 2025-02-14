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
const handler_error_1 = require("./utils/handler-error");
(async () => {
    await (0, alertSlack_1.sendSlackMessage)('🤖 Iniciando proceso de validación de campos...');
    try {
        // Crear carpeta de descargas si no existe
        if (!fs_1.default.existsSync(config_1.config.downloadPath)) {
            fs_1.default.mkdirSync(config_1.config.downloadPath, { recursive: true });
            console.log(`📁 Carpeta creada: ${config_1.config.downloadPath}`);
        }
        // Verificar sesión existente
        const sessionFilePath = path_1.default.join(config_1.config.sessionsPath, 'session.json');
        const hasSession = fs_1.default.existsSync(sessionFilePath);
        console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);
        const browser = await playwright_1.chromium.launch({ headless: false });
        const context = hasSession
            ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
            : await browser.newContext({ acceptDownloads: true });
        const page = await context.newPage();
        console.log(`🌍 Navegando a: ${config_1.config.baseUrl}`);
        await page.goto(config_1.config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        if (!hasSession) {
            await (0, alertSlack_1.sendSlackMessage)('🔑 No se detectó sesión activa, iniciando sesión...');
            await page.fill('input[name="login"]', config_1.config.user);
            await page.fill('input[name="password"]', config_1.config.pass);
            await page.click('button[type="submit"]');
            await page.waitForSelector('th.o_list_record_selector', { timeout: 30000 });
            await (0, alertSlack_1.sendSlackMessage)('✅ Inicio de sesión exitoso.');
            await context.storageState({ path: sessionFilePath });
        }
        // Interacciones con la página
        await (0, handler_error_1.interactWithElement)(page, 'button.dropdown-toggle span.o_dropdown_title', 'click');
        await (0, handler_error_1.interactWithElement)(page, 'text=Seg_Contratos', 'click');
        // Exportar a CSV
        await (0, handler_error_1.interactWithElement)(page, 'div.o_cp_action_menus > div:nth-child(2) > button', 'click');
        await (0, handler_error_1.interactWithElement)(page, 'div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a', 'click');
        await (0, alertSlack_1.sendSlackMessage)('📤 Preparando exportación...');
        await browser.close();
        await (0, alertSlack_1.sendSlackMessage)('🚀 Proceso finalizado con éxito.');
    }
    catch (error) {
        console.error('❌ Error durante la automatización:', error);
        await (0, alertSlack_1.sendSlackMessage)(`❌ Error en la automatización: ${error.message}`);
    }
})();
