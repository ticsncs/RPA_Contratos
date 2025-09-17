import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { config } from '../core/config';
import { interactWithElement } from '../utils/handler-elements';


export async function login(view: boolean) {
    const sessionFilePath = path.join(config.sessionsPath, 'session.json');
    // Siempre borrar la sesión previa y crear una nueva
    if (fs.existsSync(sessionFilePath)) {
        try { fs.unlinkSync(sessionFilePath); } catch (e) { console.log('No se pudo borrar session.json'); }
    }
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    console.log(`🌍 Navegando a: ${config.baseUrl}`);
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('🔑 Iniciando sesión nueva...');
    await interactWithElement(page, 'input[name="login"]', 'wait');
    console.log(`👤 Iniciando sesión como: ${config.user}`);
    await interactWithElement(page, 'input[name="login"]', 'fill', { text: config.user });
    await interactWithElement(page, 'input[name="password"]', 'fill', { text: config.pass });
    await interactWithElement(page, 'button[type="submit"]', 'click');
    var tried = 0;
    while (page.url() !== 'https://erp.nettplus.net/web#cids=1&action=menu') {
        await page.waitForTimeout(1000);
        tried++;
        if (tried > 30) { // Esperar máximo 30 segundos
            console.log('❌ Error: No se pudo iniciar sesión. Verifica tus credenciales.');
            await browser.close();
            process.exit(1);
        }
    }
    // Esperar a que aparezca el nombre de usuario en la barra superior
    const userMenuAppeared = await interactWithElement(
        page,
        'span.oe_topbar_name',
        'wait',
        { waitTime: 1000 } // Espera máxima de 1 segundo
    );
    console.log('User menu appeared:', userMenuAppeared);
    // Esperar a que cargue la tabla principal (ajusta el selector si es necesario)
    //const userMenuAppeared2  =await interactWithElement(page, 'span.oe_topbar_name', 'wait', { waitTime: 30000 });
    //await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 30000 });
    //console.log('User menu appeared 2:', userMenuAppeared2);
    console.log('✅ Inicio de sesión exitoso.');
    await context.storageState({ path: sessionFilePath });
    return { browser, page };
}
