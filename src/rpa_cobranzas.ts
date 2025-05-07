import { ContractStateDailyExportAutomation, CreateTicketPerContractAutomation } from './controller/contract.controller';
import { ClientOffData } from './core/interfaces/interface-client';
import { enviarCorreo }  from './utils/handler-mail';
import fs from 'fs';
import csvParser from 'csv-parser';
import { TicketPerContractAutomation } from './controller/ticket.controller';
import { reporteTicketsCobranzas } from './utils/handler-files';



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
        
        const automation = new ContractStateDailyExportAutomation(
            fecha,
            'Cortado',
            'clientes_cortados',
            'csv',
            'RPA_Clientes_Cortados'
        );
        
        const filePath = await automation.run();
        
    
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
        
        
        // Reiniciar clientsData y agregar datos de prueba
        
        let tickets: { Código: string, Descripcion: string, Cantidad: number, Detalles: any[] }[] = [];

        for (const client of clientsData) {  // Cambiado de "for...in" a "for...of"
            let fechaInicio: string;
            const fechaFin = new Date().toISOString().split('T')[0]; // Fecha actual

            switch (client.descripcion) {
                case "5 días":
                    fechaInicio = obtenerFechaModificada(5, "days");
                    break;
                case "20 días":
                    fechaInicio = obtenerFechaModificada(20, "days");
                    break;
                case "1 mes":
                    fechaInicio = obtenerFechaModificada(1, "months");
                    break;
                default:
                    fechaInicio = obtenerFechaModificada(1, "months");
                    break;
            }

            console.log(`🎟 Generando ticket para: ${client.Código} desde ${fechaInicio} hasta ${fechaFin} (${client.descripcion})`);

            try {
                
                const  ticketAutomation = new TicketPerContractAutomation(
                    client.Código,
                    fechaInicio,
                    fechaFin
                ); 

                // Ejecutar la automatización y esperar el resultado
                const result = await ticketAutomation.run(); // Cambiado de "runCreateTicket.run()" a "ticketAutomation.run()"

                // Filtrar registros válidos
                const registrosValidos = (result ?? []).filter(ticket => 
                    Array.isArray(ticket) && ticket.length > 0 && ticket.some((field: string) => field.trim() !== '')
                );
                console.log(`✅ ${registrosValidos.length} tickets válidos encontrados para ${client.Código}`);

                if (registrosValidos.length > 0) {
                    console.log('📋 Detalles de los tickets:');
                    tickets.push({
                        Código: client.Código,
                        Descripcion: client.descripcion,
                        Cantidad: registrosValidos.length,
                        Detalles: registrosValidos.map(ticket => ({
                            Código: ticket[1] || "N/A",  // Código del ticket
                            FechaInicio: ticket[5] || "N/A",  // Fecha de inicio
                            Estado: ticket[8] || "N/A"   // Estado del ticket
                        }))
                    });
                }
            } catch (error) {
                console.error(`❌ Error al generar ticket para ${client.Código}:`, error);
            }
        }

        // 🛑 Eliminar de clientsData aquellos clientes que no generaron tickets
        clientsData = clientsData.filter(client => 
            !tickets.some(ticket => ticket.Código === client.Código)
        );

        // 📋 Verificar si se generaron tickets antes de imprimir
        if (tickets.length > 0) {
            console.log('📋 Lista de tickets generados:');
            console.table(tickets.map(ticket => ({
                Código: ticket.Código,
                Descripcion: ticket.Descripcion,
                Cantidad: ticket.Cantidad,
                Resultado: ticket.Detalles.map(d => `{${d.Código}, ${d.FechaInicio}, ${d.Estado}}`).join(' | ') // Formato esperado
            })));
        } else {
            console.log("⚠️ No se generaron tickets válidos.");
        }


        console.log("Clientes para generar tickets");
        console.table(clientsData);

        console.log("Clientes con tickets generados");
        console.table(tickets);

        const formattedTickets = tickets.map(ticket => ({
            Código: ticket.Código,
            Descripcion: ticket.Descripcion,
            Cantidad: ticket.Cantidad,
            Resultado: ticket.Detalles.map(d => `{${d.Código}, ${d.FechaInicio}, ${d.Estado}}`).join(' | ')
        }));

        reporteTicketsCobranzas(formattedTickets, './src/Files/ticketsCobranzas.pdf'); // Generar reporte de tickets
        enviarCorreo(
            'djimenez@nettplus.net',
            [], 
            ['bherrera@nettplus.net', 'kyaruqui@nettplus.net'],
            './src/Files/ticketsCobranzas.pdf', 
            'Clientes con tickets generados antes del flujo de cobranzas. /n Se recomienda revisar los tickets generados.', 
            '#Clientes Con Tickets Generados'); // Enviar reporte por correo
            

        

        // Generar tickets de manera secuencial
        for (const cliente of clientsData) {
            console.log(`🎟 Generando ticket para: ${cliente.Cliente} (${cliente.descripcion})`);

            try {
                await generarTickets([cliente], cliente.descripcion); // Generar el ticket para el cliente
                console.log(`✅ Ticket generado exitosamente para: ${cliente.Cliente} (${cliente.descripcion})`);
            } catch (error) {
                console.error(`❌ Error al generar ticket para ${cliente.Cliente} (${cliente.descripcion}):`, error);
                // Si hay un error, agregar el cliente a la lista de errores
            }

            console.log('⏳ Esperando 30 segundos antes de procesar el siguiente ticket...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 30 segundos
        }

        
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

            const runCreateTicket = new CreateTicketPerContractAutomation(
                cliente.Código,
                {
                    user: cliente.Cedula,
                    title: `RPA  ${today}: Corte clientes por ${descripcion}`,
                    team: 'PAGOS Y COBRANZAS',
                    assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                    channel: 'PERSONALIZADO',
                    category: 'Pagos y cobranzas',
                    tag: '',
                }
            );
            await runCreateTicket.run(); // Ejecutar el proceso de creación de tickets

        } catch (error) {
            console.error(`❌ Error al generar ticket para ${cliente.Cliente}:`, error);
        }

        console.log('⏳ Esperando 30 segundos antes de procesar el siguiente ticket...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay de 2 segundos
    }

    console.log(`✅ Todos los tickets para (${descripcion}) han sido generados correctamente.`);
    
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
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`❌ Error al eliminar el archivo ${filePath}:`, err);
                    } else {
                        console.log(`🗑️ Archivo ${filePath} eliminado correctamente.`);
                    }
                });
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
}


// 🔥 Ejecutar la automatización
generateTicketsForCortados().catch(console.error);