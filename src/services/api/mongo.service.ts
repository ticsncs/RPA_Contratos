import { Logger } from '../../utils/logger';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const logger = new Logger('csv-uploader');

export class MongoAPIService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.API_MONGO_URL || '190.96.96.20'; // ✅ Base por defecto
  }

 
  async uploadCsvToApi(filePath: string, route: string): Promise<void> {
    logger.info('🚀 Iniciando subida de archivo CSV a API');

    try {
      const fileName = path.basename(filePath); // Solo el nombre
      logger.info(`📂 Archivo a subir: ${fileName}`);

      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('file_name', fileName);

      // Construimos la URL final
      const endpointUrl = `${this.baseUrl}${route}`;

      const response = await axios.post(endpointUrl, form, {
        headers: form.getHeaders(),
      });

      logger.success(`✅ Respuesta de la API: ${JSON.stringify(response.data)}`);

      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);
      logger.info(`🧹 Archivo temporal eliminado: ${filePath}`);
      
    } catch (error: any) {
      logger.error('❌ Falló la subida del archivo CSV', error?.message || error);
      throw new Error('Upload to API failed');
    }
  }
}
