import { runAutomation } from './rpa_create_ticket';
import { runCutUsersExport } from './rpa_cut_users_by_date';
import { runSearchTickets } from './rpa_search_tickets_by_date';
import { ClientOffData } from './core/interfaces/interface-client';
import { saveGeneratedTickets } from '../src/utils/handler-bdTemporal';
import { reporteTicketsCobranzas } from './utils/handler-files';
import { enviarCorreo } from './utils/handler-mail';
import fs from 'fs';
import csvParser from 'csv-parser';

// Types
type TimeUnit = "days" | "months";
type TicketDetail = {
  Código: string;
  FechaInicio: string;
  Estado: string;
};
type TicketSummary = {
  Código: string;
  Descripcion: string;
  Cantidad: number;
  Detalles: TicketDetail[];
};
type FormattedTicket = {
  Código: string;
  Descripcion: string;
  Cantidad: number;
  Resultado: string;
};

// Constants
const DELAY_BETWEEN_TICKETS_MS = 5000;
const EMAIL_RECIPIENT = 'djimenez@nettplus.net';
const REPORT_FILE_PATH = './src/Files/ticketsCobranzas.pdf';
const TIME_PERIODS = [
  { days: 5, unit: "days" as TimeUnit, description: "5 días" },
  { days: 20, unit: "days" as TimeUnit, description: "20 días" },
  { days: 1, unit: "months" as TimeUnit, description: "1 mes" }
];

/**
 * Gets a date in "YYYY-MM-DD" format by subtracting days or months from current date
 */
const getModifiedDate = (amount: number, unit: TimeUnit): string => {
  const date = new Date();
  unit === "days" ? date.setDate(date.getDate() - amount) : date.setMonth(date.getMonth() - amount);
  return date.toISOString().split('T')[0];
};

/**
 * Gets today's date in Spanish format (DD/MM/YYYY)
 */
const getTodayFormatted = (): string => {
  return new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Downloads client list file using RPA
 */
async function downloadFileRPA(status: string, exportTemplate: string, fileName: string, cutoffDate: string): Promise<string | null> {
  try {
    console.log(`📥 Descargando archivo de clientes con estado: ${status}...`);
    const result = await runCutUsersExport(status, exportTemplate, fileName, cutoffDate);
    return result ?? null;
  } catch (error) {
    console.error('❌ Error al descargar archivo:', error);
    return null;
  }
}

/**
 * Reads and processes a CSV file, normalizing client data
 */
async function readCSV(filePath: string): Promise<ClientOffData[]> {
  return new Promise((resolve, reject) => {
    const results: ClientOffData[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        const normalizedData: ClientOffData = {
          ...data,
          FechaCorte: data['Fecha de Corte'] || data.FechaCorte || '',
          Cedula: (data['Cliente'] || data.Cedula || '').substring(0, 13).replace(/\D/g, ''),
          Codigo: data['Código'] || data.Codigo || '',
        };
        results.push(normalizedData);
      })
      .on('end', () => {
        console.log(`✅ Archivo CSV (${filePath}) procesado correctamente.`);
        deleteFile(filePath);
        resolve(results);
      })
      .on('error', (error) => reject(error));
  });
}

/**
 * Deletes a file and logs the result
 */
function deleteFile(filePath: string): void {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`❌ Error al eliminar el archivo ${filePath}:`, err);
    } else {
      console.log(`🗑️ Archivo ${filePath} eliminado correctamente.`);
    }
  });
}

/**
 * Downloads and processes the list of clients with cut service
 */
async function processCutClients(days: number, unit: TimeUnit, description: string): Promise<ClientOffData[]> {
  try {
    const date = getModifiedDate(days, unit);
    const filePath = await downloadFileRPA("Cortado", "RPA_Clientes_Cortados", `clientes_cortados_${description}`, date);

    if (!filePath) {
      console.warn(`⚠️ No se encontró archivo para clientes cortados (${description}).`);
      return [];
    }

    console.log(`📂 Lista de clientes (${description}) descargada desde: ${filePath}`);
    return await readCSV(filePath);
  } catch (error) {
    console.error(`❌ Error al procesar clientes cortados (${description}):`, error);
    return [];
  }
}

/**
 * Formats ticket details into a string representation
 */
function formatTicketDetails(details: TicketDetail[]): string {
  return details.map(d => `{${d.Código}, ${d.FechaInicio}, ${d.Estado}}`).join(' | ');
}

/**
 * Searches for existing tickets for a client
 */
async function searchClientTickets(clientCode: string, description: string): Promise<TicketDetail[]> {
  const endDate = new Date().toISOString().split('T')[0];
  let startDate: string;

  switch (description) {
    case "5 días":
      startDate = getModifiedDate(5, "days");
      break;
    case "20 días":
      startDate = getModifiedDate(20, "days");
      break;
    case "1 mes":
      startDate = getModifiedDate(1, "months");
      break;
    default:
      startDate = getModifiedDate(1, "months");
      break;
  }

  console.log(`🔍 Buscando tickets para: ${clientCode} desde ${startDate} hasta ${endDate} (${description})`);

  try {
    const result = await runSearchTickets(clientCode, startDate, `${endDate} 23:59:59`);

    if (!Array.isArray(result)) {
      console.warn(`⚠️ Resultado inválido para ${clientCode}`);
      return [];
    }

    // Filter valid records
    const validRecords = result.filter(ticket =>
      Array.isArray(ticket) && ticket.length > 0 && ticket.some((field: string) => field.trim() !== '')
    );

    console.log(`✅ ${validRecords.length} tickets válidos encontrados para ${clientCode}`);

    return validRecords.map(ticket => ({
      Código: ticket[1] || "N/A",
      FechaInicio: ticket[5] || "N/A",
      Estado: ticket[8] || "N/A"
    }));
  } catch (error) {
    console.error(`❌ Error al buscar tickets para ${clientCode}:`, error);
    return [];
  }
}

