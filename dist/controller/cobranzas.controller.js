"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CobranzasExportAutomation = void 0;
const automation_controller_1 = require("./automation.controller");
const cobranzas_service_1 = require("../services/cobranzas.service");
class CobranzasExportAutomation extends automation_controller_1.BaseAutomationContracts {
    cobranzasService;
    constructor(cobranzasService = new cobranzas_service_1.CobranzasService()) {
        super('contract-export');
        this.cobranzasService = cobranzasService;
    }
    /**
     * Run the complete automation process with structured error handling.
     */
    async run() {
        this.logger.info('🔄 Starting contract export automation...');
        try {
            // Obtener datos de clientes cortados
            const clientsData = await this.cobranzasService.fetchDisconnectedClients();
            if (clientsData.length === 0) {
                this.logger.warn('No se encontraron clientes cortados para procesar');
                return;
            }
            this.logger.info(`Se encontraron ${clientsData.length} clientes cortados para procesar`);
            // Buscar tickets existentes
            const clientsWithTickets = await this.cobranzasService.checkExistingTickets(clientsData);
            // Filtrar clientes sin tickets existentes
            const clientsForNewTickets = this.cobranzasService.filterClientsWithoutTickets(clientsData, clientsWithTickets);
            // Generar reporte de tickets existentes
            if (clientsWithTickets.length > 0) {
                await this.cobranzasService.generateAndSendReport(clientsWithTickets);
            }
            // Generar nuevos tickets
            await this.cobranzasService.generateNewTickets(clientsForNewTickets);
            this.logger.info('Proceso de generación de tickets completado exitosamente');
            this.logger.success('✅ Contract export completed successfully.');
        }
        catch (error) {
            this.logger.error('❌ Automation process failed.', error);
        }
        finally {
            await this.cleanupResources();
        }
    }
}
exports.CobranzasExportAutomation = CobranzasExportAutomation;
