import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { config } from './core/config';
import { sendSlackMessage } from './core/alertSlack';
import { interactWithElement } from './utils/handler-error';
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit';

(async () => {
    await sendSlackMessage('🤖 Iniciando proceso de validación de campos...');
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const weekNumber = Math.ceil((((currentDate.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
   
    try {
        // Crear carpeta de descargas si no existe
        if (!fs.existsSync(config.downloadPath)) {
            fs.mkdirSync(config.downloadPath, { recursive: true });
            console.log(`📁 Carpeta creada: ${config.downloadPath}`);
        }

        // Verificar sesión existente
        const sessionFilePath = path.join(config.sessionsPath, 'session.json');
        const hasSession = fs.existsSync(sessionFilePath);
        console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);

        const browser = await chromium.launch({ headless: false });
        const context = hasSession
            ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
            : await browser.newContext({ acceptDownloads: true });
        
        const page = await context.newPage();
        console.log(`🌍 Navegando a: ${config.baseUrl}`);
        await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        if (!hasSession) {
            await sendSlackMessage('🔑 No se detectó sesión activa, iniciando sesión...');
            await page.fill('input[name="login"]', config.user);
            await page.fill('input[name="password"]', config.pass);
            await page.click('button[type="submit"]');
            await page.waitForSelector('th.o_list_record_selector', { timeout: 30000 });
            await sendSlackMessage('✅ Inicio de sesión exitoso.');
            await context.storageState({ path: sessionFilePath });
        }
        console.log(`📅 Año actual: ${currentYear}`);
        console.log(`📅 Mes actual: ${currentMonth}`);
        console.log(`📅 Semana actual del año: W${weekNumber}`);

        // Interacciones con la página
        await interactWithElement(page, 'button.dropdown-toggle:has-text("Favoritos")', 'click');
        await interactWithElement(page, 'span.d-flex:has-text("Seg_Contratos")', 'click');
        await interactWithElement(page, `th.o_group_name:has-text("${currentYear}")`, 'click');
        await interactWithElement(page, `th.o_group_name:has-text("${currentMonth} ${currentYear}")`, 'click');
        await interactWithElement(page, `th.o_group_name:has-text("W${weekNumber} ${currentYear}")`, 'click');
        await interactWithElement(page, 'th.o_list_record_selector input.custom-control-input', 'wait');
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        
        await page.pause();

        //await interactWithElement(page, 'text=Seg_Contratos', 'click');

        // Exportar a CSV
        await interactWithElement(page, 'div.o_cp_action_menus > div:nth-child(2) > button', 'click');
        await interactWithElement(page, 'div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a', 'click');
        await sendSlackMessage('📤 Preparando exportación...');

        await browser.close();
        await sendSlackMessage('🚀 Proceso finalizado con éxito.');
    } catch (error: any) {
        console.error('❌ Error durante la automatización:', error);
        await sendSlackMessage(`❌ Error en la automatización: ${(error as Error).message}`);
    }
})();
