import { CobranzasExportAutomation } from "../controller/cobranzas.controller";
import { ContractExportAutomation } from "../controller/contract.controller";


/**
 * Execute the automation
 */
(async () => {
    const automation = new CobranzasExportAutomation();
    await automation.run();
  })();