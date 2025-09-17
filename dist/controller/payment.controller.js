"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExportAutomation = void 0;
const path_1 = __importDefault(require("path"));
const index_1 = require("../routes/index");
const accounting_route_1 = require("../routes/accounting/accounting.route");
const cli_payments_route_1 = require("../routes/accounting/cli_payments.route");
const accounting_service_1 = require("../services/accounting.service");
const odoo_export_service_1 = require("../services/odoo_export.service");
const clean_resources_1 = require("../utils/clean-resources");
const logger_1 = require("../utils/logger");
const mongo_service_1 = require("../services/api/mongo.service");
class PaymentExportAutomation {
    exportDate;
    exportFileName;
    exportFileExt;
    nameTemplate;
    accountingService;
    odooExportService;
    mongoAPIService;
    logger = new logger_1.Logger('contract-export');
    browser = null;
    page = null;
    constructor(exportDate, exportFileName, exportFileExt, nameTemplate, accountingService = new accounting_service_1.AccountingService(), odooExportService = new odoo_export_service_1.OdooExportService(), mongoAPIService = new mongo_service_1.MongoAPIService()) {
        this.exportDate = exportDate;
        this.exportFileName = exportFileName;
        this.exportFileExt = exportFileExt;
        this.nameTemplate = nameTemplate;
        this.accountingService = accountingService;
        this.odooExportService = odooExportService;
        this.mongoAPIService = mongoAPIService;
    }
    /**
     * Initialize browser and page context.
     */
    async initializeBrowser() {
        const session = await (0, index_1.initialize)(this.page, this.browser, true);
        this.page = session.page;
        this.browser = session.browser;
    }
    /**
     * Run the complete automation process with structured error handling.
     */
    async run() {
        this.logger.info('🔄 Starting contract export automation...');
        try {
            await this.initializeBrowser();
            await this.processExport();
            this.logger.success('✅ Contract export completed successfully.');
        }
        catch (error) {
            this.logger.error('❌ Automation process failed.', error);
        }
        finally {
            await this.cleanupResources();
        }
    }
    /**
     * Execute each step of the automation sequentially.
     */
    async processExport() {
        if (!this.page)
            throw new Error('Page not initialized.');
        this.logger.info('➡ Navigating to Accounting Dashboard...');
        await (0, accounting_route_1.navigateToAccountingDashboard)(this.page);
        this.logger.info('➡ Navigating to Payments section...');
        await (0, cli_payments_route_1.navigateToPayments)(this.page);
        this.logger.info(`➡ Applying filters for date: ${this.exportDate}...`);
        await this.accountingService.applyFilters(this.page, this.exportDate);
        this.logger.info('➡ Selecting all records...');
        await this.odooExportService.selectAllRecords(this.page);
        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.exportFileName, this.exportFileExt, this.nameTemplate);
        if (filePath) {
            this.logger.success(`📁 File downloaded: ${path_1.default.basename(filePath)} for send API MongoDB`);
            this.mongoAPIService.uploadCsvToApi(filePath, '/odoo/payments')
                .then(() => {
                this.logger.success(`✅ File uploaded to API MongoDB successfully`);
            })
                .catch((error) => {
                this.logger.error('❌ Error uploading file to API MongoDB', error);
            })
                .finally(() => {
                this.cleanupResources(); // 
            });
        }
        else {
            throw new Error('❌ Export failed - no file was downloaded.');
        }
    }
    /**
     * Ensure resources are cleaned up after execution.
     */
    async cleanupResources() {
        this.logger.info('🧹 Cleaning up resources...');
        await (0, clean_resources_1.cleanup)(this.browser);
    }
}
exports.PaymentExportAutomation = PaymentExportAutomation;
