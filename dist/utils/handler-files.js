"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = downloadFile;
exports.generateReport = generateReport;
exports.reporteTicketsCobranzas = reporteTicketsCobranzas;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const config_1 = require("../core/config");
const handler_elements_1 = require("./handler-elements");
const xlsx_1 = __importDefault(require("xlsx"));
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function downloadFile(page, buttonSelector, filePrefix = 'archivo', ext = 'xlsx') {
    let attempts = 0;
    let downloadedFilePath = '';
    // Crear la carpeta de descargas si no existe
    if (!fs_1.default.existsSync(config_1.config.downloadPath)) {
        fs_1.default.mkdirSync(config_1.config.downloadPath, { recursive: true });
    }
    while (attempts < 2) {
        try {
            await wait(5000); // Esperar 2 segundos antes de iniciar la descarga
            const [download] = await Promise.all([
                // Esperar a que se inicie la descarga
                page.waitForEvent('download', { timeout: 80000 }),
                (0, handler_elements_1.interactWithElement)(page, buttonSelector, 'click'),
            ]);
            const originalFilePath = path_1.default.join(config_1.config.downloadPath, download.suggestedFilename());
            await download.saveAs(originalFilePath);
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
            const newFileName = `${filePrefix}_${timestamp}.${ext}`;
            downloadedFilePath = path_1.default.join(config_1.config.downloadPath, newFileName);
            fs_1.default.renameSync(originalFilePath, downloadedFilePath);
            console.log(`✅ Archivo descargado y renombrado: ${downloadedFilePath}`);
            return downloadedFilePath;
        }
        catch (err) {
            attempts++;
            console.log(`⚠️ Reintentando descarga (${attempts}/2)...`);
            if (attempts === 2) {
                throw new Error('No se pudo descargar el archivo después de dos intentos.');
            }
        }
    }
}
async function generateReport(filePath, reportTitle = 'Reporte de Datos', outputFilePrefix = 'Reporte') {
    return new Promise((resolve, reject) => {
        const emptyFieldsReport = [];
        const ext = path_1.default.extname(filePath).toLowerCase();
        if (ext === '.csv') {
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (row) => {
                if (row['Código']) {
                    const emptyFields = Object.keys(row).filter(key => String(row[key] || '').trim() === '');
                    if (emptyFields.length > 0) {
                        emptyFieldsReport.push({ codigo: row['Código'], campos: emptyFields, comercial: row['Comercial'], estado: row['Estado CT'], servicio: row['Servicio Internet']
                        });
                    }
                }
            })
                .on('end', async () => {
                await generatePDFReport(emptyFieldsReport, reportTitle, outputFilePrefix, resolve, reject);
            })
                .on('error', (error) => {
                reject(error);
            });
        }
        else if (ext === '.xlsx') {
            const workbook = xlsx_1.default.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
            sheet.forEach((row) => {
                if (row['Código']) {
                    const emptyFields = Object.keys(row).filter(key => String(row[key] || '').trim() === '');
                    if (emptyFields.length > 0) {
                        emptyFieldsReport.push({ codigo: row['Código'], campos: emptyFields, comercial: row['Comercial'], estado: row['Estado CT'], servicio: row['Servicio Internet']
                        });
                    }
                }
            });
            generatePDFReport(emptyFieldsReport, reportTitle, outputFilePrefix, resolve, reject);
        }
        else {
            reject(new Error('Unsupported file format.'));
        }
    });
}
async function generatePDFReport(emptyFieldsReport, reportTitle, outputFilePrefix, resolve, reject) {
    if (emptyFieldsReport.length > 0) {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
        const pdfFilePath = path_1.default.join(config_1.config.downloadPath, `${outputFilePrefix}_${timestamp}.pdf`);
        const doc = new pdfkit_1.default({ size: 'A4', margin: 40 });
        const stream = fs_1.default.createWriteStream(pdfFilePath);
        doc.pipe(stream);
        // 📌 Título del reporte
        doc.fontSize(18).text(reportTitle, { align: 'center' });
        doc.moveDown(1);
        // 📌 Agrupar contratos por estado
        const groupedByState = emptyFieldsReport.reduce((acc, contract) => {
            acc[contract.estado] = acc[contract.estado] || [];
            acc[contract.estado].push(contract);
            return acc;
        }, {});
        const startX = 40;
        const colWidths = [100, 200, 100, 100]; // Anchos de columnas
        Object.keys(groupedByState).forEach((estado, idx) => {
            if (idx > 0 && doc.y > 650)
                doc.addPage(); // Evitar que los títulos de estado queden al final de la página
            // 📌 Subtítulo del estado
            doc.fontSize(14).fillColor("blue").text(`Estado: ${estado}`, startX, doc.y);
            doc.fillColor("black");
            doc.moveDown(0.5);
            // 📌 Dibujar encabezados de tabla
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text("Contrato", startX, doc.y, { width: colWidths[0] });
            doc.text("Comercial", startX + colWidths[0], doc.y, { width: colWidths[1] });
            doc.text("Servicio", startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
            doc.moveDown(0.3);
            doc.strokeColor("#000000").lineWidth(1).moveTo(startX, doc.y).lineTo(startX + colWidths.reduce((a, b) => a + b), doc.y).stroke();
            doc.moveDown(0.5);
            // 📌 Dibujar los registros
            doc.fontSize(10).font('Helvetica');
            groupedByState[estado].forEach((item) => {
                if (doc.y + 20 > doc.page.height - 40) {
                    doc.addPage(); // Evitar cortar filas en dos páginas
                }
                doc.text(item.codigo, startX, doc.y, { width: colWidths[0] });
                doc.text(item.comercial, startX + colWidths[0], doc.y, { width: colWidths[1] });
                doc.text(item.servicio, startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
                doc.moveDown(0.2);
                doc.fontSize(9).fillColor("red").text(`Campos Vacíos: ${item.campos.join(', ')}`, startX, doc.y);
                doc.fillColor("black");
                doc.moveDown(0.3);
                doc.strokeColor("#D3D3D3").lineWidth(0.5).moveTo(startX, doc.y).lineTo(startX + colWidths.reduce((a, b) => a + b), doc.y).stroke();
                doc.moveDown(0.3);
            });
            doc.moveDown(0.8);
        });
        doc.end();
        stream.on('finish', async () => {
            console.log(`📄 Reporte generado: ${pdfFilePath}`);
            resolve(pdfFilePath);
        });
    }
    else {
        console.log('✅ No se encontraron campos vacíos en los datos.');
        resolve(null);
    }
}
function reporteTicketsCobranzas(tickets, outputFile) {
    const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
    const stream = fs_1.default.createWriteStream(outputFile);
    doc.pipe(stream);
    let startY = 50; // Posición inicial de la tabla
    doc.fontSize(9); // Fuente más pequeña para mejor ajuste
    // **🔹 Función para dividir los resultados en grupos de dos**
    function formatearResultados(resultado) {
        const items = resultado.split('|').map(item => item.trim()); // Dividir en elementos individuales
        let formattedResult = "";
        for (let i = 0; i < items.length; i += 2) {
            if (i + 1 < items.length) {
                formattedResult += `${items[i]} | ${items[i + 1]}\n`;
            }
            else {
                formattedResult += `${items[i]}\n`;
            }
        }
        return formattedResult.trim();
    }
    // **🔹 Función para Dibujar el Encabezado**
    function drawHeader() {
        doc.fillColor('#003366').font('Helvetica-Bold').fontSize(14).text('Reporte de Tickets de Cobranzas', { align: 'center' });
        doc.moveDown(0.3);
        const fechaActual = new Date().toLocaleString();
        doc.fillColor('black').font('Helvetica').fontSize(10).text(`Generado el: ${fechaActual}`, { align: 'right' });
        doc.moveDown(0.8);
        // **🔹 Dibujar Encabezado de la Tabla**
        const columnWidths = [60, 80, 50, 290]; // Ampliamos la columna de "Resultado"
        const startX = 50;
        startY = doc.y;
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), 25).fill('#003366');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
        const headers = ['Código', 'Descripción', 'Cantidad', 'Resultado'];
        let x = startX;
        headers.forEach((header, i) => {
            doc.text(header, x + 5, startY + 8, { width: columnWidths[i], align: 'left' });
            x += columnWidths[i];
        });
        doc.fillColor('black');
        startY += 25;
    }
    // **🔹 DIBUJAR EL ENCABEZADO INICIAL**
    drawHeader();
    // **🔹 Dibujar Filas de Datos**
    tickets.forEach((ticket, index) => {
        const isEven = index % 2 === 0;
        const columnWidths = [60, 80, 50, 290]; // Ajustamos la columna de "Resultado"
        const startX = 50;
        // **📌 Formatear el resultado para dividir en bloques de 2 elementos por línea**
        const resultadoFormateado = formatearResultados(ticket.Resultado);
        // **📌 Calcular la altura dinámica de la celda según "Resultado"**
        const lineHeight = 12;
        const maxWidth = columnWidths[3] - 10;
        const resultLines = doc.heightOfString(resultadoFormateado, { width: maxWidth }) / lineHeight;
        const rowHeight = Math.max(20, resultLines * lineHeight + 10); // Ajuste dinámico
        // **📌 Si la fila no cabe, agregar una nueva página antes de imprimir**
        if (startY + rowHeight > 750) {
            doc.addPage();
            drawHeader(); // Redibujar encabezado en nueva página
        }
        // **📌 Dibujar fondo alternado para filas**
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(isEven ? '#f0f0f0' : '#ffffff');
        doc.fillColor('black');
        let x = startX;
        const valores = [
            ticket.Código,
            ticket.Descripcion,
            ticket.Cantidad.toString(),
            resultadoFormateado // Usar el formato mejorado
        ];
        valores.forEach((valor, i) => {
            doc.text(valor, x + 5, startY + 6, {
                width: columnWidths[i],
                align: 'left'
            });
            x += columnWidths[i];
        });
        startY += rowHeight; // Ajustamos la posición para la siguiente fila
    });
    doc.end();
    console.log(`✅ PDF generado con éxito: ${outputFile}`);
}
