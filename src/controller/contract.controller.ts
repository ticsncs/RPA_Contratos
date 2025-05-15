import path from 'path';
import { navigateToContractDashboard } from '../routes/contract/contract.route';
import { OdooExportService } from '../services/odoo_export.service';
import { ContractService } from '../services/contract.service';
import { MongoAPIService } from '../services/api/mongo.service';
import { TicketData } from '../core/interfaces/interface-ticket';
import { BaseAutomationContracts } from './automation.controller';

export class ContractExportAutomation extends BaseAutomationContracts {
    

    constructor(
        private readonly exportFileName: string,
        private readonly exportFileExt: string,
        private readonly nameTemplate: string,
        private readonly odooExportService = new OdooExportService(),
        private readonly contractService = new ContractService(),
        private readonly mongoAPIService = new MongoAPIService()
    ) {
        super('contract-export');
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

        this.logger.info('➡ Navigating to Contract Dashboard...');
        await navigateToContractDashboard(this.page);

        this.logger.info(`➡ Applying filters for contracts...`);
        await this.contractService.applyFiltersContracts(this.page);

        this.logger.info('➡ Selecting all records...');
        await this.odooExportService.selectAllRecords(this.page);

        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.exportFileName, this.exportFileExt, this.nameTemplate);
        console.log('filePath controller', filePath);

        if (filePath) {
            this.logger.success(`📁 File downloaded: ${path.basename(filePath)} for send API MongoDB`);
        
            this.mongoAPIService.uploadCsvToApi(
                filePath,
                '/odoo/contracts'
            )
            .then(() => {
                this.logger.success(`✅ File uploaded to API MongoDB successfully`);
            })
            .catch((error) => {
                this.logger.error('❌ Error uploading file to API MongoDB', error);
            })
            .finally(() => {
                this.cleanupResources(); // 
            });
        
        } else {
            throw new Error('❌ Export failed - no file was downloaded.');
        }
        
    }

    
}


export class CreateTicketPerContractAutomation extends BaseAutomationContracts {


    constructor(
        private readonly searchText: string, 
        private readonly ticketData: TicketData,
        private readonly contractService = new ContractService(),
    ) { 
        super('create-ticket-per-contract');
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

        this.logger.info(`➡ Navigating to Contract Dashboard...`);
        await navigateToContractDashboard(this.page);

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


export class ContractStateDailyExportAutomation  extends BaseAutomationContracts {


    constructor(
        private readonly date_search: string,
        private readonly status: string,
        private readonly fileName: string,
        private  readonly fileExt: string,
        private readonly nameTemplate: string,
        private readonly odooExportService = new OdooExportService(),
        private readonly contractService = new ContractService(),
    ) { 
        super('contract-state-daily-export');
    }

  


     /**
     * Run the complete automation process with structured error handling.
     */
     async run(): Promise<string | null> {

        this.logger.info('🔄 Starting contract export automation...');

        try {
            await this.initializeBrowser();
            const result = await this.processExport(); // ✅ CAPTURAR Y RETORNAR
            this.logger.success('✅ Contract export completed successfully.');
            return result; // ✅ DEVOLVER RESULTADO REAL
            
        } catch (error) {
            this.logger.error('❌ Automation process failed.', error);
            return null; // 🔴 PARA QUE procesarClientesCortados() maneje correctamente
        } finally {
            await this.cleanupResources();
        }
    }

    /**
     * Execute each step of the automation sequentially.
     */
    private async processExport(): Promise<string | null> {
        if (!this.page) throw new Error('Page not initialized.');
    
        this.logger.info('➡ Navigating to Contract Dashboard...');
        await navigateToContractDashboard(this.page);
    
        this.logger.info(`➡ Applying filters for contracts...`);
        await this.contractService.applyFiltersStausContractDayly(this.page, this.status, this.date_search);
    
        await this.odooExportService.selectAllRecords(this.page);
        this.logger.info('➡ Exporting records...');
        const filePath = await this.odooExportService.exportRecords(this.page, this.fileName, this.fileExt, this.nameTemplate);
        this.logger.info(`📁 File exported to: ${filePath}`);
    
        return filePath;
    }
    
  

    
}

