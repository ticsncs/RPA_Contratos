import { Page } from 'playwright';
import { sendSlackMessage } from '../core/alertSlack';

const MAX_ATTEMPTS = 3;
const WAIT_TIME = 1000; // 1 segundo de espera

type ActionType = 'click' | 'text' | 'wait' | 'fill' | 'doubleClick' | 'hover' | 'type' | 'press';

interface ActionOptions {
    text?: string;
    key?: string;
}

export const interactWithElement = async (
    page: Page,
    selector: string,
    action: ActionType = 'click',
    options: ActionOptions = {},
    maxAttempts: number = MAX_ATTEMPTS
): Promise<boolean | string> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const element = await page.$(selector);
            if (element) {
                console.log(`✅ Elemento encontrado: ${selector}`);

                switch (action) {
                    case 'click':
                        await element.click({ force: true });
                        break;
                    case 'doubleClick':
                        await element.dblclick({ force: true });
                        break;
                    case 'hover':
                        await element.hover();
                        break;
                    case 'text':
                        return await page.$eval(selector, el => el.textContent?.trim() || '');
                    case 'wait':
                        await page.waitForSelector(selector, { timeout: 5000 });
                        break;
                    case 'fill':
                        await element.fill(options.text || '');
                        break;
                    case 'type':
                        await element.type(options.text || '');
                        break;
                    case 'press':
                        await element.press(options.key || '');
                        break;
                    default:
                        throw new Error(`Acción no soportada: ${action}`);
                }

                return true; // Éxito
            }
        } catch (error) {
            console.log(`⚠️ Intento ${attempts + 1}: Error al interactuar con ${selector}.`);
        }

        await page.waitForTimeout(WAIT_TIME);
        attempts++;
    }

    console.log(`❌ No se pudo interactuar con ${selector} después de ${maxAttempts} intentos.`);
    await sendSlackMessage(`❌ Error en la automatización: No se encontró ${selector}`);
    await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000);
    return false;
};

// Ejemplo de uso de la función interactWithElement
/*
(async () => {
    const page: Page = await browser.newPage();

    // Ejemplo 1: Hacer clic en un botón
    const clickResult = await interactWithElement(page, '#submit-button', 'click');
    console.log(`Resultado del clic: ${clickResult}`);

    // Ejemplo 2: Obtener texto de un elemento
    const textResult = await interactWithElement(page, '#message', 'text');
    console.log(`Texto obtenido: ${textResult}`);

    // Ejemplo 3: Llenar un campo de texto
    const fillResult = await interactWithElement(page, '#input-field', 'fill', { text: 'Hola Mundo' });
    console.log(`Resultado del llenado: ${fillResult}`);

    // Ejemplo 4: Esperar a que un elemento aparezca
    const waitResult = await interactWithElement(page, '#loading', 'wait');
    console.log(`Resultado de la espera: ${waitResult}`);
    // Ejemplo 5: Presionar una tecla en un elemento
    const pressResult = await interactWithElement(page, '#input-field', 'press', { key: 'Enter' });
    console.log(`Resultado de presionar tecla: ${pressResult}`);
    await page.close();
})();
*/