import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import PDFDocument from 'pdfkit';
import { config } from '../core/config';
import { sendSlackMessage } from '../core/alertSlack';
import { interactWithElement } from './handler-elements';

import { Page } from 'playwright';
import xlsx from 'xlsx';

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function downloadFile(page: Page, buttonSelector: string, filePrefix: string = 'archivo', ext: string = 'xlsx') {
    let attempts = 0;
    let downloadedFilePath = '';

    // Crear la carpeta de descargas si no existe
    if (!fs.existsSync(config.downloadPath)) {
        fs.mkdirSync(config.downloadPath, { recursive: true });
    }
    
    while (attempts < 3) { // Aumenté a 3 intentos para mayor tolerancia
        try {
            console.log(`📥 Intento de descarga ${attempts + 1}/3: Esperando que el botón ${buttonSelector} sea visible...`);
            
            // Verificar que el botón está visible y habilitado antes de continuar
            await page.waitForSelector(buttonSelector, { 
                state: 'visible',
                timeout: 10000  // 10 segundos máximo para que aparezca el botón
            });
            
            // Verificar si el botón está habilitado
            const isDisabled = await page.evaluate((sel) => {
                const button = document.querySelector(sel);
                return button ? button.hasAttribute('disabled') || 
                                getComputedStyle(button).opacity === '0.5' || 
                                getComputedStyle(button).pointerEvents === 'none' : true;
            }, buttonSelector);
            
            if (isDisabled) {
                console.log(`⚠️ El botón de descarga está deshabilitado. Esperando 3 segundos...`);
                await wait(3000); // Esperar 3 segundos y reintentar
                attempts++;
                continue;
            }
            
            // Configurar listener de descarga ANTES de hacer clic
            const downloadPromise = page.waitForEvent('download', { timeout: 30000 }); // Reduje de 80 a 30 segundos
            
            // Hacer clic en el botón una vez que esté listo
            console.log(`📥 Haciendo clic en botón de descarga...`);
            await Promise.all([
                page.waitForTimeout(1000), // Pequeña pausa para asegurar que la UI responda
                interactWithElement(page, buttonSelector, 'click'),
            ]);
            
            // Esperar a que se inicie la descarga
            console.log(`📥 Esperando evento de descarga...`);
            const download = await downloadPromise;
            
            console.log(`📥 Descarga iniciada. Guardando archivo...`);
            const originalFilePath = path.join(config.downloadPath, download.suggestedFilename());
            await download.saveAs(originalFilePath);
            
            // Verificar que el archivo existe y tiene tamaño mayor a 0
            if (!fs.existsSync(originalFilePath) || fs.statSync(originalFilePath).size === 0) {
                throw new Error(`El archivo descargado no existe o está vacío: ${originalFilePath}`);
            }
            
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
            const newFileName = `${filePrefix}_${timestamp}.${ext}`;
            downloadedFilePath = path.join(config.downloadPath, newFileName);
            fs.renameSync(originalFilePath, downloadedFilePath);
            
            console.log(`✅ Archivo descargado y renombrado: ${downloadedFilePath}`);
            return downloadedFilePath;
        } catch (err) {
            attempts++;
            console.log(`⚠️ Reintentando descarga (${attempts}/3): ${err instanceof Error ? err.message : 'Error desconocido'}`);
            
            // Verificar si hay algún diálogo de alerta que podría estar bloqueando
            try {
                const hasDialog = await page.evaluate(() => {
                    return document.querySelector('.modal-dialog') !== null;
                });
                
                if (hasDialog) {
                    console.log('📌 Detectado un diálogo que podría interferir con la descarga. Intentando cerrar...');
                    await page.click('.modal-dialog .close, .modal-dialog .btn-secondary').catch(() => {});
                    await wait(1000);
                }
            } catch (dialogErr) {
                // Ignorar errores al verificar diálogos
            }
            
            // Esperar un tiempo variable entre intentos (backoff exponencial)
            const waitTime = Math.min(5000 * attempts, 15000);
            console.log(`⏳ Esperando ${waitTime/1000} segundos antes del siguiente intento...`);
            await wait(waitTime);
            
            if (attempts >= 3) {
                throw new Error('No se pudo descargar el archivo después de tres intentos.');
            }
        }
    }
}