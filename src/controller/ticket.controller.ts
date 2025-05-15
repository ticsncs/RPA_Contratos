import { Browser, Page } from 'playwright';
import path from 'path';
import { initialize } from '../routes/index';
import { OdooExportService } from '../services/odoo_export.service';
import { cleanup } from '../utils/clean-resources';
import { Logger } from '../../src/utils/logger';
import { navigateToTicketDashboard } from '../routes/tickets/ticket.route';
import { navigateToTickets } from '../routes/tickets/cli_tickets.route';
import { TicketService } from '../services/tickets.service';
import { enviarCorreo } from '../utils/handler-mail';
import fs from 'fs';
import { BaseAutomationTickets } from './automation.controller';




export class TicketUnattendedNotificationAutomation extends BaseAutomationTickets {


    constructor(
        private readonly stage: string,
        private readonly dateStart: string,
        private readonly dateEnd: string,
        private readonly exportFileName: string,
        private readonly exportFileExt: string,
        private readonly nameTemplate: string,
        private readonly odooExportService = new OdooExportService(),
        private readonly ticketService = new TicketService(),
    ) {
        super('unattended-ticket-notification');
    }

    

    /**
     * Run the complete automation process with structured error handling.
     */
    async run(): Promise<void> {
        this.logger.info('🔄 Starting contract export automation...');

        try {
            await this.initializeBrowser();
            await this.processExport();

            this.logger.success('✅ Contract export completed successfully.');
        } catch (error) {
            this.logger.error('❌ Automation process failed.', error);
        } finally {
            await this.cleanupResources();
        }
    }

    /**
     * Execute each step of the automation sequentially.
     */
    private async processExport(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized.');
        
        this.logger.info(`➡ Applying filters for tickets...`);
        await this.ticketService.applyFiltersTicketsUnattended(this.page, this.stage, this.dateStart, this.dateEnd);

        this.logger.info('➡ Selecting all records...');
        await this.odooExportService.selectAllRecords(this.page);

        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.exportFileName, this.exportFileExt, this.nameTemplate);
        console.log('filePath controller', filePath);

        if (filePath) {
            this.logger.success(`📁 File downloaded: ${path.basename(filePath)}  for send API MongoDB`);
            let informe = enviarCorreo(
                        'djimenez@nettplus.net', // Destinatario
                        [], // Correos con copia cc
                        ['bherrera@nettplus.net', 'kyaruqui@nettplus.net'], // Correos con copia oculta cco
                        filePath, // Archivo adjunto
                        'Se adjunta el reporte de tickets abandonados por mas de 10 días', // Mensaje
                        'Reporte de tickets abandonados' // Asunto
                    );
                    if (await informe) {
                        // Borrar el archivo después de enviar el mensaje
                    if (filePath) {
                        fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
                        if (err) {
                            console.error(`❌ Error al borrar el archivo: ${err.message}`);
                        } else {
                            console.log('✅ Archivo borrado con éxito.');
                        }
                        });
                    }
                    }
            this.cleanupResources();
        } else {
            throw new Error('Export failed - no file was downloaded.');
        }
    }

    
}



export class TicketPerContractAutomation extends BaseAutomationTickets {
    constructor(
        private readonly code: string,
        private readonly dateStart: string,
        private readonly dateEnd: string,
        private readonly ticketService = new TicketService(),
        private readonly odooExportService= new OdooExportService(),
    ) {
        super('tickets-per-contract');
    }

    /**
     * Run the complete automation process with structured error handling
     */
    async run(): Promise<string[][] | null> {
        this.logger.info('🔄 Starting tickets per contract automation...');
        let tickets: string[][] | null = null;

        try {
            await this.initializeBrowser();
            tickets = await this.processExport();
            this.logger.success('✅ Tickets per contract export completed successfully');
            return tickets;
        } catch (error) {
            this.logger.error('❌ Automation process failed', error);
            return null;
        } finally {
            await this.cleanupResources();
        }
    }

    /**
     * Execute each step of the automation sequentially
     */
    private async processExport(): Promise<string[][]> {
        if (!this.page) throw new Error('Page not initialized');

        await this.navigateToTicketSection();
        
        this.logger.info(`➡ Applying filters for contract ${this.code} (${this.dateStart} to ${this.dateEnd})`);
        await this.ticketService.applyFiltersTicketsPerContract(
            this.page,
            this.code,
            this.dateStart,
            this.dateEnd
        );

        this.logger.info('➡ Exporting ticket records...');
        
        const result = await this.odooExportService.exportRecordsTableOdoo(this.page);
        
        // Extract the tickets array from the result object
        const tickets = result.tickets || [];
        
        if (!tickets || tickets.length === 0) {
            this.logger.warn('No tickets found for the specified criteria');
            return [];
        } else {
            this.logger.success(`Retrieved ${tickets.length} ticket records`);
        }
        
        return tickets;
    }
}