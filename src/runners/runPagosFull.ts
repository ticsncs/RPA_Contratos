import{ContractExportAutomation} from '../controller/accounting.controller';

// Constants
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const EXPORT_FILE_NAME = 'clientes_nettplus';
const EXPORT_FILE_EXT = 'csv';
/**
 * Execute the automation
 */
(async () => {
    const automation = new ContractExportAutomation(EXPORT_DATE, EXPORT_FILE_NAME, EXPORT_FILE_EXT);
    await automation.run();
  })();