"use strict";
/**
 * @file csv-handler.ts
 * @description Utilidades para el manejo de archivos CSV
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvHandler = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const logger_1 = require("./logger");
/**
 * Clase para manejo y procesamiento de archivos CSV
 */
class CsvHandler {
    logger = new logger_1.Logger('CsvHandler');
    /**
     * Lee un archivo CSV y extrae la información de los clientes
     * @param filePath Ruta del archivo CSV a procesar
     * @returns Promise con los datos de clientes extraídos del CSV
     */
    async readClientDataFromCsv(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => {
                const normalizedData = {
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
                .on('error', (error) => {
                this.logger.error(`Error al leer el archivo CSV ${filePath}`, error);
                reject(error);
            });
        });
    }
    /**
     * Elimina un archivo del sistema de archivos
     * @param filePath Ruta del archivo a eliminar
     */
    deleteFile(filePath) {
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                this.logger.error(`Error al eliminar el archivo ${filePath}`, err);
            }
            else {
                this.logger.info(`Archivo ${filePath} eliminado correctamente`);
            }
        });
    }
}
exports.CsvHandler = CsvHandler;
