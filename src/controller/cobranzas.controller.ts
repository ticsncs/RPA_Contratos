
import { BaseAutomationContracts } from './automation.controller';
import { CobranzasService } from '../services/cobranzas.service';

export class CobranzasExportAutomation extends BaseAutomationContracts {


    constructor(
        private readonly cobranzasService = new CobranzasService()
    ) {
        super('contract-export');
    }


    /**
     * Run the complete automation process with structured error handling.
     */
    async run(): Promise<void> {
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
        } catch (error) {
            this.logger.error('❌ Automation process failed.', error);
        } finally {
            await this.cleanupResources();
        }
    }


}