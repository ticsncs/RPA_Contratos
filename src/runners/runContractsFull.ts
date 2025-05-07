import { ContractExportAutomation } from "../controller/contract.controller";

const EXPORT_FILE_NAME = 'contracts_nettplus';
const EXPORT_FILE_EXT = 'csv';
export const EXPORT_FILE_NAME_TEMPLATE = 'PLANTILLA_API_CLIENTS_V2';

/**
 * Execute the automation
 */
(async () => {
    const automation = new ContractExportAutomation(EXPORT_FILE_NAME, EXPORT_FILE_EXT, EXPORT_FILE_NAME_TEMPLATE);
    await automation.run();
  })();