/**
 * Creates a ticket for a single client
 */
async function createTicketForClient(client: ClientOffData, description: string): Promise<boolean> {
  const today = getTodayFormatted();
  console.log(`🎟 Generando ticket para: ${client.Cliente || client.Código} (${description})`);

  try {
    const result = await runAutomation(
      client.Código,
      {
        user: client.Cedula,
        title: `RPA ${today}: Corte clientes por ${description}`,
        team: 'PAGOS Y COBRANZAS',
        assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
        channel: 'PERSONALIZADO',
        category: 'Pagos y cobranzas',
        tag: '',
      },
      "Cortado"
    );

    if (result === false) {
      saveGeneratedTickets(`${client.Cliente || client.Código} (${description}) - Error al generar ticket`);
      console.error(`❌ Error al generar ticket para ${client.Cliente || client.Código} (${description})`);
      return false;
    }

    console.log(`✅ Ticket generado exitosamente para: ${client.Cliente || client.Código}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al generar ticket para ${client.Cliente || client.Código}:`, error);
    return false;
  }
}

/**
 * Creates tickets for a list of clients sequentially
 */
async function createTicketsSequentially(clients: ClientOffData[], description: string): Promise<void> {
  if (clients.length === 0) {
    console.log(`⚠️ No hay clientes para generar tickets (${description}).`);
    return;
  }

  console.log(`🤖 Iniciando creación secuencial de tickets (${description})...`);

  for (const client of clients) {
    await createTicketForClient(client, description);
    console.log(`⏳ Esperando ${DELAY_BETWEEN_TICKETS_MS/1000} segundos antes de procesar el siguiente ticket...`);
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TICKETS_MS));
  }

  console.log(`✅ Todos los tickets para (${description}) han sido generados correctamente.`);
}

/**
 * Generates a report and sends an email with the results
 */
function generateReportAndSendEmail(tickets: FormattedTicket[]): void {
  reporteTicketsCobranzas(tickets, REPORT_FILE_PATH);
  enviarCorreo(
    EMAIL_RECIPIENT, 
    [], 
    [],
    REPORT_FILE_PATH, 
    'Clientes con tickets generados antes del flujo de cobranzas. \n Se recomienda revisar los tickets generados.', 
    '#Clientes Con Tickets Generados'
  );
  console.log(`📧 Reporte enviado a ${EMAIL_RECIPIENT}`);
}

/**
 * Main function to generate tickets for clients with cut service
 */
async function generateTicketsForCutClients(): Promise<void> {
  try {
    console.log('🔍 Obteniendo lista de clientes cortados...');

    // Process clients from different time periods
    const clientLists = await Promise.all(
      TIME_PERIODS.map(period => 
        processCutClients(period.days, period.unit, period.description.replace(' ', '_'))
      )
    );

    // Add description to each client and combine lists
    let allClients = TIME_PERIODS.reduce((acc, period, index) => {
      return [
        ...acc,
        ...clientLists[index].map(client => ({ ...client, descripcion: period.description }))
      ];
    }, [] as (ClientOffData & { descripcion: string })[]);

    // Remove duplicates
    const processedCodes = new Set<string>();
    allClients = allClients.filter(client => {
      if (processedCodes.has(client.Código)) {
        return false;
      }
      processedCodes.add(client.Código);
      return true;
    });

    if (allClients.length === 0) {
      console.log('⚠️ No se encontraron clientes cortados.');
      return;
    }

    console.log(`✅ ${allClients.length} clientes cortados únicos encontrados.`);
    
    // Log client lists for each period
    TIME_PERIODS.forEach((period, index) => {
      console.log(`📋 Clientes con corte de ${period.description}:`);
      console.table(clientLists[index]);
    });

    // Search for existing tickets
    console.log('🔍 Buscando tickets existentes...');
    const ticketSummaries: TicketSummary[] = [];

    for (const client of allClients) {
      const ticketDetails = await searchClientTickets(client.Código, client.descripcion);
      
      if (ticketDetails.length > 0) {
        ticketSummaries.push({
          Código: client.Código,
          Descripcion: client.descripcion,
          Cantidad: ticketDetails.length,
          Detalles: ticketDetails
        });
      }
    }

    // Filter out clients that already have tickets
    const clientsForTickets = allClients.filter(client => 
      !ticketSummaries.some(ticket => ticket.Código === client.Código)
    );

    // Format tickets for reporting
    if (ticketSummaries.length > 0) {
      console.log('📋 Lista de tickets existentes:');
      
      const formattedTickets: FormattedTicket[] = ticketSummaries.map(ticket => ({
        Código: ticket.Código,
        Descripcion: ticket.Descripcion,
        Cantidad: ticket.Cantidad,
        Resultado: formatTicketDetails(ticket.Detalles)
      }));
      
      console.table(formattedTickets);
      generateReportAndSendEmail(formattedTickets);
    } else {
      console.log("⚠️ No se encontraron tickets existentes.");
    }

    // Generate new tickets
    console.log(`🎟 Clientes para generar tickets: ${clientsForTickets.length}`);
    console.table(clientsForTickets);

    await createTicketsSequentially(clientsForTickets, "todos");
    
    console.log('✅ Proceso completado exitosamente.');
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

// Execute the automation
generateTicketsForCutClients().catch(console.error);