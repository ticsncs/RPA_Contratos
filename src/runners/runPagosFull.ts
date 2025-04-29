import{PaymentExportAutomation} from '../controller/payment.controller';

// Constants
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const EXPORT_FILE_NAME = 'payments_nettplus';
const EXPORT_FILE_EXT = 'csv';
export const EXPORT_FILE_NAME_TEMPLATE = 'RPA_pagos_ct';

/**
 * Execute the automation
 */
(async () => {
    const automation = new PaymentExportAutomation(EXPORT_DATE, EXPORT_FILE_NAME, EXPORT_FILE_EXT, EXPORT_FILE_NAME_TEMPLATE);
    await automation.run();
  })();