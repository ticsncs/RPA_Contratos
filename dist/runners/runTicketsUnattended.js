"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ticket_controller_1 = require("../controller/ticket.controller");
const EXPORT_FILE_NAME = 'Reporte_Tickets_abandonados';
const EXPORT_FILE_EXT = 'XLSX';
const EXPORT_FILE_NAME_TEMPLATE = 'RPA_Inf_Cobranzas2';
const currentDate = new Date();
const DATE_END = new Date(currentDate.setDate(currentDate.getDate() - 10)).toLocaleDateString('en-GB') + ' 23:59:59';
const DATE_SATART = new Date(currentDate.setMonth(currentDate.getMonth() - 3)).toLocaleDateString('en-GB') + ' 00:00:00';
const Stage = 'Nuevo';
/**
 * Execute the automation
 */
(async () => {
    const automation = new ticket_controller_1.TicketUnattendedNotificationAutomation(Stage, DATE_SATART, DATE_END, EXPORT_FILE_NAME, EXPORT_FILE_EXT, EXPORT_FILE_NAME_TEMPLATE);
    await automation.run();
})();
