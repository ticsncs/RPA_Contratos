"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CobranzasService = void 0;
const contract_controller_1 = require("../controller/contract.controller");
const ticket_controller_1 = require("../controller/ticket.controller");
const csv_handler_1 = require("../utils/csv-handler");
const date_utils_1 = require("../utils/date-utils");
const handler_files_1 = require("../utils/handler-files");
const handler_mail_1 = require("../utils/handler-mail");
const logger_1 = require("../utils/logger");
// Constantes de configuración
const CONFIG = {
    TICKET_GENERATION_DELAY_MS: 5000,
    EMAIL_RECIPIENTS: {
        to: ['djimenez@nettplus.net'],
        cc: [],
        bcc: ['bherrera@nettplus.net', 'kyaruqui@nettplus.net']
    },
    REPORT_PATH: './src/resources/ticketsCobranzas.pdf',
    EMAIL_SUBJECT: '#Clientes Con Tickets Generados',
    EMAIL_BODY: 'Clientes con tickets generados antes del flujo de cobranzas.\nSe recomienda revisar los tickets generados.'
};
class CobranzasService {
    logger = new logger_1.Logger('ClientTicketAutomation');
    csvHandler = new csv_handler_1.CsvHandler();
    dateUtils = new date_utils_1.DateUtils();
    /**
   * Procesa la lista de clientes cortados para un periodo específico
   */
    async processDisconnectedClients(quantity, unit, description) {
        try {
            const date = this.dateUtils.getModifiedDate(quantity, unit);
            const automation = new contract_controller_1.ContractStateDailyExportAutomation(date, 'Cortado', `clientes_cortados_${description}`, 'csv', 'RPA_Clientes_Cortados');
            const filePath = await automation.run();
            if (!filePath) {
                this.logger.warn(`No se encontró archivo para clientes cortados (${description})`);
                return [];
            }
            this.logger.info(`Lista de clientes (${description}) descargada desde: ${filePath}`);
            return await this.csvHandler.readClientDataFromCsv(filePath);
        }
        catch (error) {
            this.logger.error(`Error al procesar clientes cortados (${description})`, error);
            return [];
        }
    }
    /**
   * Elimina clientes duplicados de la lista
   */
    removeDuplicateClients(clients) {
        const processedCodes = new Set();
        return clients.filter(client => {
            const clientCode = client.Código || '';
            if (processedCodes.has(clientCode)) {
                return false;
            }
            processedCodes.add(clientCode);
            return true;
        });
    }
    /**
       * Obtiene los datos de clientes con servicio cortado en diferentes periodos
       */
    async fetchDisconnectedClients() {
        this.logger.info('Obteniendo listas de clientes cortados...');
        try {
            // Obtener listas de clientes en diferentes intervalos
            const [clientsData5, clientsData20, clientsDataMes] = await Promise.all([
                this.processDisconnectedClients(5, "days", "5_dias"),
                this.processDisconnectedClients(20, "days", "20_dias"),
                this.processDisconnectedClients(1, "months", "1_mes"),
            ]);
            // Combinamos todas las listas y agregamos la descripción
            const allClients = [
                ...clientsData5.map(client => ({ ...client, descripcion: "5 días" })),
                ...clientsData20.map(client => ({ ...client, descripcion: "20 días" })),
                ...clientsDataMes.map(client => ({ ...client, descripcion: "1 mes" }))
            ];
            // Eliminar duplicados (mantener la primera ocurrencia)
            return this.removeDuplicateClients(allClients);
        }
        catch (error) {
            this.logger.error('Error al obtener datos de clientes cortados', error);
            return [];
        }
    }
    /**
       * Verifica si los clientes ya tienen tickets existentes
       */
    async checkExistingTickets(clients) {
        this.logger.info('Verificando tickets existentes para los clientes...');
        const tickets = [];
        for (const client of clients) {
            const fechaInicio = this.getStartDateByDescription(client.descripcion || "1 mes");
            const fechaFin = this.dateUtils.getCurrentDate();
            this.logger.info(`Verificando tickets para: ${client.Código} desde ${fechaInicio} hasta ${fechaFin} (${client.descripcion})`);
            try {
                const ticketAutomation = new ticket_controller_1.TicketPerContractAutomation(client.Código, fechaInicio, fechaFin);
                const result = await ticketAutomation.run();
                const validRecords = this.filterValidTickets(result);
                this.logger.info(`${validRecords.length} tickets válidos encontrados para ${client.Código}`);
                if (validRecords.length > 0) {
                    tickets.push({
                        Código: client.Código,
                        Descripcion: client.descripcion || 'Sin descripción',
                        Cantidad: validRecords.length,
                        Detalles: validRecords.map(ticket => ({
                            Código: ticket[1] || "N/A",
                            FechaInicio: ticket[5] || "N/A",
                            Estado: ticket[8] || "N/A"
                        }))
                    });
                }
            }
            catch (error) {
                this.logger.error(`Error al verificar tickets para ${client.Código}`, error);
            }
        }
        return tickets;
    }
    /**
      * Determina la fecha de inicio según la descripción del periodo
      */
    getStartDateByDescription(description) {
        switch (description) {
            case "5 días":
                return this.dateUtils.getModifiedDate(5, "days");
            case "20 días":
                return this.dateUtils.getModifiedDate(20, "days");
            case "1 mes":
                return this.dateUtils.getModifiedDate(1, "months");
            default:
                return this.dateUtils.getModifiedDate(1, "months");
        }
    }
    /**
     * Filtra registros de tickets válidos
     */
    filterValidTickets(tickets) {
        return (tickets ?? []).filter(ticket => Array.isArray(ticket) &&
            ticket.length > 0 &&
            ticket.some((field) => field.trim() !== ''));
    }
    /**
    * Filtra clientes que no tienen tickets existentes
    */
    filterClientsWithoutTickets(allClients, clientsWithTickets) {
        return allClients.filter(client => !clientsWithTickets.some(ticket => ticket.Código === client.Código));
    }
    /**
       * Genera y envía el reporte de tickets existentes
       */
    async generateAndSendReport(ticketsList) {
        this.logger.info('Generando reporte de tickets existentes...');
        try {
            const formattedTickets = ticketsList.map(ticket => ({
                Código: ticket.Código,
                Descripcion: ticket.Descripcion,
                Cantidad: ticket.Cantidad,
                Resultado: ticket.Detalles.map(d => `{${d.Código}, ${d.FechaInicio}, ${d.Estado}}`).join(' | ')
            }));
            // Generar reporte de tickets
            await (0, handler_files_1.reporteTicketsCobranzas)(formattedTickets, CONFIG.REPORT_PATH);
            // Enviar reporte por correo
            await (0, handler_mail_1.enviarCorreo)(CONFIG.EMAIL_RECIPIENTS.to[0], CONFIG.EMAIL_RECIPIENTS.cc, CONFIG.EMAIL_RECIPIENTS.bcc, CONFIG.REPORT_PATH, CONFIG.EMAIL_BODY, CONFIG.EMAIL_SUBJECT);
            this.logger.info('Reporte enviado correctamente');
        }
        catch (error) {
            this.logger.error('Error al generar o enviar el reporte', error);
        }
    }
    /**
       * Genera nuevos tickets para los clientes que no tienen tickets existentes
       */
    async generateNewTickets(clients) {
        if (clients.length === 0) {
            this.logger.info('No hay clientes que requieran nuevos tickets');
            return;
        }
        this.logger.info(`Generando tickets para ${clients.length} clientes...`);
        for (const client of clients) {
            this.logger.info(`Generando ticket para: ${client.Cliente || client.Código} (${client.descripcion})`);
            try {
                const today = this.dateUtils.formatDateForTitle();
                const ticketCreation = new contract_controller_1.CreateTicketPerContractAutomation(client.Código, {
                    user: client.Cedula,
                    title: `RPA ${today}: Corte clientes por ${client.descripcion}`,
                    team: 'PAGOS Y COBRANZAS',
                    assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                    channel: 'PERSONALIZADO',
                    category: 'Pagos y cobranzas',
                    tag: '',
                });
                await ticketCreation.run();
                this.logger.info(`Ticket generado exitosamente para: ${client.Cliente || client.Código}`);
            }
            catch (error) {
                this.logger.error(`Error al generar ticket para ${client.Cliente || client.Código}`, error);
            }
            // Esperar antes de procesar el siguiente cliente
            this.logger.info(`Esperando ${CONFIG.TICKET_GENERATION_DELAY_MS / 1000} segundos antes de procesar el siguiente ticket...`);
            await this.sleep(CONFIG.TICKET_GENERATION_DELAY_MS);
        }
        this.logger.info('Generación de nuevos tickets completada');
    }
    /**
    * Función de utilidad para pausar la ejecución
    */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.CobranzasService = CobranzasService;
