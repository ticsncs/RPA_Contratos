"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactSafely = void 0;
const handler_elements_1 = require("./handler-elements");
const interactSafely = async (page, browser, selector, action, options = {}) => {
    try {
        await (0, handler_elements_1.interactWithElement)(page, selector, action = 'wait', options);
    }
    catch (error) {
        console.error(`❌ Error en el paso: ${selector} - Acción: ${action}`);
        await browser.close();
        throw new Error(`Proceso detenido debido a fallo en ${selector}`);
    }
};
exports.interactSafely = interactSafely;
