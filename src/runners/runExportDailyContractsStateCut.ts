import { ContractStateDailyExportAutomation } from "../controller/contract.controller";
import { TicketData } from "../core/interfaces/interface-ticket";


const status = 'Cortado';
const exportTemplate = 'RPA_Clientes_Cortados';
const fileName = 'clientes_cortados';
const fileExt = 'csv';
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

/**
 * Execute the automation
 */
(async () => {
    console.time("Execution Time");
    const automation = new ContractStateDailyExportAutomation(status, fileName, fileExt, exportTemplate);
    await automation.run();
    console.timeEnd("Execution Time");
})();
