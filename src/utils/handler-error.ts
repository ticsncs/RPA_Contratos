import { Page } from 'playwright';

const MAX_ATTEMPTS = 3;
const WAIT_TIME = 1000; // 1 segundo de espera

type ActionType = 'click' | 'text' | 'wait' | 'fill' | 'doubleClick' | 'hover' | 'type' | 'press' | 'selectOption' | 'paste';

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

                switch (action) {
                    case 'click':
                        await page.locator(selector).first().click({ force: true });
                        console.log(`✅ Acción 'click' realizada en: ${selector}`);
                        break;
                    case 'doubleClick':
                        await element.dblclick({ force: true });
                        console.log(`✅ Acción 'doubleClick' realizada en: ${selector}`);
                        break;
                    case 'hover':
                        await element.hover();
                        console.log(`✅ Acción 'hover' realizada en: ${selector}`);
                        break;
                    case 'text':
                        const text = await page.$eval(selector, el => el.textContent?.trim() || '');
                        console.log(`✅ Acción 'text' realizada en: ${selector}`);
                        return text;
                    case 'wait':
                        await page.waitForTimeout(options.waitTime || 3000); // Usar el tiempo de espera pasado o 3 segundos por defecto
                        console.log(`✅ Acción 'wait' realizada en: ${selector}`);
                        break;
                    case 'fill':
                        await element.fill(options.text || '');
                        console.log(`✅ Acción 'fill' realizada en: ${selector}`);
                        break;
                    case 'type':
                        await element.type(options.text || '');
                        console.log(`✅ Acción 'type' realizada en: ${selector}`);
                        break;
                    case 'press':
                        await element.press(options.key || '');
                        console.log(`✅ Acción 'press' realizada en: ${selector}`);
                        break;
                    case 'selectOption':
                        await page.selectOption(selector, { label: options.label || '' });
                        console.log(`✅ Acción 'selectOption' realizada en: ${selector}`);
                        break;
                    case 'paste':
                        await element.evaluate((el, text) => {
                            (el as HTMLInputElement).value = text;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                        }, options.text || '');
                        console.log(`✅ Acción 'paste' realizada en: ${selector}`);
                        break;
                    default:
                        throw new Error(`Acción no soportada: ${action}`);
                }

                return true; // Éxito
            }
        } catch (error) {
            console.log(`⚠️ Intento ${attempts + 1}: Error al realizar la acción '${action}' en ${selector}.`);
        }

        await page.waitForTimeout(WAIT_TIME);
        attempts++;
    }

    console.log(`❌ No se pudo realizar la acción '${action}' en ${selector} después de ${maxAttempts} intentos.`);
    await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000);
    return false;
};
