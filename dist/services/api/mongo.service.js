"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAPIService = void 0;
const logger_1 = require("../../utils/logger");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const logger = new logger_1.Logger('csv-uploader');
class MongoAPIService {
    baseUrl;
    constructor() {
        this.baseUrl = process.env.API_MONGO_URL || '190.96.96.02'; // ✅ Base por defecto
    }
    async uploadCsvToApi(filePath, route) {
        console.log(`🌍 Conectando a la API en: ${this.baseUrl}`);
        console.log(`🌐 Subiendo archivo CSV a la API en la ruta: ${route}`);
        logger.info('🚀 Iniciando subida de archivo CSV a API');
        try {
            const fileName = path_1.default.basename(filePath); // Solo el nombre
            logger.info(`📂 Archivo a subir: ${fileName}`);
            const form = new form_data_1.default();
            form.append('file', fs_1.default.createReadStream(filePath));
            form.append('file_name', fileName);
            // Construimos la URL final
            const endpointUrl = `${this.baseUrl}${route}`;
            console.log(`🌐 Subiendo archivo CSV a la API en la ruta: ${endpointUrl}`);
            const response = await axios_1.default.post(endpointUrl, form, {
                headers: form.getHeaders(),
            });
            logger.success(`✅ Respuesta de la API: ${JSON.stringify(response.data)}`);
            // Eliminar el archivo temporal
            fs_1.default.unlinkSync(filePath);
            logger.info(`🧹 Archivo temporal eliminado: ${filePath}`);
        }
        catch (error) {
            logger.error('❌ Falló la subida del archivo CSV', error?.message || error);
            throw new Error('Upload to API failed');
        }
    }
}
exports.MongoAPIService = MongoAPIService;
