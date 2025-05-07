/**
 * @file csv-handler.ts
 * @description Utilidades para el manejo de archivos CSV
 */

import fs from 'fs';
import csvParser from 'csv-parser';
import { ClientOffData } from '../core/interfaces/interface-client';
import { Logger } from './logger';

/**
 * Clase para manejo y procesamiento de archivos CSV
 */
export class CsvHandler {
  private logger = new Logger('CsvHandler');

  /**
   * Lee un archivo CSV y extrae la información de los clientes
   * @param filePath Ruta del archivo CSV a procesar
   * @returns Promise con los datos de clientes extraídos del CSV
   */
  public async readClientDataFromCsv(filePath: string): Promise<ClientOffData[]> {
    return new Promise((resolve, reject) => {
      const results: ClientOffData[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
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
          this.deleteFile(filePath);
          
          resolve(results);
        })
        .on('error', (error: Error) => {
          this.logger.error(`Error al leer el archivo CSV ${filePath}`, error);
          reject(error);
        });
    });
  }

  /**
   * Elimina un archivo del sistema de archivos
   * @param filePath Ruta del archivo a eliminar
   */
  private deleteFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        this.logger.error(`Error al eliminar el archivo ${filePath}`, err);
      } else {
        this.logger.info(`Archivo ${filePath} eliminado correctamente`);
      }
    });
  }
}