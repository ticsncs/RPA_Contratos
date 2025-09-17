"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const playwright_1 = require("playwright");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../core/config");
const handler_elements_1 = require("../utils/handler-elements");
async function login(view, urlWork) {
    const sessionFilePath = path_1.default.join(config_1.config.sessionsPath, 'session.json');
    const hasSession = fs_1.default.existsSync(sessionFilePath);
    console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);
    const browser = await playwright_1.chromium.launch({ headless: view });
    const context = hasSession
        ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
        : await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    console.log(`🌍 Navegando a: ${config_1.config.baseUrl}`);
    await page.goto(config_1.config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!hasSession) {
        console.log('🔑 No se detectó sesión activa, iniciando sesión...');
        await (0, handler_elements_1.interactWithElement)(page, 'input[name="login"]', 'wait');
        await (0, handler_elements_1.interactWithElement)(page, 'input[name="login"]', 'fill', { text: config_1.config.user });
        await (0, handler_elements_1.interactWithElement)(page, 'input[name="password"]', 'fill', { text: config_1.config.pass });
        await (0, handler_elements_1.interactWithElement)(page, 'button[type="submit"]', 'click');
        await (0, handler_elements_1.interactWithElement)(page, 'th.o_list_record_selector', 'wait', { waitTime: 30000 });
        console.log('✅ Inicio de sesión exitoso.');
        await context.storageState({ path: sessionFilePath });
    }
    await page.goto(urlWork, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return { browser, page };
}
