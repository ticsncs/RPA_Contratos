
import { Logger } from '../../utils/logger';

import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { config } from '../../core/config';

const logger = new Logger('contract-export');
export class MongoAPIService{
   async  uploadContractsToApi(filePath: string): Promise<void> {
    logger.info('Uploading exported file to API');
  
    try {
      const fileName = filePath;
      console.log("download file name",fileName);
      const form = new FormData();
  
      form.append('file', fs.createReadStream(filePath));
      form.append('file_name', fileName);
  
      const apiUrl = `${config.apiMongoUrl}1.0/odoo/contracts`;
  
      const response = await axios.post(apiUrl, form, {
        headers: form.getHeaders(),
      });
  
      logger.success(`API response: ${JSON.stringify(response.data)}`);
  
      // Clean up the downloaded file
      fs.unlinkSync(filePath);
      logger.info(`Temporary file deleted: ${filePath}`);
    } catch (error) {
      logger.error('API upload failed', error);
      throw new Error('Upload to API failed');
    }
  }
}


