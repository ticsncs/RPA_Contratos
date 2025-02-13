const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('./src/config.js');
const sendSlackMessage = require('./src/alertSlack.js');
const csv = require('csv-parser');
const PDFDocument = require('pdfkit');
const xlsx = require('xlsx');

require('dotenv').config();

(async () => {
    await sendSlackMessage('🤖 Iniciando proceso de validación de campos...');

    try {
        // Crear carpeta de descargas si no existe
        if (!fs.existsSync(config.downloadPath)) {
            fs.mkdirSync(config.downloadPath, { recursive: true });
            console.log(`📁 Carpeta creada: ${config.downloadPath}`);
        }

        // Verificar sesión existente
        const sessionDir = './Session';
        const sessionFilePath = path.join(sessionDir, 'session.json');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        const hasSession = fs.existsSync(sessionFilePath);
        console.log(`🔍 Sesión guardada: ${hasSession ? 'Sí' : 'No'}`);

        const browser = await chromium.launch({ headless: false });
        const context = hasSession
            ? await browser.newContext({ acceptDownloads: true, storageState: sessionFilePath })
            : await browser.newContext({ acceptDownloads: true });
        
        const page = await context.newPage();

        console.log(`🌍 Navegando a: ${config.baseUrl}`);
        await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Verificar sesión
        if (!hasSession) {
            await sendSlackMessage('🔑 No se detectó sesión activa, iniciando sesión...');
            await page.waitForSelector('input[name="login"]', { timeout: 15000 });
            await page.fill('input[name="login"]', config.user);
            await page.fill('input[name="password"]', config.pass);
            await page.click('button[type="submit"]');
            await page.waitForSelector('th.o_list_record_selector', { timeout: 30000 });
            await sendSlackMessage('✅ Inicio de sesión exitoso.');
            await context.storageState({ path: sessionFilePath });
        }

        // Esperar a que la interfaz cargue completamente antes de interactuar
        await page.waitForSelector('th.o_list_record_selector', { timeout: 15000 });
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const weekNumber = Math.ceil((((currentDate - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);

        console.log(`📅 Año actual: ${currentYear}`);
        console.log(`📅 Mes actual: ${currentMonth}`);
        console.log(`📅 Semana actual del año: W${weekNumber}`);

        await page.getByRole('button', { name: ' Favoritos' }).click();
        await page.getByText('Seg_Contratos').click();
        await page.getByRole('cell', { name: ` ${currentYear}` }).click();
        await page.getByRole('cell', { name: ` ${currentMonth}` }).click();
        await page.getByRole('cell', { name: ` W${weekNumber} ${currentYear}` }).click();
    
         // Selección de contratos
        await page.waitForSelector('table tbody tr', { timeout: 60000 });

        // Esperar un tiempo prudente para asegurar que la página ha cargado completamente
        await page.waitForTimeout(5000);
        // Seleccionar todos los contratos
        await page.waitForSelector('th.o_list_record_selector', { timeout: 10000 });
        await page.click('th.o_list_record_selector');
        await sendSlackMessage('📌 Contratos seleccionados.');

        // Aplicar filtros
        await page.waitForSelector('a.o_list_select_domain.btn-info', { timeout: 10000 });
        await page.click('a.o_list_select_domain.btn-info');
        await sendSlackMessage('🎯 Filtros aplicados.');

        // Exportar a CSV
        await page.waitForSelector('div.o_cp_action_menus > div:nth-child(2) > button', { timeout: 10000 });
        await page.click('div.o_cp_action_menus > div:nth-child(2) > button');
        await page.waitForSelector('div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a', { timeout: 10000 });
        await page.click('div.o_cp_action_menus > div.btn-group.dropdown.show > ul > li:nth-child(1) > a');
        await sendSlackMessage('📤 Preparando exportación...');


        await sendSlackMessage('📌 Contratos seleccionados.');

       


        await page.pause();
        await page.getByRole('button', { name: ' Favoritos' }).click();
        await page.getByRole('menuitemcheckbox', { name: 'Seg_Contratos' }).click();
        
        await page.pause();



        /**
         * 

        
  await page.locator('thead').getByRole('cell', { name: '​', exact: true }).click();
  await page.locator('thead').getByRole('cell', { name: '​', exact: true }).click();
  await page.getByRole('button', { name: ' Acción' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Exportar' }).click();
  await page.getByRole('combobox').selectOption('215');
  await page.getByRole('heading', { name: 'Error del cliente de Odoo' }).click({
    button: 'right'
  });
  await page.getByRole('heading', { name: 'Error del cliente de Odoo' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar' }).click();
  const download = await downloadPromise;
         * 
         * 
         *   const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://erp.nettplus.net/web#menu_id=385&cids=1&action=576&model=contract.contract&view_type=list');
  await page.getByRole('button', { name: ' Agrupar por' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Año' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Mes', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Semana' }).click();
  await page.getByRole('row', { name: ' 2025 (353)' }).locator('span').click();
  await page.getByRole('row', { name: ' enero 2025 (233)' }).locator('span').click();
  await page.getByRole('row', { name: ' febrero 2025 (120)' }).locator('span').click();
  await page.getByRole('cell', { name: ' W5 2025 (5)' }).click();
  await page.getByRole('row', { name: '​ Código  Cliente  Direcció' }).locator('label').click();
  await page.getByRole('button', { name: ' Acción' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Exportar' }).click();
  await page.getByRole('combobox').selectOption('215');
  await page.getByRole('button', { name: 'Aceptar' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar' }).click();
  const download = await downloadPromise;
         */
        await page.getByRole('button', { name: ' Filtros' }).click();
        await page.waitForTimeout(5000);
        await page.click('button:has-text("Añadir Filtro personalizado")');
        await page.waitForTimeout(5000);

        // Click para seleccionar campo de filtro de FECHA DE INICIO
        await page.getByRole('combobox').first().selectOption('date_start');

        // Click para seleccionar condición de filtro
        await page.getByRole('textbox').fill('01/01/2013');
        await page.getByRole('button', { name: ' Agregar condición' }).click();
        await page.getByRole('button', { name: 'Aplicar' }).click();
        await sendSlackMessage('📌 Filtros aplicados correctamente.');

        // Seleccionar contratos y exportar
        await page.waitForSelector('th.o_list_record_selector', { timeout: 15000 });
        await page.click('th.o_list_record_selector');
        await page.getByRole('button', { name: ' Acción' }).click();
        await page.getByRole('menuitem', { name: 'Exportar' }).click();
        await page.click('label[for="o_radioXLSX"]');
        await page.selectOption('select.o_exported_lists_select', { label: 'VALIDATED_FIELDS' });
        await sendSlackMessage('📤 Preparando exportación...');

    // Descarga del archivo con reintentos
    let attempts = 0;
    let downloadedFilePath = '';
    while (attempts < 2) {
        try {
            const [download] = await Promise.all([
                page.waitForEvent('download', { timeout: 60000 }),
                page.click('.modal-footer > .btn-primary'),
            ]);
            const originalFilePath = path.join(config.downloadPath, download.suggestedFilename());
            await download.saveAs(originalFilePath);

            const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
            const newFileName = `validador_campos_${timestamp}.xlsx`;
            downloadedFilePath = path.join(config.downloadPath, newFileName);

            fs.renameSync(originalFilePath, downloadedFilePath);
            await sendSlackMessage(`✅ Archivo descargado y renombrado: ${downloadedFilePath}`);
            break;
        } catch (err) {
            attempts++;
            await sendSlackMessage(`⚠️ Reintentando descarga (${attempts}/2)...`);
            if (attempts === 2) {
                throw new Error('No se pudo descargar el archivo después de dos intentos.');
            }
        }
    }

    // Leer el archivo Excel y generar reporte en PDF
    const workbook = xlsx.readFile(downloadedFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

   // Validar campos vacíos solo para contratos con "Servicio Internet" en "Activo"
   const emptyFieldsReport = [];
   data.forEach((row) => {
       if (String(row['Servicio Internet']).trim().toLowerCase() === 'activo') {
           const emptyFields = Object.keys(row).filter(key => !String(row[key] || '').trim());
           if (emptyFields.length > 0) {
               emptyFieldsReport.push({ codigo: row['Código'], campos: emptyFields });
           }
       }
   });
   if (emptyFieldsReport.length > 0) {
    // Generar reporte en PDF
    const pdfFilePath = path.join(config.downloadPath, `Reporte_Contratos_${new Date().toISOString().replace(/[-:.]/g, '_')}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfFilePath);
    doc.pipe(stream);

    doc.fontSize(16).text('Reporte de Contratos con Campos Vacíos', { align: 'center' });
    doc.moveDown();
    emptyFieldsReport.forEach(item => {
        doc.fontSize(12).text(`Contrato: ${item.codigo}`);
        doc.fontSize(10).text(`Campos Vacíos: ${item.campos.join(', ')}`);
        doc.moveDown();
    });
    
    doc.end();
    await sendSlackMessage(`📄 Reporte en PDF generado: ${pdfFilePath}`);
} else {
    await sendSlackMessage('✅ No se encontraron contratos con campos vacíos.');
}

    // Cierre del navegador
    await browser.close();
    await sendSlackMessage('🚀 Proceso finalizado con éxito.');
} catch (error) {
    console.error('❌ Error durante la automatización:', error);
    await sendSlackMessage(`❌ Error en la automatización: ${error.message}`);
}
})();
