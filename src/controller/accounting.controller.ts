import { Browser, Page } from 'playwright';
import path from 'path';
import { initialize } from '../routes/index';
import { navigateToAccountingDashboard } from '../routes/accounting/accounting.route';
import { navigateToPayments } from '../routes/accounting/cli_payments.route';
import { AccountingService } from '../services/accounting.service';
import { OdooExportService } from '../services/odoo_export.service';
import { cleanup } from '../utils/clean-resources';
import { Logger } from '../../src/utils/logger';
import {config} from '../core/config';

export class AccountignExportAutomation {
  private readonly logger = new Logger('contract-export');
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(
    private readonly exportDate: string,
    private readonly exportFileName: string,
    private readonly exportFileExt: string,
    private readonly nameTemplate: string,
    private readonly accountingService = new AccountingService(),
    private readonly odooExportService = new OdooExportService()
  ) {}

  /**
   * Initialize browser and page context.
   */
  private async initializeBrowser(): Promise<void> {
    const session = await initialize( this.page!, this.browser!, false);
    this.page = session.page;
    this.browser = session.browser;  
  }

  /**
   * Run the complete automation process with structured error handling.
   */
  async run(): Promise<void> {
    this.logger.info('🔄 Starting contract export automation...');

    try {
      await this.initializeBrowser();
      await this.processExport();

      this.logger.success('✅ Contract export completed successfully.');
    } catch (error) {
      this.logger.error('❌ Automation process failed.', error);
    } finally {
      await this.cleanupResources();
    }
  }

  /**
   * Execute each step of the automation sequentially.
   */
  private async processExport(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized.');

    this.logger.info('➡ Navigating to Accounting Dashboard...');
    await navigateToAccountingDashboard( this.page);

    this.logger.info('➡ Navigating to Payments section...');
    await navigateToPayments(this.page);

    this.logger.info(`➡ Applying filters for date: ${this.exportDate}...`);
    await this.accountingService.applyFilters(this.page, this.exportDate);

    this.logger.info('➡ Selecting all records...');
    await this.odooExportService.selectAllRecords(this.page);

    this.logger.info('➡ Exporting records...');
    const filePath = await this.odooExportService.exportRecords(this.page, this.exportFileName, this.exportFileExt, this.nameTemplate );

    if (filePath) {
      this.logger.success(`📁 File downloaded: ${path.basename(filePath)}`);
      this.cleanupResources();
    } else {
      throw new Error('Export failed - no file was downloaded.');
    }
  }

  /**
   * Ensure resources are cleaned up after execution.
   */
  private async cleanupResources(): Promise<void> {
    this.logger.info('🧹 Cleaning up resources...');
    await cleanup(this.browser!);
  }
}
