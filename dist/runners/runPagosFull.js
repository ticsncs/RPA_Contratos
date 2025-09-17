"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPORT_FILE_NAME_TEMPLATE = void 0;
const payment_controller_1 = require("../controller/payment.controller");
// Constants
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const EXPORT_FILE_NAME = 'payments_nettplus';
const EXPORT_FILE_EXT = 'csv';
exports.EXPORT_FILE_NAME_TEMPLATE = 'RPA_pagos_ct';
/**
 * Execute the automation
 */
(async () => {
    const automation = new payment_controller_1.PaymentExportAutomation(EXPORT_DATE, EXPORT_FILE_NAME, EXPORT_FILE_EXT, exports.EXPORT_FILE_NAME_TEMPLATE);
    await automation.run();
})();
