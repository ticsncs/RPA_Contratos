import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { config } from '../core/config';
import { interactWithElement } from '../utils/handler-elements';


export async function login(view: boolean) {
    const sessionFilePath = path.join(config.sessionsPath, 'session.json');
    let hasSession = fs.existsSync(sessionFilePath);
    console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);

    const browser = await chromium.launch({ headless: view });
    let context = hasSession
        ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
        : await browser.newContext({ acceptDownloads: true });
    let page = await context.newPage();
    console.log(`🌍 Navegando a: ${config.baseUrl}`);
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    let sessionValida = true;
    if (hasSession) {
        // Validar si la sesión es válida buscando un elemento que solo aparece si está logueado
        try {
            await page.waitForSelector('th.o_list_record_selector', { timeout: 10000 });
            console.log('✅ Sesión válida.');
        } catch (e) {
            console.log('⚠️  Sesión inválida, se requiere login.');
            sessionValida = false;
        }
    }

    if (!hasSession || !sessionValida) {
        // Si la sesión es inválida, eliminar el archivo de sesión y crear nuevo contexto limpio
        if (hasSession && !sessionValida) {
            try { fs.unlinkSync(sessionFilePath); } catch (e) { console.log('No se pudo borrar session.json'); }
            context = await browser.newContext({ acceptDownloads: true });
            page = await context.newPage();
            await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        }
        console.log('🔑 No se detectó sesión activa o es inválida, iniciando sesión...');
        await interactWithElement(page, 'input[name="login"]', 'wait');
        console.log(`👤 Iniciando sesión como: ${config.user}`);
        await interactWithElement(page, 'input[name="login"]', 'fill', { text: config.user });
        await interactWithElement(page, 'input[name="password"]', 'fill', { text: config.pass });
        await interactWithElement(page, 'button[type="submit"]', 'click');
        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 30000 });
        console.log('✅ Inicio de sesión exitoso.');
        await context.storageState({ path: sessionFilePath });
    }

    return { browser, page };
}
