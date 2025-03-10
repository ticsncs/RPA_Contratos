import { runAutomation } from './rpa_create_ticket';
import { runClientExportAutomation } from './rpa_clientes_cortados_x_fecha';
import { ClientOffData } from './core/interfaces/interface-client';
import { loadGeneratedTickets, saveGeneratedTickets } from '../src/utils/handler-bdTemporal';
import fs from 'fs';
import csvParser from 'csv-parser';
import PDFDocument from 'pdfkit';
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
    const errores: { Cliente: string, Codigo: string, Descripcion: string }[] = [];  // Para almacenar clientes con errores

    try {
        console.log('🔍 Obteniendo lista de clientes cortados...');

        // Obtener listas de clientes en diferentes intervalos
        const [clientsData5, clientsData20, clientsDataMes] = await Promise.all([
            procesarClientesCortados(5, "days", "5_dias"),
            procesarClientesCortados(20, "days", "20_dias"),
            procesarClientesCortados(1, "months", "1_mes"),
        ]);

        // Combinamos todas las listas y agregamos la descripción
        let clientsData = [
            ...clientsData5.map(client => ({ ...client, descripcion: "5 días" })),
            ...clientsData20.map(client => ({ ...client, descripcion: "20 días" })),
            ...clientsDataMes.map(client => ({ ...client, descripcion: "1 mes" }))
        ];

        // Depuramos para eliminar clientes duplicados
        const processedCodes = new Set<string>(); // Para almacenar los códigos de los clientes procesados
        clientsData = clientsData.filter(client => {
            if (processedCodes.has(client.Código)) {
                return false;
            }
            processedCodes.add(client.Código); // Marcamos el cliente como procesado
            return true;
        });

        if (clientsData.length === 0) {
            console.log('⚠️ No se encontraron clientes cortados.');
            return;
        }

        console.log(`✅ ${clientsData.length} clientes cortados únicos encontrados.`);
    
        console.table(clientsData5);
        console.table(clientsData20);
        console.table(clientsDataMes);

        // Ejecutar robots de creación de tickets 
        console.log('🤖 Iniciando creación de tickets...')
        // Generar tickets en paralelo
        
        
        

        // Generar tickets de manera secuencial
        for (const cliente of clientsData) {
            console.log(`🎟 Generando ticket para: ${cliente.Cliente} (${cliente.descripcion})`);

            try {
                await generarTickets([cliente], cliente.descripcion); // Generar el ticket para el cliente
                console.log(`✅ Ticket generado exitosamente para: ${cliente.Cliente} (${cliente.descripcion})`);
            } catch (error) {
                console.error(`❌ Error al generar ticket para ${cliente.Cliente} (${cliente.descripcion}):`, error);
                // Si hay un error, agregar el cliente a la lista de errores
                errores.push({
                    Cliente: cliente.Cliente,
                    Codigo: cliente.Código,
                    Descripcion: cliente.descripcion
                });
            }

            console.log('⏳ Esperando 30 segundos antes de procesar el siguiente ticket...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 30 segundos
        }

        

        // Si hubo errores, generar el PDF
        if (errores.length > 0) {
            console.log('📑 Generando PDF con los errores...');
            await generarPDFConErrores(errores); // Llamamos a la función para crear el PDF
        }

        console.log('✅ Todos los tickets han sido generados correctamente.');
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    }
}

/**
 * Función para generar un PDF con los clientes que tuvieron errores al generar su ticket.
 */
async function generarPDFConErrores(errores: { Cliente: string, Codigo: string, Descripcion: string }[]) {
    const doc = new PDFDocument();
    const filePath = './errores_ticket.pdf';

    // Establecer las opciones para el archivo PDF
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(16).text('Clientes con Errores en la Generación de Tickets', { align: 'center' });

    // Agregar una tabla de errores
    doc.fontSize(12).text('Clientes con errores:', { align: 'left' });
    doc.moveDown(1);
    doc.text('Nombre Cliente  |  Código Cliente  |  Descripción', { align: 'left' });

    // Añadir los errores al PDF
    errores.forEach((error) => {
        doc.text(`${error.Cliente}  |  ${error.Codigo}  |  ${error.Descripcion}`, { align: 'left' });
    });

    // Finalizar el archivo PDF
    doc.end();
    console.log(`📂 PDF de errores generado en: ${filePath}`);
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
           const clientes = await runAutomation(
            cliente.Código,
            {
                user: cliente.Cedula,
                title: `RPA  ${today}: Corte clientes por ${descripcion}`,
                team: 'PAGOS Y COBRANZAS',
                assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                channel: 'PERSONALIZADO',
                category: 'Pagos y cobranzas',
                tag: '',
            },
            "Cortado"
        );

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
        await new Promise(resolve => setTimeout(resolve, 5000)); // Delay de 30 segundos
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
                    Codigo: data['Código'] || data.Codigo || '',
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