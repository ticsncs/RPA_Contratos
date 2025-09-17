"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cobranzas_controller_1 = require("../controller/cobranzas.controller");
/**
 * Execute the automation
 */
(async () => {
    const automation = new cobranzas_controller_1.CobranzasExportAutomation();
    await automation.run();
})();
