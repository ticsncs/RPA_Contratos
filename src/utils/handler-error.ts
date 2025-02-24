import { Page, Browser } from 'playwright';
import { interactWithElement } from './handler-elements';

export const interactSafely = async (
    page: Page,
    browser: Browser,
    selector: string,
    action: string,
    options: any = {}
): Promise<void> => {
    try {
        await interactWithElement(page, selector, action= 'wait', options);
    } catch (error) {
        console.error(`❌ Error en el paso: ${selector} - Acción: ${action}`);
        await browser.close();
        throw new Error(`Proceso detenido debido a fallo en ${selector}`);
    }
};