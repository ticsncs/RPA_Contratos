import { Browser, Page } from 'playwright';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { login } from '../../src/core/login';
import { interactWithElement } from '../../src/utils/handler-elements';
import { downloadFile } from '../../src/utils/f_dowload';
import { config } from '../../src/core/config';
import { Logger } from '../../src/utils/logger';

import { navigateToAccountingDashboard } from '../routes/accounting/accounting.route';
import { navigateToPayments } from '../routes/accounting/cli_payments.route';
import { initialize } from '../routes/index';

// Constants
const EXPORT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const ODOO_DASHBOARD_URL = 'https://erp.nettplus.net/web#cids=1&action=308&model=account.journal&view_type=kanban&menu_id=258';
const EXPORT_FILE_NAME = 'clientes_nettplus';
const EXPORT_FILE_EXT = 'csv';
const DEFAULT_TIMEOUT = 10000;

// Logger instance
const logger = new Logger('contract-export');

/**
 * Main automation process to export contracts
 */
class ContractExportAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  
 
 

  /**
   * Apply filters and search criteria
   */
  async applyFilters(): Promise<void> {
    logger.info('Applying filters and search criteria');
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Clear search and apply saved filter
      await this.page.getByRole('searchbox', { name: 'Buscar registros' }).click();
      await this.page.getByRole('searchbox', { name: 'Buscar registros' }).fill('');
      
      await this.page.getByRole('button', { name: ' Favoritos' }).click();
      await this.page.getByRole('menuitemcheckbox', { name: 'RPA_mongo_cont' }).click();
      await this.page.getByRole('button', { name: ' Favoritos' }).click();
      
      // Wait for filter to apply
      await this.page.waitForTimeout(5000);
      
      // Apply date filter
      await this.page.getByRole('button', { name: ' Filtros' }).click();
      await this.page.getByRole('button', { name: 'Añadir Filtro personalizado' }).click();
      await this.page.getByRole('combobox').first().selectOption('date');
      await this.page.getByRole('textbox').fill(EXPORT_DATE);
      await this.page.getByRole('button', { name: 'Aplicar' }).click();
      await this.page.getByRole('button', { name: ' Filtros' }).click();
      
      logger.success('Filters applied successfully');
    } catch (error) {
      logger.error('Failed to apply filters', error);
      throw new Error('Filter application failed');
    }
  }

  /**
   * Select all records for export
   */
  async selectAllRecords(): Promise<boolean> {
    logger.info('Selecting all records for export');
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      await interactWithElement(this.page, 'th.o_list_record_selector', 'wait', { waitTime: 2000 });
      await interactWithElement(this.page, 'th.o_list_record_selector', 'click');
      
      try {
        await interactWithElement(this.page, 'a.o_list_select_domain', 'wait', { waitTime: 2000 });
        await interactWithElement(this.page, 'a.o_list_select_domain', 'click');
        logger.success('All records selected');
        return true;
      } catch (error) {
        logger.warn('No records to select or select all option not available');
        return false;
      }
    } catch (error) {
      logger.error('Failed to select records', error);
      return false;
    }
  }

  /**
   * Export selected records to CSV
   */
  async exportRecords(): Promise<string | null> {
    logger.info('Exporting records to CSV');
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Click on Actions button and select Export option
      await interactWithElement(this.page, 'span.o_dropdown_title:has-text("Acción")', 'click');
      await interactWithElement(this.page, 'a.dropdown-item:has-text("Exportar")', 'click');
      
      // Wait for export modal and set options
      await this.page.locator('h4.modal-title', { hasText: 'Exportar Datos' })
        .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
      
      // Select CSV format
      await interactWithElement(this.page, 'label[for="o_radioCSV"]', 'click');
      
      // Select export field template
      await interactWithElement(this.page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
      await interactWithElement(this.page, 'select.o_exported_lists_select', 'selectOption', { label: 'RPA_pagos_ct' });
      await interactWithElement(this.page, 'select.o_exported_lists_select', 'wait', { waitTime: 2000 });
      
      // Download the file
      const downloadedFilePath = await downloadFile(
        this.page, 
        '.modal-footer > .btn-primary', 
        EXPORT_FILE_NAME, 
        EXPORT_FILE_EXT
      );
      
      if (downloadedFilePath) {
        logger.success(`File downloaded: ${path.basename(downloadedFilePath)}`);
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

  /**
   * Upload exported file to API
   */
  async uploadToApi(filePath: string): Promise<void> {
    logger.info('Uploading exported file to API');
    
    try {
      const fileName = path.basename(filePath);
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

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up resources');
    if (this.browser) {
      await this.browser.close();
      logger.success('Browser closed');
    }
  }

  /**
   * Run the complete automation process
   */
  async run(): Promise<void> {
    logger.info('Starting contract export automation');
    
    try {
     this.page = await initialize(ODOO_DASHBOARD_URL, this.page!, this.browser!, false);
      this.page =await navigateToAccountingDashboard(this.page!);
      this.page =  await navigateToPayments(this.page!);
      await this.applyFilters();
      
      const hasRecords = await this.selectAllRecords();
      if (!hasRecords) {
        logger.warn('No records found to export');
        return;
      }
      
      const filePath = await this.exportRecords();
      if (filePath) {
        await this.uploadToApi(filePath);
        logger.success('Contract export completed successfully');
      } else {
        logger.error('Export process failed - no file was downloaded');
      }
    } catch (error) {
      logger.error('Automation failed', error);
    } finally {
      await this.cleanup();
    }
  }
}

/**
 * Execute the automation
 */
(async () => {
  const automation = new ContractExportAutomation();
  await automation.run();
})();