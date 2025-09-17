"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = cleanup;
const logger_1 = require("./logger"); // Logger instance
const logger = new logger_1.Logger('contract-export');
async function cleanup(browser) {
    logger.info('Cleaning up resources');
    if (browser) {
        await browser.close();
        logger.success('Browser closed');
    }
}
