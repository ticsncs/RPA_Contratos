import { interactWithElement } from './utils/handler-elements';
import { login } from './core/login';
import { downloadFile } from './utils/handler-files';
import { runAutomation } from './rpa_create_ticket';
import { runClientExportAutomation } from './rpa_clientes_cortados';
import { ClientOffData } from './core/interfaces/interface-client';
import fs from 'fs';
import csvParser from 'csv-parser';

/**
 * Función para convertir una fecha en formato "YYYY-MM-DD" a un objeto Date.
 */
function parseFechaCorte(dateString: string): Date | null {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
        console.log(`❌ Formato de fecha inválido: "${dateString}"`);
        return null;
    }
    
    const [year, month, day] = dateString.split('-').map(Number);
    const fecha = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(fecha.getTime())) {
        console.log(`❌ No se pudo convertir la fecha: "${dateString}"`);
        return null;
    }

    return fecha;
}

/**
 * Función para obtener la lista de clientes cortados y generar tickets automáticamente.
 */
async function generateTicketsForCortados() {
    try {
        console.log('🔍 Obteniendo lista de clientes cortados...');
        
        const csvFilePath = await downloadFileRPA('Cortado', 'RPA_Clientes_Cortados', 'clientes_cortados');
        
        if (!csvFilePath) {
            console.error('❌ No se pudo descargar la lista de clientes cortados.');
            return;
        }

        console.log('📂 Lista de clientes descargada:', csvFilePath);

        const clientsData: ClientOffData[] = await readCSV(csvFilePath);

        if (clientsData.length === 0) {
            console.log('⚠️ No se encontraron clientes cortados.');
            return;
        }

        console.log(`✅ ${clientsData.length} clientes cortados encontrados.`);

        const fechaHoy = new Date();

        const fecha5Dias = new Date(fechaHoy);
        fecha5Dias.setDate(fecha5Dias.getDate() - 5);

        const fecha20Dias = new Date(fechaHoy);
        fecha20Dias.setDate(fecha20Dias.getDate() - 20);

        const fecha1Mes = new Date(fechaHoy);
        fecha1Mes.setMonth(fecha1Mes.getMonth() - 1);

        const clientes5Dias = clientsData.filter(cliente => {
            const fechaCorte = parseFechaCorte(cliente.FechaCorte);
            return fechaCorte && fechaCorte < fecha5Dias;
        });

        console.log(`Clientes con fecha de corte hace 5 días: ${clientes5Dias.length}`);
        console.table(clientes5Dias);

        const clientes20Dias = clientsData.filter(cliente => {
            const fechaCorte = parseFechaCorte(cliente.FechaCorte);
            return fechaCorte && fechaCorte < fecha20Dias;
        });

        console.log(`Clientes con fecha de corte hace 20 días: ${clientes20Dias.length}`);
        console.table(clientes20Dias);

        const clientes1Mes = clientsData.filter(cliente => {
            const fechaCorte = parseFechaCorte(cliente.FechaCorte);
            return fechaCorte && fechaCorte < fecha1Mes;
        });

        console.log(`Clientes con fecha de corte hace 1 mes: ${clientes1Mes.length}`);
        console.table(clientes1Mes);

        // Ejecutar robots de creación de tickets 
        console.log('🤖 Iniciando creación de tickets...')
        
        for (const cliente of clientes5Dias) {
            await runAutomation(
                cliente.Cliente,
                {
                user: cliente.Cedula,
                title: 'RPA : Corte clientes por 5 dias',
                team: 'PAGOS Y COBRANZAS',
                assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                channel: 'PERSONALIZADO',
                category: 'Pagos y cobranzas',
                tag: '',
                });
        }

        for (const cliente of clientes20Dias) {
            await runAutomation(
                cliente.Cliente,
                {
                user: cliente.Cedula,
                title: 'RPA : Corte clientes por 20 dias',
                team: 'PAGOS Y COBRANZAS',
                assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                channel: 'PERSONALIZADO',
                category: 'Pagos y cobranzas',
                tag: '',
                });
        }

        for (const cliente of clientes1Mes) {
            await runAutomation(
                cliente.Cliente,
                {
                user: cliente.Cedula,
                title: 'RPA : Corte clientes por 1 mes',
                team: 'PAGOS Y COBRANZAS',
                assignedUser: 'JIMENEZ ZHINGRE DANIEL ALEJANDRO',
                channel: 'PERSONALIZADO',
                category: 'Pagos y cobranzas',
                tag: '',
                });
        }
        
        console.log('✅ Todos los tickets han sido generados correctamente.');
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    }
}

/**
 * Función para descargar la lista de clientes cortados desde Odoo.
 */
async function downloadFileRPA(status: string, exportTemplate: string, fileName: string) {
    try {
        console.log(`📥 Descargando archivo de clientes con estado: ${status}...`);
        return await runClientExportAutomation(status, exportTemplate, fileName);
    } catch (error) {
        console.error('❌ Error al descargar archivo:', error);
        return null;
    }
}

/**
 * Función para leer el archivo CSV y extraer la información de los clientes.
 */
async function readCSV(filePath: string): Promise<ClientOffData[]> {
    return new Promise((resolve, reject) => {
        const results: ClientOffData[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                // 🔹 Normalizar nombres de columnas
                const normalizedData: ClientOffData = {
                    ...data,
                    FechaCorte: data['Fecha de Corte'] || data.FechaCorte || '',
                    Cedula: (data['Cliente'] || data.Cedula || '').substring(0, 13).replace(/\D/g, ''), // Remove non-numeric characters
                };
                results.push(normalizedData);
            })
            .on('end', () => {
                console.log('✅ Archivo CSV procesado correctamente.');
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
}


// 🔥 Ejecutar la automatización
generateTicketsForCortados().catch(console.error);
