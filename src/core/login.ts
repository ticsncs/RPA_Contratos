import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { config } from '../core/config';
import { sendSlackMessage } from '../core/alertSlack';

export async function login() {
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

    return { browser, page };
}
