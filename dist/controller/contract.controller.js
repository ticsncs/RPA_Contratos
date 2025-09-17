"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractStateDailyExportAutomation = exports.CreateTicketPerContractAutomation = exports.ContractExportAutomation = void 0;
const path_1 = __importDefault(require("path"));
const contract_route_1 = require("../routes/contract/contract.route");
const odoo_export_service_1 = require("../services/odoo_export.service");
const contract_service_1 = require("../services/contract.service");
const mongo_service_1 = require("../services/api/mongo.service");
const automation_controller_1 = require("./automation.controller");
class ContractExportAutomation extends automation_controller_1.BaseAutomationContracts {
    exportFileName;
    exportFileExt;
    nameTemplate;
    odooExportService;
    contractService;
    mongoAPIService;
    constructor(exportFileName, exportFileExt, nameTemplate, odooExportService = new odoo_export_service_1.OdooExportService(), contractService = new contract_service_1.ContractService(), mongoAPIService = new mongo_service_1.MongoAPIService()) {
        super('contract-export');
        this.exportFileName = exportFileName;
        this.exportFileExt = exportFileExt;
        this.nameTemplate = nameTemplate;
        this.odooExportService = odooExportService;
        this.contractService = contractService;
        this.mongoAPIService = mongoAPIService;
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
        this.logger.info('➡ Navigating to Contract Dashboard...');
        await (0, contract_route_1.navigateToContractDashboard)(this.page);
        this.logger.info(`➡ Applying filters for contracts...`);
        await this.contractService.applyFiltersContracts(this.page);
        this.logger.info('➡ Selecting all records...');
        await this.odooExportService.selectAllRecords(this.page);
        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.exportFileName, this.exportFileExt, this.nameTemplate);
        console.log('filePath controller', filePath);
        if (filePath) {
            this.logger.success(`📁 File downloaded: ${path_1.default.basename(filePath)} for send API MongoDB`);
            this.mongoAPIService.uploadCsvToApi(filePath, '/odoo/contracts')
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
}
exports.ContractExportAutomation = ContractExportAutomation;
class CreateTicketPerContractAutomation extends automation_controller_1.BaseAutomationContracts {
    searchText;
    ticketData;
    contractService;
    constructor(searchText, ticketData, contractService = new contract_service_1.ContractService()) {
        super('create-ticket-per-contract');
        this.searchText = searchText;
        this.ticketData = ticketData;
        this.contractService = contractService;
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
        this.logger.info(`➡ Navigating to Contract Dashboard...`);
        await (0, contract_route_1.navigateToContractDashboard)(this.page);
        this.logger.info(`➡ Applying filters for tickets...`);
        await this.contractService.applyFiltersContract(this.page, this.searchText);
        this.logger.info(`➡ Opening contract...`);
        await this.contractService.openContract(this.page, this.ticketData.user);
        this.logger.info(`➡ Opening ticket...`);
        await this.contractService.openTicketPerContract(this.page);
        this.logger.info(`➡ Creating ticket...`);
        await this.contractService.writeTicketPerContract(this.page, this.ticketData.title, this.ticketData.team, this.ticketData.assignedUser, this.ticketData.channel, this.ticketData.category, this.ticketData.tag);
        this.logger.info(`➡ Saving ticket...`);
        await this.contractService.saveTicketPerContract(this.page);
        this.logger.info(`➡ Cleaning up resources...`);
        this.cleanupResources();
    }
}
exports.CreateTicketPerContractAutomation = CreateTicketPerContractAutomation;
class ContractStateDailyExportAutomation extends automation_controller_1.BaseAutomationContracts {
    date_search;
    status;
    fileName;
    fileExt;
    nameTemplate;
    odooExportService;
    contractService;
    constructor(date_search, status, fileName, fileExt, nameTemplate, odooExportService = new odoo_export_service_1.OdooExportService(), contractService = new contract_service_1.ContractService()) {
        super('contract-state-daily-export');
        this.date_search = date_search;
        this.status = status;
        this.fileName = fileName;
        this.fileExt = fileExt;
        this.nameTemplate = nameTemplate;
        this.odooExportService = odooExportService;
        this.contractService = contractService;
    }
    /**
    * Run the complete automation process with structured error handling.
    */
    async run() {
        this.logger.info('🔄 Starting contract export automation...');
        try {
            await this.initializeBrowser();
            const result = await this.processExport(); // ✅ CAPTURAR Y RETORNAR
            this.logger.success('✅ Contract export completed successfully.');
            return result; // ✅ DEVOLVER RESULTADO REAL
        }
        catch (error) {
            this.logger.error('❌ Automation process failed.', error);
            return null; // 🔴 PARA QUE procesarClientesCortados() maneje correctamente
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
        this.logger.info('➡ Navigating to Contract Dashboard...');
        await (0, contract_route_1.navigateToContractDashboard)(this.page);
        this.logger.info(`➡ Applying filters for contracts...`);
        await this.contractService.applyFiltersStausContractDayly(this.page, this.status, this.date_search);
        await this.odooExportService.selectAllRecords(this.page);
        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.fileName, this.fileExt, this.nameTemplate);
        this.logger.info(`📁 File exported to: ${filePath}`);
        return filePath;
    }
}
exports.ContractStateDailyExportAutomation = ContractStateDailyExportAutomation;
