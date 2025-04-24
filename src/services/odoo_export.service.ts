import { Page } from "playwright"; {} 
import {interactWithElement} from '../utils/handler-elements';
import { downloadFile } from '../utils/f_dowload';
import { Logger } from '../utils/logger';
import path from 'path';

const logger = new Logger('contract-export');  
const DEFAULT_TIMEOUT = 10000;

/**
* Select all records for export
*/
  export class OdooExportService {

  async selectAllRecords(page:Page): Promise<Page> {
    logger.info('Selecting all records for export');
    if (!page) throw new Error('Page not initialized');
    
    try {

        await interactWithElement(page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'th.o_list_record_selector', 'click');
        await interactWithElement(page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(page, 'a.o_list_select_domain', 'click');
        logger.success('All records selected');
      
      return page
    } catch (error) {
      logger.error('Failed to select records', error);
      return page;
    }
  }

  /**
   * Export selected records to CSV
   */
  async exportRecords(page:Page, name_file:string, ext_file:string, name_template: string): Promise<string | null> {
    logger.info('Exporting records to CSV');
    console.log(name_template, name_file, ext_file);
    if (!page) throw new Error('Page not initialized');
    
    try {
      // Click on Actions button and select Export option
      await interactWithElement(page, 'span.o_dropdown_title:has-text("Acción")', 'click');
      await interactWithElement(page, 'a.dropdown-item:has-text("Exportar")', 'click');
      
      // Wait for export modal and set options
      await page.locator('h4.modal-title', { hasText: 'Exportar Datos' })
        .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
      
      // Select CSV format
      await interactWithElement(page, `label[for="o_radio${ext_file.toUpperCase()}"]`, 'wait');
      await interactWithElement(page, `label[for="o_radio${ext_file.toUpperCase()}"]`, 'click');
      
      
      // Select export field template
      await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
      await interactWithElement(page, 'select.o_exported_lists_select', 'selectOption', { label: name_template });
      await interactWithElement(page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
      
      // Download the file
      const downloadedFilePath = await downloadFile(
        page, 
        '.modal-footer > .btn-primary', 
        name_file, 
        ext_file
      );
      
      if (downloadedFilePath) {
        logger.success(`File downloaded: ${path.basename(downloadedFilePath)}`);
        console.log('File downloaded  service:', downloadedFilePath);
        return downloadedFilePath;
      } else {
        logger.error('File download failed');
        return null;
      }
    } catch (error) {
      logger.error('Export process failed', error);
      return null;
    }
  }

}