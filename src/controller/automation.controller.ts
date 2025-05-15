import { Browser, Page } from "playwright";
import { Logger } from "../utils/logger";
import { initialize } from "../routes";
import { navigateToTicketDashboard } from "../routes/tickets/ticket.route";
import { navigateToTickets } from "../routes/tickets/cli_tickets.route";
import { cleanup } from "../utils/clean-resources";
import { navigateToContractDashboard } from "../routes/contract/contract.route";

/**
 * Base automation class that handles common browser operations
 */
export abstract class BaseAutomationTickets {
    protected browser: Browser | null = null;
    protected page: Page | null = null;
    protected logger: Logger;

    constructor(loggerName: string) {
        this.logger = new Logger(loggerName);
    }

    /**
     * Initialize browser and page context
     */
    protected async initializeBrowser(): Promise<void> {
        try {
            const session = await initialize(this.page!, this.browser!, true);
            this.page = session.page;
            this.browser = session.browser;
        } catch (error) {
            this.logger.error('Failed to initialize browser', error);
            throw new Error('Browser initialization failed');
        }
    }

    /**
     * Navigate to ticket dashboard and ticket section
     */
    protected async navigateToTicketSection(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        try {
            this.logger.info('➡ Navigating to Ticket Dashboard...');
            await navigateToTicketDashboard(this.page);

            this.logger.info('➡ Navigating to Tickets section...');
            await navigateToTickets(this.page);
        } catch (error) {
            this.logger.error('Navigation failed', error);
            throw new Error('Failed to navigate to ticket section');
        }
    }

    /**
     * Ensure resources are cleaned up after execution
     */
    protected async cleanupResources(): Promise<void> {
        this.logger.info('🧹 Cleaning up resources...');
        
        if (this.browser) {
            try {
                await cleanup(this.browser);
                this.browser = null;
                this.page = null;
            } catch (error) {
                this.logger.error('Error during cleanup', error);
            }
        }
    }

    /**
     * Run the automation process with proper error handling
     */
    abstract run(): Promise<any>;
}


export abstract class BaseAutomationContracts {
    protected browser: Browser | null = null;
    protected page: Page | null = null;
    protected logger: Logger;

    constructor(loggerName: string) {
        this.logger = new Logger(loggerName);
    }

    /**
     * Initialize browser and page context
     */
    protected async initializeBrowser(): Promise<void> {
        try {
            const session = await initialize(this.page!, this.browser!, true);
            this.page = session.page;
            this.browser = session.browser;
        } catch (error) {
            this.logger.error('Failed to initialize browser', error);
            throw new Error('Browser initialization failed');
        }
    }

    /**
     * Navigate to ticket dashboard and ticket section
     */
    protected async navigateToContractsSection(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        try {
            this.logger.info('➡ Navigating to Ticket Dashboard...');
            await navigateToContractDashboard(this.page);

        } catch (error) {
            this.logger.error('Navigation failed', error);
            throw new Error('Failed to navigate to ticket section');
        }
    }

    /**
     * Ensure resources are cleaned up after execution
     */
    protected async cleanupResources(): Promise<void> {
        this.logger.info('🧹 Cleaning up resources...');
        
        if (this.browser) {
            try {
                await cleanup(this.browser);
                this.browser = null;
                this.page = null;
            } catch (error) {
                this.logger.error('Error during cleanup', error);
            }
        }
    }

    /**
     * Run the automation process with proper error handling
     */
    abstract run(): Promise<any>;
}
