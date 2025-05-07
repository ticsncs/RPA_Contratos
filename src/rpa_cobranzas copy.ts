/**
 * @file index.ts
 * @description Sistema automatizado para gestionar tickets de clientes con servicio cortado
 */

import { ContractStateDailyExportAutomation, CreateTicketPerContractAutomation } from './controller/contract.controller';
import { ClientOffData, TicketDetails, ClientTicketSummary } from './core/interfaces/interface-client';
import { enviarCorreo } from './utils/handler-mail';
import { reporteTicketsCobranzas } from './utils/handler-files';
import { TicketPerContractAutomation } from './controller/ticket.controller';


// Constantes de configuración
const CONFIG = {
  TICKET_GENERATION_DELAY_MS: 5000,
  EMAIL_RECIPIENTS: {
    to: ['djimenez@nettplus.net'],
    cc: [],
    bcc: ['bherrera@nettplus.net', 'kyaruqui@nettplus.net']
  },
  REPORT_PATH: './src/Files/ticketsCobranzas.pdf',
  EMAIL_SUBJECT: '#Clientes Con Tickets Generados',
  EMAIL_BODY: 'Clientes con tickets generados antes del flujo de cobranzas.\nSe recomienda revisar los tickets generados.'
};

/**
 * Clase principal para la automatización de tickets por corte de servicio
 */
class ClientTicketAutomation {
  private logger = new Logger('ClientTicketAutomation');
  private csvHandler = new CsvHandler();
  private dateUtils = new DateUtils();

  /**
   * Ejecuta el proceso completo de generación de tickets
   */
  public async execute(): Promise<void> {
    try {
      this.logger.info('Iniciando proceso de generación de tickets para clientes cortados');
      
      // Obtener datos de clientes cortados
      const clientsData = await this.fetchDisconnectedClients();
      
      if (clientsData.length === 0) {
        this.logger.warn('No se encontraron clientes cortados para procesar');
        return;
      }
      
      this.logger.info(`Se encontraron ${clientsData.length} clientes cortados para procesar`);
      
      // Buscar tickets existentes
      const clientsWithTickets = await this.checkExistingTickets(clientsData);
      
      // Filtrar clientes sin tickets existentes
      const clientsForNewTickets = this.filterClientsWithoutTickets(clientsData, clientsWithTickets);
      
      // Generar reporte de tickets existentes
      if (clientsWithTickets.length > 0) {
        await this.generateAndSendReport(clientsWithTickets);
      }
      
      // Generar nuevos tickets
      await this.generateNewTickets(clientsForNewTickets);
      
      this.logger.info('Proceso de generación de tickets completado exitosamente');
    } catch (error) {
      this.logger.error('Error en el proceso principal de generación de tickets', error);
    }
  }

  /**
   * Obtiene los datos de clientes con servicio cortado en diferentes periodos
   */
  private async fetchDisconnectedClients(): Promise<ClientOffData[]> {
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
   * Procesa la lista de clientes cortados para un periodo específico
   */
  private async processDisconnectedClients(
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
   * Verifica si los clientes ya tienen tickets existentes
   */
  private async checkExistingTickets(clients: ClientOffData[]): Promise<ClientTicketSummary[]> {
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
   * Filtra clientes que no tienen tickets existentes
   */
  private filterClientsWithoutTickets(
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
  private async generateAndSendReport(ticketsList: ClientTicketSummary[]): Promise<void> {
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
  private async generateNewTickets(clients: ClientOffData[]): Promise<void> {
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
      this.logger.info(`Esperando ${CONFIG.TICKET_GENERATION_DELAY_MS/1000} segundos antes de procesar el siguiente ticket...`);
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

// Archivo de utilidades para fechas
export class DateUtils {
  /**
   * Obtiene una fecha en formato "YYYY-MM-DD" restando días o meses
   */
  public getModifiedDate(quantity: number, unit: "days" | "months"): string {
    const date = new Date();
    if (unit === "days") {
      date.setDate(date.getDate() - quantity);
    } else {
      date.setMonth(date.getMonth() - quantity);
    }
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  /**
   * Obtiene la fecha actual en formato "YYYY-MM-DD"
   */
  public getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Formatea la fecha actual para el título del ticket
   */
  public formatDateForTitle(): string {
    return new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }
}

// Archivo de utilidades para manejo de CSV
export class CsvHandler {
  private logger = new Logger('CsvHandler');
  private fs = require('fs');
  private csvParser = require('csv-parser');

  /**
   * Lee un archivo CSV y extrae la información de los clientes
   */
  public async readClientDataFromCsv(filePath: string): Promise<ClientOffData[]> {
    return new Promise((resolve, reject) => {
      const results: ClientOffData[] = [];

      this.fs.createReadStream(filePath)
        .pipe(this.csvParser())
        .on('data', (data: any) => {
          const normalizedData: ClientOffData = {
            ...data,
            FechaCorte: data['Fecha de Corte'] || data.FechaCorte || '',
            Cedula: (data['Cliente'] || data.Cedula || '').substring(0, 13).replace(/\D/g, ''),
            Código: data['Código'] || data.Codigo || '',
          };
          results.push(normalizedData);
        })
        .on('end', () => {
          this.logger.info(`Archivo CSV (${filePath}) procesado correctamente`);
          
          // Eliminar el archivo después de procesarlo
          this.fs.unlink(filePath, (err: Error) => {
            if (err) {
              this.logger.error(`Error al eliminar el archivo ${filePath}`, err);
            } else {
              this.logger.info(`Archivo ${filePath} eliminado correctamente`);
            }
          });
          
          resolve(results);
        })
        .on('error', (error: Error) => {
          this.logger.error(`Error al leer el archivo CSV ${filePath}`, error);
          reject(error);
        });
    });
  }
}

// Archivo de utilidades para logging
export class Logger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  public info(message: string): void {
    console.log(`ℹ️ [${this.context}] ${message}`);
  }
  
  public warn(message: string): void {
    console.warn(`⚠️ [${this.context}] ${message}`);
  }
  
  public error(message: string, error?: any): void {
    console.error(`❌ [${this.context}] ${message}`, error || '');
  }
  
  public success(message: string): void {
    console.log(`✅ [${this.context}] ${message}`);
  }
  
  public table(data: any): void {
    console.log(`📋 [${this.context}] Datos:`);
    console.table(data);
  }
}

// Ejecutar la automatización
const automation = new ClientTicketAutomation();
automation.execute().catch(error => {
  console.error('❌ Error fatal en la automatización:', error);
  process.exit(1);
});