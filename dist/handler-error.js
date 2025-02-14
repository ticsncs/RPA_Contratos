"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactWithElement = void 0;
const alertSlack_1 = require("./alertSlack");
const MAX_ATTEMPTS = 3;
const WAIT_TIME = 1000; // 1 segundo de espera
const interactWithElement = async (page, selector, action = 'click', maxAttempts = MAX_ATTEMPTS) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            const element = await page.$(selector);
            if (element) {
                console.log(`✅ Elemento encontrado: ${selector}`);
                if (action === 'click') {
                    await element.click({ force: true });
                }
                else if (action === 'text') {
                    return await page.$eval(selector, el => el.textContent?.trim() || '');
                }
                else if (action === 'wait') {
                    await page.waitForSelector(selector, { timeout: 5000 });
                }
                return true; // Éxito
            }
        }
        catch (error) {
            console.log(`⚠️ Intento ${attempts + 1}: Error al interactuar con ${selector}.`);
        }
        await page.waitForTimeout(WAIT_TIME);
        attempts++;
    }
    console.log(`❌ No se pudo interactuar con ${selector} después de ${maxAttempts} intentos.`);
    await (0, alertSlack_1.sendSlackMessage)(`❌ Error en la automatización: No se encontró ${selector}`);
    return false;
};
exports.interactWithElement = interactWithElement;
