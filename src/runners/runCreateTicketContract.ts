import { ContractExportAutomation, CreateTicketPerContractAutomation } from "../controller/contract.controller";
import { TicketData } from "../core/interfaces/interface-ticket";


const searchContract = 'CT-99999';
const dataTicket: TicketData = {
    user: "0123456789",
    title: `RPA  : Corte clientes por `,
    team: 'PAGOS Y COBRANZAS',
    assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
    channel: 'PERSONALIZADO',
    category: 'Pagos y cobranzas',
    tag: '',
};
/**
 * Execute the automation
 */
(async () => {
    const automation = new CreateTicketPerContractAutomation(searchContract, dataTicket);
    await automation.run();
})();
