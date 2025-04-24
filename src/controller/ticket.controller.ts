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
import { navigateToContractDashboard } from '../routes/contract/contract.route';
export class TicketUnattendedNotificationAutomation {
    private readonly logger = new Logger('contract-export');
    private browser: Browser | null = null;
    private page: Page | null = null;


    constructor(
        private readonly stage: string,
        private readonly dateStart: string,
        private readonly dateEnd: string,
        private readonly exportFileName: string,
        private readonly exportFileExt: string,
        private readonly nameTemplate: string,
        private readonly odooExportService = new OdooExportService(),
        private readonly ticketService = new TicketService(),
    ) { }

    /**
     * Initialize browser and page context.
     */
    private async initializeBrowser(): Promise<void> {
        const session = await initialize(this.page!, this.browser!, false);
        this.page = session.page;
        this.browser = session.browser;
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

        this.logger.info('➡ Navigating to Contract Dashboard...');
        await navigateToTicketDashboard(this.page);

        this.logger.info('➡ Navigating to Tikets section...');
        await navigateToTickets(this.page);
        
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

    /**
     * Ensure resources are cleaned up after execution.
     */
    private async cleanupResources(): Promise<void> {
        this.logger.info('🧹 Cleaning up resources...');
        await cleanup(this.browser!);
    }
}

