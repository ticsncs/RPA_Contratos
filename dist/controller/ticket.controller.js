"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPerContractAutomation = exports.TicketUnattendedNotificationAutomation = void 0;
const path_1 = __importDefault(require("path"));
const odoo_export_service_1 = require("../services/odoo_export.service");
const tickets_service_1 = require("../services/tickets.service");
const handler_mail_1 = require("../utils/handler-mail");
const fs_1 = __importDefault(require("fs"));
const automation_controller_1 = require("./automation.controller");
class TicketUnattendedNotificationAutomation extends automation_controller_1.BaseAutomationTickets {
    stage;
    dateStart;
    dateEnd;
    exportFileName;
    exportFileExt;
    nameTemplate;
    odooExportService;
    ticketService;
    constructor(stage, dateStart, dateEnd, exportFileName, exportFileExt, nameTemplate, odooExportService = new odoo_export_service_1.OdooExportService(), ticketService = new tickets_service_1.TicketService()) {
        super('unattended-ticket-notification');
        this.stage = stage;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.exportFileName = exportFileName;
        this.exportFileExt = exportFileExt;
        this.nameTemplate = nameTemplate;
        this.odooExportService = odooExportService;
        this.ticketService = ticketService;
    }
    /**
     * Run the complete automation process with structured error handling.
     */
    async run() {
        this.logger.info('🔄 Starting contract export automation...');
        try {
            await this.initializeBrowser();
            await this.processExport();
            this.logger.success('✅ Contract export completed successfully.');
        }
        catch (error) {
            this.logger.error('❌ Automation process failed.', error);
        }
        finally {
            await this.cleanupResources();
        }
    }
    /**
     * Execute each step of the automation sequentially.
     */
    async processExport() {
        if (!this.page)
            throw new Error('Page not initialized.');
        this.logger.info(`➡ Applying filters for tickets...`);
        await this.ticketService.applyFiltersTicketsUnattended(this.page, this.stage, this.dateStart, this.dateEnd);
        this.logger.info('➡ Selecting all records...');
        await this.odooExportService.selectAllRecords(this.page);
        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.exportFileName, this.exportFileExt, this.nameTemplate);
        console.log('filePath controller', filePath);
        if (filePath) {
            this.logger.success(`📁 File downloaded: ${path_1.default.basename(filePath)}  for send API MongoDB`);
            let informe = (0, handler_mail_1.enviarCorreo)('djimenez@nettplus.net', // Destinatario
            [], // Correos con copia cc
            ['bherrera@nettplus.net', 'kyaruqui@nettplus.net'], // Correos con copia oculta cco
            filePath, // Archivo adjunto
            'Se adjunta el reporte de tickets abandonados por mas de 10 días', // Mensaje
            'Reporte de tickets abandonados' // Asunto
            );
            if (await informe) {
                // Borrar el archivo después de enviar el mensaje
                if (filePath) {
                    fs_1.default.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`❌ Error al borrar el archivo: ${err.message}`);
                        }
                        else {
                            console.log('✅ Archivo borrado con éxito.');
                        }
                    });
                }
            }
            this.cleanupResources();
        }
        else {
            throw new Error('Export failed - no file was downloaded.');
        }
    }
}
exports.TicketUnattendedNotificationAutomation = TicketUnattendedNotificationAutomation;
class TicketPerContractAutomation extends automation_controller_1.BaseAutomationTickets {
    code;
    dateStart;
    dateEnd;
    ticketService;
    odooExportService;
    constructor(code, dateStart, dateEnd, ticketService = new tickets_service_1.TicketService(), odooExportService = new odoo_export_service_1.OdooExportService()) {
        super('tickets-per-contract');
        this.code = code;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.ticketService = ticketService;
        this.odooExportService = odooExportService;
    }
    /**
     * Run the complete automation process with structured error handling
     */
    async run() {
        this.logger.info('🔄 Starting tickets per contract automation...');
        let tickets = null;
        try {
            await this.initializeBrowser();
            tickets = await this.processExport();
            this.logger.success('✅ Tickets per contract export completed successfully');
            return tickets;
        }
        catch (error) {
            this.logger.error('❌ Automation process failed', error);
            return null;
        }
        finally {
            await this.cleanupResources();
        }
    }
    /**
     * Execute each step of the automation sequentially
     */
    async processExport() {
        if (!this.page)
            throw new Error('Page not initialized');
        await this.navigateToTicketSection();
        this.logger.info(`➡ Applying filters for contract ${this.code} (${this.dateStart} to ${this.dateEnd})`);
        await this.ticketService.applyFiltersTicketsPerContract(this.page, this.code, this.dateStart, this.dateEnd);
        this.logger.info('➡ Exporting ticket records...');
        const result = await this.odooExportService.exportRecordsTableOdoo(this.page);
        // Extract the tickets array from the result object
        const tickets = result.tickets || [];
        if (!tickets || tickets.length === 0) {
            this.logger.warn('No tickets found for the specified criteria');
            return [];
        }
        else {
            this.logger.success(`Retrieved ${tickets.length} ticket records`);
        }
        return tickets;
    }
}
exports.TicketPerContractAutomation = TicketPerContractAutomation;
