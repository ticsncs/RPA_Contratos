import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { config } from '../core/config';
import { interactWithElement } from '../utils/handler-elements';

export async function login(view:boolean, urlWork:string) {
    const sessionFilePath = path.join(config.sessionsPath, 'session.json');
    const hasSession = fs.existsSync(sessionFilePath);
    console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);

    const browser = await chromium.launch({ headless: view });
    const context = hasSession
        ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
        : await browser.newContext({ acceptDownloads: true });
    
    const page = await context.newPage();
    console.log(`🌍 Navegando a: ${config.baseUrl}`);
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    if (!hasSession) {
        console.log('🔑 No se detectó sesión activa, iniciando sesión...');
        await interactWithElement(page, 'input[name="login"]', 'wait');
        await interactWithElement(page, 'input[name="login"]', 'fill', { text: config.user });
        await interactWithElement(page, 'input[name="password"]', 'fill', { text: config.pass });
        await interactWithElement(page, 'button[type="submit"]', 'click');
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 30000 });
        console.log('✅ Inicio de sesión exitoso.');
        await context.storageState({ path: sessionFilePath });
    }

    await page.goto(urlWork, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return { browser, page };
}
