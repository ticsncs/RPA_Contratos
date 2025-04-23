import chalk from 'chalk';

/**
 * Logger utility for standardized application logging
 * Provides formatted logs with timestamps, component identifiers and color coding
 */
export class Logger {
  private component: string;
  
  /**
   * Create a new logger instance for a specific component
   * @param component The name of the component this logger is for
   */
  constructor(component: string) {
    this.component = component;
  }
  
  /**
   * Generate a formatted timestamp for log entries
   * @returns ISO timestamp string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }
  
  /**
   * Format a log message with component and timestamp
   * @param message The message to format
   * @returns Formatted message string
   */
  private formatMessage(message: string): string {
    return `[${this.getTimestamp()}] [${this.component}] ${message}`;
  }
  
  /**
   * Log an informational message
   * @param message The information to log
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ️ ') + this.formatMessage(message));
  }
  
  /**
   * Log a success message
   * @param message The success information to log
   */
  success(message: string): void {
    console.log(chalk.green('✅ ') + this.formatMessage(message));
  }
  
  /**
   * Log a warning message
   * @param message The warning information to log
   */
  warn(message: string): void {
    console.log(chalk.yellow('⚠️ ') + this.formatMessage(message));
  }
  
  /**
   * Log an error message with optional error details
   * @param message The error description
   * @param error Optional error object for additional details
   */
  error(message: string, error?: unknown): void {
    console.error(chalk.red('❌ ') + this.formatMessage(message));
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red('   Error details:'), error.message);
        if (error.stack) {
          console.error(chalk.red('   Stack trace:'), error.stack.split('\n').slice(1).join('\n'));
        }
      } else {
        console.error(chalk.red('   Unknown error:'), error);
      }
    }
  }
  
  /**
   * Log a debug message (only shows when debugging is enabled)
   * @param message The debug information to log
   */
  debug(message: string): void {
    // Only log if DEBUG environment variable is set
    if (process.env.DEBUG) {
      console.log(chalk.cyan('🔍 ') + this.formatMessage(message));
    }
  }
  
  /**
   * Log the start of a process or task
   * @param processName Name of the process being started
   */
  startProcess(processName: string): void {
    console.log(chalk.magenta('▶️ ') + this.formatMessage(`Starting: ${processName}`));
  }
  
  /**
   * Log the completion of a process or task
   * @param processName Name of the process being completed
   * @param durationMs Optional duration in milliseconds
   */
  endProcess(processName: string, durationMs?: number): void {
    const durationText = durationMs ? ` (${durationMs}ms)` : '';
    console.log(chalk.magenta('⏹️ ') + this.formatMessage(`Completed: ${processName}${durationText}`));
  }
}

/**
 * Create a simple timer for measuring operation durations
 * @returns Object with start and stop timer functions
 */
export const createTimer = () => {
  const startTime = process.hrtime();
  
  return {
    /**
     * Stop the timer and get elapsed milliseconds
     * @returns Duration in milliseconds
     */
    stop: (): number => {
      const diff = process.hrtime(startTime);
      return diff[0] * 1000 + diff[1] / 1000000;
    }
  };
};