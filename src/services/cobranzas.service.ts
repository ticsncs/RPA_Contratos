import { ContractStateDailyExportAutomation, CreateTicketPerContractAutomation } from "../controller/contract.controller";
import { TicketPerContractAutomation } from "../controller/ticket.controller";
import { ClientOffData, ClientTicketSummary } from "../core/interfaces/interface-client";
import { CsvHandler } from "../utils/csv-handler";
import { DateUtils } from "../utils/date-utils";
import { reporteTicketsCobranzas } from "../utils/handler-files";
import { enviarCorreo } from "../utils/handler-mail";
import { Logger } from "../utils/logger";

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

export class CobranzasService {

    private logger = new Logger('ClientTicketAutomation');
    private csvHandler = new CsvHandler();
    private dateUtils = new DateUtils();

    /**
   * Procesa la lista de clientes cortados para un periodo específico
   */
    async processDisconnectedClients(
        quantity: number,
        unit: "days" | "months",
        description: string
    ): Promise<ClientOffData[]> {
        try {
            const date = this.dateUtils.getModifiedDate(quantity, unit);

            const automation = new ContractStateDailyExportAutomation(
                date,
                'Cortado',
                `clientes_cortados_${description}`,
                'csv',
                'RPA_Clientes_Cortados'
            );

            const filePath = await automation.run();

            if (!filePath) {
                this.logger.warn(`No se encontró archivo para clientes cortados (${description})`);
                return [];
            }

            this.logger.info(`Lista de clientes (${description}) descargada desde: ${filePath}`);
            return await this.csvHandler.readClientDataFromCsv(filePath);
        } catch (error) {
            this.logger.error(`Error al procesar clientes cortados (${description})`, error);
            return [];
        }
    }

    /**
   * Elimina clientes duplicados de la lista
   */
    private removeDuplicateClients(clients: ClientOffData[]): ClientOffData[] {
        const processedCodes = new Set<string>();
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
    async fetchDisconnectedClients(): Promise<ClientOffData[]> {
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
        } catch (error) {
            this.logger.error('Error al obtener datos de clientes cortados', error);
            return [];
        }
    }


    /**
       * Verifica si los clientes ya tienen tickets existentes
       */
    async checkExistingTickets(clients: ClientOffData[]): Promise<ClientTicketSummary[]> {
        this.logger.info('Verificando tickets existentes para los clientes...');

        const tickets: ClientTicketSummary[] = [];

        for (const client of clients) {
            const fechaInicio = this.getStartDateByDescription(client.descripcion || "1 mes");
            const fechaFin = this.dateUtils.getCurrentDate();

            this.logger.info(`Verificando tickets para: ${client.Código} desde ${fechaInicio} hasta ${fechaFin} (${client.descripcion})`);

            try {
                const ticketAutomation = new TicketPerContractAutomation(
                    client.Código,
                    fechaInicio,
                    fechaFin
                );

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
            } catch (error) {
                this.logger.error(`Error al verificar tickets para ${client.Código}`, error);
            }
        }

        return tickets;
    }


    /**
      * Determina la fecha de inicio según la descripción del periodo
      */
    private getStartDateByDescription(description: string): string {
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
    private filterValidTickets(tickets: any[] | null): any[] {
        return (tickets ?? []).filter(ticket =>
            Array.isArray(ticket) &&
            ticket.length > 0 &&
            ticket.some((field: string) => field.trim() !== '')
        );
    }

    /**
    * Filtra clientes que no tienen tickets existentes
    */
    filterClientsWithoutTickets(
        allClients: ClientOffData[],
        clientsWithTickets: ClientTicketSummary[]
    ): ClientOffData[] {
        return allClients.filter(client =>
            !clientsWithTickets.some(ticket => ticket.Código === client.Código)
        );
    }


    /**
       * Genera y envía el reporte de tickets existentes
       */
    async generateAndSendReport(ticketsList: ClientTicketSummary[]): Promise<void> {
        this.logger.info('Generando reporte de tickets existentes...');

        try {
            const formattedTickets = ticketsList.map(ticket => ({
                Código: ticket.Código,
                Descripcion: ticket.Descripcion,
                Cantidad: ticket.Cantidad,
                Resultado: ticket.Detalles.map(d => `{${d.Código}, ${d.FechaInicio}, ${d.Estado}}`).join(' | ')
            }));

            // Generar reporte de tickets
            await reporteTicketsCobranzas(formattedTickets, CONFIG.REPORT_PATH);

            // Enviar reporte por correo
            await enviarCorreo(
                CONFIG.EMAIL_RECIPIENTS.to[0],
                CONFIG.EMAIL_RECIPIENTS.cc,
                CONFIG.EMAIL_RECIPIENTS.bcc,
                CONFIG.REPORT_PATH,
                CONFIG.EMAIL_BODY,
                CONFIG.EMAIL_SUBJECT
            );

            this.logger.info('Reporte enviado correctamente');
        } catch (error) {
            this.logger.error('Error al generar o enviar el reporte', error);
        }
    }



    /**
       * Genera nuevos tickets para los clientes que no tienen tickets existentes
       */
    async generateNewTickets(clients: ClientOffData[]): Promise<void> {
        if (clients.length === 0) {
            this.logger.info('No hay clientes que requieran nuevos tickets');
            return;
        }

        this.logger.info(`Generando tickets para ${clients.length} clientes...`);

        for (const client of clients) {
            this.logger.info(`Generando ticket para: ${client.Cliente || client.Código} (${client.descripcion})`);

            try {
                const today = this.dateUtils.formatDateForTitle();

                const ticketCreation = new CreateTicketPerContractAutomation(
                    client.Código,
                    {
                        user: client.Cedula,
                        title: `RPA ${today}: Corte clientes por ${client.descripcion}`,
                        team: 'PAGOS Y COBRANZAS',
                        assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                        channel: 'PERSONALIZADO',
                        category: 'Pagos y cobranzas',
                        tag: '',
                    }
                );

                await ticketCreation.run();
                this.logger.info(`Ticket generado exitosamente para: ${client.Cliente || client.Código}`);
            } catch (error) {
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
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}