"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAutomationContracts = exports.BaseAutomationTickets = void 0;
const logger_1 = require("../utils/logger");
const routes_1 = require("../routes");
const ticket_route_1 = require("../routes/tickets/ticket.route");
const cli_tickets_route_1 = require("../routes/tickets/cli_tickets.route");
const clean_resources_1 = require("../utils/clean-resources");
const contract_route_1 = require("../routes/contract/contract.route");
/**
 * Base automation class that handles common browser operations
 */
class BaseAutomationTickets {
    browser = null;
    page = null;
    logger;
    constructor(loggerName) {
        this.logger = new logger_1.Logger(loggerName);
    }
    /**
     * Initialize browser and page context
     */
    async initializeBrowser() {
        try {
            const session = await (0, routes_1.initialize)(this.page, this.browser, true);
            this.page = session.page;
            this.browser = session.browser;
        }
        catch (error) {
            this.logger.error('Failed to initialize browser', error);
            throw new Error('Browser initialization failed');
        }
    }
    /**
     * Navigate to ticket dashboard and ticket section
     */
    async navigateToTicketSection() {
        if (!this.page)
            throw new Error('Page not initialized');
        try {
            this.logger.info('➡ Navigating to Ticket Dashboard...');
            await (0, ticket_route_1.navigateToTicketDashboard)(this.page);
            this.logger.info('➡ Navigating to Tickets section...');
            await (0, cli_tickets_route_1.navigateToTickets)(this.page);
        }
        catch (error) {
            this.logger.error('Navigation failed', error);
            throw new Error('Failed to navigate to ticket section');
        }
    }
    /**
     * Ensure resources are cleaned up after execution
     */
    async cleanupResources() {
        this.logger.info('🧹 Cleaning up resources...');
        if (this.browser) {
            try {
                await (0, clean_resources_1.cleanup)(this.browser);
                this.browser = null;
                this.page = null;
            }
            catch (error) {
                this.logger.error('Error during cleanup', error);
            }
        }
    }
}
exports.BaseAutomationTickets = BaseAutomationTickets;
class BaseAutomationContracts {
    browser = null;
    page = null;
    logger;
    constructor(loggerName) {
        this.logger = new logger_1.Logger(loggerName);
    }
    /**
     * Initialize browser and page context
     */
    async initializeBrowser() {
        try {
            const session = await (0, routes_1.initialize)(this.page, this.browser, true);
            this.page = session.page;
            this.browser = session.browser;
        }
        catch (error) {
            this.logger.error('Failed to initialize browser', error);
            throw new Error('Browser initialization failed');
        }
    }
    /**
     * Navigate to ticket dashboard and ticket section
     */
    async navigateToContractsSection() {
        if (!this.page)
            throw new Error('Page not initialized');
        try {
            this.logger.info('➡ Navigating to Ticket Dashboard...');
            await (0, contract_route_1.navigateToContractDashboard)(this.page);
        }
        catch (error) {
            this.logger.error('Navigation failed', error);
            throw new Error('Failed to navigate to ticket section');
        }
    }
    /**
     * Ensure resources are cleaned up after execution
     */
    async cleanupResources() {
        this.logger.info('🧹 Cleaning up resources...');
        if (this.browser) {
            try {
                await (0, clean_resources_1.cleanup)(this.browser);
                this.browser = null;
                this.page = null;
            }
            catch (error) {
                this.logger.error('Error during cleanup', error);
            }
        }
    }
}
exports.BaseAutomationContracts = BaseAutomationContracts;
