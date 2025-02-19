import { Page } from 'playwright';
import { sendSlackMessage } from '../core/alertSlack';

const MAX_ATTEMPTS = 3;
const WAIT_TIME = 1000; // 1 segundo de espera

type ActionType = 'click' | 'text' | 'wait' | 'fill' | 'doubleClick' | 'hover' | 'type' | 'press' | 'selectOption';

interface ActionOptions {
    text?: string;
    key?: string;
    label?: string;
    waitTime?: number; // Añadido para permitir pasar el tiempo de espera
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
                        await page.locator(selector).first().click({ force: true });
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
                        await page.waitForTimeout(options.waitTime || 3000); // Usar el tiempo de espera pasado o 3 segundos por defecto
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
                    case 'selectOption':
                        await page.selectOption(selector, { label: options.label || '' });
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
