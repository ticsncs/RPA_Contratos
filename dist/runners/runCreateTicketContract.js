"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract_controller_1 = require("../controller/contract.controller");
const searchContract = 'CT-99999';
const dataTicket = {
    user: "0123456789",
    title: `RPA  : Corte clientes por `,
    team: 'PAGOS Y COBRANZAS',
    assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
    channel: 'PERSONALIZADO',
    category: 'Pagos y cobranzas',
    tag: 'PROCEDENTE',
};
/**
 * Execute the automation
 */
(async () => {
    console.time("Execution Time");
    const automation = new contract_controller_1.CreateTicketPerContractAutomation(searchContract, dataTicket);
    await automation.run();
    console.timeEnd("Execution Time");
})();
