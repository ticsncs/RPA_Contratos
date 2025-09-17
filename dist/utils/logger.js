"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimer = exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Logger utility for standardized application logging
 * Provides formatted logs with timestamps, component identifiers and color coding
 */
class Logger {
    component;
    /**
     * Create a new logger instance for a specific component
     * @param component The name of the component this logger is for
     */
    constructor(component) {
        this.component = component;
    }
    /**
     * Generate a formatted timestamp for log entries
     * @returns ISO timestamp string
     */
    getTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Format a log message with component and timestamp
     * @param message The message to format
     * @returns Formatted message string
     */
    formatMessage(message) {
        return `[${this.getTimestamp()}] [${this.component}] ${message}`;
    }
    /**
     * Log an informational message
     * @param message The information to log
     */
    info(message) {
        console.log(chalk_1.default.blue('ℹ️ ') + this.formatMessage(message));
    }
    /**
     * Log a success message
     * @param message The success information to log
     */
    success(message) {
        console.log(chalk_1.default.green('✅ ') + this.formatMessage(message));
    }
    /**
     * Log a warning message
     * @param message The warning information to log
     */
    warn(message) {
        console.log(chalk_1.default.yellow('⚠️ ') + this.formatMessage(message));
    }
    /**
     * Log an error message with optional error details
     * @param message The error description
     * @param error Optional error object for additional details
     */
    error(message, error) {
        console.error(chalk_1.default.red('❌ ') + this.formatMessage(message));
        if (error) {
            if (error instanceof Error) {
                console.error(chalk_1.default.red('   Error details:'), error.message);
                if (error.stack) {
                    console.error(chalk_1.default.red('   Stack trace:'), error.stack.split('\n').slice(1).join('\n'));
                }
            }
            else {
                console.error(chalk_1.default.red('   Unknown error:'), error);
            }
        }
    }
    /**
     * Log a debug message (only shows when debugging is enabled)
     * @param message The debug information to log
     */
    debug(message) {
        // Only log if DEBUG environment variable is set
        if (process.env.DEBUG) {
            console.log(chalk_1.default.cyan('🔍 ') + this.formatMessage(message));
        }
    }
    /**
     * Log the start of a process or task
     * @param processName Name of the process being started
     */
    startProcess(processName) {
        console.log(chalk_1.default.magenta('▶️ ') + this.formatMessage(`Starting: ${processName}`));
    }
    /**
     * Log the completion of a process or task
     * @param processName Name of the process being completed
     * @param durationMs Optional duration in milliseconds
     */
    endProcess(processName, durationMs) {
        const durationText = durationMs ? ` (${durationMs}ms)` : '';
        console.log(chalk_1.default.magenta('⏹️ ') + this.formatMessage(`Completed: ${processName}${durationText}`));
    }
}
exports.Logger = Logger;
/**
 * Create a simple timer for measuring operation durations
 * @returns Object with start and stop timer functions
 */
const createTimer = () => {
    const startTime = process.hrtime();
    return {
        /**
         * Stop the timer and get elapsed milliseconds
         * @returns Duration in milliseconds
         */
        stop: () => {
            const diff = process.hrtime(startTime);
            return diff[0] * 1000 + diff[1] / 1000000;
        }
    };
};
exports.createTimer = createTimer;
