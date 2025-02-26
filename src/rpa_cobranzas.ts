import { runAutomation } from './rpa_create_ticket';
import { runClientExportAutomation } from './rpa_clientes_cortados_x_fecha';
import { ClientOffData } from './core/interfaces/interface-client';
import { loadGeneratedTickets, saveGeneratedTickets } from '../src/utils/handler-bdTemporal';
import fs from 'fs';
import csvParser from 'csv-parser';
import { save } from 'pdfkit';

/**
 * Función para obtener una fecha en formato "YYYY-MM-DD" restando días o meses.
 */
const obtenerFechaModificada = (cantidad: number, unidad: "days" | "months"): string => {
    const fecha = new Date();
    unidad === "days" ? fecha.setDate(fecha.getDate() - cantidad) : fecha.setMonth(fecha.getMonth() - cantidad);
    return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

/**
 * Función para descargar y procesar la lista de clientes cortados.
 */
const procesarClientesCortados = async (dias: number, unidad: "days" | "months", descripcion: string) => {
    try {
        const fecha = obtenerFechaModificada(dias, unidad);
        const filePath = await downloadFileRPA("Cortado", "RPA_Clientes_Cortados", `clientes_cortados_${descripcion}`, fecha);

        if (!filePath) {
            console.warn(`⚠️ No se encontró archivo para clientes cortados (${descripcion}).`);
            return [];
        }

        console.log(`📂 Lista de clientes (${descripcion}) descargada desde: ${filePath}`);
        return await readCSV(filePath);
    } catch (error) {
        console.error(`❌ Error al procesar clientes cortados (${descripcion}):`, error);
        return [];
    }
};

/**
 * Función para obtener la lista de clientes cortados y generar tickets automáticamente.
 */
async function generateTicketsForCortados() {
    try {
        console.log('🔍 Obteniendo lista de clientes cortados...');

        // Obtener listas de clientes en diferentes intervalos
        const [clientsData5, clientsData20, clientsDataMes] = await Promise.all([
            procesarClientesCortados(5, "days", "5_dias"),
            procesarClientesCortados(20, "days", "20_dias"),
            procesarClientesCortados(1, "months", "1_mes"),
        ]);

        // Combinar todas las listas
        const clientsData = [...clientsData5, ...clientsData20, ...clientsDataMes];

        if (clientsData.length === 0) {
            console.log('⚠️ No se encontraron clientes cortados.');
            return;
        }


        console.log(`✅ ${clientsData.length} clientes cortados encontrados.`);


    
        console.table(clientsData5);
        console.table(clientsData20);
        console.table(clientsDataMes);

        // Ejecutar robots de creación de tickets 
        console.log('🤖 Iniciando creación de tickets...')
        // Generar tickets en paralelo
        await Promise.all([
            generarTickets(clientsData5, "5 días"),
            generarTickets(clientsData20, "20 días"), 
            generarTickets(clientsDataMes, "1 mes"),
        ]);

        console.log('✅ Todos los tickets han sido generados correctamente.');
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    }
}


/**
 * Función para generar tickets a partir de una lista de clientes de forma secuencial.
 * Se ejecuta un ticket cada 30 segundos para evitar saturar Odoo.
 */
async function generarTickets(clientes: ClientOffData[], descripcion: string) {
    
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (clientes.length === 0) {
        console.log(`⚠️ No hay clientes para generar tickets (${descripcion}).`);
        return;
    }

    console.log(`🤖 Iniciando creación secuencial de tickets (${descripcion})...`);

    for (const cliente of clientes) {
        console.log(`🎟 Generando ticket para: ${cliente.Cliente} (${descripcion})`);

        try {
           const clientes = await runAutomation(cliente.Cliente, {
                user: cliente.Cedula,
                title: `RPA  ${today}: Corte clientes por ${descripcion}`,
                team: 'PAGOS Y COBRANZAS',
                assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                channel: 'PERSONALIZADO',
                category: 'Pagos y cobranzas',
                tag: '',
            });

            if (clientes === false) {
                saveGeneratedTickets(`${cliente.Cliente} (${descripcion}) - Error al generar ticket`);
                console.error(`❌ Error al generar ticket para ${cliente.Cliente} (${descripcion})`);
                continue;
            }

            console.log(`✅ Ticket generado exitosamente para: ${cliente.Cliente}`);

        } catch (error) {
            console.error(`❌ Error al generar ticket para ${cliente.Cliente}:`, error);
        }

        console.log('⏳ Esperando 30 segundos antes de procesar el siguiente ticket...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Delay de 30 segundos
    }

    console.log(`✅ Todos los tickets para (${descripcion}) han sido generados correctamente.`);
}



/**
 * Función para descargar la lista de clientes cortados desde Odoo.
 */
async function downloadFileRPA(status: string, exportTemplate: string, fileName: string, fechaCorte: string): Promise<string | null> {
    try {
        console.log(`📥 Descargando archivo de clientes con estado: ${status}...`);
        const result = await runClientExportAutomation(status, exportTemplate, fileName, fechaCorte);
        return result ?? null;
    } catch (error) {
        console.error('❌ Error al descargar archivo:', error);
        return null;
    }
}


/**
 * Función para leer un archivo CSV y extraer la información de los clientes.
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
                };
                results.push(normalizedData);
            })
            .on('end', () => {
                console.log(`✅ Archivo CSV (${filePath}) procesado correctamente.`);
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
}

// 🔥 Ejecutar la automatización
generateTicketsForCortados().catch(console.error);