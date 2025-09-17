"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPORT_FILE_NAME_TEMPLATE = void 0;
const contract_controller_1 = require("../controller/contract.controller");
const EXPORT_FILE_NAME = 'contracts_nettplus';
const EXPORT_FILE_EXT = 'csv';
exports.EXPORT_FILE_NAME_TEMPLATE = 'PLANTILLA_API_CLIENTS_V2';
/**
 * Execute the automation
 */
(async () => {
    const automation = new contract_controller_1.ContractExportAutomation(EXPORT_FILE_NAME, EXPORT_FILE_EXT, exports.EXPORT_FILE_NAME_TEMPLATE);
    await automation.run();
})();
