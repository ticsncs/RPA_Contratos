"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const billig_controller_1 = require("../controller/billig.controller");
// Constants
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const EXPORT_FILE_NAME = 'billings_clientes_nettplus';
const EXPORT_FILE_EXT = 'csv';
const EXPORT_FILE_NAME_TEMPLATE = 'FACTURAS_MONGO';
/**
 * Execute the automation
 */
(async () => {
    const automation = new billig_controller_1.BillingExportAutomation(EXPORT_DATE, EXPORT_FILE_NAME, EXPORT_FILE_EXT, EXPORT_FILE_NAME_TEMPLATE);
    await automation.run();
})();
