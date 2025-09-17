"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract_controller_1 = require("../controller/contract.controller");
const status = 'Retirado';
const exportTemplate = 'RPA_Clientes_Cortados';
const fileName = 'clientes_cortados';
const fileExt = 'csv';
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
/**
 * Execute the automation
 */
(async () => {
    console.time("Execution Time");
    const automation = new contract_controller_1.ContractStateDailyExportAutomation(EXPORT_DATE, status, fileName, fileExt, exportTemplate);
    await automation.run();
    console.timeEnd("Execution Time");
})();
