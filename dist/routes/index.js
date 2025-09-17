"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
const login_1 = require("../core/login");
const logger_1 = require("../utils/logger");
const DEFAULT_TIMEOUT = 10000;
// Logger instance
const logger = new logger_1.Logger('contract-export');
async function initialize(page, browser, active) {
    logger.info('Initializing automation session');
    try {
        const session = await (0, login_1.login)(active);
        browser = session.browser;
        page = session.page;
        logger.success('Session initialized successfully');
        return { page, browser };
    }
    catch (error) {
        logger.error('Failed to initialize session', error);
        throw new Error('Login failed');
    }
}
